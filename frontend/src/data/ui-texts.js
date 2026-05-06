// data/ui-texts.js
// Lädt einmal alle ui-text-blocks aus Strapi und cacht sie. Frontend-Code
// ruft `t(key, fallback)` auf — gibt den Strapi-Wert zurück oder den Fallback.

import { getUiTextBlocks } from '../api.js'

let _texts = {}      // { key: text }
let _loaded = false
let _loadingPromise = null

export async function ensureUiTextsLoaded() {
  if (_loaded) return _texts
  if (_loadingPromise) return _loadingPromise

  _loadingPromise = (async () => {
    try {
      const blocks = await getUiTextBlocks()
      if (Array.isArray(blocks)) {
        blocks.forEach(b => {
          if (b && b.key) _texts[b.key] = b.text
        })
      }
    } catch (e) {
      console.warn('UI-Texte konnten nicht aus Strapi geladen werden, nutze Fallbacks:', e.message)
    }
    _loaded = true
    _loadingPromise = null
    return _texts
  })()

  return _loadingPromise
}

// Synchroner Lookup. Wenn ensureUiTextsLoaded() noch nicht durchgelaufen ist
// (z.B. erster Render), gibt's den Fallback zurück.
export function t(key, fallback = '') {
  if (!key) return fallback
  const val = _texts[key]
  return (val == null || val === '') ? fallback : val
}

// Helper für simple Variablen-Substitution: t('foo', 'Hallo {name}', { name: 'Anna' })
export function tf(key, fallback, vars) {
  let template = t(key, fallback)
  if (vars) {
    Object.keys(vars).forEach(k => {
      template = template.replace(new RegExp(`\\{${k}\\}`, 'g'), vars[k])
    })
  }
  return template
}
