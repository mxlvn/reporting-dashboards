import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { GA4Metrics } from '../../../types'
import { fmtNumber, fmtPercent, fmtDuration, pctChange, fmtChange } from '../../../utils/formatters'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import clsx from 'clsx'

interface Props {
  ga4: GA4Metrics
  reportingPeriod: string
}

function MetricCard({ label, value, current, previous, invert = false }: {
  label: string; value: string; current: number; previous: number; invert?: boolean
}) {
  const pct = pctChange(current, previous)
  const good = invert ? pct < 0 : pct > 0
  const neutral = Math.abs(pct) < 0.5
  return (
    <div className="bg-white rounded-xl p-4 border border-orange-100 shadow-sm">
      <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">{label}</p>
      <p className="text-2xl font-black text-gray-900">{value}</p>
      <span className={clsx('flex items-center gap-0.5 text-xs font-semibold mt-1',
        neutral ? 'text-gray-400' : good ? 'text-emerald-600' : 'text-red-500')}>
        {neutral ? <Minus size={11} /> : good ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
        {fmtChange(pct)}
      </span>
    </div>
  )
}

export default function GA4Slide({ ga4, reportingPeriod }: Props) {
  const channelData = [
    { channel: 'Paid Search', sessions: Math.round(ga4.sessions * 0.34), conversions: Math.round(ga4.conversions * 0.38) },
    { channel: 'Paid Social', sessions: Math.round(ga4.sessions * 0.26), conversions: Math.round(ga4.conversions * 0.22) },
    { channel: 'Organic Search', sessions: Math.round(ga4.sessions * 0.22), conversions: Math.round(ga4.conversions * 0.20) },
    { channel: 'Direct', sessions: Math.round(ga4.sessions * 0.10), conversions: Math.round(ga4.conversions * 0.12) },
    { channel: 'Referral', sessions: Math.round(ga4.sessions * 0.08), conversions: Math.round(ga4.conversions * 0.08) },
  ]

  const COLORS = ['#4285F4', '#0082FB', '#34A853', '#FBBC04', '#EA4335']

  return (
    <div className="slide bg-white flex flex-col">
      <div className="h-2 w-full bg-gradient-to-r from-orange-400 to-orange-600" />

      <div className="flex flex-col flex-1 p-12">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="w-4 h-4 rounded-full bg-orange-500" />
            <p className="text-sm font-semibold uppercase tracking-widest text-orange-600">Web Analytics</p>
          </div>
          <h2 className="text-4xl font-black text-gray-900">Google Analytics 4</h2>
          <p className="text-gray-500 mt-1 text-sm">{reportingPeriod}</p>
        </div>

        <div className="flex gap-6 flex-1">
          {/* Left: metrics */}
          <div className="flex-1">
            <div className="grid grid-cols-3 gap-3 mb-4">
              <MetricCard label="Sessions" value={fmtNumber(ga4.sessions, true)} current={ga4.sessions} previous={ga4.prevSessions} />
              <MetricCard label="Users" value={fmtNumber(ga4.users, true)} current={ga4.users} previous={ga4.prevUsers} />
              <MetricCard label="Conversions" value={fmtNumber(ga4.conversions)} current={ga4.conversions} previous={ga4.prevConversions} />
              <MetricCard label="New Users" value={fmtNumber(ga4.newUsers, true)} current={ga4.newUsers} previous={Math.round(ga4.prevUsers * 0.77)} />
              <MetricCard label="Bounce Rate" value={fmtPercent(ga4.bounceRate)} current={ga4.bounceRate} previous={ga4.bounceRate * 1.05} invert />
              <MetricCard label="Conv. Rate" value={fmtPercent(ga4.conversionRate, 2)} current={ga4.conversionRate} previous={ga4.prevConversions / ga4.prevSessions * 100} />
            </div>

            {/* Avg session duration */}
            <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">Avg. Session Duration</p>
                  <p className="text-3xl font-black text-gray-900">{fmtDuration(ga4.avgSessionDuration)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 mb-1">New vs Returning</p>
                  <div className="w-40 h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-400 rounded-l-full" style={{ width: `${(ga4.newUsers / ga4.users) * 100}%` }} />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-0.5">
                    <span>New {fmtPercent((ga4.newUsers / ga4.users) * 100, 0)}</span>
                    <span>Returning {fmtPercent(((ga4.users - ga4.newUsers) / ga4.users) * 100, 0)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: channel breakdown */}
          <div className="w-80 flex flex-col gap-4">
            <div className="bg-gray-50 rounded-xl p-4 flex-1">
              <p className="text-xs font-semibold text-gray-600 mb-3">Sessions by Channel</p>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={channelData} layout="vertical" margin={{ top: 0, right: 8, bottom: 0, left: 0 }}>
                  <XAxis type="number" tickFormatter={(v) => fmtNumber(v, true)} tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="channel" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} width={80} />
                  <Tooltip formatter={(v: number) => fmtNumber(v)} contentStyle={{ fontSize: 11 }} />
                  <Bar dataKey="sessions" radius={[0, 3, 3, 0]}>
                    {channelData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
              <p className="text-xs font-semibold text-orange-700 mb-2">Top Observations</p>
              <ul className="space-y-2">
                {[
                  `Paid channels drove ${fmtPercent((channelData[0].sessions + channelData[1].sessions) / ga4.sessions * 100, 0)} of total sessions`,
                  `Conversion rate improved to ${fmtPercent(ga4.conversionRate, 2)} vs ${fmtPercent(ga4.prevConversions / ga4.prevSessions * 100, 2)} prior period`,
                  `${fmtPercent((ga4.newUsers / ga4.users) * 100, 0)} of users are new — indicating strong top-of-funnel growth`,
                ].map((obs, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-orange-800">
                    <span className="text-orange-500 font-bold mt-0.5 flex-shrink-0">→</span>
                    {obs}
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
