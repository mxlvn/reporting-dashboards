import { ClientConfig, PlatformMetrics } from '../../../types'
import { PLATFORM_META, fmtCurrency, fmtNumber, fmtRoas } from '../../../utils/formatters'

interface Props {
  client: ClientConfig
  platforms: PlatformMetrics[]
}

const PRIORITY_COLORS = {
  high:   { bg: 'bg-red-50',   border: 'border-red-200',   text: 'text-red-700',   badge: 'bg-red-100 text-red-700' },
  medium: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-700' },
  low:    { bg: 'bg-blue-50',  border: 'border-blue-200',  text: 'text-blue-700',  badge: 'bg-blue-100 text-blue-700' },
}

interface Recommendation {
  priority: 'high' | 'medium' | 'low'
  title: string
  detail: string
  owner: string
}

export default function RecommendationsSlide({ client, platforms }: Props) {
  const recommendations: Recommendation[] = client.recommendations.map((r, i) => ({
    priority: i < 2 ? 'high' : i < 4 ? 'medium' : 'low',
    title: r.split('—')[0].trim(),
    detail: r,
    owner: ['Paid Media Team', 'Creative Team', 'Analytics Team', 'Strategy Team'][i % 4],
  }))

  const totalSpend = platforms.reduce((s, p) => s + p.spend, 0)
  const totalConversions = platforms.reduce((s, p) => s + p.conversions, 0)
  const totalRevenue = platforms.reduce((s, p) => s + p.revenue, 0)
  const bestPlatform = [...platforms].sort((a, b) => b.roas - a.roas)[0]
  const lowestCpa = [...platforms].sort((a, b) => a.cpa - b.cpa)[0]

  return (
    <div className="slide bg-gradient-to-br from-slate-900 to-indigo-950 text-white flex flex-col relative overflow-hidden">
      {/* BG decoration */}
      <div className="absolute inset-0 pointer-events-none opacity-10" style={{
        backgroundImage: 'radial-gradient(circle at 80% 20%, indigo, transparent 40%), radial-gradient(circle at 20% 80%, purple, transparent 40%)',
      }} />

      <div className="relative z-10 flex flex-col h-full p-12">
        {/* Header */}
        <div className="mb-8">
          <p className="text-indigo-400 text-sm font-semibold uppercase tracking-widest mb-1">Next Steps</p>
          <h2 className="text-4xl font-black">Recommendations & Action Items</h2>
          <p className="text-slate-400 mt-1">{client.reportingPeriod} · {client.name}</p>
        </div>

        <div className="flex gap-8 flex-1">
          {/* Recommendations */}
          <div className="flex-1 space-y-3">
            {recommendations.map((rec, i) => {
              const colors = PRIORITY_COLORS[rec.priority]
              return (
                <div key={i} className="bg-white/5 rounded-xl p-4 border border-white/10 backdrop-blur-sm">
                  <div className="flex items-start gap-3">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${colors.badge} flex-shrink-0`}>{rec.priority.toUpperCase()}</span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-white leading-snug">{rec.detail}</p>
                      <p className="text-xs text-slate-400 mt-1">Owner: {rec.owner}</p>
                    </div>
                    <span className="text-slate-500 text-sm font-bold flex-shrink-0">{String(i + 1).padStart(2, '0')}</span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Right: highlights */}
          <div className="w-72 flex flex-col gap-4">
            {/* Period summary */}
            <div className="bg-white/5 rounded-xl p-5 border border-white/10">
              <p className="text-xs text-indigo-400 font-semibold uppercase tracking-wide mb-3">Period Summary</p>
              <div className="space-y-3">
                {[
                  { label: 'Total Spend',    value: fmtCurrency(totalSpend) },
                  { label: 'Revenue',        value: fmtCurrency(totalRevenue) },
                  { label: 'Conversions',    value: fmtNumber(totalConversions) },
                  { label: 'Blended ROAS',   value: fmtRoas(totalRevenue / totalSpend) },
                ].map((s) => (
                  <div key={s.label} className="flex justify-between">
                    <span className="text-xs text-slate-400">{s.label}</span>
                    <span className="text-xs font-bold text-white">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top performers */}
            <div className="bg-white/5 rounded-xl p-5 border border-white/10">
              <p className="text-xs text-indigo-400 font-semibold uppercase tracking-wide mb-3">Top Performers</p>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-slate-400">Best ROAS</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="w-2 h-2 rounded-full" style={{ background: PLATFORM_META[bestPlatform.platform].color }} />
                    <span className="text-sm font-bold text-white">{PLATFORM_META[bestPlatform.platform].label}</span>
                    <span className="ml-auto text-emerald-400 font-bold text-sm">{fmtRoas(bestPlatform.roas)}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Lowest CPA</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="w-2 h-2 rounded-full" style={{ background: PLATFORM_META[lowestCpa.platform].color }} />
                    <span className="text-sm font-bold text-white">{PLATFORM_META[lowestCpa.platform].label}</span>
                    <span className="ml-auto text-emerald-400 font-bold text-sm">{fmtCurrency(lowestCpa.cpa)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Next steps */}
            <div className="bg-indigo-600/20 rounded-xl p-5 border border-indigo-500/30 flex-1">
              <p className="text-xs text-indigo-400 font-semibold uppercase tracking-wide mb-3">Next Review</p>
              <p className="text-sm text-slate-200">Monthly performance review scheduled for next month. All action items to be implemented within 2 weeks.</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-4 border-t border-white/10 mt-4">
          <p className="text-xs text-slate-500">{client.name} · Paid Media Report · {client.reportingMonth}</p>
          <p className="text-xs text-slate-500">Confidential</p>
        </div>
      </div>
    </div>
  )
}
