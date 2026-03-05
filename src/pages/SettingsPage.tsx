import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, Link, Unlink, AlertCircle, RefreshCw, ExternalLink, Plus } from 'lucide-react'
import clsx from 'clsx'
import { useClients } from '../contexts/ClientContext'

interface PlatformStatus {
  connected:    boolean
  configured:   boolean
  connected_at?: string
}

type StatusMap = Record<string, PlatformStatus>

interface PlatformMeta {
  key:         string
  label:       string
  color:       string
  description: string
  docsUrl:     string
  envVars:     string[]
}

const PLATFORMS: PlatformMeta[] = [
  {
    key:         'google',
    label:       'Google Ads & GA4',
    color:       '#4285F4',
    description: "Sign in with the Google account that has access to this client's Google Ads manager and GA4 property. Google will let you pick which account each time.",
    docsUrl:     'https://console.cloud.google.com/',
    envVars:     ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'],
  },
  {
    key:         'meta',
    label:       'Meta Ads',
    color:       '#0082FB',
    description: "Connect via Facebook login to access this client's Meta Ads Manager (Facebook + Instagram campaigns).",
    docsUrl:     'https://developers.facebook.com/',
    envVars:     ['META_APP_ID', 'META_APP_SECRET'],
  },
  {
    key:         'linkedin',
    label:       'LinkedIn Ads',
    color:       '#0A66C2',
    description: 'Connect to pull LinkedIn campaign analytics, sponsored content, and lead gen data for this client.',
    docsUrl:     'https://www.linkedin.com/developers/apps',
    envVars:     ['LINKEDIN_CLIENT_ID', 'LINKEDIN_CLIENT_SECRET'],
  },
  {
    key:         'x',
    label:       'X Ads',
    color:       '#14171A',
    description: 'Connect X (Twitter) Ads. Requires Ads API access approval from X. Uses PKCE for secure token exchange.',
    docsUrl:     'https://developer.twitter.com/en/portal/dashboard',
    envVars:     ['X_CLIENT_ID', 'X_CLIENT_SECRET'],
  },
  {
    key:         'tiktok',
    label:       'TikTok Ads',
    color:       '#FF0050',
    description: 'Access TikTok for Business campaign data, video ad performance, and audience demographics for this client.',
    docsUrl:     'https://business-api.tiktok.com/portal/',
    envVars:     ['TIKTOK_APP_ID', 'TIKTOK_APP_SECRET'],
  },
]

