// screens/SplashScreen.js
// Kurze Logo-Anzeige, dann Weiterleitung je nach Spielstand.

import { getProgress, getSettings } from '../store.js'
import { t } from '../data/ui-texts.js'

export function SplashScreen() {
  const el = document.createElement('div')
  el.className = 'screen splash-screen'

  el.innerHTML = `
    <div class="splash-content">
      <div class="splash-logo">
        <span class="splash-title">${t('splash.title', 'Kopf frei!')}</span>
        <span class="splash-subtitle">${t('splash.subtitle', 'Dein Kurs für mehr Leichtigkeit')}</span>
      </div>
    </div>
  `

  // Hard-Fallback: nach 2s in jedem Fall weiter zu /home — schützt vor hängender
  // IndexedDB (z.B. Vite HMR-Reload mit zombier DB-Connection).
  let forwarded = false
  const goHome = () => {
    if (forwarded) return
    forwarded = true
    window.location.hash = '#/home'
  }
  setTimeout(goHome, 2000)

  setTimeout(async () => {
    try {
      // Nur kurz auf Storage warten, sonst direkt forward
      await Promise.race([
        Promise.all([getSettings(), getProgress()]),
        new Promise((_, rej) => setTimeout(() => rej(new Error('storage-timeout')), 800)),
      ])
    } catch {
      // egal — Spielstand wird im Home selbst nochmal geladen
    }
    goHome()
  }, 1500)

  return el
}
