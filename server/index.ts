import 'dotenv/config'
import express from 'express'
import session from 'express-session'
import cors from 'cors'
import authRouter    from './routes/auth.js'
import oauthRouter   from './routes/oauth.js'
import clientsRouter from './routes/clients.js'

// ── App ───────────────────────────────────────────────────────────────────────
const app  = express()
const PORT = Number(process.env.PORT ?? 3001)

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(express.json())
app.use(cors({
  origin:      process.env.CLIENT_URL ?? 'http://localhost:5173',
  credentials: true,
}))
app.use(session({
  secret:            process.env.SESSION_SECRET ?? 'dev-secret-CHANGE-IN-PRODUCTION',
  resave:            false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure:   false,                         // set true behind HTTPS in production
    maxAge:   7 * 24 * 60 * 60 * 1000,      // 7 days
  },
}))

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',    authRouter)
app.use('/api/oauth',   oauthRouter)
app.use('/api/clients', clientsRouter)

app.get('/api/health', (_req, res) => res.json({ ok: true }))

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`[server] running on http://localhost:${PORT}`)
})
