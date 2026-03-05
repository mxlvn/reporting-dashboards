import { useState } from 'react'
import { LayoutDashboard, Presentation, RefreshCw } from 'lucide-react'
import clsx from 'clsx'
import Dashboard from './components/Dashboard'
import Deck from './components/Deck'
import { mockReportData } from './data/mockData'
import { ReportData, DateRange } from './types'

type View = 'dashboard' | 'deck'

const DATE_RANGE_OPTIONS: { value: DateRange; label: string }[] = [
  { value: 'this_month', label: 'This Month' },
  { value: 'last_month', label: 'Last Month' },
  { value: 'last_30',   label: 'Last 30 Days' },
  { value: 'last_90',   label: 'Last 90 Days' },
  { value: 'ytd',       label: 'Year to Date' },
]

export default function App() {
  const [view, setView] = useState<View>('dashboard')
  const [dateRange, setDateRange] = useState<DateRange>('last_month')
  const [data] = useState<ReportData>(mockReportData)

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
            <button
              onClick={() => setView('dashboard')}
              className={clsx(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all',
                view === 'dashboard'
                  ? 'bg-white shadow text-indigo-700'
                  : 'text-gray-500 hover:text-gray-700',
              )}
            >
              <LayoutDashboard size={15} />
              Live Dashboard
            </button>
            <button
              onClick={() => setView('deck')}
              className={clsx(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all',
                view === 'deck'
                  ? 'bg-white shadow text-indigo-700'
                  : 'text-gray-500 hover:text-gray-700',
              )}
            >
              <Presentation size={15} />
              Monthly Deck
            </button>
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
            <button className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition">
              <RefreshCw size={13} />
              Refresh
            </button>
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live
            </div>
          </div>
        </div>
      </header>

      {/* ── Platform status bar (dashboard only) ── */}
      {view === 'dashboard' && (
        <div className="bg-white border-b border-gray-100 no-print">
          <div className="max-w-screen-2xl mx-auto px-6 py-2 flex items-center gap-6 overflow-x-auto scrollbar-hide">
            {data.platforms.map((p) => {
              const { label, color } = { label: getPlatformLabel(p.platform), color: getPlatformColor(p.platform) }
              return (
                <div key={p.platform} className="flex items-center gap-2 text-xs flex-shrink-0">
                  <span className="w-2 h-2 rounded-full" style={{ background: color }} />
                  <span className="text-gray-600 font-medium">{label}</span>
                  <span className="text-gray-400">·</span>
                  <span className="font-semibold text-gray-800">${(p.spend / 1000).toFixed(1)}k</span>
                  <span className="text-gray-400">/</span>
                  <span className={p.roas >= 3.5 ? 'text-emerald-600 font-bold' : 'text-amber-600 font-bold'}>{p.roas.toFixed(2)}x ROAS</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Main content ── */}
      <main className="flex-1">
        {view === 'dashboard' ? (
          <div className="max-w-screen-2xl mx-auto px-6 py-6">
            <Dashboard data={data} />
          </div>
        ) : (
          <div className="h-[calc(100vh-56px)]">
            <Deck data={data} />
          </div>
        )}
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
