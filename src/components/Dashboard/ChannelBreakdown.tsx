import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { PlatformMetrics } from '../../types'
import { PLATFORM_META, fmtCurrency, fmtPercent } from '../../utils/formatters'

interface Props {
  platforms: PlatformMetrics[]
}

export default function ChannelBreakdown({ platforms }: Props) {
  const totalSpend = platforms.reduce((s, p) => s + p.spend, 0)

  const data = platforms.map((p) => ({
    name: PLATFORM_META[p.platform].label,
    value: p.spend,
    color: PLATFORM_META[p.platform].color,
    pct: (p.spend / totalSpend) * 100,
  }))

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: {
    cx: number; cy: number; midAngle: number; innerRadius: number; outerRadius: number; percent: number
  }) => {
    if (percent < 0.06) return null
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)
    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={600}>
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Spend by Channel</h3>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomLabel}
            outerRadius={110}
            innerRadius={50}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => [fmtCurrency(value), 'Spend']}
            contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }}
          />
          <Legend
            formatter={(value) => <span style={{ fontSize: 12, color: '#374151' }}>{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Spend breakdown list */}
      <div className="mt-2 space-y-2">
        {data.map((d) => (
          <div key={d.name} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
              <span className="text-gray-600">{d.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-semibold text-gray-800">{fmtCurrency(d.value)}</span>
              <span className="text-gray-400 w-10 text-right">{fmtPercent(d.pct, 0)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
