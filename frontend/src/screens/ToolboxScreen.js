// screens/ToolboxScreen.js
// Selfcare-Schachtel: Sammlung aller Übungen, die der User schon gesehen/freigeschaltet hat.

import { getProgress } from '../store.js'
import { EXERCISES_BY_SLUG, CHAPTER_EXERCISES } from '../data/exercises-meta.js'

function formatDuration(seconds) {
  if (!seconds) return ''
  const min = Math.round(seconds / 60)
  return min < 1 ? '< 1 Min' : `${min} Min`
}

export function ToolboxScreen() {
  const el = document.createElement('div')
  el.className = 'screen toolbox-screen'

  el.innerHTML = `
    <div class="topbar">
      <button class="btn-menu toolbox-back" type="button" aria-label="Zurück">&#8592;</button>
      <h1 class="toolbox-heading">Selfcare-Schachtel</h1>
      <div style="width:44px"></div>
    </div>
    <p class="toolbox-intro">Hier findest du alle Übungen, die du im Kurs schon kennengelernt hast.</p>
    <div class="toolbox-list"></div>
  `

  const listEl = el.querySelector('.toolbox-list')

  el.querySelector('.toolbox-back').addEventListener('click', () => {
    history.back()
  })

  async function init() {
    const progress = await getProgress()
    const explicit = progress.unlockedExercises || []
    const completedChapters = progress.completedChapters || []

    // Zusätzlich aus abgeschlossenen Kapiteln ableiten, falls beim Öffnen
    // der Übung das explizite Unlock noch nicht gelaufen ist.
    const fromChapters = completedChapters.flatMap(ch => CHAPTER_EXERCISES[ch] || [])
    const unlocked = [...new Set([...explicit, ...fromChapters])]

    if (unlocked.length === 0) {
      listEl.innerHTML = `
        <div class="toolbox-empty">
          <p>Du hast noch keine Übung freigeschaltet.</p>
          <p>Sobald du im Kurs eine Übung machst, landet sie hier in deiner Selfcare-Schachtel — als Werkzeug für deinen Alltag.</p>
        </div>
      `
      return
    }

    unlocked.forEach(slug => {
      const ex = EXERCISES_BY_SLUG[slug]
      if (!ex) return  // unbekannter Slug — überspringen

      const card = document.createElement('button')
      card.className = 'toolbox-card'
      card.innerHTML = `
        <span class="toolbox-card-icon">${ex.icon || '🌿'}</span>
        <span class="toolbox-card-body">
          <span class="toolbox-card-title">${ex.title}</span>
          <span class="toolbox-card-desc">${ex.description || ''}</span>
          ${ex.duration ? `<span class="toolbox-card-duration">${formatDuration(ex.duration)}</span>` : ''}
        </span>
      `
      card.addEventListener('click', () => {
        const route = ex.targetRoute || 'exercise'
        window.location.hash = `#/${route}/${slug}`
      })
      listEl.appendChild(card)
    })
  }

  init()
  return el
}
