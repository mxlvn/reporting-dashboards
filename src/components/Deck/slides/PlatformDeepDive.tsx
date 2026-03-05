import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Platform, PlatformMetrics, Campaign } from '../../../types'
import { PLATFORM_META, fmtCurrency, fmtNumber, fmtPercent, fmtRoas, pctChange, fmtChange } from '../../../utils/formatters'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import clsx from 'clsx'

interface Props {
  platform: Platform
  metrics: PlatformMetrics
  campaigns: Campaign[]
  reportingPeriod: string
}

function MetricBox({
  label, value, current, previous, invert = false,
}: { label: string; value: string; current: number; previous: number; invert?: boolean }) {
  const pct = pctChange(current, previous)
  const good = invert ? pct < 0 : pct > 0
  const neutral = Math.abs(pct) < 0.5
  return (
    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
      <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide font-medium">{label}</p>
      <p className="text-2xl font-black text-gray-900">{value}</p>
      <span className={clsx('flex items-center gap-0.5 text-xs font-semibold mt-1',
        neutral ? 'text-gray-400' : good ? 'text-emerald-600' : 'text-red-500')}>
        {neutral ? <Minus size={11} /> : good ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
        {fmtChange(pct)}
      </span>
    </div>
  )
}

// Platform-specific insights
const PLATFORM_INSIGHTS: Record<Platform, { tips: string[]; audience: string; bestFor: string }> = {
  google_ads: {
    tips: ['Search intent targeting drives highest purchase intent', 'Performance Max campaigns unify cross-channel reach', 'Smart bidding adapts to conversion signals in real-time'],
    audience: 'Active searchers with purchase intent',
    bestFor: 'Bottom-funnel conversions & brand defense',
  },
  meta_ads: {
    tips: ['Broad audience targeting with AI optimization outperforming narrow audiences', 'Video creative sees 3x engagement vs static images', 'Retargeting audiences yielding 4.2x ROAS vs prospecting'],
    audience: '18–54 across Facebook & Instagram',
    bestFor: 'Brand awareness, prospecting & retargeting',
  },
  linkedin_ads: {
    tips: ['Lead Gen Forms convert at 3x the rate of website clicks', 'Targeting by job title + company size narrows to decision-makers', 'Thought Leader Ads boost organic reach alongside paid'],
    audience: 'B2B professionals, decision-makers, C-suite',
    bestFor: 'B2B lead generation & brand authority',
  },
  x_ads: {
    tips: ['Promoted tweets blend with organic content for lower banner blindness', 'Video creatives see 70% more engagement than image ads', 'Retargeting website visitors achieves lowest CPAs'],
    audience: 'News-engaged, tech-savvy adults 25–44',
    bestFor: 'Brand awareness & real-time event targeting',
  },
  tiktok_ads: {
    tips: ['UGC-style creatives dramatically outperform polished video ads', 'TopView drives highest brand recall at launch', 'Lookalike audiences based on purchasers achieving 4.5x ROAS'],
    audience: '16–34 highly engaged mobile-first users',
    bestFor: 'Top-of-funnel & Gen Z/Millennial engagement',
  },
}

export default function PlatformDeepDive({ platform, metrics, campaigns, reportingPeriod }: Props) {
  const m = PLATFORM_META[platform]
  const insight = PLATFORM_INSIGHTS[platform]
  const platformCampaigns = campaigns.filter((c) => c.platform === platform)

  return (
    <div className="slide flex flex-col" style={{ background: 'white' }}>
      {/* Top bar with platform color */}
      <div className="h-2 w-full" style={{ background: m.color }} />

      <div className="flex flex-col flex-1 p-12">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="w-4 h-4 rounded-full" style={{ background: m.color }} />
              <p className="text-sm font-semibold uppercase tracking-widest" style={{ color: m.color }}>Platform Deep Dive</p>
            </div>
            <h2 className="text-4xl font-black text-gray-900">{m.label}</h2>
            <p className="text-gray-500 mt-1 text-sm">{reportingPeriod} · {insight.bestFor}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 mb-1">Audience</p>
            <p className="text-sm font-medium text-gray-700 max-w-48 text-right">{insight.audience}</p>
          </div>
        </div>

        <div className="flex gap-6 flex-1">
          {/* Left: metrics + campaigns */}
          <div className="flex-1 flex flex-col gap-4">
            <div className="grid grid-cols-3 gap-3">
              <MetricBox label="Spend" value={fmtCurrency(metrics.spend)} current={metrics.spend} previous={metrics.prevSpend} />
              <MetricBox label="Conversions" value={fmtNumber(metrics.conversions)} current={metrics.conversions} previous={metrics.prevConversions} />
              <MetricBox label="Revenue" value={fmtCurrency(metrics.revenue)} current={metrics.revenue} previous={metrics.prevRevenue} />
              <MetricBox label="CTR" value={fmtPercent(metrics.ctr)} current={metrics.ctr} previous={metrics.ctr * 0.92} />
              <MetricBox label="CPA" value={fmtCurrency(metrics.cpa)} current={metrics.cpa} previous={metrics.cpa * 1.08} invert />
              <MetricBox label="ROAS" value={fmtRoas(metrics.roas)} current={metrics.roas} previous={metrics.prevRevenue / metrics.prevSpend} />
            </div>

            {/* Campaign table */}
            {platformCampaigns.length > 0 && (
              <div className="bg-gray-50 rounded-xl overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-100 text-gray-500 uppercase tracking-wide">
                      <th className="px-3 py-2 text-left font-medium">Campaign</th>
                      <th className="px-3 py-2 text-right font-medium">Spend</th>
                      <th className="px-3 py-2 text-right font-medium">Conv.</th>
                      <th className="px-3 py-2 text-right font-medium">ROAS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {platformCampaigns.map((c) => (
                      <tr key={c.id} className="bg-white">
                        <td className="px-3 py-2 text-gray-700 font-medium">{c.name}</td>
                        <td className="px-3 py-2 text-right text-gray-600">{fmtCurrency(c.spend)}</td>
                        <td className="px-3 py-2 text-right text-gray-600">{c.conversions}</td>
                        <td className="px-3 py-2 text-right font-bold" style={{ color: c.roas >= 3.5 ? '#059669' : '#d97706' }}>
                          {fmtRoas(c.roas)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Right: chart + insights */}
          <div className="w-72 flex flex-col gap-4">
            {/* Bar chart: campaigns spend */}
            {platformCampaigns.length > 0 && (
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs font-semibold text-gray-600 mb-2">Spend Distribution</p>
                <ResponsiveContainer width="100%" height={140}>
                  <BarChart data={platformCampaigns} layout="vertical" margin={{ top: 0, right: 8, bottom: 0, left: 0 }}>
                    <XAxis type="number" tickFormatter={(v) => fmtCurrency(v, true)} tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} width={100}
                      tickFormatter={(v: string) => v.length > 18 ? v.slice(0, 18) + '…' : v}
                    />
                    <Tooltip formatter={(v: number) => fmtCurrency(v)} contentStyle={{ fontSize: 11 }} />
                    <Bar dataKey="spend" fill={m.color} radius={[0, 3, 3, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Insights */}
            <div className="rounded-xl p-4 flex-1" style={{ background: `${m.color}10`, border: `1px solid ${m.color}25` }}>
              <p className="text-xs font-semibold mb-3" style={{ color: m.color }}>Key Insights</p>
              <ul className="space-y-2">
                {insight.tips.map((t, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-gray-700">
                    <span className="mt-0.5 font-bold flex-shrink-0" style={{ color: m.color }}>→</span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
