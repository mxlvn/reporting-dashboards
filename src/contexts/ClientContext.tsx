import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface Client {
  id:        string
  name:      string
  color:     string
  createdAt: string
}

interface ClientContextValue {
  clients:        Client[]
  selected:       Client | null
  setSelected:    (client: Client) => void
  createClient:   (name: string, color: string) => Promise<Client>
  deleteClient:   (id: string) => Promise<void>
  refresh:        () => Promise<void>
}

const ClientContext = createContext<ClientContextValue | null>(null)

export function ClientProvider({ children }: { children: ReactNode }) {
  const [clients,  setClients]  = useState<Client[]>([])
  const [selected, setSelected] = useState<Client | null>(null)

  async function refresh() {
    const res = await fetch('/api/clients', { credentials: 'include' })
    if (!res.ok) return
    const data = await res.json() as Client[]
    setClients(data)
    // Keep selection valid; auto-select first if nothing selected
    setSelected((prev) => {
      if (prev && data.find((c) => c.id === prev.id)) return prev
      return data[0] ?? null
    })
  }

  useEffect(() => { refresh() }, [])

  async function createClient(name: string, color: string): Promise<Client> {
    const res = await fetch('/api/clients', {
      method:      'POST',
      credentials: 'include',
      headers:     { 'Content-Type': 'application/json' },
      body:        JSON.stringify({ name, color }),
    })
    const client = await res.json() as Client
    await refresh()
    setSelected(client)
    return client
  }

  async function deleteClient(id: string): Promise<void> {
    await fetch(`/api/clients/${id}`, { method: 'DELETE', credentials: 'include' })
    await refresh()
  }

  return (
    <ClientContext.Provider value={{ clients, selected, setSelected, createClient, deleteClient, refresh }}>
      {children}
    </ClientContext.Provider>
  )
}

export function useClients(): ClientContextValue {
  const ctx = useContext(ClientContext)
  if (!ctx) throw new Error('useClients must be used inside ClientProvider')
  return ctx
}
