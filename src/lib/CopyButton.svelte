<script lang="ts">
  let {
    copy,
    label = 'Copy',
    primary = false,
  }: { copy: () => Promise<void>; label?: string; primary?: boolean } = $props()

  let status = $state<'idle' | 'done' | 'failed'>('idle')
  let timer: ReturnType<typeof setTimeout>

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

<button type="button" class="btn" class:primary class:done={status === 'done'} onclick={run}>
  <span aria-live="polite">
    {status === 'done' ? 'Copied ✓' : status === 'failed' ? 'Copy failed' : label}
  </span>
</button>
