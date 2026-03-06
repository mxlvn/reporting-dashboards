import { useEffect, useRef, useState, DragEvent } from 'react'
import { Upload, Trash2, RefreshCw, CheckCircle, AlertCircle, FileText, Terminal, Calendar, ChevronDown, ChevronRight } from 'lucide-react'
import clsx from 'clsx'
import { useClients } from '../contexts/ClientContext'

// ── Types ─────────────────────────────────────────────────────────────────────
interface ParsedMetrics {
  spend: number; impressions: number; clicks: number
  conversions: number; revenue: number; roas: number; rows: number
  detectedColumns: Record<string, string>
}
interface UploadRecord {
  id: string; platform: string; filename: string
  uploadedAt: string; period?: string; metrics: ParsedMetrics
}

// ── Platform config ───────────────────────────────────────────────────────────
const PLATFORMS = [
  {
    key: 'google_ads', label: 'Google Ads', color: '#4285F4',
    exportPath: 'Reports → Campaigns → Download (.csv)',
    scheduleLink: 'https://ads.google.com',
    scheduleSteps: [
      'In Google Ads, go to Reports → Predefined reports → Basic → Campaign',
      'Set date range to "Last month"',
      'Click the download icon → CSV',
      'Or go to Reports → Custom → Save and schedule to get monthly emails',
    ],
  },
  {
    key: 'ga4', label: 'GA4', color: '#FF6D00',
    exportPath: 'Reports → Download (CSV)',
    scheduleLink: 'https://analytics.google.com',
    scheduleSteps: [
      'In GA4, open any report (e.g. Traffic acquisition)',
      'Click the download icon in the top-right → Download CSV',
      'For scheduled exports, use Looker Studio connected to GA4 and enable scheduled email delivery',
    ],
  },
  {
    key: 'meta', label: 'Meta Ads', color: '#0082FB',
    exportPath: 'Ads Manager → Export → Export Table Data',
    scheduleLink: 'https://adsmanager.facebook.com',
    scheduleSteps: [
      'In Ads Manager, go to Campaigns tab',
      'Click the Columns dropdown → Customize columns → choose your metrics',
      'Click Export → Export Table Data → CSV',
      'To schedule: Reports → Create report → set frequency to Monthly → Save',
    ],
  },
  {
    key: 'linkedin', label: 'LinkedIn Ads', color: '#0A66C2',
    exportPath: 'Campaign Manager → Analyze → Export',
    scheduleLink: 'https://www.linkedin.com/campaignmanager',
    scheduleSteps: [
      'In Campaign Manager, click Analyze → Performance',
      'Set date range to last month',
      'Click Export → Download as CSV',
      'LinkedIn does not support scheduled exports natively — set a monthly calendar reminder',
    ],
  },
  {
    key: 'tiktok', label: 'TikTok Ads', color: '#FF0050',
    exportPath: 'Ads Manager → Reporting → Export',
    scheduleLink: 'https://ads.tiktok.com',
    scheduleSteps: [
      'In TikTok Ads Manager, go to Reporting → Custom Report',
      'Select your campaigns and date range (last month)',
      'Click Export → CSV',
      'To schedule: save the report and enable "Schedule Report" for monthly delivery',
    ],
  },
  {
    key: 'x_ads', label: 'X Ads', color: '#14171A',
    exportPath: 'Ads → Analytics → Export',
    scheduleLink: 'https://ads.twitter.com',
    scheduleSteps: [
      'In X Ads, go to Campaigns',
      'Select the campaigns for last month',
      'Click Export → Export to CSV',
      'For scheduled reports: Analytics → Saved reports → Schedule',
    ],
  },
]

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = {
  currency: (n: number) => n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : `$${n.toFixed(0)}`,
  number:   (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : `${n.toFixed(0)}`,
  roas:     (n: number) => `${n.toFixed(2)}x`,
  date:     (s: string) => new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
}

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]
function defaultPeriod(): string {
  const d = new Date()
  d.setMonth(d.getMonth() - 1)
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

// ── DropZone ─────────────────────────────────────────────────────────────────
function DropZone({ onFile }: { onFile: (f: File) => void }) {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleDrop(e: DragEvent) {
    e.preventDefault(); setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) onFile(f)
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={clsx(
        'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all',
        dragging ? 'border-indigo-400 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50',
      )}
    >
      <Upload size={24} className={clsx('mx-auto mb-2', dragging ? 'text-indigo-500' : 'text-gray-300')} />
      <p className="text-sm font-medium text-gray-600">Drop your export here or <span className="text-indigo-600">click to browse</span></p>
      <p className="text-xs text-gray-400 mt-1">CSV or Excel (.xlsx) — any platform export format</p>
      <input
        ref={inputRef} type="file" className="hidden"
        accept=".csv,.xlsx,.xls,.xlsm,.tsv,.txt"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = '' }}
      />
    </div>
  )
}

// ── MetricPill ────────────────────────────────────────────────────────────────
function MetricPill({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <span className={clsx('text-xs px-2 py-0.5 rounded-full', highlight ? 'bg-emerald-50 text-emerald-700 font-bold' : 'bg-gray-100 text-gray-600')}>
      {label}: {value}
    </span>
  )
}

