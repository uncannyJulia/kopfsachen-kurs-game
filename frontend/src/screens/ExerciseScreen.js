// screens/ExerciseScreen.js
// Dispatcher für Übungen. Je nach category unterschiedliches Layout:
//   box_atmung         → Animation (keine Audio)
//   audio / innerer_ort→ Übungskarte mit Audio-Player + Anleitung
//   sonstige           → Guided Text

import { getExercise } from '../api.js'
import { unlockExercise } from '../store.js'
import { BoxAtmung } from '../components/BoxAtmung.js'
import { EXERCISES_BY_SLUG } from '../data/exercises-meta.js'
import { t } from '../data/ui-texts.js'

export function ExerciseScreen(path) {
  const slug = (path?.replace('/exercise/', '') || '').split('/')[0]
  const el = document.createElement('div')
  el.className = 'screen exercise-screen'

  el.innerHTML = `
    <div class="topbar">
      <button class="btn-menu exercise-back" type="button" aria-label="Zurück">&#8592;</button>
      <h1 class="exercise-heading">${t('exercise.heading.default', 'Übung')}</h1>
      <div style="width:44px"></div>
    </div>
    <div class="exercise-body"></div>
    <div class="exercise-footer"></div>
    <div class="exercise-loading">${t('exercise.loading', 'Lade Übung …')}</div>
  `

  const bodyEl = el.querySelector('.exercise-body')
  const footerEl = el.querySelector('.exercise-footer')
  const loadingEl = el.querySelector('.exercise-loading')
  const headingEl = el.querySelector('.exercise-heading')

  el.querySelector('.exercise-back').addEventListener('click', () => {
    history.back()
  })

  async function init() {
    let loaded = null
    try {
      if (slug) {
        const results = await getExercise(slug)
        loaded = Array.isArray(results) ? results[0] : results
      }
    } catch (e) {
      console.warn('Strapi nicht erreichbar, nutze Demo-Daten:', e.message)
    }

    const fallback = EXERCISES_BY_SLUG[slug] || EXERCISES_BY_SLUG['box-atmung']
    // Strapi-Daten haben Vorrang, aber subtitles + audioUrl + icon kommen
    // aus dem lokalen Fallback wenn Strapi sie nicht liefert.
    const exercise = loaded
      ? {
          ...fallback,
          ...loaded,
          subtitles: (loaded.subtitles && loaded.subtitles.length) ? loaded.subtitles : fallback.subtitles,
          audioUrl:  loaded.audioUrl || fallback.audioUrl,
          icon:      loaded.icon     || fallback.icon,
        }
      : fallback
    loadingEl.style.display = 'none'
    headingEl.textContent = exercise.title || t('exercise.heading.default', 'Übung')

    // Übung kennen heißt: jetzt in der Wohlfühl-Schachtel verfügbar
    if (exercise.slug) unlockExercise(exercise.slug)

    if (exercise.category === 'box_atmung') {
      renderBoxAtmung(bodyEl, footerEl, exercise)
    } else if (exercise.type === 'audio' || exercise.category === 'innerer_ort') {
      renderAudioExercise(bodyEl, footerEl, exercise)
    } else {
      renderGuidedText(bodyEl, footerEl, exercise)
    }
  }

  init()
  return el
}

// ── Box-Atmung ──────────────────────────────────────────────
function renderBoxAtmung(container, footer, exercise) {
  container.classList.add('exercise-body--boxatmung')
  container.innerHTML = `
    <p class="exercise-desc">${escape(exercise.description || '')}</p>
  `
  const anim = BoxAtmung({
    onDone: () => history.back(),
  })
  container.appendChild(anim)
  // Box-Atmung hat eigenen Done-Button in der Animation — kein Footer-Button nötig.
  footer.innerHTML = ''
}

