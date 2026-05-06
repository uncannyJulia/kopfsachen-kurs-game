// screens/KopfsachenScreen.js
// Info-Seite über Kopfsachen e.V. mit Submenu: Kontakt, Credits, FAQ.
// Stub – wird in späteren Wellen inhaltlich gefüllt.

import { t } from '../data/ui-texts.js'

export function KopfsachenScreen() {
  const el = document.createElement('div')
  el.className = 'screen kopfsachen-screen'

  el.innerHTML = `
    <div class="topbar">
      <button class="btn-menu kopfsachen-back" type="button">&#8592;</button>
      <h1 class="kopfsachen-heading">${t('kopfsachen.heading', 'Kopfsachen')}</h1>
      <div style="width:44px"></div>
    </div>
    <div class="kopfsachen-intro">
      <p>${t('kopfsachen.intro', 'Dieses Angebot wird von Kopfsachen e.V. entwickelt.')}</p>
    </div>
    <nav class="kopfsachen-submenu">
      <a href="#/kopfsachen/kontakt" class="kopfsachen-submenu-link">
        <span class="kopfsachen-submenu-label">${t('kopfsachen.kontakt.label', 'Kontakt')}</span>
        <span class="kopfsachen-submenu-hint">${t('kopfsachen.kontakt.hint', 'Frag Kopfsachen etwas')}</span>
      </a>
      <a href="#/kopfsachen/credits" class="kopfsachen-submenu-link">
        <span class="kopfsachen-submenu-label">${t('kopfsachen.credits.label', 'Credits')}</span>
        <span class="kopfsachen-submenu-hint">${t('kopfsachen.credits.hint', 'Wer hat mitgewirkt')}</span>
      </a>
      <a href="#/kopfsachen/faq" class="kopfsachen-submenu-link">
        <span class="kopfsachen-submenu-label">${t('kopfsachen.faq.label', 'FAQ')}</span>
        <span class="kopfsachen-submenu-hint">${t('kopfsachen.faq.hint', 'Häufig gestellte Fragen')}</span>
      </a>
    </nav>
    <div class="kopfsachen-reset">
      <button type="button" class="kopfsachen-reset-btn">${t('kopfsachen.reset.button', 'Spielstand zurücksetzen')}</button>
      <p class="kopfsachen-reset-hint">${t('kopfsachen.reset.hint', 'Setzt deinen Fortschritt komplett zurück. Du startest dann wieder vom Onboarding.')}</p>
    </div>
  `

  el.querySelector('.kopfsachen-back').addEventListener('click', () => {
    history.back()
  })

  el.querySelector('.kopfsachen-reset-btn').addEventListener('click', async () => {
    if (!confirm(t('kopfsachen.reset.confirm', 'Wirklich zurücksetzen? Dein gesamter Fortschritt geht verloren.'))) return
    try {
      indexedDB.deleteDatabase('kopfsachen')
    } catch (e) { /* noop */ }
    setTimeout(() => { window.location.hash = '#/'; window.location.reload() }, 100)
  })

  return el
}