export default function SettingsPage() {
  const { selected, clients, setSelected } = useClients()
  const [status,  setStatus]  = useState<StatusMap>({})
  const [loading, setLoading] = useState(false)
  const [pending, setPending] = useState<string | null>(null)

  const urlParams     = new URLSearchParams(window.location.search)
  const justConnected = urlParams.get('connected')
  const oauthError    = urlParams.get('error')
  const errorPlatform = urlParams.get('platform')

  useEffect(() => {
    if (justConnected || oauthError) window.history.replaceState({}, '', '/settings')
  }, [])

  useEffect(() => {
    if (selected) fetchStatus(selected.id)
    else setStatus({})
  }, [selected?.id])

  async function fetchStatus(clientId: string) {
    setLoading(true)
    try {
      const res = await fetch(`/api/oauth/status?clientId=${clientId}`, { credentials: 'include' })
      if (res.ok) setStatus(await res.json() as StatusMap)
    } finally {
      setLoading(false)
    }
  }

  function connect(platform: string) {
    if (!selected) return
    window.location.href = `/api/oauth/${platform}/connect?clientId=${selected.id}`
  }

  async function disconnect(platform: string) {
    if (!selected) return
    setPending(platform)
    try {
      await fetch(`/api/oauth/${platform}/disconnect?clientId=${selected.id}`, { method: 'DELETE', credentials: 'include' })
      await fetchStatus(selected.id)
    } finally {
      setPending(null)
    }
  }

  const connectedCount = Object.values(status).filter((s) => s.connected).length

  if (clients.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-16 text-center text-gray-400">
        <p className="text-lg font-medium mb-2">No clients yet</p>
        <p className="text-sm">Add a client using the dropdown in the nav, then come back to connect their ad accounts.</p>
      </div>
    )
  }

  if (!selected) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-16 text-center text-gray-400">
        <p className="text-lg font-medium">Select a client from the dropdown above</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">

      {/* Header */}
      <div className="flex items-start gap-3">
        <span className="w-3.5 h-3.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: selected.color }} />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Connect Accounts — {selected.name}</h1>
          <p className="text-gray-500 text-sm mt-1">
            Connections are stored per client. Switch clients in the dropdown to manage a different client.
            {' '}<span className="font-medium text-indigo-600">{connectedCount} of {PLATFORMS.length} connected.</span>
          </p>
        </div>
      </div>

      {/* Banners */}
      {justConnected && (
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-sm">
          <CheckCircle size={16} className="flex-shrink-0 text-emerald-500" />
          Successfully connected <strong>{PLATFORMS.find((p) => p.key === justConnected)?.label ?? justConnected}</strong> for <strong>{selected.name}</strong>!
        </div>
      )}
      {oauthError && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl text-sm">
          <AlertCircle size={16} className="flex-shrink-0 mt-0.5 text-red-500" />
          <div>
            <strong>Connection failed</strong>{errorPlatform ? ` for ${errorPlatform}` : ''}.{' '}
            {oauthError === 'not_configured'
              ? 'API credentials are not set in your .env file.'
              : `Error: ${oauthError}. Check your app credentials and redirect URIs.`}
          </div>
        </div>
      )}

      {/* One-time credentials note */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800 flex items-start gap-3">
        <AlertCircle size={16} className="flex-shrink-0 mt-0.5 text-amber-500" />
        <div>
          <strong>One-time setup:</strong> Copy <code className="bg-amber-100 px-1 rounded">.env.example</code> to <code className="bg-amber-100 px-1 rounded">.env</code> and add your API app credentials.
          You only do this once — then you can connect as many clients as you want.
        </div>
      </div>

      {/* Google account picker note */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-800 flex items-start gap-3">
        <span className="font-bold text-blue-500 text-base leading-none mt-0.5">G</span>
        <div>
          <strong>Google accounts:</strong> Clicking Connect for Google will open Google's account picker — just sign in with whichever Google account has access to this client's Google Ads and GA4. No extra setup needed.
        </div>
      </div>

      {/* Platform cards */}
      <div className="space-y-3">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />)
          : PLATFORMS.map((p) => {
              const s           = status[p.key] ?? { connected: false, configured: false }
              const isPending   = pending === p.key

              return (
                <div
                  key={p.key}
                  className={clsx(
                    'bg-white border rounded-xl p-5 flex gap-4 shadow-sm hover:shadow-md transition-shadow',
                    s.connected ? 'border-emerald-200' : 'border-gray-200',
                  )}
                >
                  <div className="w-1 rounded-full flex-shrink-0" style={{ background: p.color }} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <a href={p.docsUrl} target="_blank" rel="noopener noreferrer"
                        className="text-sm font-semibold text-gray-900 hover:text-indigo-600 flex items-center gap-1">
                        {p.label} <ExternalLink size={12} className="opacity-40" />
                      </a>
                      {s.connected ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">
                          <CheckCircle size={11} /> Connected
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                          <XCircle size={11} /> Not connected
                        </span>
                      )}
                      {!s.configured && (
                        <span className="text-xs font-medium bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">
                          Needs .env credentials
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-gray-500 mb-2">{p.description}</p>

                    {!s.configured && (
                      <div className="flex flex-wrap gap-1">
                        {p.envVars.map((v) => (
                          <code key={v} className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{v}</code>
                        ))}
                      </div>
                    )}
                    {s.connected && s.connected_at && (
                      <p className="text-xs text-gray-400">
                        Connected {new Date(s.connected_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    )}
                  </div>

                  <div className="flex-shrink-0 flex items-center">
                    {s.connected ? (
                      <button
                        onClick={() => disconnect(p.key)}
                        disabled={isPending}
                        className="flex items-center gap-1.5 text-xs font-medium text-red-600 hover:text-red-700 border border-red-200 hover:border-red-300 px-3 py-1.5 rounded-lg transition disabled:opacity-50"
                      >
                        {isPending ? <RefreshCw size={12} className="animate-spin" /> : <Unlink size={12} />}
                        Disconnect
                      </button>
                    ) : (
                      <button
                        onClick={() => connect(p.key)}
                        disabled={!s.configured}
                        title={!s.configured ? `Add ${p.envVars.join(' and ')} to .env first` : undefined}
                        className={clsx(
                          'flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition',
                          s.configured ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm' : 'bg-gray-100 text-gray-400 cursor-not-allowed',
                        )}
                      >
                        <Link size={12} /> Connect
                      </button>
                    )}
                  </div>
                </div>
              )
            })
        }
      </div>

      {/* Quick-switch to other clients */}
      {clients.length > 1 && (
        <div className="border-t border-gray-200 pt-4">
          <p className="text-xs text-gray-400 mb-2">Switch to another client:</p>
          <div className="flex flex-wrap gap-2">
            {clients.filter((c) => c.id !== selected.id).map((c) => (
              <button
                key={c.id}
                onClick={() => setSelected(c)}
                className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-indigo-600 border border-gray-200 hover:border-indigo-300 px-2.5 py-1 rounded-lg transition"
              >
                <span className="w-2 h-2 rounded-full" style={{ background: c.color }} />
                {c.name}
                <Plus size={10} className="opacity-40 rotate-45" />
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="text-center">
        <button
          onClick={() => fetchStatus(selected.id)}
          className="flex items-center gap-2 text-xs text-gray-400 hover:text-gray-600 mx-auto transition"
        >
          <RefreshCw size={12} /> Refresh status
        </button>
      </div>
    </div>
  )
}
