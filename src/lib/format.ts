import { columnCount, keys, type Table } from './table'

export type FormatOptions = { width: number }

export type Format = {
  id: string
  label: string
  group: 'Chat' | 'Markup' | 'Data' | 'Plain text'
  hint: string
  render: (t: Table, o: FormatOptions) => string
}

const segmenter = new Intl.Segmenter()
const WIDE = /\p{Emoji_Presentation}|️|[ᄀ-ᅟ⺀-꓏가-힣豈-﫿︰-﹏＀-｠￠-￦]/u

const graphemes = (s: string) => Array.from(segmenter.segment(s), (g) => g.segment)

/** Monospace columns a string occupies: emoji and CJK take two. */
export const displayWidth = (s: string) =>
  graphemes(s).reduce((w, g) => w + (WIDE.test(g) ? 2 : 1), 0)

const pad = (s: string, w: number) => s + ' '.repeat(Math.max(0, w - displayWidth(s)))
const oneLine = (s: string) => s.replace(/\n/g, ' ')

function chunk(word: string, w: number): string[] {
  const parts = ['']
  for (const g of graphemes(word)) {
    if (displayWidth(parts.at(-1)! + g) > w) parts.push('')
    parts[parts.length - 1] += g
  }
  return parts
}

export function wrap(text: string, w: number): string[] {
  const out: string[] = []
  for (const para of text.split('\n')) {
    let line = ''
    for (const word of para.split(/ +/).filter(Boolean)) {
      for (const part of chunk(word, w)) {
        const next = line ? `${line} ${part}` : part
        if (displayWidth(next) <= w) {
          line = next
        } else {
          out.push(line)
          line = part
        }
      }
    }
    out.push(line)
  }
  return out
}

const MIN_COLUMN = 4

/** Draws a +---+ table. With `maxWidth`, the widest columns shrink and wrap until it fits. */
export function asciiTable(t: Table, maxWidth = Infinity): string {
  const all = t.headers ? [t.headers, ...t.rows] : t.rows
  const n = columnCount(t)
  if (!n) return ''
  const widths = Array.from({ length: n }, (_, i) =>
    Math.max(1, ...all.flatMap((r) => r[i].split('\n').map(displayWidth))),
  )
  const longestWord = Array.from({ length: n }, (_, i) =>
    Math.max(MIN_COLUMN, ...all.flatMap((r) => r[i].split(/\s+/).map(displayWidth))),
  )
  const widest = (floor: (i: number) => number) => {
    const candidates = widths.map((w, i) => (w > floor(i) ? w : -1))
    const max = Math.max(...candidates)
    return max < 0 ? -1 : candidates.indexOf(max)
  }
  // Shrink the widest column, but only split words once every column is down to its longest word.
  while (widths.reduce((a, b) => a + b, 0) + 3 * n + 1 > maxWidth) {
    let i = widest((c) => longestWord[c])
    if (i < 0) i = widest(() => MIN_COLUMN)
    if (i < 0) break
    widths[i]--
  }

  const rule = `+${widths.map((w) => '-'.repeat(w + 2)).join('+')}+`
  const blocks = all.map((row) => {
    const cells = row.map((c, i) => wrap(c, widths[i]))
    const height = Math.max(...cells.map((c) => c.length))
    return Array.from(
      { length: height },
      (_, k) => `| ${cells.map((c, i) => pad(c[k] ?? '', widths[i])).join(' | ')} |`,
    ).join('\n')
  })
  const ruleBetweenRows = blocks.some((b) => b.includes('\n'))

  const out = [rule]
  blocks.forEach((b, i) => {
    out.push(b)
    if (i === blocks.length - 1) return
    if (ruleBetweenRows || (t.headers && i === 0)) out.push(rule)
  })
  out.push(rule)
  return out.join('\n')
}

function rowBlocks(t: Table): string {
  const k = keys(t)
  return t.rows
    .map(([title, ...rest]) =>
      [
        title && `*${oneLine(title)}*`,
        ...rest.map((c, i) => `• ${k[i + 1]}: ${c.replace(/\n/g, '\n   ')}`.trimEnd()),
      ]
        .filter(Boolean)
        .join('\n'),
    )
    .join('\n\n')
}

function bulletList(t: Table): string {
  const k = keys(t)
  return t.rows
    .map(([title, ...rest]) => {
      const details = rest.map((c, i) => `${k[i + 1]}: ${oneLine(c)}`).join(' · ')
      return `• ${title ? `*${oneLine(title)}*` : ''}${title && details ? ' — ' : ''}${details}`
    })
    .join('\n')
}

