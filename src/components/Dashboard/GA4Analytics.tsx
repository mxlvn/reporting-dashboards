import { GA4Metrics } from '../../types'
import { fmtNumber, fmtPercent, fmtDuration, fmtChange, pctChange } from '../../utils/formatters'
import { TrendingUp, TrendingDown, Minus, Globe } from 'lucide-react'
import clsx from 'clsx'

interface Props {
  ga4: GA4Metrics
}

function StatRow({
  label,
  value,
  current,
  previous,
  invert = false,
}: {
  label: string
  value: string
  current: number
  previous: number
  invert?: boolean
}) {
  const pct = pctChange(current, previous)
  const isPositive = invert ? pct < 0 : pct > 0
  const isNeutral = Math.abs(pct) < 0.5
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-600">{label}</span>
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold text-gray-800">{value}</span>
        <span className={clsx('inline-flex items-center gap-0.5 text-xs font-medium w-14 justify-end',
          isNeutral ? 'text-gray-400' : isPositive ? 'text-emerald-600' : 'text-red-500')}>
          {isNeutral ? <Minus size={11} /> : isPositive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
          {fmtChange(pct)}
        </span>
      </div>
    </div>
  )
}

export default function GA4Analytics({ ga4 }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <span className="p-1.5 bg-orange-50 rounded-lg">
          <Globe size={16} className="text-orange-500" />
        </span>
        <h3 className="text-sm font-semibold text-gray-700">GA4 Web Analytics</h3>
      </div>

      {/* Top stats row */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: 'Sessions', value: fmtNumber(ga4.sessions, true), current: ga4.sessions, previous: ga4.prevSessions },
          { label: 'Users', value: fmtNumber(ga4.users, true), current: ga4.users, previous: ga4.prevUsers },
          { label: 'Conversions', value: fmtNumber(ga4.conversions), current: ga4.conversions, previous: ga4.prevConversions },
        ].map((s) => {
          const pct = pctChange(s.current, s.previous)
          const isPositive = pct > 0
          const isNeutral = Math.abs(pct) < 0.5
          return (
            <div key={s.label} className="bg-orange-50 rounded-lg p-3 text-center">
              <p className="text-xs text-orange-700 font-medium mb-1">{s.label}</p>
              <p className="text-xl font-bold text-gray-900">{s.value}</p>
              <p className={clsx('text-xs font-medium mt-0.5 flex items-center justify-center gap-0.5',
                isNeutral ? 'text-gray-400' : isPositive ? 'text-emerald-600' : 'text-red-500')}>
                {isNeutral ? <Minus size={10} /> : isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                {fmtChange(pct)}
              </p>
            </div>
          )
        })}
      </div>

      <div>
        <StatRow label="New Users" value={fmtNumber(ga4.newUsers, true)} current={ga4.newUsers} previous={Math.round(ga4.prevUsers * 0.77)} />
        <StatRow label="Bounce Rate" value={fmtPercent(ga4.bounceRate)} current={ga4.bounceRate} previous={ga4.bounceRate * 1.05} invert />
        <StatRow label="Avg. Session Duration" value={fmtDuration(ga4.avgSessionDuration)} current={ga4.avgSessionDuration} previous={ga4.avgSessionDuration * 0.94} />
        <StatRow label="Conversion Rate" value={fmtPercent(ga4.conversionRate, 2)} current={ga4.conversionRate} previous={ga4.prevConversions / ga4.prevSessions * 100} />
      </div>

      {/* New vs Returning */}
      <div className="mt-4">
        <p className="text-xs text-gray-500 mb-2">New vs. Returning Users</p>
        <div className="h-2 rounded-full bg-gray-100 overflow-hidden flex">
          <div
            className="h-full bg-orange-400 rounded-l-full"
            style={{ width: `${(ga4.newUsers / ga4.users) * 100}%` }}
          />
          <div className="h-full bg-orange-200 flex-1" />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>New: {fmtPercent((ga4.newUsers / ga4.users) * 100, 0)}</span>
          <span>Returning: {fmtPercent(((ga4.users - ga4.newUsers) / ga4.users) * 100, 0)}</span>
        </div>
      </div>
    </div>
  )
}
