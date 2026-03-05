import { Router, Request, Response, NextFunction } from 'express'
import { createHash, randomBytes } from 'crypto'
import { OAUTH_CONFIGS } from '../lib/oauthConfig.js'
import { saveToken, deleteToken, getAllTokenStatus } from '../lib/tokens.js'

const router = Router()

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173'

// ── Auth guard ────────────────────────────────────────────────────────────────
function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (req.session.authenticated) { next(); return }
  res.status(401).json({ error: 'Not authenticated' })
}

// ── PKCE helpers ──────────────────────────────────────────────────────────────
function generateCodeVerifier(): string {
  return randomBytes(32).toString('base64url')
}
function generateCodeChallenge(verifier: string): string {
  return createHash('sha256').update(verifier).digest('base64url')
}

// ── GET /api/oauth/status ─────────────────────────────────────────────────────
router.get('/status', requireAuth, (_req: Request, res: Response) => {
  res.json(getAllTokenStatus())
})

// ── GET /api/oauth/:platform/connect ─────────────────────────────────────────
router.get('/:platform/connect', requireAuth, (req: Request, res: Response) => {
  const { platform } = req.params
  const config = OAUTH_CONFIGS[platform]

  if (!config) {
    res.status(404).json({ error: 'Unknown platform' }); return
  }
  if (!config.clientId || !config.clientSecret) {
    res.redirect(`${CLIENT_URL}/settings?error=not_configured&platform=${platform}`); return
  }

  const state = randomBytes(16).toString('hex')
  req.session.oauthState = state

  const sep = config.scopeSeparator ?? ' '
  const params = new URLSearchParams({
    client_id:     config.clientId,
    redirect_uri:  config.redirectUri,
    response_type: 'code',
    scope:         config.scopes.join(sep),
    state,
  })

  // Google: request offline access for refresh token
  if (platform === 'google') {
    params.set('access_type', 'offline')
    params.set('prompt', 'consent')
  }

  // X (Twitter) requires PKCE
  if (config.pkce) {
    const verifier  = generateCodeVerifier()
    const challenge = generateCodeChallenge(verifier)
    req.session.codeVerifier = verifier
    params.set('code_challenge',        challenge)
    params.set('code_challenge_method', 'S256')
  }

  res.redirect(`${config.authUrl}?${params.toString()}`)
})

// ── GET /api/oauth/:platform/callback ────────────────────────────────────────
router.get('/:platform/callback', async (req: Request, res: Response) => {
  const { platform } = req.params
  const config = OAUTH_CONFIGS[platform]
  const { code, state, error } = req.query as Record<string, string>

  if (error) {
    res.redirect(`${CLIENT_URL}/settings?error=${encodeURIComponent(error)}&platform=${platform}`)
    return
  }
  if (!config) {
    res.redirect(`${CLIENT_URL}/settings?error=unknown_platform`); return
  }
  if (state !== req.session.oauthState) {
    res.redirect(`${CLIENT_URL}/settings?error=state_mismatch&platform=${platform}`); return
  }

  try {
    const body: Record<string, string> = {
      grant_type:    'authorization_code',
      code,
      redirect_uri:  config.redirectUri,
      client_id:     config.clientId,
      client_secret: config.clientSecret,
    }

    if (config.pkce && req.session.codeVerifier) {
      body.code_verifier = req.session.codeVerifier
    }

    // X uses Basic auth header instead of body credentials
    const headers: Record<string, string> = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept':       'application/json',
    }
    if (platform === 'x') {
      const basic = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64')
      headers['Authorization'] = `Basic ${basic}`
      delete body.client_id
      delete body.client_secret
    }

    const tokenRes = await fetch(config.tokenUrl, {
      method:  'POST',
      headers,
      body:    new URLSearchParams(body).toString(),
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tokens = await tokenRes.json() as any

    if (!tokenRes.ok) {
      console.error(`[oauth] Token exchange failed for ${platform}:`, tokens)
      res.redirect(`${CLIENT_URL}/settings?error=token_exchange_failed&platform=${platform}`)
      return
    }

    saveToken(platform, {
      access_token:  tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at:    tokens.expires_in ? Date.now() + Number(tokens.expires_in) * 1000 : undefined,
      connected_at:  new Date().toISOString(),
    })

    // Clean up session state
    delete req.session.oauthState
    delete req.session.codeVerifier

    res.redirect(`${CLIENT_URL}/settings?connected=${platform}`)
  } catch (err) {
    console.error(`[oauth] Callback error for ${platform}:`, err)
    res.redirect(`${CLIENT_URL}/settings?error=callback_failed&platform=${platform}`)
  }
})

// ── DELETE /api/oauth/:platform/disconnect ────────────────────────────────────
router.delete('/:platform/disconnect', requireAuth, (req: Request, res: Response) => {
  deleteToken(req.params.platform)
  res.json({ success: true })
})

export default router
