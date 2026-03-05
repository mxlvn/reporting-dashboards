import { Router, Request, Response, NextFunction } from 'express'
import { listClients, createClient, deleteClient } from '../lib/clients.js'

const router = Router()

function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (req.session.authenticated) { next(); return }
  res.status(401).json({ error: 'Not authenticated' })
}

router.get('/', requireAuth, (_req: Request, res: Response) => {
  res.json(listClients())
})

router.post('/', requireAuth, (req: Request, res: Response) => {
  const { name, color } = req.body as { name?: string; color?: string }
  if (!name?.trim()) { res.status(400).json({ error: 'Name is required' }); return }
  res.status(201).json(createClient(name.trim(), color ?? '#6366f1'))
})

router.delete('/:id', requireAuth, (req: Request, res: Response) => {
  deleteClient(req.params.id)
  res.json({ success: true })
})

export default router
