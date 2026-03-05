import { useState } from 'react'
import { LayoutDashboard, Presentation, LogOut, RefreshCw, Plug } from 'lucide-react'
import clsx from 'clsx'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import LoginPage from './pages/LoginPage'
import SettingsPage from './pages/SettingsPage'
import Dashboard from './components/Dashboard'
import Deck from './components/Deck'
import { mockReportData } from './data/mockData'
import { ReportData, DateRange } from './types'

type View = 'dashboard' | 'deck' | 'settings'

const DATE_RANGE_OPTIONS: { value: DateRange; label: string }[] = [
  { value: 'this_month', label: 'This Month' },
  { value: 'last_month', label: 'Last Month' },
  { value: 'last_30',   label: 'Last 30 Days' },
  { value: 'last_90',   label: 'Last 90 Days' },
  { value: 'ytd',       label: 'Year to Date' },
]

// ── Inner app (authenticated) ─────────────────────────────────────────────────
function AppInner() {
  const { user, loading, logout } = useAuth()
  const [view, setView]           = useState<View>('dashboard')
  const [dateRange, setDateRange] = useState<DateRange>('last_month')
  const [data]                    = useState<ReportData>(mockReportData)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <RefreshCw size={24} className="animate-spin" />
          <p className="text-sm">Loading…</p>
        </div>
      </div>
    )
  }

  if (!user) return <LoginPage />

  // Auto-switch to settings if redirected there after OAuth
  const path = window.location.pathname
  if (path === '/settings' && view !== 'settings') setView('settings')

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ── Top Nav ── */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-screen-2xl mx-auto px-6 h-14 flex items-center justify-between gap-4">
          {/* Logo / Client */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-black text-sm">R</span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-gray-900 leading-none truncate">{data.client.name}</p>
              <p className="text-xs text-gray-500 leading-none mt-0.5 truncate">{data.client.reportingPeriod}</p>
            </div>
          </div>

          {/* View switcher */}
          <div className="flex bg-gray-100 rounded-lg p-0.5 gap-0.5">
            {([
              { id: 'dashboard', label: 'Live Dashboard',  icon: <LayoutDashboard size={15} /> },
              { id: 'deck',      label: 'Monthly Deck',    icon: <Presentation size={15} /> },
              { id: 'settings',  label: 'Connect Accounts', icon: <Plug size={15} /> },
            ] as { id: View; label: string; icon: React.ReactNode }[]).map((v) => (
              <button
                key={v.id}
                onClick={() => setView(v.id)}
                className={clsx(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all',
                  view === v.id ? 'bg-white shadow text-indigo-700' : 'text-gray-500 hover:text-gray-700',
                )}
              >
                {v.icon}
                {v.label}
              </button>
            ))}
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-3">
            {view === 'dashboard' && (
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as DateRange)}
                className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
              >
                {DATE_RANGE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            )}
            <div className="flex items-center gap-1.5 text-xs text-gray-400 border-r border-gray-200 pr-3">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {user.email}
            </div>
            <button
              onClick={logout}
              title="Sign out"
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-600 px-2 py-1.5 rounded-lg hover:bg-red-50 transition"
            >
              <LogOut size={13} />
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* ── Platform status bar (dashboard only) ── */}
      {view === 'dashboard' && (
        <div className="bg-white border-b border-gray-100 no-print">
          <div className="max-w-screen-2xl mx-auto px-6 py-2 flex items-center gap-6 overflow-x-auto scrollbar-hide">
            {data.platforms.map((p) => {
              const label = getPlatformLabel(p.platform)
              const color = getPlatformColor(p.platform)
              return (
                <div key={p.platform} className="flex items-center gap-2 text-xs flex-shrink-0">
                  <span className="w-2 h-2 rounded-full" style={{ background: color }} />
                  <span className="text-gray-600 font-medium">{label}</span>
                  <span className="text-gray-400">·</span>
                  <span className="font-semibold text-gray-800">${(p.spend / 1000).toFixed(1)}k</span>
                  <span className="text-gray-400">/</span>
                  <span className={p.roas >= 3.5 ? 'text-emerald-600 font-bold' : 'text-amber-600 font-bold'}>
                    {p.roas.toFixed(2)}x ROAS
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Main content ── */}
      <main className="flex-1">
        {view === 'dashboard' && (
          <div className="max-w-screen-2xl mx-auto px-6 py-6">
            <Dashboard data={data} />
          </div>
        )}
        {view === 'deck' && (
          <div className="h-[calc(100vh-56px)]">
            <Deck data={data} />
          </div>
        )}
        {view === 'settings' && <SettingsPage />}
      </main>

      {/* ── Footer ── */}
      {view === 'dashboard' && (
        <footer className="no-print border-t border-gray-200 bg-white py-3 px-6">
          <div className="max-w-screen-2xl mx-auto flex justify-between items-center text-xs text-gray-400">
            <span>Reporting Dashboard · {data.client.name} · Confidential</span>
            <span>Generated {new Date(data.generatedAt).toLocaleString()}</span>
          </div>
        </footer>
      )}
    </div>
  )
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  )
}

function getPlatformLabel(p: string): string {
  const labels: Record<string, string> = {
    google_ads: 'Google Ads', meta_ads: 'Meta Ads', linkedin_ads: 'LinkedIn',
    x_ads: 'X Ads', tiktok_ads: 'TikTok',
  }
  return labels[p] ?? p
}

function getPlatformColor(p: string): string {
  const colors: Record<string, string> = {
    google_ads: '#4285F4', meta_ads: '#0082FB', linkedin_ads: '#0A66C2',
    x_ads: '#14171A', tiktok_ads: '#FF0050',
  }
  return colors[p] ?? '#6366f1'
}
