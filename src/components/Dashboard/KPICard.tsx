import { ReactNode } from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import clsx from 'clsx'
import { fmtChange, pctChange } from '../../utils/formatters'

interface KPICardProps {
  label: string
  value: string
  current: number
  previous: number
  icon: ReactNode
  invertTrend?: boolean  // for CPA/CPC: lower is better
  goalValue?: string
  goalMet?: boolean
  accentColor?: string
}

export default function KPICard({
  label,
  value,
  current,
  previous,
  icon,
  invertTrend = false,
  goalValue,
  goalMet,
  accentColor = 'indigo',
}: KPICardProps) {
  const pct = pctChange(current, previous)
  const isPositive = invertTrend ? pct < 0 : pct > 0
  const isNeutral = Math.abs(pct) < 0.5

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <span className={clsx('p-2 rounded-lg', `bg-${accentColor}-50 text-${accentColor}-600`)}>
          {icon}
        </span>
      </div>

      <div>
        <p className="text-2xl font-bold text-gray-900 tracking-tight">{value}</p>
        {goalValue && (
          <p className={clsx('text-xs mt-0.5 font-medium', goalMet ? 'text-emerald-600' : 'text-amber-600')}>
            {goalMet ? '✓' : '○'} Goal: {goalValue}
          </p>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        {isNeutral ? (
          <Minus size={14} className="text-gray-400" />
        ) : isPositive ? (
          <TrendingUp size={14} className="text-emerald-500" />
        ) : (
          <TrendingDown size={14} className="text-red-500" />
        )}
        <span
          className={clsx(
            'text-xs font-semibold',
            isNeutral ? 'text-gray-400' : isPositive ? 'text-emerald-600' : 'text-red-500',
          )}
        >
          {fmtChange(pct)}
        </span>
        <span className="text-xs text-gray-400">vs prev period</span>
      </div>
    </div>
  )
}
