<script lang="ts">
  import CopyButton from './CopyButton.svelte'

  let {
    title,
    hint,
    text,
    nudge,
    oncopy,
  }: { title: string; hint: string; text: string; nudge: boolean; oncopy: () => void } = $props()

  function copy() {
    oncopy()
    return navigator.clipboard.writeText(text)
  }
</script>

<section class="card output">
  <header>
    <div>
      <h3>{title}</h3>
      <p class="muted">{hint}</p>
    </div>
    <CopyButton {copy} primary nudge={nudge ? text : undefined} />
  </header>
  <pre>{text}</pre>
</section>

<style>
  header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    padding: 14px 16px 10px;
  }
  h3 {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
  }
  p {
    margin: 2px 0 0;
    font-size: 12.5px;
  }
  pre {
    margin: 0;
    padding: 12px 16px 16px;
    max-height: 560px;
    overflow: auto;
    font: 12.5px/1.55 var(--mono);
    border-top: 1px solid var(--line);
    background: var(--code-bg);
    border-radius: 0 0 var(--radius) var(--radius);
  }
</style>
