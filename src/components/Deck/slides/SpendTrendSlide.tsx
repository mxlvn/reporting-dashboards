import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from 'recharts'
import { ReportData } from '../../../types'
import { PLATFORM_META, fmtCurrency, fmtNumber } from '../../../utils/formatters'

interface Props { data: ReportData }

const PLATFORMS = ['google_ads', 'meta_ads', 'linkedin_ads', 'x_ads', 'tiktok_ads'] as const

const labelDate = (d: string) => {
  const dt = new Date(d + 'T00:00:00')
  return `${dt.toLocaleString('en', { month: 'short' })} ${dt.getDate()}`
}

export default function SpendTrendSlide({ data }: Props) {
  const { dailySpendTrend, conversionTrend, client } = data

  return (
    <div className="slide bg-white flex flex-col p-12">
      <div className="mb-8">
        <p className="text-indigo-600 text-sm font-semibold uppercase tracking-widest mb-1">Channel Performance</p>
        <h2 className="text-4xl font-black text-gray-900">Daily Spend & Conversion Trends</h2>
        <p className="text-gray-500 mt-1">{client.reportingPeriod}</p>
      </div>

      <div className="grid grid-cols-2 gap-6 flex-1">
        {/* Spend trend */}
        <div className="bg-gray-50 rounded-xl p-5">
          <p className="text-sm font-semibold text-gray-700 mb-3">Daily Spend by Platform</p>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={dailySpendTrend} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <defs>
                {PLATFORMS.map((p) => (
                  <linearGradient key={p} id={`dg-${p}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={PLATFORM_META[p].color} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={PLATFORM_META[p].color} stopOpacity={0.02} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" tickFormatter={labelDate} tick={{ fontSize: 10 }} tickLine={false} />
              <YAxis tickFormatter={(v) => fmtCurrency(v, true)} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip formatter={(v: number) => fmtCurrency(v)} labelFormatter={labelDate} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Legend formatter={(v) => <span style={{ fontSize: 10 }}>{PLATFORM_META[v as keyof typeof PLATFORM_META]?.label ?? v}</span>} />
              {PLATFORMS.map((p) => (
                <Area key={p} type="monotone" dataKey={p} stackId="1" stroke={PLATFORM_META[p].color} fill={`url(#dg-${p})`} strokeWidth={1.5} dot={false} />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Conversion trend */}
        <div className="bg-gray-50 rounded-xl p-5">
          <p className="text-sm font-semibold text-gray-700 mb-3">Daily Conversions by Platform</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={conversionTrend} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" tickFormatter={labelDate} tick={{ fontSize: 10 }} tickLine={false} />
              <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip formatter={(v: number) => fmtNumber(v)} labelFormatter={labelDate} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Legend formatter={(v) => <span style={{ fontSize: 10 }}>{PLATFORM_META[v as keyof typeof PLATFORM_META]?.label ?? v}</span>} />
              {PLATFORMS.map((p) => (
                <Bar key={p} dataKey={p} stackId="a" fill={PLATFORM_META[p].color} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
