import { describe, expect, it } from 'vitest'
import { findTables } from './parse'
import { EXAMPLES } from './examples'

describe('findTables', () => {
  it('parses the Claude Code unicode table and keeps wrapped pieces', () => {
    const [t, ...rest] = findTables(EXAMPLES[0].text)
    expect(rest).toHaveLength(0)
    expect(t.kind).toBe('unicode')
    expect(t.grid).toHaveLength(6)
    expect(t.grid[0]).toEqual([
      'Deployment option',
      'Monthly cost',
      'Setup time',
      'Scales to',
      'Main trade-off',
      'Lock-in\nrisk',
    ])
    expect(t.grid[3]).toEqual([
      'Kubernetes\n(managed)',
      '$180 + node\ncosts',
      '1–2 weeks',
      'practically\nunlimited',
      'needs someone who knows\nKubernetes on call',
      'low',
    ])
  })

  it('handles indentation, ANSI colours and CRLF', () => {
    const text =
      '  ┌───┬───┐\r\n  │ \x1b[1ma\x1b[0m │ b │\r\n  ├───┼───┤\r\n  │ 1 │ 2 │\r\n  └───┴───┘'
    expect(findTables(text)[0].grid).toEqual([
      ['a', 'b'],
      ['1', '2'],
    ])
  })

  it('keeps ASCII pipes inside unicode cells and emoji intact', () => {
    const text = ['┌─────┬───────┐', '│ a|b │ ✅ yes │', '└─────┴───────┘'].join('\n')
    expect(findTables(text)[0].grid).toEqual([['a|b', '✅ yes']])
  })

  it('treats a cell holding only "-" as content, not a rule line', () => {
    const text = ['┌───┬───┐', '│ a │ b │', '├───┼───┤', '│ - │ 2 │', '└───┴───┘'].join('\n')
    expect(findTables(text)[0].grid).toEqual([
      ['a', 'b'],
      ['-', '2'],
    ])
  })

  it('parses a MySQL table where rows have no separators', () => {
    const text = [
      '+----+-------+',
      '| id | name  |',
      '+----+-------+',
      '|  1 | alice |',
      '|  2 | bob   |',
      '+----+-------+',
    ].join('\n')
    const [t] = findTables(text)
    expect(t.kind).toBe('ascii')
    expect(t.grid).toEqual([
      ['id', 'name'],
      ['1', 'alice'],
      ['2', 'bob'],
    ])
  })

  it('merges continuation lines (empty first cell) in rule-less tables', () => {
    const text = [
      '╭──────┬─────────────╮',
      '│ Name │ Notes       │',
      '├──────┼─────────────┤',
      '│ foo  │ a long      │',
      '│      │ description │',
      '│ bar  │ short       │',
      '╰──────┴─────────────╯',
    ].join('\n')
    expect(findTables(text)[0].grid).toEqual([
      ['Name', 'Notes'],
      ['foo', 'a long\ndescription'],
      ['bar', 'short'],
    ])
  })

  it('parses markdown with escaped pipes and <br>', () => {
    const text = ['| Op | Meaning |', '|:---|---:|', '| `a \\| b` | or<br>else |'].join('\n')
    const [t] = findTables(text)
    expect(t.kind).toBe('markdown')
    expect(t.grid).toEqual([
      ['Op', 'Meaning'],
      ['`a | b`', 'or\nelse'],
    ])
  })

  it('parses space-aligned columns, keeping single spaces inside values', () => {
    const text = [
      'CONTAINER ID   IMAGE          STATUS',
      'a1b2c3d4e5f6   nginx:latest   Up 2 hours',
      '9f8e7d6c5b4a   redis          Exited (0) 3 days ago',
    ].join('\n')
    const [t] = findTables(text)
    expect(t.kind).toBe('spaces')
    expect(t.grid).toEqual([
      ['CONTAINER ID', 'IMAGE', 'STATUS'],
      ['a1b2c3d4e5f6', 'nginx:latest', 'Up 2 hours'],
      ['9f8e7d6c5b4a', 'redis', 'Exited (0) 3 days ago'],
    ])
  })

  it('finds several tables among prose and ignores the prose', () => {
    const text = [
      'Here is the comparison you asked for:',
      '',
      '| a | b |',
      '|---|---|',
      '| 1 | 2 |',
      '',
      'And the second one, which is wider than the first',
      'one and wraps onto a new line of normal prose.',
      '',
      '┌───┬───┐',
      '│ x │ y │',
      '└───┴───┘',
    ].join('\n')
    expect(findTables(text).map((t) => t.kind)).toEqual(['markdown', 'unicode'])
  })

  it('does not mistake diff lines or "+1" comments for tables', () => {
    expect(findTables('+1 for this\n+ added line\n| quoted')).toEqual([])
  })

  it('detects every built-in example as intended', () => {
    const shape = (text: string) =>
      findTables(text).map((t) => `${t.kind} ${t.grid.length}x${t.grid[0].length}`)
    expect(EXAMPLES.map((e) => shape(e.text))).toEqual([
      ['unicode 6x6'],
      ['unicode 5x4'],
      ['ascii 5x4'],
      ['markdown 5x3'],
      ['spaces 4x6'],
      ['unicode 3x3', 'unicode 3x3'],
    ])
    const [, emoji] = EXAMPLES
    expect(findTables(emoji.text)[0].grid[3]).toEqual([
      'Code owners',
      '❌',
      '✅',
      'required for protected\nbranches',
    ])
  })

  it('filters by kind when asked', () => {
    const text = '| a | b |\n|---|---|\n| 1 | 2 |'
    expect(findTables(text, 'unicode')).toEqual([])
    expect(findTables(text, 'markdown')).toHaveLength(1)
  })
})
