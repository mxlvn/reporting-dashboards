import { readFileSync } from 'fs'

export interface ParsedMetrics {
  spend:            number
  impressions:      number
  clicks:           number
  conversions:      number
  revenue:          number
  roas:             number
  rows:             number
  detectedColumns:  Record<string, string>
}

// Case-insensitive partial-match aliases for each metric
const ALIASES: Record<string, string[]> = {
  spend:       ['spend', 'cost', 'amount spent', 'total cost', 'amount'],
  impressions: ['impression', 'impr'],
  clicks:      ['click', 'link click', 'outbound click'],
  conversions: ['conversion', 'conv.', 'purchase', 'lead', 'result'],
  revenue:     ['revenue', 'purchase value', 'conversion value', 'conv. value', 'roas value', 'website purchase'],
}

function findCol(headers: string[], aliases: string[]): string | undefined {
  return headers.find((h) => aliases.some((a) => h.toLowerCase().includes(a)))
}

function toNumber(val: unknown): number {
  if (typeof val === 'number') return isNaN(val) ? 0 : Math.abs(val)
  if (typeof val === 'string') {
    const n = parseFloat(val.replace(/[$,£€\s%]/g, ''))
    return isNaN(n) ? 0 : Math.abs(n)
  }
  return 0
}

export function parseRows(rows: Record<string, unknown>[]): ParsedMetrics {
  if (rows.length === 0) {
    return { spend: 0, impressions: 0, clicks: 0, conversions: 0, revenue: 0, roas: 0, rows: 0, detectedColumns: {} }
  }

  const headers = Object.keys(rows[0])
  const cols: Record<string, string | undefined> = {}
  for (const [metric, aliases] of Object.entries(ALIASES)) {
    cols[metric] = findCol(headers, aliases)
  }

  const totals = { spend: 0, impressions: 0, clicks: 0, conversions: 0, revenue: 0 }
  for (const row of rows) {
    for (const key of Object.keys(totals) as (keyof typeof totals)[]) {
      if (cols[key]) totals[key] += toNumber(row[cols[key]!])
    }
  }

  const roas = totals.spend > 0 && totals.revenue > 0 ? totals.revenue / totals.spend : 0

  return {
    ...totals,
    roas,
    rows:            rows.length,
    detectedColumns: Object.fromEntries(Object.entries(cols).filter(([, v]) => v).map(([k, v]) => [k, v!])),
  }
}

export async function parseFile(filePath: string, originalName: string): Promise<ParsedMetrics> {
  const ext = originalName.toLowerCase().split('.').pop() ?? ''

  if (['csv', 'tsv', 'txt'].includes(ext)) {
    const { parse } = await import('csv-parse/sync')
    const raw  = readFileSync(filePath, 'utf-8').replace(/^\uFEFF/, '') // strip BOM
    const rows = parse(raw, {
      columns:            true,
      skip_empty_lines:   true,
      trim:               true,
      relax_column_count: true,
    }) as Record<string, unknown>[]
    return parseRows(rows)
  }

  // Excel
  const XLSX = await import('xlsx')
  const wb   = XLSX.readFile(filePath)
  const ws   = wb.Sheets[wb.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json(ws) as Record<string, unknown>[]
  return parseRows(rows)
}
