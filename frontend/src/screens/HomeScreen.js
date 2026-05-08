// screens/HomeScreen.js
// Home-Menü mit zwei Zuständen:
//   1. Initial (kein Onboarding abgeschlossen): Start, Hilfsangebote, Kopfsachen
//   2. Nach Kapitel 1: Kurs fortsetzen, Kapitelauswahl, Selfcare-Schachtel, Hilfsangebote, Kopfsachen
//
// Start → /novel/onboarding (erstes Mal) oder /novel/<currentChapter> (Kurs fortsetzen)

import { getProgress, getSettings, saveProgress } from '../store.js'
import { t } from '../data/ui-texts.js'

// Slugs, die als gültige "Kurs-fortsetzen"-Ziele zählen (Onboarding zählt nicht).
const COURSE_SLUGS = new Set([
  'ein-moment-nur-fuer-dich',
  'wie-geht-es-dir-danke-gut',
  'unter-druck',
  'frueh-merken-wenns-zu-viel-wird',
  'gut-zu-dir-sein',
  'was-will-ich-eigentlich',
  'was-traegt-dich',
  'dein-weg',
])

export function HomeScreen() {
  const el = document.createElement('div')
  el.className = 'screen home-screen'

  el.innerHTML = `
    <div class="home-content">
      <div class="home-hero">
        <h1 class="home-title">${t('home.title', 'Kopf frei!')}</h1>
        <p class="home-tagline">${t('home.tagline', 'Dein Kurs für mentale Stärke')}</p>
      </div>
      <div class="home-actions home-actions--loading">
        <div class="home-loading">Lade …</div>
      </div>
    </div>
  `

  const actionsEl = el.querySelector('.home-actions')

  async function init() {
    let settings = {}, progress = { completedChapters: [], currentChapter: null, currentNodeId: 0 }
    try {
      settings  = await getSettings()
      progress  = await getProgress()
    } catch (err) {
      console.warn('Home: Spielstand konnte nicht geladen werden, zeige Initial-Menü:', err)
    }

    const onboardingDone = !!settings.onboardingDone
    const hasResumableChapter = progress.currentChapter
      && COURSE_SLUGS.has(progress.currentChapter)
      && progress.currentNodeId > 0
    const hasStarted = (progress.completedChapters || []).length > 0 || hasResumableChapter

    actionsEl.classList.remove('home-actions--loading')
    actionsEl.innerHTML = ''

    if (hasStarted) {
      renderPostOnboarding(actionsEl, progress)
    } else {
      renderInitial(actionsEl, onboardingDone)
    }
  }

  init()
  return el
}

function renderInitial(container, onboardingDone) {
  container.innerHTML = `
    <button class="btn-primary home-btn home-start" type="button">${t('home.button.start', 'Start')}</button>
    <button class="btn-secondary home-btn home-hilfsangebote" type="button">${t('home.button.hilfsangebote', 'Hilfsangebote')}</button>
    <button class="btn-secondary home-btn home-kopfsachen" type="button">${t('home.button.kopfsachen', 'Kopfsachen')}</button>
  `
  container.querySelector('.home-start').addEventListener('click', async () => {
    // Onboarding ist die erste Evu-Szene. Frischer Start: alten Resume-Pointer löschen,
    // sonst landet der User beim Abschiedsgruß einer früheren abgebrochenen Session.
    await saveProgress({ currentChapter: null, currentNodeId: 0 })
    window.location.hash = onboardingDone ? '#/chapters' : '#/novel/onboarding'
  })
  container.querySelector('.home-hilfsangebote').addEventListener('click', () => {
    window.location.hash = '#/hilfsangebote'
  })
  container.querySelector('.home-kopfsachen').addEventListener('click', () => {
    window.location.hash = '#/kopfsachen'
  })
}

function renderPostOnboarding(container, progress) {
  const resumeTarget = progress.currentChapter
    ? `#/novel/${progress.currentChapter}`
    : '#/chapters'

  container.innerHTML = `
    <button class="btn-primary home-btn home-resume" type="button">${t('home.button.resume', 'Kurs fortsetzen')}</button>
    <button class="btn-secondary home-btn home-chapters" type="button">${t('home.button.chapters', 'Kapitelauswahl')}</button>
    <button class="btn-secondary home-btn home-toolbox" type="button">${t('home.button.toolbox', 'Selfcare-Schachtel')}</button>
    <button class="btn-secondary home-btn home-hilfsangebote" type="button">${t('home.button.hilfsangebote', 'Hilfsangebote')}</button>
    <button class="btn-secondary home-btn home-kopfsachen" type="button">${t('home.button.kopfsachen', 'Kopfsachen')}</button>
  `
  container.querySelector('.home-resume').addEventListener('click', () => {
    window.location.hash = resumeTarget
  })
  container.querySelector('.home-chapters').addEventListener('click', () => {
    window.location.hash = '#/chapters'
  })
  container.querySelector('.home-toolbox').addEventListener('click', () => {
    window.location.hash = '#/toolbox'
  })
  container.querySelector('.home-hilfsangebote').addEventListener('click', () => {
    window.location.hash = '#/hilfsangebote'
  })
  container.querySelector('.home-kopfsachen').addEventListener('click', () => {
    window.location.hash = '#/kopfsachen'
  })
}
