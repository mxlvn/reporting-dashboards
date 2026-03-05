import { ReportData } from '../types'

// Helper: generate daily data for a 30-day month
function genDailySpend(
  base: { google: number; meta: number; linkedin: number; x: number; tiktok: number },
  days = 28,
  startDate = '2026-02-01',
): ReportData['dailySpendTrend'] {
  const result = []
  const start = new Date(startDate)
  for (let i = 0; i < days; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    const label = d.toISOString().slice(0, 10)
    const noise = () => 0.7 + Math.random() * 0.6
    const g = +(base.google * noise()).toFixed(0)
    const m = +(base.meta * noise()).toFixed(0)
    const l = +(base.linkedin * noise()).toFixed(0)
    const x = +(base.x * noise()).toFixed(0)
    const t = +(base.tiktok * noise()).toFixed(0)
    result.push({ date: label, google_ads: g, meta_ads: m, linkedin_ads: l, x_ads: x, tiktok_ads: t, total: g + m + l + x + t })
  }
  return result
}

function genDailyConversions(
  base: { google: number; meta: number; linkedin: number; x: number; tiktok: number },
  days = 28,
  startDate = '2026-02-01',
): ReportData['conversionTrend'] {
  const result = []
  const start = new Date(startDate)
  for (let i = 0; i < days; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    const label = d.toISOString().slice(0, 10)
    const noise = () => 0.5 + Math.random() * 1.0
    result.push({
      date: label,
      google_ads: Math.round(base.google * noise()),
      meta_ads: Math.round(base.meta * noise()),
      linkedin_ads: Math.round(base.linkedin * noise()),
      x_ads: Math.round(base.x * noise()),
      tiktok_ads: Math.round(base.tiktok * noise()),
    })
  }
  return result
}

