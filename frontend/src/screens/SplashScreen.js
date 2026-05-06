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
        <span class="splash-subtitle">${t('splash.subtitle', 'Dein Kurs für mentale Stärke')}</span>
      </div>
    </div>
  `

  setTimeout(async () => {
    try {
      const settings = await getSettings()
      const progress = await getProgress()

      if (!settings.onboardingDone) {
        window.location.hash = '#/home'
      } else if (progress.completedChapters.length > 0 || progress.currentNodeId > 0) {
        window.location.hash = '#/home'
      } else {
        window.location.hash = '#/home'
      }
    } catch {
      window.location.hash = '#/home'
    }
  }, 1500)

  return el
}
