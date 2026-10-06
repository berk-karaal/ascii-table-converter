import { hydrate, mount } from 'svelte'
import './app.css'
import App from './App.svelte'

const target = document.getElementById('app')!

// Production HTML is prerendered (scripts/prerender.ts); the dev server serves an empty shell.
const app = target.firstElementChild ? hydrate(App, { target }) : mount(App, { target })

export default app
