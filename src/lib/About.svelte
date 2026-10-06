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

  <p class="why">
    Why this exists: tools like Claude Code draw tables with box-drawing characters and pad every
    cell with spaces so the columns line up in a monospace terminal. Slack and most chat apps use a
    proportional font, wrap long lines and have no table syntax, so the grid falls apart when you
    paste it.
  </p>
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
    margin: 0 0 20px;
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
  .why {
    margin: 0;
    max-width: 70ch;
    font-size: 14px;
    line-height: 1.6;
    color: var(--muted);
  }
</style>