// Seeded so it renders consistently (Math.random is fine for mock UI)
export const mockReportData: ReportData = {
  client: {
    name: 'Acme Corp',
    industry: 'E-Commerce / Retail',
    reportingPeriod: 'Feb 1 – Feb 28, 2026',
    reportingMonth: 'February 2026',
    currency: 'USD',
    goals: {
      spend: 50000,
      conversions: 1500,
      revenue: 175000,
      roas: 3.5,
    },
    wins: [
      'Google Ads achieved 4.2x ROAS — highest in the last 6 months',
      'TikTok Ads drove 22% lower CPAs versus January, fueled by new UGC creatives',
      'Meta retargeting campaigns lifted conversion rate by 18% MoM',
      'LinkedIn Lead Gen forms delivered 127 qualified leads at $58 CPL',
    ],
    recommendations: [
      'Scale Google Ads Performance Max budget by 20% given strong ROAS performance',
      'Expand TikTok top-of-funnel spend — CPMs are 40% cheaper than Meta for 18–34 demo',
      'Test LinkedIn Thought Leadership Ads to improve brand awareness among decision-makers',
      'Launch X Ads retargeting with video creatives to lower CPAs from $52 to target $38',
      'A/B test new landing page variants for Meta traffic — current bounce rate is 61%',
      'Set up GA4 Enhanced Conversions to improve attribution accuracy across all platforms',
    ],
  },

  platforms: [
    {
      platform: 'google_ads',
      spend: 20800,
      impressions: 2140000,
      clicks: 42800,
      conversions: 834,
      revenue: 87570,
      ctr: 2.0,
      cpc: 0.49,
      cpa: 24.94,
      roas: 4.21,
      prevSpend: 19200,
      prevImpressions: 1980000,
      prevClicks: 39600,
      prevConversions: 762,
      prevRevenue: 79248,
    },
    {
      platform: 'meta_ads',
      spend: 14600,
      impressions: 5320000,
      clicks: 31900,
      conversions: 463,
      revenue: 50930,
      ctr: 0.60,
      cpc: 0.46,
      cpa: 31.53,
      roas: 3.49,
      prevSpend: 15100,
      prevImpressions: 5100000,
      prevClicks: 30600,
      prevConversions: 393,
      prevRevenue: 43230,
    },
    {
      platform: 'linkedin_ads',
      spend: 7900,
      impressions: 520000,
      clicks: 5070,
      conversions: 127,
      revenue: 28575,
      ctr: 0.97,
      cpc: 1.56,
      cpa: 62.20,
      roas: 3.62,
      prevSpend: 7200,
      prevImpressions: 480000,
      prevClicks: 4320,
      prevConversions: 108,
      prevRevenue: 23760,
    },
    {
      platform: 'x_ads',
      spend: 2900,
      impressions: 890000,
      clicks: 8120,
      conversions: 58,
      revenue: 8120,
      ctr: 0.91,
      cpc: 0.36,
      cpa: 50.00,
      roas: 2.80,
      prevSpend: 3100,
      prevImpressions: 920000,
      prevClicks: 8280,
      prevConversions: 62,
      prevRevenue: 8680,
    },
    {
      platform: 'tiktok_ads',
      spend: 3800,
      impressions: 3100000,
      clicks: 19840,
      conversions: 114,
      revenue: 17100,
      ctr: 0.64,
      cpc: 0.19,
      cpa: 33.33,
      roas: 4.50,
      prevSpend: 3600,
      prevImpressions: 2800000,
      prevClicks: 16800,
      prevConversions: 93,
      prevRevenue: 13950,
    },
  ],

  ga4: {
    sessions: 97420,
    users: 74310,
    newUsers: 56480,
    bounceRate: 44.2,
    avgSessionDuration: 168, // 2m 48s
    conversions: 1596,
    conversionRate: 1.64,
    prevSessions: 89200,
    prevUsers: 68400,
    prevConversions: 1418,
  },

  dailySpendTrend: genDailySpend(
    { google: 743, meta: 521, linkedin: 282, x: 104, tiktok: 136 },
    28,
    '2026-02-01',
  ),

  conversionTrend: genDailyConversions(
    { google: 30, meta: 17, linkedin: 5, x: 2, tiktok: 4 },
    28,
    '2026-02-01',
  ),

  campaigns: [
    { id: 'g1', platform: 'google_ads', name: 'PMax – All Products', spend: 9200, impressions: 920000, clicks: 18400, conversions: 386, roas: 4.58, ctr: 2.0, status: 'active' },
    { id: 'g2', platform: 'google_ads', name: 'Brand Search', spend: 4100, impressions: 310000, clicks: 12710, conversions: 248, roas: 5.12, ctr: 4.1, status: 'active' },
    { id: 'g3', platform: 'google_ads', name: 'Non-Brand Search', spend: 7500, impressions: 910000, clicks: 11700, conversions: 200, roas: 3.46, ctr: 1.3, status: 'active' },
    { id: 'm1', platform: 'meta_ads', name: 'Prospecting – LAL 2%', spend: 6200, impressions: 2400000, clicks: 14400, conversions: 192, roas: 3.44, ctr: 0.6, status: 'active' },
    { id: 'm2', platform: 'meta_ads', name: 'Retargeting – 30d Visitors', spend: 5100, impressions: 1800000, clicks: 12600, conversions: 198, roas: 4.28, ctr: 0.7, status: 'active' },
    { id: 'm3', platform: 'meta_ads', name: 'DPA – Cart Abandoners', spend: 3300, impressions: 1120000, clicks: 4900, conversions: 73, roas: 2.74, ctr: 0.44, status: 'active' },
    { id: 'l1', platform: 'linkedin_ads', name: 'Lead Gen – Decision Makers', spend: 5400, impressions: 350000, clicks: 3430, conversions: 91, roas: 3.89, ctr: 0.98, status: 'active' },
    { id: 'l2', platform: 'linkedin_ads', name: 'Brand Awareness – Video', spend: 2500, impressions: 170000, clicks: 1640, conversions: 36, roas: 2.99, ctr: 0.96, status: 'active' },
    { id: 'x1', platform: 'x_ads', name: 'Promoted Tweets – Retargeting', spend: 2900, impressions: 890000, clicks: 8120, conversions: 58, roas: 2.80, ctr: 0.91, status: 'active' },
    { id: 't1', platform: 'tiktok_ads', name: 'TopView – Brand Awareness', spend: 1600, impressions: 1450000, clicks: 8700, conversions: 43, roas: 4.08, ctr: 0.60, status: 'active' },
    { id: 't2', platform: 'tiktok_ads', name: 'In-Feed – UGC Creatives', spend: 2200, impressions: 1650000, clicks: 11140, conversions: 71, roas: 4.77, ctr: 0.68, status: 'active' },
  ],

  generatedAt: new Date().toISOString(),
}
