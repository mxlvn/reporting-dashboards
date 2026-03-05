import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, Link, Unlink, AlertCircle, RefreshCw, ExternalLink } from 'lucide-react'
import clsx from 'clsx'

interface PlatformStatus {
  connected:    boolean
  configured:   boolean
  connected_at?: string
  account_name?: string
}

type StatusMap = Record<string, PlatformStatus>

interface PlatformMeta {
  key:          string
  label:        string
  color:        string
  bg:           string
  description:  string
  docsUrl:      string
  envVars:      string[]
}

const PLATFORMS: PlatformMeta[] = [
  {
    key:         'google',
    label:       'Google Ads & GA4',
    color:       '#4285F4',
    bg:          'bg-blue-50',
    description: 'Connects both Google Ads and Google Analytics 4 using a single OAuth app. Provides campaign performance, keyword data, and website conversion metrics.',
    docsUrl:     'https://console.cloud.google.com/',
    envVars:     ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'],
  },
  {
    key:         'meta',
    label:       'Meta Ads',
    color:       '#0082FB',
    bg:          'bg-sky-50',
    description: 'Access Facebook and Instagram campaign data, ad set performance, creative metrics, and audience insights via the Meta Marketing API.',
    docsUrl:     'https://developers.facebook.com/',
    envVars:     ['META_APP_ID', 'META_APP_SECRET'],
  },
  {
    key:         'linkedin',
    label:       'LinkedIn Ads',
    color:       '#0A66C2',
    bg:          'bg-blue-50',
    description: 'Pull LinkedIn campaign analytics, lead gen form data, sponsored content performance, and company page metrics.',
    docsUrl:     'https://www.linkedin.com/developers/apps',
    envVars:     ['LINKEDIN_CLIENT_ID', 'LINKEDIN_CLIENT_SECRET'],
  },
  {
    key:         'x',
    label:       'X Ads',
    color:       '#14171A',
    bg:          'bg-gray-100',
    description: 'Retrieve X (Twitter) Ads campaign metrics, promoted tweet performance, and audience engagement data. Requires Ads API approval.',
    docsUrl:     'https://developer.twitter.com/en/portal/dashboard',
    envVars:     ['X_CLIENT_ID', 'X_CLIENT_SECRET'],
  },
  {
    key:         'tiktok',
    label:       'TikTok Ads',
    color:       '#FF0050',
    bg:          'bg-rose-50',
    description: 'Access TikTok for Business campaign data, video ad performance, audience demographics, and conversion tracking.',
    docsUrl:     'https://business-api.tiktok.com/portal/',
    envVars:     ['TIKTOK_APP_ID', 'TIKTOK_APP_SECRET'],
  },
]

