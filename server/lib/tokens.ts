import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { isConfigured } from './oauthConfig.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_DIR = join(__dirname, '../data')
const TOKENS_FILE = join(DATA_DIR, 'tokens.json')

export interface TokenData {
  access_token: string
  refresh_token?: string
  expires_at?: number
  connected_at: string
  account_name?: string
}

type TokenStore = Partial<Record<string, TokenData>>

function readTokens(): TokenStore {
  if (!existsSync(TOKENS_FILE)) return {}
  try {
    return JSON.parse(readFileSync(TOKENS_FILE, 'utf-8')) as TokenStore
  } catch {
    return {}
  }
}

function writeTokens(tokens: TokenStore): void {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true })
  writeFileSync(TOKENS_FILE, JSON.stringify(tokens, null, 2))
}

export function saveToken(platform: string, data: TokenData): void {
  const tokens = readTokens()
  tokens[platform] = data
  writeTokens(tokens)
}

export function getToken(platform: string): TokenData | null {
  return readTokens()[platform] ?? null
}

export function deleteToken(platform: string): void {
  const tokens = readTokens()
  delete tokens[platform]
  writeTokens(tokens)
}

export interface PlatformStatus {
  connected: boolean
  configured: boolean
  connected_at?: string
  account_name?: string
}

export function getAllTokenStatus(): Record<string, PlatformStatus> {
  const tokens = readTokens()
  const platforms = ['google', 'meta', 'linkedin', 'x', 'tiktok']
  return Object.fromEntries(
    platforms.map((p) => [
      p,
      {
        connected:    !!tokens[p],
        configured:   isConfigured(p),
        connected_at: tokens[p]?.connected_at,
        account_name: tokens[p]?.account_name,
      },
    ]),
  )
}
