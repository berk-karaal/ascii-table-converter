<script lang="ts">
  let {
    copy,
    label = 'Copy',
    primary = false,
    nudge,
  }: {
    copy: () => Promise<void>
    label?: string
    primary?: boolean
    /** When set, the button wiggles on mount and again whenever this value changes. */
    nudge?: unknown
  } = $props()

  // Two short shakes in 1.6 s: well under WCAG 2.2.2's 5-second limit for unprompted motion.
  const WIGGLE: Keyframe[] = [
    [0, 0],
    [0.05, -4],
    [0.1, 4],
    [0.15, -2],
    [0.2, 2],
    [0.3, 0],
    [0.35, -4],
    [0.4, 4],
    [0.45, -2],
    [0.5, 2],
    [0.6, 0],
    [1, 0],
  ].map(([offset, deg]) => ({ offset, transform: `rotate(${deg}deg)`, easing: 'ease-in-out' }))

  let button: HTMLButtonElement
  let status = $state<'idle' | 'done' | 'failed'>('idle')
  let timer: ReturnType<typeof setTimeout>

  $effect(() => {
    if (nudge === undefined || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    button.animate(WIGGLE, 1600)
  })

  async function run() {
    try {
      await copy()
      status = 'done'
    } catch {
      status = 'failed'
    }
    clearTimeout(timer)
    timer = setTimeout(() => (status = 'idle'), 1600)
  }
</script>

<button
  bind:this={button}
  type="button"
  class="btn"
  class:primary
  class:done={status === 'done'}
  onclick={run}
>
  <span aria-live="polite">
    {status === 'done' ? 'Copied ✓' : status === 'failed' ? 'Copy failed' : label}
  </span>
</button>
