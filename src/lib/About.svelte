<script lang="ts">
  const STEPS = [
    {
      title: 'Paste',
      text: 'Copy a table from Claude Code, ChatGPT, MySQL, docker or any terminal and paste it in.',
    },
    {
      title: 'Pick a format',
      text: 'Chat-friendly text, Markdown, Jira, HTML, CSV, TSV, JSON or a clean ASCII table.',
    },
    {
      title: 'Copy & share',
      text: 'One click copies it, ready for Slack, Teams, GitHub, Notion, Jira or a spreadsheet.',
    },
  ]
</script>

<section class="about" aria-labelledby="how-it-works">
  <h2 id="how-it-works">Convert ASCII and box-drawing tables in three steps</h2>
  <ol class="steps">
    {#each STEPS as step, i (step.title)}
      <li>
        <span class="num" aria-hidden="true">{i + 1}</span>
        <h3>{step.title}</h3>
        <p class="muted">{step.text}</p>
      </li>
    {/each}
  </ol>

  <h2>Frequently asked questions</h2>
  <div class="faq">
    <details>
      <summary>Why do tables from AI agents and terminals break when pasted into Slack?</summary>
      <p>
        Tools like Claude Code draw tables with box-drawing characters (┌─┬─┐) and pad every cell
        with spaces so the columns line up in a monospace terminal. Slack messages use a
        proportional font, wrap long lines and have no table syntax, so the grid falls apart.
        Converting the table into a list or a narrow code block keeps it readable.
      </p>
    </details>
    <details>
      <summary>Which output format works best in Slack, Teams or Discord?</summary>
      <p>
        <strong>Row blocks</strong> and <strong>Bullet list</strong> read best in a normal message:
        each row becomes a short, labelled block. If you need the grid itself, use
        <strong>Code block</strong>: it redraws the table with plain characters and wraps it to the
        width you choose.
      </p>
    </details>
    <details>
      <summary>Can I paste a whole reply from Claude Code or ChatGPT?</summary>
      <p>
        Yes. Text around the tables is ignored. When a reply contains several tables, a picker lets
        you choose which one to convert.
      </p>
    </details>
    <details>
      <summary>How do I get the table into Excel or Google Sheets?</summary>
      <p>
        Copy the <strong>TSV</strong> output and paste it into a cell: every value lands in its own
        column. <strong>Copy as rich table</strong> works too, and also pastes as a real table into Google
        Docs, Notion, Confluence, Gmail and Word.
      </p>
    </details>
    <details>
      <summary>What happens to cells the terminal wrapped onto several lines?</summary>
      <p>
        The pieces are joined back into one value with spaces. Turn on
        <strong>Keep line breaks in cells</strong> to keep them as separate lines instead (shown as &lt;br&gt;
        in Markdown and HTML).
      </p>
    </details>
    <details>
      <summary>Is my data uploaded anywhere?</summary>
      <p>
        No. The conversion runs entirely in your browser and nothing you paste is sent to a server.
        There are no cookies and no analytics; only your display preferences are saved in your
        browser.
      </p>
    </details>
  </div>
</section>

<style>
  .about {
    max-width: 880px;
    margin: 56px auto 0;
  }
  h2 {
    margin: 0 0 16px;
    font-size: 18px;
    letter-spacing: -0.01em;
  }
  .steps {
    list-style: none;
    padding: 0;
    margin: 0 0 44px;
    display: grid;
    gap: 14px;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  }
  .steps li {
    padding: 18px;
    border: 1px solid var(--line);
    border-radius: var(--radius);
    background: var(--surface);
  }
  .num {
    display: inline-grid;
    place-items: center;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: var(--accent-soft);
    color: var(--accent);
    font-size: 12.5px;
    font-weight: 600;
  }
  h3 {
    margin: 10px 0 4px;
    font-size: 14.5px;
  }
  .steps p {
    margin: 0;
    font-size: 13.5px;
    line-height: 1.5;
  }
  .faq {
    border: 1px solid var(--line);
    border-radius: var(--radius);
    background: var(--surface);
  }
  details + details {
    border-top: 1px solid var(--line);
  }
  summary {
    padding: 14px 18px;
    font-size: 14.5px;
    font-weight: 500;
    cursor: pointer;
  }
  summary:hover {
    color: var(--accent);
  }
  details p {
    margin: 0;
    padding: 0 18px 16px;
    font-size: 14px;
    line-height: 1.6;
    color: var(--muted);
  }
</style>
