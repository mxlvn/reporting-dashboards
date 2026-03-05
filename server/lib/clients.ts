import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { randomUUID } from 'crypto'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_DIR   = join(__dirname, '../data')
const CLIENTS_FILE = join(DATA_DIR, 'clients.json')

export interface Client {
  id:        string
  name:      string
  color:     string
  createdAt: string
}

function readClients(): Client[] {
  if (!existsSync(CLIENTS_FILE)) return []
  try { return JSON.parse(readFileSync(CLIENTS_FILE, 'utf-8')) as Client[] }
  catch { return [] }
}

function writeClients(clients: Client[]): void {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true })
  writeFileSync(CLIENTS_FILE, JSON.stringify(clients, null, 2))
}

export function listClients(): Client[] { return readClients() }

export function createClient(name: string, color: string): Client {
  const client: Client = { id: randomUUID(), name, color, createdAt: new Date().toISOString() }
  const clients = readClients()
  clients.push(client)
  writeClients(clients)
  return client
}

export function deleteClient(id: string): void {
  writeClients(readClients().filter((c) => c.id !== id))
}
