export interface OAuthPlatformConfig {
  label: string
  authUrl: string
  tokenUrl: string
  scopes: string[]
  clientId: string
  clientSecret: string
  redirectUri: string
  pkce?: boolean
  scopeSeparator?: string
}

const BASE_URL = process.env.SERVER_URL || 'http://localhost:3001'

export const OAUTH_CONFIGS: Record<string, OAuthPlatformConfig> = {
  google: {
    label: 'Google Ads & GA4',
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    scopes: [
      'https://www.googleapis.com/auth/adwords',
      'https://www.googleapis.com/auth/analytics.readonly',
    ],
    clientId:     process.env.GOOGLE_CLIENT_ID     || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    redirectUri:  `${BASE_URL}/api/oauth/google/callback`,
    scopeSeparator: ' ',
  },
  meta: {
    label: 'Meta Ads',
    authUrl: 'https://www.facebook.com/v19.0/dialog/oauth',
    tokenUrl: 'https://graph.facebook.com/v19.0/oauth/access_token',
    scopes: ['ads_read', 'ads_management'],
    clientId:     process.env.META_APP_ID     || '',
    clientSecret: process.env.META_APP_SECRET || '',
    redirectUri:  `${BASE_URL}/api/oauth/meta/callback`,
    scopeSeparator: ',',
  },
  linkedin: {
    label: 'LinkedIn Ads',
    authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
    tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
    scopes: ['r_ads', 'r_ads_reporting'],
    clientId:     process.env.LINKEDIN_CLIENT_ID     || '',
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET || '',
    redirectUri:  `${BASE_URL}/api/oauth/linkedin/callback`,
    scopeSeparator: ' ',
  },
  x: {
    label: 'X Ads',
    authUrl: 'https://twitter.com/i/oauth2/authorize',
    tokenUrl: 'https://api.twitter.com/2/oauth2/token',
    scopes: ['ads:read', 'tweet:read', 'users:read', 'offline.access'],
    clientId:     process.env.X_CLIENT_ID     || '',
    clientSecret: process.env.X_CLIENT_SECRET || '',
    redirectUri:  `${BASE_URL}/api/oauth/x/callback`,
    pkce: true,
    scopeSeparator: ' ',
  },
  tiktok: {
    label: 'TikTok Ads',
    authUrl: 'https://www.tiktok.com/v2/auth/authorize/',
    tokenUrl: 'https://open.tiktokapis.com/v2/oauth/token/',
    scopes: ['user.info.basic', 'ad.read'],
    clientId:     process.env.TIKTOK_APP_ID     || '',
    clientSecret: process.env.TIKTOK_APP_SECRET || '',
    redirectUri:  `${BASE_URL}/api/oauth/tiktok/callback`,
    scopeSeparator: ',',
  },
}

export function isConfigured(platform: string): boolean {
  const c = OAUTH_CONFIGS[platform]
  return !!c?.clientId && !!c?.clientSecret
}
