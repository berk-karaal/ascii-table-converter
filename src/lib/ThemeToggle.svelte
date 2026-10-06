<script lang="ts">
  const KEY = 'table-reformatter:theme'

  function toggle() {
    const root = document.documentElement
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark'
    root.dataset.theme = next
    try {
      localStorage.setItem(KEY, next)
    } catch {
      // Storage blocked: the choice still applies until the page is closed.
    }
  }
</script>

<!-- Both icons are rendered; CSS shows the one for the current theme, so prerendered HTML always matches. -->
<button
  type="button"
  class="icon-btn"
  aria-label="Toggle dark mode"
  title="Toggle dark mode"
  onclick={toggle}
>
  <svg class="moon" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" />
  </svg>
  <svg class="sun" viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="12" r="4" />
    <path
      d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"
    />
  </svg>
</button>

<style>
  svg {
    fill: none;
    stroke: currentColor;
    stroke-width: 1.8;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  .sun,
  :global([data-theme='dark']) .moon {
    display: none;
  }
  :global([data-theme='dark']) .sun {
    display: block;
  }
</style>
