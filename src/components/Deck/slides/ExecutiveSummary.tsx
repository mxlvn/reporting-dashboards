import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { ReportData } from '../../../types'
import { PLATFORM_META, fmtCurrency, fmtNumber, fmtRoas, fmtPercent, pctChange, fmtChange } from '../../../utils/formatters'
import { TrendingUp, TrendingDown } from 'lucide-react'
import clsx from 'clsx'

interface Props { data: ReportData }

function Stat({ label, value, pct, invert = false }: { label: string; value: string; pct: number; invert?: boolean }) {
  const good = invert ? pct < 0 : pct > 0
  const neutral = Math.abs(pct) < 0.5
  return (
    <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">{label}</p>
      <p className="text-3xl font-black text-gray-900 mb-1">{value}</p>
      <div className={clsx('flex items-center gap-1 text-xs font-semibold', neutral ? 'text-gray-400' : good ? 'text-emerald-600' : 'text-red-500')}>
        {!neutral && (good ? <TrendingUp size={12} /> : <TrendingDown size={12} />)}
        {fmtChange(pct)} vs prev period
      </div>
    </div>
  )
}

export default function ExecutiveSummary({ data }: Props) {
  const { client, platforms } = data
  const ts = platforms.reduce((s, p) => s + p.spend, 0)
  const tc = platforms.reduce((s, p) => s + p.conversions, 0)
  const tr = platforms.reduce((s, p) => s + p.revenue, 0)
  const ps = platforms.reduce((s, p) => s + p.prevSpend, 0)
  const pc = platforms.reduce((s, p) => s + p.prevConversions, 0)
  const pr = platforms.reduce((s, p) => s + p.prevRevenue, 0)
  const roas = tr / ts
  const prevRoas = pr / ps

  const pieData = platforms.map((p) => ({ name: PLATFORM_META[p.platform].label, value: p.spend, color: PLATFORM_META[p.platform].color }))

  return (
    <div className="slide bg-gray-50 flex flex-col p-12">
      {/* Header */}
      <div className="mb-8">
        <p className="text-indigo-600 text-sm font-semibold uppercase tracking-widest mb-1">Executive Summary</p>
        <h2 className="text-4xl font-black text-gray-900">{client.reportingMonth} Performance Overview</h2>
      </div>

      <div className="flex gap-8 flex-1">
        {/* Left: KPIs */}
        <div className="flex-1">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Stat label="Total Spend" value={fmtCurrency(ts)} pct={pctChange(ts, ps)} />
            <Stat label="Revenue Generated" value={fmtCurrency(tr)} pct={pctChange(tr, pr)} />
            <Stat label="Total Conversions" value={fmtNumber(tc)} pct={pctChange(tc, pc)} />
            <Stat label="Blended ROAS" value={fmtRoas(roas)} pct={pctChange(roas, prevRoas)} />
          </div>

          {/* Goal pacing */}
          <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
            <p className="text-sm font-semibold text-gray-700 mb-3">Goal Pacing</p>
            {[
              { label: 'Spend', cur: ts, goal: client.goals.spend, fmt: (v: number) => fmtCurrency(v, true) },
              { label: 'Conversions', cur: tc, goal: client.goals.conversions, fmt: (v: number) => fmtNumber(v) },
              { label: 'Revenue', cur: tr, goal: client.goals.revenue, fmt: (v: number) => fmtCurrency(v, true) },
              { label: 'ROAS', cur: roas, goal: client.goals.roas, fmt: (v: number) => fmtRoas(v) },
            ].map((g) => {
              const pct = Math.min((g.cur / g.goal) * 100, 100)
              const met = g.cur >= g.goal
              return (
                <div key={g.label} className="mb-2 last:mb-0">
                  <div className="flex justify-between text-xs mb-0.5">
                    <span className="text-gray-600">{g.label}</span>
                    <span className={clsx('font-medium', met ? 'text-emerald-600' : 'text-gray-600')}>
                      {g.fmt(g.cur)} / {g.fmt(g.goal)} {met ? '✓' : `(${fmtPercent(pct, 0)})`}
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full">
                    <div className={clsx('h-full rounded-full', met ? 'bg-emerald-500' : pct > 75 ? 'bg-indigo-500' : 'bg-amber-400')} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right: Spend breakdown + wins */}
        <div className="w-80 flex flex-col gap-4">
          <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
            <p className="text-sm font-semibold text-gray-700 mb-2">Spend by Platform</p>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={80} dataKey="value" paddingAngle={2}>
                  {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip formatter={(v: number) => [fmtCurrency(v), 'Spend']} contentStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5">
              {pieData.map((d) => (
                <div key={d.name} className="flex justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                    <span className="text-gray-600">{d.name}</span>
                  </div>
                  <span className="font-medium text-gray-800">{fmtCurrency(d.value)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-indigo-50 rounded-xl p-5 border border-indigo-100 flex-1">
            <p className="text-sm font-semibold text-indigo-800 mb-3">Key Wins</p>
            <ul className="space-y-2">
              {client.wins.slice(0, 4).map((w, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-indigo-700">
                  <span className="text-emerald-500 font-bold mt-0.5 flex-shrink-0">✓</span>
                  {w}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
