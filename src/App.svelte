<script lang="ts">
  import About from './lib/About.svelte'
  import CopyButton from './lib/CopyButton.svelte'
  import ThemeToggle from './lib/ThemeToggle.svelte'
  import InfoTip from './lib/InfoTip.svelte'
  import OutputCard from './lib/OutputCard.svelte'
  import { FORMATS, html, tsv } from './lib/format'
  import { findTables } from './lib/parse'
  import { EXAMPLES } from './lib/examples'
  import { loadSettings, saveSettings } from './lib/settings'
  import { columnCount, KIND_LABELS, toTable, type Kind } from './lib/table'

  const GROUPS = [...new Set(FORMATS.map((f) => f.group))]

  const SUPPORTED: { kind: Kind; glyph: string; name: string; from: string }[] = [
    {
      kind: 'unicode',
      glyph: '┌─┬─┐',
      name: 'Unicode box',
      from: 'Claude Code, Python rich, SQLite box mode',
    },
    { kind: 'ascii', glyph: '+-+-+', name: 'ASCII box', from: 'MySQL, SQLite table mode' },
    { kind: 'markdown', glyph: '|a|b|', name: 'Markdown', from: 'ChatGPT, Codex, Gemini' },
    {
      kind: 'spaces',
      glyph: 'a  b',
      name: 'Space-aligned',
      from: 'docker ps, kubectl get (best guess)',
    },
  ]

  let input = $state('')
  let kind = $state<Kind | 'auto'>('auto')
  let picked = $state(0)
  const settings = $state(loadSettings())

  $effect(() => saveSettings($state.snapshot(settings)))

  const found = $derived(findTables(input, kind === 'auto' ? undefined : kind))
  const current = $derived(found[Math.min(picked, found.length - 1)])
  const table = $derived(current && toTable(current.grid, settings))
  const options = $derived({ width: Math.max(20, settings.width || 80) })
  const active = $derived(FORMATS.find((f) => f.id === settings.format) ?? FORMATS[0])

  function loadExample(e: Event & { currentTarget: HTMLSelectElement }) {
    const example = EXAMPLES[Number(e.currentTarget.value)]
    e.currentTarget.value = ''
    if (!example) return
    input = example.text
    kind = 'auto'
    picked = 0
  }

  const richHtml = $derived(table ? html(table) : '')

  function copyRich() {
    settings.hasCopied = true
    if (!table) return Promise.reject()
    return navigator.clipboard.write([
      new ClipboardItem({
        'text/html': new Blob([richHtml], { type: 'text/html' }),
        'text/plain': new Blob([tsv(table)], { type: 'text/plain' }),
      }),
    ])
  }
</script>