function records(t: Table): string {
  const k = keys(t)
  return t.rows
    .map((r) => r.map((c, i) => `${k[i]}: ${c.replace(/\n/g, '\n  ')}`.trimEnd()).join('\n'))
    .join('\n\n')
}

function markdown(t: Table): string {
  const esc = (c: string) => c.replace(/\|/g, '\\|').replace(/\n/g, '<br>')
  const all = [t.headers ?? keys(t), ...t.rows].map((r) => r.map(esc))
  const widths = all[0].map((_, i) => Math.max(3, ...all.map((r) => displayWidth(r[i]))))
  const line = (r: string[]) => `| ${r.map((c, i) => pad(c, widths[i])).join(' | ')} |`
  return [
    line(all[0]),
    `| ${widths.map((w) => '-'.repeat(w)).join(' | ')} |`,
    ...all.slice(1).map(line),
  ].join('\n')
}

function jira(t: Table): string {
  const esc = (c: string) => c.replace(/\|/g, '\\|').replace(/\n/g, ' \\\\ ') || ' '
  const lines = t.rows.map((r) => `|${r.map(esc).join('|')}|`)
  if (t.headers) lines.unshift(`||${t.headers.map(esc).join('||')}||`)
  return lines.join('\n')
}

export function html(t: Table): string {
  const esc = (c: string) =>
    c
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/\n/g, '<br>')
  const row = (r: string[], tag: string) =>
    `    <tr>${r.map((c) => `<${tag}>${esc(c)}</${tag}>`).join('')}</tr>`
  return [
    '<table>',
    ...(t.headers ? ['  <thead>', row(t.headers, 'th'), '  </thead>'] : []),
    '  <tbody>',
    ...t.rows.map((r) => row(r, 'td')),
    '  </tbody>',
    '</table>',
  ].join('\n')
}

function csv(t: Table): string {
  const esc = (c: string) => (/[",\n\r]/.test(c) ? `"${c.replace(/"/g, '""')}"` : c)
  return (t.headers ? [t.headers, ...t.rows] : t.rows).map((r) => r.map(esc).join(',')).join('\n')
}

export function tsv(t: Table): string {
  const esc = (c: string) => c.replace(/[\t\r\n]+/g, ' ')
  return (t.headers ? [t.headers, ...t.rows] : t.rows).map((r) => r.map(esc).join('\t')).join('\n')
}

function json(t: Table): string {
  const seen = new Map<string, number>()
  const names = keys(t).map((k) => {
    const count = (seen.get(k) ?? 0) + 1
    seen.set(k, count)
    return count > 1 ? `${k}_${count}` : k
  })
  return JSON.stringify(
    t.rows.map((r) => Object.fromEntries(r.map((c, i) => [names[i], c]))),
    null,
    2,
  )
}

export const FORMATS: Format[] = [
  {
    id: 'rows',
    label: 'Row blocks',
    group: 'Chat',
    hint: 'Slack, Teams, Discord. One block per row, first column in bold.',
    render: rowBlocks,
  },
  {
    id: 'list',
    label: 'Bullet list',
    group: 'Chat',
    hint: 'Slack, Teams, Discord. One line per row.',
    render: bulletList,
  },
  {
    id: 'code',
    label: 'Code block',
    group: 'Chat',
    hint: 'Monospace table in a ``` code block, wrapped to fit the width setting.',
    render: (t, o) => `\`\`\`\n${asciiTable(t, o.width)}\n\`\`\``,
  },
  {
    id: 'markdown',
    label: 'Markdown',
    group: 'Markup',
    hint: 'GitHub, GitLab, Notion, Obsidian, Slack canvases.',
    render: markdown,
  },
  {
    id: 'jira',
    label: 'Jira / Confluence',
    group: 'Markup',
    hint: 'Jira and Confluence wiki markup.',
    render: jira,
  },
  { id: 'html', label: 'HTML', group: 'Markup', hint: 'Plain <table> markup.', render: html },
  { id: 'csv', label: 'CSV', group: 'Data', hint: 'Comma-separated values.', render: csv },
  {
    id: 'tsv',
    label: 'TSV',
    group: 'Data',
    hint: 'Pastes straight into Excel and Google Sheets cells.',
    render: tsv,
  },
  { id: 'json', label: 'JSON', group: 'Data', hint: 'Array of row objects.', render: json },
  {
    id: 'ascii',
    label: 'ASCII table',
    group: 'Plain text',
    hint: 'Redrawn with + - | only, for monospace places.',
    render: (t) => asciiTable(t),
  },
  {
    id: 'records',
    label: 'Records',
    group: 'Plain text',
    hint: 'One "Header: value" block per row. Readable anywhere.',
    render: records,
  },
]
