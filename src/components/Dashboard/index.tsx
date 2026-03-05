import { ReportData } from '../../types'
import { fmtCurrency, fmtNumber, fmtRoas } from '../../utils/formatters'
import KPICard from './KPICard'
import ChannelBreakdown from './ChannelBreakdown'
import PerformanceTrend from './PerformanceTrend'
import PlatformTable from './PlatformTable'
import GA4Analytics from './GA4Analytics'
import TopCampaigns from './TopCampaigns'
import GoalProgress from './GoalProgress'
import {
  DollarSign, MousePointerClick, Eye, ShoppingCart, TrendingUp, Target,
} from 'lucide-react'

interface Props {
  data: ReportData
}

export default function Dashboard({ data }: Props) {
  const { client, platforms, ga4, dailySpendTrend, conversionTrend, campaigns } = data

  const totalSpend       = platforms.reduce((s, p) => s + p.spend, 0)
  const totalImpressions = platforms.reduce((s, p) => s + p.impressions, 0)
  const totalClicks      = platforms.reduce((s, p) => s + p.clicks, 0)
  const totalConversions = platforms.reduce((s, p) => s + p.conversions, 0)
  const totalRevenue     = platforms.reduce((s, p) => s + p.revenue, 0)
  const blendedRoas      = totalRevenue / totalSpend
  const prevSpend       = platforms.reduce((s, p) => s + p.prevSpend, 0)
  const prevImpressions = platforms.reduce((s, p) => s + p.prevImpressions, 0)
  const prevClicks      = platforms.reduce((s, p) => s + p.prevClicks, 0)
  const prevConversions = platforms.reduce((s, p) => s + p.prevConversions, 0)
  const prevRevenue     = platforms.reduce((s, p) => s + p.prevRevenue, 0)
  const prevRoas        = prevRevenue / prevSpend

  return (
    <div className="space-y-6">
      {/* Period bar */}
      <div className="bg-white rounded-xl border border-gray-200 px-5 py-3 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Reporting Period</p>
          <p className="text-sm font-semibold text-gray-800">{client.reportingPeriod}</p>
        </div>
        <div className="flex items-center gap-6 text-center">
          <div>
            <p className="text-xs text-gray-500">Industry</p>
            <p className="text-sm font-medium text-gray-700">{client.industry}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Platforms</p>
            <p className="text-sm font-medium text-gray-700">{platforms.length} Active</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Campaigns</p>
            <p className="text-sm font-medium text-gray-700">{campaigns.filter(c => c.status === 'active').length} Running</p>
          </div>
          <div className="text-xs text-gray-400 italic">
            Updated {new Date(data.generatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <KPICard
          label="Total Spend"
          value={fmtCurrency(totalSpend, true)}
          current={totalSpend}
          previous={prevSpend}
          icon={<DollarSign size={16} />}
          goalValue={fmtCurrency(client.goals.spend, true)}
          goalMet={totalSpend >= client.goals.spend * 0.95}
          accentColor="indigo"
        />
        <KPICard
          label="Impressions"
          value={fmtNumber(totalImpressions, true)}
          current={totalImpressions}
          previous={prevImpressions}
          icon={<Eye size={16} />}
          accentColor="blue"
        />
        <KPICard
          label="Clicks"
          value={fmtNumber(totalClicks, true)}
          current={totalClicks}
          previous={prevClicks}
          icon={<MousePointerClick size={16} />}
          accentColor="violet"
        />
        <KPICard
          label="Conversions"
          value={fmtNumber(totalConversions)}
          current={totalConversions}
          previous={prevConversions}
          icon={<ShoppingCart size={16} />}
          goalValue={fmtNumber(client.goals.conversions)}
          goalMet={totalConversions >= client.goals.conversions}
          accentColor="emerald"
        />
        <KPICard
          label="Revenue"
          value={fmtCurrency(totalRevenue, true)}
          current={totalRevenue}
          previous={prevRevenue}
          icon={<TrendingUp size={16} />}
          goalValue={fmtCurrency(client.goals.revenue, true)}
          goalMet={totalRevenue >= client.goals.revenue}
          accentColor="green"
        />
        <KPICard
          label="Blended ROAS"
          value={fmtRoas(blendedRoas)}
          current={blendedRoas}
          previous={prevRoas}
          icon={<Target size={16} />}
          goalValue={fmtRoas(client.goals.roas)}
          goalMet={blendedRoas >= client.goals.roas}
          accentColor="amber"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <PerformanceTrend dailySpend={dailySpendTrend} conversionTrend={conversionTrend} />
        </div>
        <ChannelBreakdown platforms={platforms} />
      </div>

      {/* Platform table */}
      <PlatformTable platforms={platforms} />

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <GoalProgress client={client} platforms={platforms} />
        <div className="lg:col-span-2">
          <GA4Analytics ga4={ga4} />
        </div>
      </div>

      {/* Top campaigns */}
      <TopCampaigns campaigns={campaigns} />

      {/* Wins & Observations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Key Wins This Period</h3>
          <ul className="space-y-2">
            {client.wins.map((w, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="mt-0.5 text-emerald-500 font-bold flex-shrink-0">✓</span>
                {w}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Recommendations</h3>
          <ul className="space-y-2">
            {client.recommendations.slice(0, 4).map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="mt-0.5 text-indigo-500 font-bold flex-shrink-0">{i + 1}.</span>
                {r}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
