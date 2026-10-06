export type Settings = {
  format: string
  width: number
  header: boolean
  keepBreaks: boolean
}

const KEY = 'table-reformatter:settings'

export const DEFAULTS: Settings = {
  format: 'rows',
  width: 80,
  header: true,
  keepBreaks: false,
}

export function loadSettings(): Settings {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) ?? '{}')
    const known = Object.keys(DEFAULTS).filter((k) => saved && k in saved)
    return { ...DEFAULTS, ...Object.fromEntries(known.map((k) => [k, saved[k]])) }
  } catch {
    return { ...DEFAULTS }
  }
}

export function saveSettings(settings: Settings) {
  try {
    localStorage.setItem(KEY, JSON.stringify(settings))
  } catch {
    // Storage blocked (private mode, disabled cookies): settings just won't persist.
  }
}
