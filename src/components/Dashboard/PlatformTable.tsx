import { PlatformMetrics } from '../../types'
import { PLATFORM_META, fmtCurrency, fmtNumber, fmtPercent, fmtRoas, fmtChange, pctChange } from '../../utils/formatters'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import clsx from 'clsx'

interface Props {
  platforms: PlatformMetrics[]
}

function DeltaBadge({ current, previous, invert = false }: { current: number; previous: number; invert?: boolean }) {
  const pct = pctChange(current, previous)
  const isPositive = invert ? pct < 0 : pct > 0
  const isNeutral = Math.abs(pct) < 0.5
  return (
    <span className={clsx('inline-flex items-center gap-0.5 text-xs font-medium', isNeutral ? 'text-gray-400' : isPositive ? 'text-emerald-600' : 'text-red-500')}>
      {isNeutral ? <Minus size={11} /> : isPositive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
      {fmtChange(pct)}
    </span>
  )
}

export default function PlatformTable({ platforms }: Props) {
  const totals = platforms.reduce(
    (acc, p) => ({
      spend: acc.spend + p.spend,
      impressions: acc.impressions + p.impressions,
      clicks: acc.clicks + p.clicks,
      conversions: acc.conversions + p.conversions,
      revenue: acc.revenue + p.revenue,
      prevSpend: acc.prevSpend + p.prevSpend,
      prevConversions: acc.prevConversions + p.prevConversions,
      prevRevenue: acc.prevRevenue + p.prevRevenue,
    }),
    { spend: 0, impressions: 0, clicks: 0, conversions: 0, revenue: 0, prevSpend: 0, prevConversions: 0, prevRevenue: 0 },
  )
  const totalRoas = totals.revenue / totals.spend
  const totalCtr = (totals.clicks / totals.impressions) * 100
  const totalCpc = totals.spend / totals.clicks
  const totalCpa = totals.spend / totals.conversions

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-700">Platform Performance Summary</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
              <th className="px-4 py-3 text-left font-medium">Platform</th>
              <th className="px-4 py-3 text-right font-medium">Spend</th>
              <th className="px-4 py-3 text-right font-medium">Impressions</th>
              <th className="px-4 py-3 text-right font-medium">Clicks</th>
              <th className="px-4 py-3 text-right font-medium">CTR</th>
              <th className="px-4 py-3 text-right font-medium">CPC</th>
              <th className="px-4 py-3 text-right font-medium">Conversions</th>
              <th className="px-4 py-3 text-right font-medium">CPA</th>
              <th className="px-4 py-3 text-right font-medium">Revenue</th>
              <th className="px-4 py-3 text-right font-medium">ROAS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {platforms.map((p) => {
              const m = PLATFORM_META[p.platform]
              return (
                <tr key={p.platform} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: m.color }} />
                      <span className="font-medium text-gray-800">{m.label}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div>{fmtCurrency(p.spend)}</div>
                    <DeltaBadge current={p.spend} previous={p.prevSpend} />
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600">{fmtNumber(p.impressions, true)}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{fmtNumber(p.clicks, true)}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{fmtPercent(p.ctr)}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{fmtCurrency(p.cpc)}</td>
                  <td className="px-4 py-3 text-right">
                    <div>{fmtNumber(p.conversions)}</div>
                    <DeltaBadge current={p.conversions} previous={p.prevConversions} />
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600">{fmtCurrency(p.cpa)}</td>
                  <td className="px-4 py-3 text-right">
                    <div>{fmtCurrency(p.revenue)}</div>
                    <DeltaBadge current={p.revenue} previous={p.prevRevenue} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={clsx('font-bold', p.roas >= 3.5 ? 'text-emerald-600' : p.roas >= 2.5 ? 'text-amber-600' : 'text-red-500')}>
                      {fmtRoas(p.roas)}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            <tr className="bg-gray-50 font-semibold border-t border-gray-200 text-gray-800">
              <td className="px-4 py-3">Total</td>
              <td className="px-4 py-3 text-right">
                <div>{fmtCurrency(totals.spend)}</div>
                <DeltaBadge current={totals.spend} previous={totals.prevSpend} />
              </td>
              <td className="px-4 py-3 text-right text-gray-700">{fmtNumber(totals.impressions, true)}</td>
              <td className="px-4 py-3 text-right text-gray-700">{fmtNumber(totals.clicks, true)}</td>
              <td className="px-4 py-3 text-right text-gray-700">{fmtPercent(totalCtr)}</td>
              <td className="px-4 py-3 text-right text-gray-700">{fmtCurrency(totalCpc)}</td>
              <td className="px-4 py-3 text-right">
                <div>{fmtNumber(totals.conversions)}</div>
                <DeltaBadge current={totals.conversions} previous={totals.prevConversions} />
              </td>
              <td className="px-4 py-3 text-right text-gray-700">{fmtCurrency(totalCpa)}</td>
              <td className="px-4 py-3 text-right">
                <div>{fmtCurrency(totals.revenue)}</div>
                <DeltaBadge current={totals.revenue} previous={totals.prevRevenue} />
              </td>
              <td className="px-4 py-3 text-right">
                <span className={clsx('font-bold', totalRoas >= 3.5 ? 'text-emerald-600' : 'text-amber-600')}>
                  {fmtRoas(totalRoas)}
                </span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