<div class="page">
  <header class="top">
    <div class="brand">
      <svg class="mark" viewBox="0 0 32 32" aria-hidden="true">
        <path d="M17 5H8a3 3 0 0 0-3 3v16a3 3 0 0 0 3 3h9" /><path
          d="M5 12h12M5 19.5h12M11 5v22M17 5v22"
        /><path d="M21 8.5h6M21 15.75h4M21 23.25h5.5" />
      </svg>
      <div>
        <h1>ASCII Table Converter</h1>
        <p class="muted">
          Turn the box tables that AI agents and terminals print into Markdown, CSV, Slack-ready
          text and more.
        </p>
      </div>
    </div>
    <div class="top-actions">
      <ThemeToggle />
      <a
        class="icon-btn github"
        href="https://github.com/berk-karaal/ascii-table-converter"
        aria-label="Source code on GitHub"
        title="Source code on GitHub"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M10.226 17.284c-2.965-.36-5.054-2.493-5.054-5.256 0-1.123.404-2.336 1.078-3.144-.292-.741-.247-2.314.09-2.965.898-.112 2.111.36 2.83 1.01.853-.269 1.752-.404 2.853-.404 1.1 0 1.999.135 2.807.382.696-.629 1.932-1.1 2.83-.988.315.606.36 2.179.067 2.942.72.854 1.101 2 1.101 3.167 0 2.763-2.089 4.852-5.098 5.234.763.494 1.28 1.572 1.28 2.807v2.336c0 .674.561 1.056 1.235.786 4.066-1.55 7.255-5.615 7.255-10.646C23.5 6.188 18.334 1 11.978 1 5.62 1 .5 6.188.5 12.545c0 4.986 3.167 9.12 7.435 10.669.606.225 1.19-.18 1.19-.786V20.63a2.9 2.9 0 0 1-1.078.224c-1.483 0-2.359-.808-2.987-2.313-.247-.607-.517-.966-1.034-1.033-.27-.023-.359-.135-.359-.27 0-.27.45-.471.898-.471.652 0 1.213.404 1.797 1.235.45.651.921.943 1.483.943.561 0 .92-.202 1.437-.719.382-.381.674-.718.944-.943"
          />
        </svg>
      </a>
    </div>
  </header>

  <main class="layout">
    <section class="card input">
      <header>
        <label for="source">Paste a table</label>
        <div class="actions">
          <select aria-label="Load an example" onchange={loadExample}>
            <option value="" selected>Load an example…</option>
            {#each EXAMPLES as example, i (i)}
              <option value={i}>{example.label}</option>
            {/each}
          </select>
          {#if input}
            <button type="button" class="btn ghost" onclick={() => (input = '')}>Clear</button>
          {/if}
        </div>
      </header>
      <textarea
        id="source"
        bind:value={input}
        wrap="off"
        spellcheck="false"
        autocomplete="off"
        placeholder="Paste output from Claude Code, Codex, ChatGPT, MySQL, docker…&#10;&#10;┌───────┬────────────┐&#10;│ Suite │ Result     │&#10;├───────┼────────────┤&#10;│ unit  │ 412 passed │&#10;└───────┴────────────┘"
      ></textarea>
      <footer>
        <p class="status" class:warn={input.trim() && !found.length}>
          {#if !input.trim()}
            Paste a table, or load an example.
          {:else if !found.length}
            No table found{kind === 'auto' ? '' : ' of this type'}.
          {:else if table}
            <span class="dot"></span>
            {KIND_LABELS[current.kind]} · {table.rows.length} rows × {columnCount(table)} columns
          {/if}
        </p>
        <div class="selects">
          {#if found.length > 1}
            <select bind:value={picked} aria-label="Table">
              {#each found as t, i (i)}
                <option value={i}>Table {i + 1} of {found.length} · {KIND_LABELS[t.kind]}</option>
              {/each}
            </select>
          {/if}
          <select bind:value={kind} aria-label="Input type">
            <option value="auto">Detect automatically</option>
            {#each Object.entries(KIND_LABELS) as [value, label] (value)}
              <option {value}>{label}</option>
            {/each}
          </select>
        </div>
      </footer>
    </section>

    <section class="results">
      <div class="card toolbar">
        <label class="check">
          <input type="checkbox" bind:checked={settings.header} /> First row is header
        </label>
        <label class="check">
          <input type="checkbox" bind:checked={settings.keepBreaks} /> Keep line breaks in cells
        </label>
        <label class="number">
          Code block width
          <input type="number" min="20" max="400" bind:value={settings.width} />
        </label>
        {#if table}
          <div class="rich">
            <CopyButton
              copy={copyRich}
              label="Copy as rich table"
              primary
              nudge={settings.hasCopied ? undefined : richHtml}
            />
            <InfoTip label="About Copy as rich table">
              Copies a real table. Paste it into Slack, Google Docs, Notion, Confluence, Gmail, Word
              or Sheets to get actual rows and columns.
            </InfoTip>
          </div>
        {/if}
      </div>

      {#if !table}
        <div class="card empty">
          <h2>Your converted table shows up here</h2>
          <h3 class="group-label">Supported inputs</h3>
          <ul class="supported">
            {#each SUPPORTED as s (s.kind)}
              <li>
                <code aria-hidden="true">{s.glyph}</code>
                <span class="name">{s.name}</span>
                <span class="muted">{s.from}</span>
              </li>
            {/each}
          </ul>
          <p class="muted">
            Several tables in one paste and text around them are fine. No table at hand? Pick one
            from <strong>Load an example…</strong>
          </p>
          <p class="muted">Everything runs in your browser. Nothing you paste leaves this page.</p>
        </div>
      {:else}
        <nav class="formats" aria-label="Output format">
          {#each GROUPS as group (group)}
            <div class="group">
              <span class="group-label">{group}</span>
              {#each FORMATS.filter((f) => f.group === group) as f (f.id)}
                <button
                  type="button"
                  class="chip"
                  aria-pressed={f.id === active.id}
                  onclick={() => (settings.format = f.id)}>{f.label}</button
                >
              {/each}
            </div>
          {/each}
        </nav>
        <OutputCard
          title={active.label}
          hint={active.hint}
          text={active.render(table, options)}
          nudge={!settings.hasCopied}
          oncopy={() => (settings.hasCopied = true)}
        />
      {/if}
    </section>
  </main>

  <About />

  <footer class="bottom muted">Runs entirely in your browser. No uploads, no tracking.</footer>
</div>

<style>
  .page {
    max-width: 1440px;
    margin: 0 auto;
    padding: 28px 24px 40px;
  }

  .top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 24px;
  }
  .top-actions {
    display: flex;
    gap: 4px;
  }
  .github svg {
    fill: currentColor;
  }
  .brand {
    display: flex;
    align-items: center;
    gap: 14px;
  }
  .mark {
    width: 40px;
    height: 40px;
    padding: 8px;
    border-radius: 12px;
    background: var(--accent);
    fill: none;
    stroke: var(--on-accent);
    stroke-width: 2.6;
    stroke-linecap: round;
    stroke-linejoin: round;
    flex: none;
  }
  h1 {
    margin: 0;
    font-size: 20px;
    letter-spacing: -0.02em;
  }
  .brand p {
    margin: 2px 0 0;
    font-size: 14px;
  }

  .layout {
    display: grid;
    gap: 20px;
    align-items: start;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  }
  .input {
    position: sticky;
    top: 20px;
  }
  @media (max-width: 960px) {
    .layout {
      grid-template-columns: minmax(0, 1fr);
    }
    .input {
      position: static;
    }
  }

  .input header,
  .input footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
    padding: 12px 16px;
  }
  .input header label {
    font-weight: 600;
    font-size: 14px;
  }
  .actions {
    display: flex;
    gap: 6px;
  }
  textarea {
    display: block;
    width: 100%;
    min-height: 380px;
    resize: vertical;
    padding: 14px 16px;
    border: 0;
    border-block: 1px solid var(--line);
    background: var(--code-bg);
    color: var(--text);
    font: 12.5px/1.55 var(--mono);
    outline: none;
  }
  textarea:focus-visible {
    box-shadow: inset 0 0 0 2px var(--accent);
  }
  textarea::placeholder {
    color: var(--muted);
    opacity: 0.8;
  }
  .status {
    margin: 0;
    font-size: 13px;
    color: var(--muted);
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .status.warn {
    color: var(--warn);
  }
  .dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--ok);
  }
  .selects {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .results {
    display: grid;
    gap: 14px;
    min-width: 0;
  }
  .toolbar {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px 18px;
    padding: 10px 12px 10px 16px;
    font-size: 13.5px;
  }
  .check,
  .number {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
  }
  .number input {
    width: 68px;
  }
  .rich {
    position: relative;
    flex-basis: 100%;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .formats {
    display: flex;
    flex-wrap: wrap;
    gap: 10px 18px;
  }
  .group {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px;
  }
  .group-label {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--muted);
    margin: 0 4px 0 0;
  }

  .empty {
    padding: 28px;
  }
  .empty h2 {
    margin: 0 0 22px;
    font-size: 16px;
    letter-spacing: -0.01em;
  }
  .empty h3 {
    margin: 0 0 8px;
  }
  .empty p {
    margin: 10px 0 0;
    font-size: 13.5px;
  }
  .supported {
    list-style: none;
    margin: 0 0 18px;
    padding: 0;
    border: 1px solid var(--line);
    border-radius: 10px;
  }
  .supported li {
    display: grid;
    grid-template-columns: 64px 120px minmax(0, 1fr);
    align-items: center;
    gap: 12px;
    padding: 10px 14px;
    font-size: 13.5px;
  }
  .supported li + li {
    border-top: 1px solid var(--line);
  }
  .supported code {
    font: 15px var(--mono);
    color: var(--accent);
    white-space: pre;
  }
  .supported .name {
    font-weight: 500;
  }
  @media (max-width: 600px) {
    .supported li {
      grid-template-columns: 56px minmax(0, 1fr);
    }
    .supported li .muted {
      grid-column: 2;
    }
  }

  .bottom {
    margin-top: 32px;
    text-align: center;
    font-size: 12.5px;
  }

  @media (max-width: 600px) {
    .page {
      padding: 20px 16px 32px;
    }
    .top {
      align-items: flex-start;
    }
  }
</style>