export default function SettingsPage() {
  const [status, setStatus]   = useState<StatusMap>({})
  const [loading, setLoading] = useState(true)
  const [pending, setPending] = useState<string | null>(null)

  // URL feedback after OAuth redirect
  const urlParams    = new URLSearchParams(window.location.search)
  const justConnected = urlParams.get('connected')
  const oauthError   = urlParams.get('error')
  const errorPlatform = urlParams.get('platform')

  useEffect(() => {
    fetchStatus()
    // Clean URL after reading params
    if (justConnected || oauthError) {
      window.history.replaceState({}, '', '/settings')
    }
  }, [])

  async function fetchStatus() {
    setLoading(true)
    try {
      const res = await fetch('/api/oauth/status', { credentials: 'include' })
      if (res.ok) setStatus(await res.json() as StatusMap)
    } finally {
      setLoading(false)
    }
  }

  async function connect(platform: string) {
    // Redirect to backend OAuth initiation
    window.location.href = `/api/oauth/${platform}/connect`
  }

  async function disconnect(platform: string) {
    setPending(platform)
    try {
      await fetch(`/api/oauth/${platform}/disconnect`, { method: 'DELETE', credentials: 'include' })
      await fetchStatus()
    } finally {
      setPending(null)
    }
  }

  const connectedCount = Object.values(status).filter((s) => s.connected).length

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Connect Accounts</h1>
        <p className="text-gray-500 text-sm mt-1">
          Connect your ad platforms to pull live data into the dashboard.
          {' '}<span className="font-medium text-indigo-600">{connectedCount} of {PLATFORMS.length} connected.</span>
        </p>
      </div>

      {/* OAuth feedback banners */}
      {justConnected && (
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-sm">
          <CheckCircle size={16} className="flex-shrink-0 text-emerald-500" />
          <span>Successfully connected <strong>{PLATFORMS.find(p => p.key === justConnected)?.label ?? justConnected}</strong>!</span>
        </div>
      )}
      {oauthError && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl text-sm">
          <AlertCircle size={16} className="flex-shrink-0 mt-0.5 text-red-500" />
          <div>
            <strong>Connection failed</strong> for {errorPlatform}.{' '}
            {oauthError === 'not_configured'
              ? 'API credentials are not set in your .env file. See the setup instructions below.'
              : `Error: ${oauthError}. Check your app credentials and redirect URIs.`}
          </div>
        </div>
      )}

      {/* Setup note */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800 flex items-start gap-3">
        <AlertCircle size={16} className="flex-shrink-0 mt-0.5 text-amber-500" />
        <div>
          <strong>Before connecting:</strong> Copy <code className="bg-amber-100 px-1 rounded">.env.example</code> to{' '}
          <code className="bg-amber-100 px-1 rounded">.env</code> and fill in your API credentials for each platform.
          Click the platform name to go to that platform's developer portal.
        </div>
      </div>

      {/* Platform cards */}
      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-28 bg-gray-100 rounded-xl animate-pulse" />
          ))
        ) : (
          PLATFORMS.map((p) => {
            const s          = status[p.key] ?? { connected: false, configured: false }
            const isConnected = s.connected
            const isConfigured = s.configured
            const isPending  = pending === p.key

            return (
              <div
                key={p.key}
                className={clsx(
                  'bg-white border rounded-xl p-5 flex gap-4 shadow-sm transition-shadow hover:shadow-md',
                  isConnected ? 'border-emerald-200' : 'border-gray-200',
                )}
              >
                {/* Platform color bar */}
                <div className="w-1 rounded-full flex-shrink-0" style={{ background: p.color }} />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <a
                      href={p.docsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-semibold text-gray-900 hover:text-indigo-600 flex items-center gap-1"
                    >
                      {p.label}
                      <ExternalLink size={12} className="opacity-50" />
                    </a>
                    {isConnected ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">
                        <CheckCircle size={11} /> Connected
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                        <XCircle size={11} /> Not connected
                      </span>
                    )}
                    {!isConfigured && (
                      <span className="text-xs font-medium bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">
                        Needs credentials
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-gray-500 mb-2 line-clamp-2">{p.description}</p>

                  {/* Env vars needed */}
                  {!isConfigured && (
                    <div className="flex flex-wrap gap-1">
                      {p.envVars.map((v) => (
                        <code key={v} className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                          {v}
                        </code>
                      ))}
                    </div>
                  )}

                  {/* Connected info */}
                  {isConnected && s.connected_at && (
                    <p className="text-xs text-gray-400">
                      Connected {new Date(s.connected_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  )}
                </div>

                {/* Action */}
                <div className="flex-shrink-0 flex items-center">
                  {isConnected ? (
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
                      disabled={!isConfigured || isPending}
                      title={!isConfigured ? `Add ${p.envVars.join(' and ')} to .env first` : ''}
                      className={clsx(
                        'flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition',
                        isConfigured
                          ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed',
                      )}
                    >
                      <Link size={12} />
                      Connect
                    </button>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Refresh */}
      <div className="text-center">
        <button
          onClick={fetchStatus}
          className="flex items-center gap-2 text-xs text-gray-400 hover:text-gray-600 mx-auto transition"
        >
          <RefreshCw size={12} /> Refresh connection status
        </button>
      </div>
    </div>
  )
}
