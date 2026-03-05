export type Platform = 'google_ads' | 'meta_ads' | 'linkedin_ads' | 'x_ads' | 'tiktok_ads'

export type DateRange = 'this_month' | 'last_month' | 'last_30' | 'last_90' | 'ytd'

export interface PlatformMetrics {
  platform: Platform
  spend: number
  impressions: number
  clicks: number
  conversions: number
  revenue: number
  ctr: number      // %
  cpc: number      // $
  cpa: number      // $
  roas: number
  // vs previous period
  prevSpend: number
  prevImpressions: number
  prevClicks: number
  prevConversions: number
  prevRevenue: number
}

export interface GA4Metrics {
  sessions: number
  users: number
  newUsers: number
  bounceRate: number          // %
  avgSessionDuration: number  // seconds
  conversions: number
  conversionRate: number      // %
  prevSessions: number
  prevUsers: number
  prevConversions: number
}

export interface DailyDataPoint {
  date: string
  google_ads: number
  meta_ads: number
  linkedin_ads: number
  x_ads: number
  tiktok_ads: number
  total: number
}

export interface ConversionTrendPoint {
  date: string
  google_ads: number
  meta_ads: number
  linkedin_ads: number
  x_ads: number
  tiktok_ads: number
}

export interface Campaign {
  id: string
  platform: Platform
  name: string
  spend: number
  impressions: number
  clicks: number
  conversions: number
  roas: number
  ctr: number
  status: 'active' | 'paused' | 'ended'
}

export interface ClientConfig {
  name: string
  industry: string
  reportingPeriod: string
  reportingMonth: string  // e.g. "February 2026"
  currency: string
  goals: {
    spend: number
    conversions: number
    revenue: number
    roas: number
  }
  wins: string[]
  recommendations: string[]
}

export interface ReportData {
  client: ClientConfig
  platforms: PlatformMetrics[]
  ga4: GA4Metrics
  dailySpendTrend: DailyDataPoint[]
  conversionTrend: ConversionTrendPoint[]
  campaigns: Campaign[]
  generatedAt: string
}