// ── AutomationPanel ───────────────────────────────────────────────────────────
function AutomationPanel({ clientId }: { clientId: string }) {
  const [tab, setTab] = useState<'curl' | 'schedule'>('curl')
  const [platform, setPlatform] = useState(PLATFORMS[0].key)
  const apiKey = 'your-UPLOAD_API_KEY-from-.env'
  const serverUrl = 'http://localhost:3001'

  const curlCmd = `curl -X POST "${serverUrl}/api/uploads/${clientId}/${platform}" \\
  -H "x-api-key: ${apiKey}" \\
  -F "file=@/path/to/export.csv" \\
  -F "period=January 2026"`

  const p = PLATFORMS.find((x) => x.key === platform)!

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        <Terminal size={16} className="text-gray-400" />
        <span className="text-sm font-semibold text-gray-700">Automate Monthly Uploads</span>
      </div>

      <div className="p-4 space-y-4">
        <p className="text-sm text-gray-500">
          Each client has its own upload URL. You can automate uploads using a script, cron job, Zapier, or Make — no OAuth needed.
        </p>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-0.5 rounded-lg w-fit">
          {([['curl', 'API / curl'], ['schedule', 'Platform export settings']] as const).map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)}
              className={clsx('px-3 py-1.5 text-xs font-medium rounded-md transition', tab === id ? 'bg-white shadow text-gray-800' : 'text-gray-500 hover:text-gray-700')}>
              {label}
            </button>
          ))}
        </div>

        {/* Platform selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Platform:</span>
          <select
            value={platform} onChange={(e) => setPlatform(e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-300"
          >
            {PLATFORMS.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
          </select>
        </div>

        {tab === 'curl' && (
          <div className="space-y-3">
            <p className="text-xs text-gray-500">
              Set <code className="bg-gray-100 px-1 rounded">UPLOAD_API_KEY</code> in your <code className="bg-gray-100 px-1 rounded">.env</code> to a secret string. Then use it in scripts or automation tools.
            </p>
            <div className="bg-gray-900 rounded-lg p-4 relative group">
              <pre className="text-xs text-green-300 font-mono whitespace-pre-wrap break-all leading-5">{curlCmd}</pre>
              <button
                onClick={() => navigator.clipboard.writeText(curlCmd)}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-xs bg-gray-700 hover:bg-gray-600 text-gray-200 px-2 py-1 rounded transition"
              >
                Copy
              </button>
            </div>
            <p className="text-xs text-gray-400">
              Works with Zapier (Webhooks), Make (HTTP module), n8n, cron scripts, or any tool that can make HTTP POST requests.
            </p>
          </div>
        )}

        {tab === 'schedule' && (
          <div className="space-y-3">
            <p className="text-xs text-gray-500">
              Set up scheduled exports in each platform so you receive the CSV by email at the start of each month. Then upload here.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
                {p.label}
                <a href={p.scheduleLink} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-indigo-500 hover:underline ml-auto">Open platform →</a>
              </div>
              <ol className="space-y-1.5 ml-4">
                {p.scheduleSteps.map((step, i) => (
                  <li key={i} className="text-xs text-gray-600 flex gap-2">
                    <span className="text-gray-400 flex-shrink-0">{i + 1}.</span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function UploadsPage() {
  const { selected, clients } = useClients()
  const [uploads,   setUploads]   = useState<UploadRecord[]>([])
  const [loading,   setLoading]   = useState(false)
  const [uploading, setUploading] = useState(false)
  const [platform,  setPlatform]  = useState(PLATFORMS[0].key)
  const [period,    setPeriod]    = useState(defaultPeriod)
  const [error,     setError]     = useState('')
  const [success,   setSuccess]   = useState('')
  const [showAuto,  setShowAuto]  = useState(false)

  useEffect(() => {
    if (selected) fetchUploads(selected.id)
    else setUploads([])
  }, [selected?.id])

  async function fetchUploads(clientId: string) {
    setLoading(true)
    try {
      const res = await fetch(`/api/uploads/${clientId}`, { credentials: 'include' })
      if (res.ok) setUploads(await res.json() as UploadRecord[])
    } finally { setLoading(false) }
  }

  async function handleFile(file: File) {
    if (!selected) return
    setUploading(true); setError(''); setSuccess('')
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('period', period)
      const res = await fetch(`/api/uploads/${selected.id}/${platform}`, {
        method: 'POST', credentials: 'include', body: fd,
      })
      const data = await res.json() as UploadRecord & { error?: string }
      if (!res.ok) { setError(data.error ?? 'Upload failed'); return }
      setUploads((prev) => [data, ...prev])
      setSuccess(`Uploaded "${file.name}" — ${data.metrics.rows} rows parsed`)
    } catch {
      setError('Upload failed. Check the server is running.')
    } finally { setUploading(false) }
  }

  async function deleteUpload(id: string) {
    if (!selected) return
    await fetch(`/api/uploads/${selected.id}/${id}`, { method: 'DELETE', credentials: 'include' })
    setUploads((prev) => prev.filter((u) => u.id !== id))
  }

  // Group uploads by platform for the history view
  const byPlatform = PLATFORMS.map((p) => ({
    ...p,
    records: uploads.filter((u) => u.platform === p.key),
  }))

  if (clients.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-16 text-center text-gray-400">
        <p className="text-lg font-medium mb-2">No clients yet</p>
        <p className="text-sm">Add a client using the dropdown in the nav first.</p>
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

  const platformsWithData = byPlatform.filter((p) => p.records.length > 0).length

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">

      {/* Header */}
      <div className="flex items-start gap-3">
        <span className="w-3.5 h-3.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: selected.color }} />
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Upload Data — {selected.name}</h1>
          <p className="text-gray-500 text-sm mt-1">
            Upload CSV or Excel exports from any ad platform. The dashboard will use the latest upload per platform.
            {' '}<span className="font-medium text-indigo-600">{platformsWithData} of {PLATFORMS.length} platforms have data.</span>
          </p>
        </div>
      </div>

      {/* Feedback */}
      {success && (
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-sm">
          <CheckCircle size={16} className="text-emerald-500 flex-shrink-0" />
          {success}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl text-sm">
          <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Upload area */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
          <Upload size={15} className="text-indigo-500" /> Upload new export
        </h2>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Platform</label>
            <select
              value={platform} onChange={(e) => setPlatform(e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
            >
              {PLATFORMS.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              <Calendar size={11} className="inline mr-1" />Reporting period
            </label>
            <input
              type="text"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              placeholder="e.g. January 2026"
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>
        </div>

        {uploading ? (
          <div className="border-2 border-dashed border-indigo-200 rounded-xl p-8 text-center">
            <RefreshCw size={24} className="mx-auto mb-2 animate-spin text-indigo-400" />
            <p className="text-sm text-gray-500">Parsing file…</p>
          </div>
        ) : (
          <DropZone onFile={handleFile} />
        )}

        <p className="text-xs text-gray-400">
          Just export whatever your platform gives you — the parser auto-detects spend, impressions, clicks, conversions, and revenue columns.
        </p>
      </div>

      {/* Upload history by platform */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-700">Upload history</h2>

        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)
        ) : (
          byPlatform.map((p) => (
            <div key={p.key} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              {/* Platform header */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: p.color }} />
                <span className="text-sm font-semibold text-gray-800">{p.label}</span>
                {p.records.length === 0 && <span className="text-xs text-gray-400 ml-auto">No uploads yet</span>}
                {p.records.length > 0 && (
                  <span className="text-xs text-emerald-600 font-medium ml-auto flex items-center gap-1">
                    <CheckCircle size={11} /> {p.records.length} upload{p.records.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>

              {/* Records */}
              {p.records.length > 0 && (
                <div className="divide-y divide-gray-50">
                  {p.records.map((r, idx) => (
                    <div key={r.id} className={clsx('px-4 py-3 flex items-start gap-3', idx === 0 && 'bg-emerald-50/50')}>
                      <FileText size={14} className="text-gray-300 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1.5">
                          <span className="text-xs font-medium text-gray-700 truncate">{r.filename}</span>
                          {r.period && (
                            <span className="text-xs bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded font-medium">{r.period}</span>
                          )}
                          {idx === 0 && <span className="text-xs bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-medium">Latest</span>}
                          <span className="text-xs text-gray-400 ml-auto">{fmt.date(r.uploadedAt)}</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {r.metrics.spend > 0        && <MetricPill label="Spend"       value={fmt.currency(r.metrics.spend)} />}
                          {r.metrics.impressions > 0   && <MetricPill label="Impr"        value={fmt.number(r.metrics.impressions)} />}
                          {r.metrics.clicks > 0        && <MetricPill label="Clicks"      value={fmt.number(r.metrics.clicks)} />}
                          {r.metrics.conversions > 0   && <MetricPill label="Conv"        value={fmt.number(r.metrics.conversions)} />}
                          {r.metrics.roas > 0          && <MetricPill label="ROAS"        value={fmt.roas(r.metrics.roas)} highlight />}
                          <span className="text-xs text-gray-400">{r.metrics.rows} rows</span>
                        </div>
                        {Object.keys(r.metrics.detectedColumns).length === 0 && (
                          <p className="text-xs text-amber-600 mt-1">⚠ No standard columns detected — check column names in the export</p>
                        )}
                      </div>
                      <button onClick={() => deleteUpload(r.id)} className="text-gray-300 hover:text-red-500 transition flex-shrink-0 mt-0.5">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Export instructions */}
              {p.records.length === 0 && (
                <div className="px-4 py-3 text-xs text-gray-500">
                  Export from: <span className="font-medium text-gray-700">{p.exportPath}</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Automation section */}
      <div>
        <button
          onClick={() => setShowAuto((v) => !v)}
          className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-indigo-600 transition"
        >
          {showAuto ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
          Automate monthly uploads
        </button>
        {showAuto && (
          <div className="mt-3">
            <AutomationPanel clientId={selected.id} />
          </div>
        )}
      </div>

    </div>
  )
}
