import { Router, Request, Response } from 'express'

const router = Router()

router.post('/login', (req: Request, res: Response) => {
  const { email, password } = req.body as { email: string; password: string }
  const adminEmail    = process.env.ADMIN_EMAIL    || 'admin@example.com'
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'

  if (email === adminEmail && password === adminPassword) {
    req.session.authenticated = true
    req.session.userId = email
    res.json({ success: true, user: { email } })
  } else {
    res.status(401).json({ error: 'Invalid email or password' })
  }
})

router.post('/logout', (req: Request, res: Response) => {
  req.session.destroy(() => {
    res.json({ success: true })
  })
})

router.get('/me', (req: Request, res: Response) => {
  if (req.session.authenticated) {
    res.json({ authenticated: true, user: { email: req.session.userId } })
  } else {
    res.status(401).json({ authenticated: false })
  }
})

export default router
