import { ClientConfig, PlatformMetrics } from '../../types'
import { fmtCurrency, fmtNumber, fmtRoas, fmtPercent } from '../../utils/formatters'
import clsx from 'clsx'

interface Props {
  client: ClientConfig
  platforms: PlatformMetrics[]
}

interface GoalBarProps {
  label: string
  current: number
  goal: number
  fmtValue: (v: number) => string
}

function GoalBar({ label, current, goal, fmtValue }: GoalBarProps) {
  const pct = Math.min((current / goal) * 100, 100)
  const met = current >= goal
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-600 font-medium">{label}</span>
        <span className={clsx('font-semibold', met ? 'text-emerald-600' : 'text-gray-700')}>
          {fmtValue(current)} / {fmtValue(goal)}
        </span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={clsx('h-full rounded-full transition-all', met ? 'bg-emerald-500' : pct > 75 ? 'bg-blue-500' : pct > 50 ? 'bg-amber-400' : 'bg-red-400')}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className={clsx('text-xs mt-0.5', met ? 'text-emerald-600' : 'text-gray-400')}>
        {fmtPercent(pct, 0)} of goal{met ? ' ✓' : ''}
      </p>
    </div>
  )
}

export default function GoalProgress({ client, platforms }: Props) {
  const totalSpend = platforms.reduce((s, p) => s + p.spend, 0)
  const totalConversions = platforms.reduce((s, p) => s + p.conversions, 0)
  const totalRevenue = platforms.reduce((s, p) => s + p.revenue, 0)
  const blendedRoas = totalRevenue / totalSpend

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Goal Progress</h3>
      <div className="space-y-4">
        <GoalBar label="Total Spend" current={totalSpend} goal={client.goals.spend} fmtValue={(v) => fmtCurrency(v, true)} />
        <GoalBar label="Conversions" current={totalConversions} goal={client.goals.conversions} fmtValue={(v) => fmtNumber(v)} />
        <GoalBar label="Revenue" current={totalRevenue} goal={client.goals.revenue} fmtValue={(v) => fmtCurrency(v, true)} />
        <GoalBar label="ROAS" current={blendedRoas} goal={client.goals.roas} fmtValue={(v) => fmtRoas(v)} />
      </div>
    </div>
  )
}
