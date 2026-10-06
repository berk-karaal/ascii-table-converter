import type { Found, Kind } from './table'

const BOX_CHAR = /^[─-╿]/
const UNICODE_SEP = /[│┃║]/
const ASCII_SEP = /\|/
const MD_SEPARATOR = /^\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)*\|?$/

const isBorderLine = (line: string) => /^\s*[─-╿+|]/.test(line)

const isRule = (line: string) =>
  !/[│┃║|]/.test(line) && /^[─-╿+=:\s-]+$/.test(line) && /[─━═=-]/.test(line)

/**
 * Finds every table in `text`, in document order. Box and Markdown tables are
 * recognised by their borders; remaining blank-line-separated blocks are tried
 * as space-aligned columns. Pass `only` to accept a single kind.
 */
export function findTables(text: string, only?: Kind): Found[] {
  const lines = text
    .replace(/\x1b\[[0-9;]*m/g, '')
    .replace(/\r\n?/g, '\n')
    .replace(/ /g, ' ')
    .split('\n')
    .map((l) => l.trimEnd())
  const accepts = (k: Kind) => !only || only === k
  const found: Found[] = []
  let prose: string[] = []

  const flushProse = () => {
    if (accepts('spaces')) {
      for (const block of splitOnBlankLines(prose)) {
        const t = parseSpaces(block)
        if (t) found.push(t)
      }
    }
    prose = []
  }

  for (let i = 0; i < lines.length;) {
    if (!isBorderLine(lines[i])) {
      prose.push(lines[i++])
      continue
    }
    let j = i
    while (j < lines.length && isBorderLine(lines[j])) j++
    const block = lines.slice(i, j)
    const t = parseBorderedBlock(block.map((l) => l.trim()))
    if (t && accepts(t.kind)) {
      flushProse()
      found.push(t)
    } else {
      prose.push(...block)
    }
    i = j
  }
  flushProse()
  return found
}

function parseBorderedBlock(lines: string[]): Found | null {
  if (lines.some((l) => BOX_CHAR.test(l))) return parseBox(lines, UNICODE_SEP, 'unicode')
  if (lines.length >= 2 && MD_SEPARATOR.test(lines[1])) return parseMarkdown(lines)
  return parseBox(lines, ASCII_SEP, 'ascii')
}

/**
 * Rule lines split the block into segments. With 3+ segments every segment is
 * one (possibly wrapped) row. Otherwise rows aren't separated by rules (MySQL,
 * Python rich), so a line whose first cell is empty continues the previous row.
 */
function parseBox(lines: string[], sep: RegExp, kind: Kind): Found | null {
  const split = (line: string) => {
    let s = line
    if (sep.test(s[0])) s = s.slice(1)
    if (sep.test(s.at(-1) ?? '')) s = s.slice(0, -1)
    return s.split(sep).map((c) => c.trim())
  }

  const segments: string[][][] = [[]]
  for (const line of lines) {
    if (isRule(line)) segments.push([])
    else segments.at(-1)!.push(split(line))
  }
  const parsed = segments.filter((s) => s.length)
  const hasRule = segments.length > 1

  let groups: string[][][]
  if (parsed.length > 2) {
    groups = parsed
  } else {
    const fixed = parsed.length === 2 ? 1 : 0
    groups = parsed.slice(0, fixed)
    for (const cells of parsed.slice(fixed).flat()) {
      if (cells[0] === '' && groups.length > fixed) groups.at(-1)!.push(cells)
      else groups.push([cells])
    }
  }

  const grid = groups.map(mergeLines).filter((row) => row.some(Boolean))
  const maxCols = Math.max(0, ...grid.map((r) => r.length))
  if (!grid.length || (maxCols < 2 && !hasRule)) return null
  return { kind, grid }
}

function mergeLines(lines: string[][]): string[] {
  const width = Math.max(...lines.map((l) => l.length))
  return Array.from({ length: width }, (_, i) =>
    lines
      .map((l) => l[i] ?? '')
      .filter(Boolean)
      .join('\n'),
  )
}

function parseMarkdown(lines: string[]): Found {
  const cells = (line: string) =>
    line
      .replace(/^\|/, '')
      .replace(/(?<!\\)\|$/, '')
      .split(/(?<!\\)\|/)
      .map((c) =>
        c
          .trim()
          .replace(/\\\|/g, '|')
          .replace(/<br\s*\/?>/gi, '\n'),
      )
  return { kind: 'markdown', grid: [lines[0], ...lines.slice(2)].map(cells) }
}

/**
 * Columns are separated by runs of 2+ positions that are blank on every line,
 * so single spaces inside a value ("CONTAINER ID") don't split it.
 */
// ponytail: positions are UTF-16 indices, so wide chars (CJK, emoji) can misalign columns.
function parseSpaces(lines: string[]): Found | null {
  if (lines.length < 2) return null
  const width = Math.max(...lines.map((l) => l.length))
  const gap = Array.from({ length: width }, (_, p) => lines.every((l) => (l[p] ?? ' ') === ' '))

  const columns: [number, number][] = []
  for (let p = 0; p < width;) {
    if (gap[p]) {
      p++
      continue
    }
    const start = p
    while (p < width && !(gap[p] && (p + 1 >= width || gap[p + 1]))) p++
    columns.push([start, p])
  }
  if (columns.length < 2) return null

  const grid = lines.map((l) => columns.map(([s, e]) => l.slice(s, e).trim()))
  return { kind: 'spaces', grid }
}

function splitOnBlankLines(lines: string[]): string[][] {
  const blocks: string[][] = [[]]
  for (const line of lines) {
    if (line.trim()) blocks.at(-1)!.push(line)
    else if (blocks.at(-1)!.length) blocks.push([])
  }
  return blocks.filter((b) => b.length)
}
