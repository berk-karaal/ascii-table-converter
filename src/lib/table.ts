export type Kind = 'unicode' | 'ascii' | 'markdown' | 'spaces'

export const KIND_LABELS: Record<Kind, string> = {
  unicode: 'Unicode box table',
  ascii: 'ASCII box table',
  markdown: 'Markdown table',
  spaces: 'Space-aligned columns (best guess)',
}

/** A table as found in the input. Wrapped cell pieces are joined with "\n". */
export type Found = { kind: Kind; grid: string[][] }

export type Table = { headers: string[] | null; rows: string[][] }

export type TableOptions = { header: boolean; keepBreaks: boolean }

export function toTable(grid: string[][], { header, keepBreaks }: TableOptions): Table {
  const width = Math.max(0, ...grid.map((r) => r.length))
  const full = grid.map((r) => Array.from({ length: width }, (_, i) => r[i] ?? ''))
  const cell = (c: string) => (keepBreaks ? c : c.replace(/\n/g, ' '))
  if (!header) return { headers: null, rows: full.map((r) => r.map(cell)) }
  const [first = [], ...rest] = full
  return { headers: first.map((h) => h.replace(/\n/g, ' ')), rows: rest.map((r) => r.map(cell)) }
}

export const columnCount = (t: Table) => (t.headers ?? t.rows[0] ?? []).length

/** Header names to use as labels, falling back to "Col N" when missing. */
export const keys = (t: Table) =>
  Array.from({ length: columnCount(t) }, (_, i) => t.headers?.[i] || `Col ${i + 1}`)
