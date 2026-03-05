export function fmtCurrency(value: number, compact = false): string {
  if (compact && value >= 1000) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value)
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

export function fmtNumber(value: number, compact = false): string {
  if (compact && value >= 1000) {
    return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(value)
  }
  return new Intl.NumberFormat('en-US').format(value)
}

export function fmtPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`
}

export function fmtRoas(value: number): string {
  return `${value.toFixed(2)}x`
}

export function fmtDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}m ${s}s`
}

export function pctChange(current: number, previous: number): number {
  if (previous === 0) return 0
  return ((current - previous) / previous) * 100
}

export function fmtChange(pct: number): string {
  const sign = pct >= 0 ? '+' : ''
  return `${sign}${pct.toFixed(1)}%`
}

export const PLATFORM_META = {
  google_ads:   { label: 'Google Ads',   color: '#4285F4', shortColor: '#4285F4', bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200' },
  meta_ads:     { label: 'Meta Ads',     color: '#0082FB', shortColor: '#0082FB', bg: 'bg-sky-50',    text: 'text-sky-700',    border: 'border-sky-200' },
  linkedin_ads: { label: 'LinkedIn Ads', color: '#0A66C2', shortColor: '#0A66C2', bg: 'bg-blue-50',   text: 'text-blue-800',   border: 'border-blue-300' },
  x_ads:        { label: 'X Ads',        color: '#14171A', shortColor: '#14171A', bg: 'bg-gray-100',  text: 'text-gray-800',   border: 'border-gray-300' },
  tiktok_ads:   { label: 'TikTok Ads',   color: '#FF0050', shortColor: '#FF0050', bg: 'bg-rose-50',   text: 'text-rose-700',   border: 'border-rose-200' },
} as const
