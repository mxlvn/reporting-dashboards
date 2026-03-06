import { Router, Request, Response, NextFunction } from 'express'
import multer from 'multer'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { randomUUID } from 'crypto'
import { parseFile, ParsedMetrics } from '../lib/parseUpload.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_DIR   = join(__dirname, '../data')
const router     = Router()

// ── Auth: session OR API key ──────────────────────────────────────────────────
function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const key = req.headers['x-api-key'] as string | undefined
  if (key && key === process.env.UPLOAD_API_KEY && process.env.UPLOAD_API_KEY) { next(); return }
  if (req.session.authenticated) { next(); return }
  res.status(401).json({ error: 'Not authenticated' })
}

// ── Upload record type ────────────────────────────────────────────────────────
export interface UploadRecord {
  id:         string
  platform:   string
  filename:   string
  uploadedAt: string
  period?:    string
  metrics:    ParsedMetrics
}

// ── Storage helpers ───────────────────────────────────────────────────────────
function uploadsFile(clientId: string): string {
  return join(DATA_DIR, 'clients', clientId, 'uploads.json')
}
function readUploads(clientId: string): UploadRecord[] {
  const f = uploadsFile(clientId)
  if (!existsSync(f)) return []
  try { return JSON.parse(readFileSync(f, 'utf-8')) as UploadRecord[] } catch { return [] }
}
function writeUploads(clientId: string, records: UploadRecord[]): void {
  const dir = join(DATA_DIR, 'clients', clientId)
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  writeFileSync(uploadsFile(clientId), JSON.stringify(records, null, 2))
}

// ── GET /api/uploads/:clientId ────────────────────────────────────────────────
router.get('/:clientId', requireAuth, (req: Request, res: Response) => {
  res.json(readUploads(req.params.clientId))
})

// ── POST /api/uploads/:clientId/:platform ────────────────────────────────────
router.post('/:clientId/:platform', requireAuth, (req: Request, res: Response) => {
  const { clientId, platform } = req.params
  const filesDir = join(DATA_DIR, 'clients', clientId, 'files', platform)
  if (!existsSync(filesDir)) mkdirSync(filesDir, { recursive: true })

  const upload = multer({
    storage: multer.diskStorage({
      destination: filesDir,
      filename:    (_req, file, cb) =>
        cb(null, `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}`),
    }),
    limits:     { fileSize: 50 * 1024 * 1024 },
    fileFilter: (_req, file, cb) =>
      cb(null, /\.(csv|xlsx?|xlsm|tsv|txt)$/i.test(file.originalname)),
  }).single('file')

  upload(req, res, async (err) => {
    if (err)       { res.status(400).json({ error: err.message });            return }
    if (!req.file) { res.status(400).json({ error: 'No file uploaded' });     return }

    try {
      const metrics = await parseFile(req.file.path, req.file.originalname)
      const record: UploadRecord = {
        id:         randomUUID(),
        platform,
        filename:   req.file.originalname,
        uploadedAt: new Date().toISOString(),
        period:     (req.body as { period?: string }).period ?? undefined,
        metrics,
      }
      writeUploads(clientId, [record, ...readUploads(clientId)])
      res.json(record)
    } catch {
      res.status(422).json({ error: 'Could not parse file. Make sure it is a valid CSV or Excel export.' })
    }
  })
})

// ── DELETE /api/uploads/:clientId/:uploadId ───────────────────────────────────
router.delete('/:clientId/:uploadId', requireAuth, (req: Request, res: Response) => {
  const { clientId, uploadId } = req.params
  writeUploads(clientId, readUploads(clientId).filter((r) => r.id !== uploadId))
  res.json({ success: true })
})

export default router
