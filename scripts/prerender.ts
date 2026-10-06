// Renders the app to static HTML inside dist/index.html so crawlers see real content.
// The browser then hydrates it (see src/main.ts).
import { readFile, writeFile } from 'node:fs/promises'
import { createServer } from 'vite'

const FILE = 'dist/index.html'
const PLACEHOLDER = '<!--app-->'

const server = await createServer({
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'error',
})
try {
  const { render } = await server.ssrLoadModule('svelte/server')
  const { default: App } = await server.ssrLoadModule('/src/App.svelte')
  const { head, body } = render(App)
  const html = await readFile(FILE, 'utf8')
  if (!html.includes(PLACEHOLDER)) throw new Error(`${FILE} has no ${PLACEHOLDER} placeholder`)
  await writeFile(FILE, html.replace('</head>', `${head}</head>`).replace(PLACEHOLDER, body))
} finally {
  await server.close()
}
