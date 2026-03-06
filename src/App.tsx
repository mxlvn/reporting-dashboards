import { useState, useRef, useEffect, FormEvent } from 'react'
import { LayoutDashboard, Presentation, LogOut, RefreshCw, Plug, ChevronDown, Plus, Trash2, Check } from 'lucide-react'
import clsx from 'clsx'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ClientProvider, useClients } from './contexts/ClientContext'
import LoginPage from './pages/LoginPage'
import UploadsPage from './pages/UploadsPage'
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

const CLIENT_COLORS = [
  '#6366f1', '#0ea5e9', '#10b981', '#f59e0b',
  '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6',
]

// ── Client switcher dropdown ──────────────────────────────────────────────────
function ClientSwitcher({ onAddClick }: { onAddClick: () => void }) {
  const { clients, selected, setSelected, deleteClient } = useClients()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  if (clients.length === 0) {
    return (
      <button
        onClick={onAddClick}
        className="flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 border border-dashed border-indigo-300 hover:border-indigo-400 px-3 py-1.5 rounded-lg transition"
      >
        <Plus size={14} /> Add your first client
      </button>
    )
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition text-sm font-semibold text-gray-800 max-w-[200px]"
      >
        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: selected?.color ?? '#6366f1' }} />
        <span className="truncate">{selected?.name ?? 'Select client'}</span>
        <ChevronDown size={14} className={clsx('flex-shrink-0 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-60 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-1 overflow-hidden">
          {clients.map((c) => (
            <div
              key={c.id}
              className={clsx(
                'flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer group',
                selected?.id === c.id && 'bg-indigo-50',
              )}
              onClick={() => { setSelected(c); setOpen(false) }}
            >
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: c.color }} />
              <span className={clsx('flex-1 text-sm truncate', selected?.id === c.id ? 'font-semibold text-indigo-700' : 'text-gray-700')}>
                {c.name}
              </span>
              {selected?.id === c.id && <Check size={12} className="text-indigo-500 flex-shrink-0" />}
              <button
                onClick={(e) => { e.stopPropagation(); deleteClient(c.id) }}
                className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition p-0.5 rounded"
                title="Delete client"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
          <div className="border-t border-gray-100 mt-1 pt-1">
            <button
              onClick={() => { setOpen(false); onAddClick() }}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-indigo-600 hover:bg-indigo-50 transition"
            >
              <Plus size={14} /> Add client
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Add client modal ──────────────────────────────────────────────────────────
function AddClientModal({ onClose }: { onClose: () => void }) {
  const { createClient } = useClients()
  const [name,  setName]  = useState('')
  const [color, setColor] = useState(CLIENT_COLORS[0])
  const [busy,  setBusy]  = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setBusy(true)
    await createClient(name.trim(), color)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Add client</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Client name</label>
            <input
              autoFocus
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Acme Corp"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
            <div className="flex gap-2 flex-wrap">
              {CLIENT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={clsx(
                    'w-7 h-7 rounded-full transition-transform',
                    color === c ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : 'hover:scale-110',
                  )}
                  style={{ background: c }}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition">
              Cancel
            </button>
            <button type="submit" disabled={busy || !name.trim()} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-50">
              {busy ? 'Creating…' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Main authenticated app ────────────────────────────────────────────────────
function AppInner() {
  const { user, loading, logout } = useAuth()
  const { selected }              = useClients()
  const [view,          setView]          = useState<View>('dashboard')
  const [dateRange,     setDateRange]     = useState<DateRange>('last_month')
  const [data]                            = useState<ReportData>(mockReportData)
  const [showAddClient, setShowAddClient] = useState(false)

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

  if (window.location.pathname === '/settings' && view !== 'settings') setView('settings')

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ── Nav ── */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-screen-2xl mx-auto px-6 h-14 flex items-center justify-between gap-4">

          {/* Logo + client switcher */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-black text-sm">R</span>
            </div>
            <ClientSwitcher onAddClick={() => setShowAddClient(true)} />
          </div>

          {/* View switcher */}
          <div className="flex bg-gray-100 rounded-lg p-0.5 gap-0.5">
            {([
              { id: 'dashboard', label: 'Dashboard',        icon: <LayoutDashboard size={15} /> },
              { id: 'deck',      label: 'Monthly Deck',     icon: <Presentation size={15} /> },
              { id: 'settings',  label: 'Upload Data', icon: <Plug size={15} /> },
            ] as { id: View; label: string; icon: React.ReactNode }[]).map((v) => (
              <button
                key={v.id}
                onClick={() => setView(v.id)}
                className={clsx(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all',
                  view === v.id ? 'bg-white shadow text-indigo-700' : 'text-gray-500 hover:text-gray-700',
                )}
              >
                {v.icon}{v.label}
              </button>
            ))}
          </div>

          {/* Right */}
          <div className="flex items-center gap-3">
            {view === 'dashboard' && (
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as DateRange)}
                className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
              >
                {DATE_RANGE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            )}
            <div className="flex items-center gap-1.5 text-xs text-gray-400 border-r border-gray-200 pr-3">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {user.email}
            </div>
            <button onClick={logout} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-600 px-2 py-1.5 rounded-lg hover:bg-red-50 transition">
              <LogOut size={13} /> Sign out
            </button>
          </div>
        </div>
      </header>

      {/* ── Platform quick-stats ── */}
      {view === 'dashboard' && (
        <div className="bg-white border-b border-gray-100 no-print">
          <div className="max-w-screen-2xl mx-auto px-6 py-2 flex items-center gap-6 overflow-x-auto">
            {selected ? data.platforms.map((p) => (
              <div key={p.platform} className="flex items-center gap-2 text-xs flex-shrink-0">
                <span className="w-2 h-2 rounded-full" style={{ background: getPlatformColor(p.platform) }} />
                <span className="text-gray-600 font-medium">{getPlatformLabel(p.platform)}</span>
                <span className="text-gray-400">·</span>
                <span className="font-semibold text-gray-800">${(p.spend / 1000).toFixed(1)}k</span>
                <span className="text-gray-400">/</span>
                <span className={p.roas >= 3.5 ? 'text-emerald-600 font-bold' : 'text-amber-600 font-bold'}>
                  {p.roas.toFixed(2)}x ROAS
                </span>
              </div>
            )) : (
              <p className="text-xs text-gray-400 italic py-0.5">Select or create a client to get started.</p>
            )}
          </div>
        </div>
      )}

      {/* ── Content ── */}
      <main className="flex-1">
        {view === 'dashboard' && (
          <div className="max-w-screen-2xl mx-auto px-6 py-6">
            {selected ? <Dashboard data={data} /> : (
              <div className="flex flex-col items-center justify-center h-64 gap-4 text-gray-400">
                <p className="text-lg font-medium">No client selected</p>
                <button
                  onClick={() => setShowAddClient(true)}
                  className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 border border-dashed border-indigo-300 px-4 py-2 rounded-xl"
                >
                  <Plus size={14} /> Add your first client
                </button>
              </div>
            )}
          </div>
        )}
        {view === 'deck' && <div className="h-[calc(100vh-56px)]"><Deck data={data} /></div>}
        {view === 'settings' && <UploadsPage />}
      </main>

      {/* ── Footer ── */}
      {view === 'dashboard' && selected && (
        <footer className="no-print border-t border-gray-200 bg-white py-3 px-6">
          <div className="max-w-screen-2xl mx-auto flex justify-between items-center text-xs text-gray-400">
            <span>{selected.name} · Confidential</span>
            <span>Generated {new Date(data.generatedAt).toLocaleString()}</span>
          </div>
        </footer>
      )}

      {showAddClient && <AddClientModal onClose={() => setShowAddClient(false)} />}
    </div>
  )
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <ClientProvider>
        <AppInner />
      </ClientProvider>
    </AuthProvider>
  )
}

function getPlatformLabel(p: string): string {
  const m: Record<string, string> = { google_ads: 'Google Ads', meta_ads: 'Meta', linkedin_ads: 'LinkedIn', x_ads: 'X', tiktok_ads: 'TikTok' }
  return m[p] ?? p
}
function getPlatformColor(p: string): string {
  const m: Record<string, string> = { google_ads: '#4285F4', meta_ads: '#0082FB', linkedin_ads: '#0A66C2', x_ads: '#14171A', tiktok_ads: '#FF0050' }
  return m[p] ?? '#6366f1'
}
