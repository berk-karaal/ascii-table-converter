<script lang="ts">
  import type { Snippet } from 'svelte'

  let { label, children }: { label: string; children: Snippet } = $props()

  const id = $props.id()
  let open = $state(false)
  let root: HTMLElement
</script>

<svelte:window
  onclick={(e) => {
    if (open && !root.contains(e.target as Node)) open = false
  }}
  onkeydown={(e) => {
    if (e.key === 'Escape') open = false
  }}
/>

<span class="info" class:open bind:this={root}>
  <button
    type="button"
    aria-label={label}
    aria-expanded={open}
    aria-describedby={id}
    onclick={() => (open = !open)}>i</button
  >
  <span role="tooltip" {id}>{@render children()}</span>
</span>

<style>
  /* The popover is positioned against the nearest positioned ancestor, so the parent decides where it opens. */
  .info {
    display: inline-flex;
  }
  button {
    width: 22px;
    height: 22px;
    padding: 0;
    border-radius: 50%;
    border: 1px solid var(--line);
    background: var(--surface);
    color: var(--muted);
    font:
      italic 600 12px/1 Georgia,
      serif;
    cursor: help;
  }
  button:hover,
  .open button {
    color: var(--accent);
    border-color: var(--accent);
  }
  [role='tooltip'] {
    position: absolute;
    top: calc(100% + 8px);
    left: 0;
    z-index: 10;
    width: max-content;
    max-width: min(300px, calc(100vw - 32px));
    padding: 10px 12px;
    border: 1px solid var(--line);
    border-radius: 10px;
    background: var(--surface);
    box-shadow: 0 8px 24px rgb(0 0 0 / 0.12);
    font-size: 12.5px;
    line-height: 1.5;
    visibility: hidden;
    opacity: 0;
    transform: translateY(-4px);
    transition:
      opacity 0.12s,
      transform 0.12s,
      visibility 0.12s;
  }
  .info:hover [role='tooltip'],
  .info:focus-within [role='tooltip'],
  .open [role='tooltip'] {
    visibility: visible;
    opacity: 1;
    transform: none;
  }
</style>
