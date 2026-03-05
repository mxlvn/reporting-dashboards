import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { isConfigured } from './oauthConfig.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_DIR   = join(__dirname, '../data')

export interface TokenData {
  access_token:  string
  refresh_token?: string
  expires_at?:   number
  connected_at:  string
}

type TokenStore = Partial<Record<string, TokenData>>

function clientDir(clientId: string): string {
  return join(DATA_DIR, 'clients', clientId)
}

function tokensFile(clientId: string): string {
  return join(clientDir(clientId), 'tokens.json')
}

function readTokens(clientId: string): TokenStore {
  const f = tokensFile(clientId)
  if (!existsSync(f)) return {}
  try { return JSON.parse(readFileSync(f, 'utf-8')) as TokenStore }
  catch { return {} }
}

function writeTokens(clientId: string, tokens: TokenStore): void {
  const dir = clientDir(clientId)
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  writeFileSync(tokensFile(clientId), JSON.stringify(tokens, null, 2))
}

export function saveToken(clientId: string, platform: string, data: TokenData): void {
  const tokens = readTokens(clientId)
  tokens[platform] = data
  writeTokens(clientId, tokens)
}

export function getToken(clientId: string, platform: string): TokenData | null {
  return readTokens(clientId)[platform] ?? null
}

export function deleteToken(clientId: string, platform: string): void {
  const tokens = readTokens(clientId)
  delete tokens[platform]
  writeTokens(clientId, tokens)
}

export interface PlatformStatus {
  connected:    boolean
  configured:   boolean
  connected_at?: string
}

export function getAllTokenStatus(clientId: string): Record<string, PlatformStatus> {
  const tokens = readTokens(clientId)
  return Object.fromEntries(
    ['google', 'meta', 'linkedin', 'x', 'tiktok'].map((p) => [
      p,
      { connected: !!tokens[p], configured: isConfigured(p), connected_at: tokens[p]?.connected_at },
    ]),
  )
}
