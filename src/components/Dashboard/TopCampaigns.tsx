import { Campaign } from '../../types'
import { PLATFORM_META, fmtCurrency, fmtNumber, fmtPercent, fmtRoas } from '../../utils/formatters'
import clsx from 'clsx'

interface Props {
  campaigns: Campaign[]
}

export default function TopCampaigns({ campaigns }: Props) {
  const sorted = [...campaigns].sort((a, b) => b.conversions - a.conversions)

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-700">Top Campaigns by Conversions</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
              <th className="px-4 py-3 text-left font-medium">Campaign</th>
              <th className="px-4 py-3 text-left font-medium">Platform</th>
              <th className="px-4 py-3 text-right font-medium">Spend</th>
              <th className="px-4 py-3 text-right font-medium">Impressions</th>
              <th className="px-4 py-3 text-right font-medium">CTR</th>
              <th className="px-4 py-3 text-right font-medium">Conversions</th>
              <th className="px-4 py-3 text-right font-medium">ROAS</th>
              <th className="px-4 py-3 text-center font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {sorted.map((c) => {
              const m = PLATFORM_META[c.platform]
              return (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 max-w-xs">
                    <span className="font-medium text-gray-800 truncate block" title={c.name}>{c.name}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={clsx('inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full', m.bg, m.text)}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: m.color }} />
                      {m.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600">{fmtCurrency(c.spend)}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{fmtNumber(c.impressions, true)}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{fmtPercent(c.ctr)}</td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-800">{fmtNumber(c.conversions)}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={clsx('font-bold', c.roas >= 4 ? 'text-emerald-600' : c.roas >= 3 ? 'text-blue-600' : c.roas >= 2 ? 'text-amber-600' : 'text-red-500')}>
                      {fmtRoas(c.roas)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium',
                      c.status === 'active'  ? 'bg-emerald-50 text-emerald-700' :
                      c.status === 'paused'  ? 'bg-amber-50 text-amber-700' :
                                               'bg-gray-100 text-gray-600')}>
                      {c.status}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