// ── Audio-Übung (Übungskarte) ───────────────────────────────
function renderAudioExercise(container, footer, exercise) {
  container.classList.add('exercise-body--audio')
  // Title liegt schon in der Topbar — kein zweites H2 hier.
  container.innerHTML = `
    <div class="exercise-card">
      <p class="exercise-desc">${escape(exercise.description || '')}</p>
      <div class="exercise-subtitle-box" hidden>
        <p class="exercise-subtitle"></p>
      </div>
      <div class="audio-player">
        <div class="audio-time-row">
          <span class="audio-time audio-current">0:00</span>
          <span class="audio-time audio-duration">0:00</span>
        </div>
        <input type="range" class="audio-seek" min="0" max="100" value="0">
        <div class="audio-controls">
          <button class="audio-btn exercise-back-10" type="button">-10s</button>
          <button class="audio-btn audio-btn--play exercise-play" type="button">&#9654;</button>
          <button class="audio-btn exercise-fwd-10" type="button">+10s</button>
        </div>
      </div>
      ${exercise.guidedText ? `<details class="exercise-instructions"><summary>${escape(t('exercise.instructions.summary', 'Anleitung'))}</summary><div class="exercise-instructions-body">${escape(exercise.guidedText).replace(/\n/g, '<br>')}</div></details>` : ''}
    </div>
  `
  // Weiter-Button in den Footer pinnen, damit er immer am unteren Rand sitzt.
  footer.innerHTML = `<button class="btn-primary exercise-done" type="button" hidden>${escape(t('exercise.continue', 'Weiter'))}</button>`

  const subtitleBoxEl = container.querySelector('.exercise-subtitle-box')
  const subtitleEl = container.querySelector('.exercise-subtitle')
  const seekEl     = container.querySelector('.audio-seek')
  const currentTimeEl = container.querySelector('.audio-current')
  const durationEl    = container.querySelector('.audio-duration')
  const playBtn    = container.querySelector('.exercise-play')
  const doneBtn    = footer.querySelector('.exercise-done')

  let audio = null

  const subtitles = exercise.subtitles || []
  const hasAudio = !!exercise.audioUrl
  // Subtitle-Box nur einblenden wenn es Subtitles gibt — sonst leerer Kasten.
  if (subtitles.length === 0 && subtitleBoxEl) subtitleBoxEl.hidden = true

  function updateSubtitle(time) {
    if (!subtitles.length) return
    if (subtitleBoxEl) subtitleBoxEl.hidden = false
    let current = subtitles[0]?.text || ''
    for (const s of subtitles) if (time >= s.time) current = s.text
    subtitleEl.textContent = current
  }

  function formatTime(s) {
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  // Real- oder Fake-Audio
  const fallbackDuration = exercise.duration || 60
  if (hasAudio) {
    audio = new Audio(exercise.audioUrl)
  } else {
    audio = {
      currentTime: 0,
      duration: fallbackDuration,
      paused: true,
      _interval: null,
      play() {
        this.paused = false
        this._interval = setInterval(() => {
          this.currentTime += 0.5
          if (this.currentTime >= this.duration) {
            this.currentTime = this.duration
            this.paused = true
            clearInterval(this._interval)
            if (this.onended) this.onended()
          }
          if (this.ontimeupdate) this.ontimeupdate()
        }, 500)
      },
      pause() { this.paused = true; clearInterval(this._interval) },
      set src(_) {},
    }
  }

  durationEl.textContent = formatTime(audio.duration || fallbackDuration)

  const update = () => {
    const ct = audio.currentTime || 0
    const dur = audio.duration || fallbackDuration
    currentTimeEl.textContent = formatTime(ct)
    seekEl.value = dur ? (ct / dur * 100) : 0
    updateSubtitle(ct)
  }

  if (audio instanceof Audio) {
    audio.addEventListener('timeupdate', update)
    audio.addEventListener('loadedmetadata', () => {
      durationEl.textContent = formatTime(audio.duration)
    })
    audio.addEventListener('ended', showFinish)
  } else {
    audio.ontimeupdate = update
    audio.onended = showFinish
  }

  playBtn.addEventListener('click', () => {
    if (audio.paused) { audio.play(); playBtn.innerHTML = '&#10074;&#10074;' }
    else              { audio.pause(); playBtn.innerHTML = '&#9654;' }
  })

  seekEl.addEventListener('input', () => {
    audio.currentTime = (seekEl.value / 100) * (audio.duration || fallbackDuration)
  })

  container.querySelector('.exercise-back-10').addEventListener('click', () => {
    audio.currentTime = Math.max(0, audio.currentTime - 10)
  })
  container.querySelector('.exercise-fwd-10').addEventListener('click', () => {
    audio.currentTime = Math.min(audio.duration || fallbackDuration, audio.currentTime + 10)
  })

  function showFinish() {
    playBtn.innerHTML = '&#9654;'
    doneBtn.hidden = false
    doneBtn.addEventListener('click', () => {
      if (audio && audio instanceof Audio) { audio.pause(); audio.src = '' }
      history.back()
    })
  }

  updateSubtitle(0)
}

// ── Guided-Text-Übung (Fallback) ────────────────────────────
function renderGuidedText(container, footer, exercise) {
  container.classList.add('exercise-body--text')
  container.innerHTML = `
    <div class="exercise-card">
      <p class="exercise-desc">${escape(exercise.description || '')}</p>
      ${exercise.guidedText ? `<div class="exercise-text">${escape(exercise.guidedText).replace(/\n/g, '<br>')}</div>` : ''}
    </div>
  `
  footer.innerHTML = `<button class="btn-primary exercise-close" type="button">${escape(t('exercise.done', 'Fertig'))}</button>`
  footer.querySelector('.exercise-close').addEventListener('click', () => history.back())
}

function escape(s) {
  return String(s || '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}
