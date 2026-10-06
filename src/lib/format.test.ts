import { describe, expect, it } from 'vitest'
import { asciiTable, displayWidth, FORMATS, wrap } from './format'
import { findTables } from './parse'
import { EXAMPLES } from './examples'
import { toTable, type Table } from './table'

const render = (id: string, t: Table, width = 80) =>
  FORMATS.find((f) => f.id === id)!.render(t, { width })

const small: Table = {
  headers: ['Name', 'Note'],
  rows: [
    ['a|b', 'say "hi", ok'],
    ['c', 'two\nlines'],
  ],
}

describe('toTable', () => {
  const grid = [['Lock-in\nrisk', 'x'], ['Kubernetes\n(managed)'], ['b', 'c']]

  it('joins wrapped pieces with spaces and pads short rows', () => {
    expect(toTable(grid, { header: true, keepBreaks: false })).toEqual({
      headers: ['Lock-in risk', 'x'],
      rows: [
        ['Kubernetes (managed)', ''],
        ['b', 'c'],
      ],
    })
  })

  it('keeps breaks in body cells but never in headers', () => {
    const t = toTable(grid, { header: true, keepBreaks: true })
    expect(t.headers).toEqual(['Lock-in risk', 'x'])
    expect(t.rows[0][0]).toBe('Kubernetes\n(managed)')
  })

  it('treats every row as data without a header', () => {
    expect(toTable(grid, { header: false, keepBreaks: false }).headers).toBeNull()
  })
})

describe('formats', () => {
  it('row blocks', () => {
    expect(render('rows', small)).toBe('*a|b*\n• Note: say "hi", ok\n\n*c*\n• Note: two\n   lines')
  })

  it('bullet list', () => {
    expect(render('list', small)).toBe('• *a|b* — Note: say "hi", ok\n• *c* — Note: two lines')
  })

  it('markdown escapes pipes and turns breaks into <br>', () => {
    expect(render('markdown', small)).toBe(
      [
        '| Name | Note         |',
        '| ---- | ------------ |',
        '| a\\|b | say "hi", ok |',
        '| c    | two<br>lines |',
      ].join('\n'),
    )
  })

  it('jira', () => {
    expect(render('jira', small)).toBe('||Name||Note||\n|a\\|b|say "hi", ok|\n|c|two \\\\ lines|')
  })

  it('html escapes content', () => {
    const t: Table = { headers: ['<b>'], rows: [['a & "b"']] }
    expect(render('html', t)).toContain('<th>&lt;b&gt;</th>')
    expect(render('html', t)).toContain('<td>a &amp; &quot;b&quot;</td>')
  })

  it('csv quotes per RFC 4180', () => {
    expect(render('csv', small)).toBe('Name,Note\na|b,"say ""hi"", ok"\nc,"two\nlines"')
  })

  it('tsv flattens tabs and newlines', () => {
    const t: Table = { headers: null, rows: [['a\tb', 'c\nd']] }
    expect(render('tsv', t)).toBe('a b\tc d')
  })

  it('json dedupes repeated headers and names missing ones', () => {
    const t: Table = { headers: ['x', 'x', ''], rows: [['1', '2', '3']] }
    expect(JSON.parse(render('json', t))).toEqual([{ x: '1', x_2: '2', 'Col 3': '3' }])
  })

  it('records', () => {
    expect(render('records', small)).toBe(
      'Name: a|b\nNote: say "hi", ok\n\nName: c\nNote: two\n  lines',
    )
  })

  it('ascii table has a header rule and row rules only when rows wrap', () => {
    const t: Table = {
      headers: ['a', 'b'],
      rows: [
        ['1', '2'],
        ['3', '4'],
      ],
    }
    expect(asciiTable(t)).toBe(
      ['+---+---+', '| a | b |', '+---+---+', '| 1 | 2 |', '| 3 | 4 |', '+---+---+'].join('\n'),
    )
  })

  it('code block fits the first example inside the requested width', () => {
    const t = toTable(findTables(EXAMPLES[0].text)[0].grid, { header: true, keepBreaks: false })
    for (const width of [60, 80, 100]) {
      const lines = render('code', t, width).split('\n')
      expect(lines[0]).toBe('```')
      expect(lines.at(-1)).toBe('```')
      expect(Math.max(...lines.map(displayWidth))).toBeLessThanOrEqual(width)
    }
  })
})

describe('text helpers', () => {
  it('counts emoji and CJK as two columns', () => {
    expect(displayWidth('✅ ok')).toBe(5)
    expect(displayWidth('日本')).toBe(4)
  })

  it('wraps on words and hard-breaks long words', () => {
    expect(wrap('needs a restore request', 10)).toEqual(['needs a', 'restore', 'request'])
    expect(wrap('abcdefghij', 4)).toEqual(['abcd', 'efgh', 'ij'])
  })
})
