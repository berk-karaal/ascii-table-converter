import { svelte } from '@sveltejs/vite-plugin-svelte'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  // Relative asset paths so the build works under any GitHub Pages sub-path.
  base: './',
  plugins: [svelte()],
})
