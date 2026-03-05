import { Router, Request, Response, NextFunction } from 'express'
import { createHash, randomBytes } from 'crypto'
import { OAUTH_CONFIGS } from '../lib/oauthConfig.js'
import { saveToken, deleteToken, getAllTokenStatus } from '../lib/tokens.js'

const router     = Router()
const CLIENT_URL = process.env.CLIENT_URL ?? 'http://localhost:5173'

// ── Auth guard ────────────────────────────────────────────────────────────────
function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (req.session.authenticated) { next(); return }
  res.status(401).json({ error: 'Not authenticated' })
}

// ── PKCE helpers ──────────────────────────────────────────────────────────────
function generateCodeVerifier():              string { return randomBytes(32).toString('base64url') }
function generateCodeChallenge(v: string):   string { return createHash('sha256').update(v).digest('base64url') }

// ── GET /api/oauth/status?clientId=... ───────────────────────────────────────
router.get('/status', requireAuth, (req: Request, res: Response) => {
  const clientId = req.query.clientId as string | undefined
  if (!clientId) { res.status(400).json({ error: 'clientId required' }); return }
  res.json(getAllTokenStatus(clientId))
})

// ── GET /api/oauth/:platform/connect?clientId=... ────────────────────────────
router.get('/:platform/connect', requireAuth, (req: Request, res: Response) => {
  const { platform } = req.params
  const clientId     = req.query.clientId as string | undefined
  const config       = OAUTH_CONFIGS[platform]

  if (!clientId)    { res.status(400).json({ error: 'clientId required' }); return }
  if (!config)      { res.status(404).json({ error: 'Unknown platform' }); return }
  if (!config.clientId || !config.clientSecret) {
    res.redirect(`${CLIENT_URL}/settings?error=not_configured&platform=${platform}`); return
  }

  const state = randomBytes(16).toString('hex')
  req.session.oauthState    = state
  req.session.oauthClientId = clientId

  const sep    = config.scopeSeparator ?? ' '
  const params = new URLSearchParams({
    client_id:     config.clientId,
    redirect_uri:  config.redirectUri,
    response_type: 'code',
    scope:         config.scopes.join(sep),
    state,
  })

  // Google: force account picker (different account per client) + request refresh token
  if (platform === 'google') {
    params.set('access_type', 'offline')
    params.set('prompt',      'select_account consent')
  }

  // X: PKCE
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
  const config       = OAUTH_CONFIGS[platform]
  const { code, state, error } = req.query as Record<string, string>
  const clientId     = req.session.oauthClientId

  if (error) {
    res.redirect(`${CLIENT_URL}/settings?error=${encodeURIComponent(error)}&platform=${platform}`); return
  }
  if (!config || !clientId) {
    res.redirect(`${CLIENT_URL}/settings?error=missing_context`); return
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

    const headers: Record<string, string> = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept':       'application/json',
    }
    // X uses Basic auth instead of body credentials
    if (platform === 'x') {
      headers['Authorization'] = `Basic ${Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64')}`
      delete body.client_id
      delete body.client_secret
    }

    const tokenRes = await fetch(config.tokenUrl, { method: 'POST', headers, body: new URLSearchParams(body).toString() })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tokens   = await tokenRes.json() as any

    if (!tokenRes.ok) {
      console.error(`[oauth] Token exchange failed for ${platform}:`, tokens)
      res.redirect(`${CLIENT_URL}/settings?error=token_exchange_failed&platform=${platform}`); return
    }

    saveToken(clientId, platform, {
      access_token:  tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at:    tokens.expires_in ? Date.now() + Number(tokens.expires_in) * 1000 : undefined,
      connected_at:  new Date().toISOString(),
    })

    delete req.session.oauthState
    delete req.session.oauthClientId
    delete req.session.codeVerifier

    res.redirect(`${CLIENT_URL}/settings?connected=${platform}`)
  } catch (err) {
    console.error(`[oauth] Callback error for ${platform}:`, err)
    res.redirect(`${CLIENT_URL}/settings?error=callback_failed&platform=${platform}`)
  }
})

// ── DELETE /api/oauth/:platform/disconnect?clientId=... ──────────────────────
router.delete('/:platform/disconnect', requireAuth, (req: Request, res: Response) => {
  const clientId = req.query.clientId as string | undefined
  if (!clientId) { res.status(400).json({ error: 'clientId required' }); return }
  deleteToken(clientId, req.params.platform)
  res.json({ success: true })
})

export default router
