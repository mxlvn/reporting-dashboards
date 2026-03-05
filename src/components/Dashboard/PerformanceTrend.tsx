import { useState } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar,
} from 'recharts'
import { DailyDataPoint, ConversionTrendPoint } from '../../types'
import { PLATFORM_META, fmtCurrency, fmtNumber } from '../../utils/formatters'
import clsx from 'clsx'

type Metric = 'spend' | 'conversions'

interface Props {
  dailySpend: DailyDataPoint[]
  conversionTrend: ConversionTrendPoint[]
}

const PLATFORMS = ['google_ads', 'meta_ads', 'linkedin_ads', 'x_ads', 'tiktok_ads'] as const

export default function PerformanceTrend({ dailySpend, conversionTrend }: Props) {
  const [metric, setMetric] = useState<Metric>('spend')

  const data = metric === 'spend' ? dailySpend : conversionTrend
  const formatter = metric === 'spend'
    ? (v: number) => fmtCurrency(v)
    : (v: number) => fmtNumber(v)

  const label = (d: string) => {
    const dt = new Date(d + 'T00:00:00')
    return `${dt.toLocaleString('en', { month: 'short' })} ${dt.getDate()}`
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-700">Daily Performance Trend</h3>
        <div className="flex bg-gray-100 rounded-lg p-0.5 gap-0.5">
          {(['spend', 'conversions'] as Metric[]).map((m) => (
            <button
              key={m}
              onClick={() => setMetric(m)}
              className={clsx(
                'px-3 py-1 text-xs font-medium rounded-md transition-all',
                metric === m ? 'bg-white shadow text-indigo-700' : 'text-gray-500 hover:text-gray-700',
              )}
            >
              {m === 'spend' ? 'Spend' : 'Conversions'}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        {metric === 'spend' ? (
          <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <defs>
              {PLATFORMS.map((p) => (
                <linearGradient key={p} id={`grad-${p}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={PLATFORM_META[p].color} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={PLATFORM_META[p].color} stopOpacity={0.02} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="date" tickFormatter={label} tick={{ fontSize: 11 }} tickLine={false} />
            <YAxis tickFormatter={(v) => fmtCurrency(v, true)} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
            <Tooltip formatter={(v: number) => formatter(v)} labelFormatter={label} contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }} />
            <Legend formatter={(v) => <span style={{ fontSize: 11, color: '#374151' }}>{PLATFORM_META[v as keyof typeof PLATFORM_META]?.label ?? v}</span>} />
            {PLATFORMS.map((p) => (
              <Area key={p} type="monotone" dataKey={p} stackId="1" stroke={PLATFORM_META[p].color} fill={`url(#grad-${p})`} strokeWidth={2} dot={false} />
            ))}
          </AreaChart>
        ) : (
          <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="date" tickFormatter={label} tick={{ fontSize: 11 }} tickLine={false} />
            <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
            <Tooltip formatter={(v: number) => formatter(v)} labelFormatter={label} contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }} />
            <Legend formatter={(v) => <span style={{ fontSize: 11, color: '#374151' }}>{PLATFORM_META[v as keyof typeof PLATFORM_META]?.label ?? v}</span>} />
            {PLATFORMS.map((p) => (
              <Bar key={p} dataKey={p} stackId="a" fill={PLATFORM_META[p].color} />
            ))}
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  )
}
