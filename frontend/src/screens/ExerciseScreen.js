// screens/ExerciseScreen.js
// Dispatcher für Übungen. Je nach category unterschiedliches Layout:
//   box_atmung         → Animation (keine Audio)
//   audio / innerer_ort→ Übungskarte mit Audio-Player + Anleitung
//   sonstige           → Guided Text

import { getExercise } from '../api.js'
import { saveQuestionnaire } from '../store.js'
import { BoxAtmung } from '../components/BoxAtmung.js'

// Fallback-Daten, gespiegelt aus cms/seed/data/exercises.json
const DEMO_EXERCISES_BY_SLUG = {
  'box-atmung': {
    slug: 'box-atmung',
    title: 'Box-Atmung',
    category: 'box_atmung',
    type: 'guided_text',
    duration: 240,
    description: 'Zu viel los im Kopf? Angespannt? Gestresst? Diese Atemtechnik hilft dir, wieder runterzukommen.',
  },
  'innerer-sicherer-ort-vorstellung': {
    slug: 'innerer-sicherer-ort-vorstellung',
    title: 'Innerer sicherer Ort (Vorstellung)',
    category: 'innerer_ort',
    type: 'audio',
    duration: 600,
    description: 'Ein persönlicher Ort in deiner Vorstellung, an den du dich zurückziehen kannst.',
    subtitle: 'Audio-Anleitung, ca. 10 Minuten.',
    audioUrl: null,
    subtitles: [
      { time: 0,   text: 'Finde eine bequeme Position.' },
      { time: 15,  text: 'Atme tief ein und aus.' },
      { time: 30,  text: 'Stell dir einen Ort vor, an dem du dich sicher fühlst.' },
      { time: 90,  text: 'Was siehst du? Welche Farben, Formen?' },
      { time: 180, text: 'Was hörst du an diesem Ort?' },
      { time: 270, text: 'Wie fühlt sich die Luft an?' },
      { time: 360, text: 'Bleib so lange du willst. Genieß die Ruhe.' },
      { time: 480, text: 'Komm langsam zurück. Bewege Hände und Füße.' },
    ],
  },
}

export function ExerciseScreen(path) {
  const slug = (path?.replace('/exercise/', '') || '').split('/')[0]
  const el = document.createElement('div')
  el.className = 'screen exercise-screen'

  el.innerHTML = `
    <div class="topbar">
      <button class="btn-menu exercise-back" type="button" aria-label="Zurück">&#8592;</button>
      <h1 class="exercise-heading">Übung</h1>
      <div style="width:44px"></div>
    </div>
    <div class="exercise-body"></div>
    <div class="exercise-loading">Lade Übung …</div>
  `

  const bodyEl = el.querySelector('.exercise-body')
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

    const exercise = loaded || DEMO_EXERCISES_BY_SLUG[slug] || DEMO_EXERCISES_BY_SLUG['box-atmung']
    loadingEl.style.display = 'none'
    headingEl.textContent = exercise.title || 'Übung'

    if (exercise.category === 'box_atmung') {
      renderBoxAtmung(bodyEl, exercise)
    } else if (exercise.type === 'audio' || exercise.category === 'innerer_ort') {
      renderAudioExercise(bodyEl, exercise)
    } else {
      renderGuidedText(bodyEl, exercise)
    }
  }

  init()
  return el
}

// ── Box-Atmung ──────────────────────────────────────────────
function renderBoxAtmung(container, exercise) {
  container.classList.add('exercise-body--boxatmung')
  container.innerHTML = `
    <div class="exercise-intro">
      <h2 class="exercise-title">${escape(exercise.title)}</h2>
      <p class="exercise-desc">${escape(exercise.description || '')}</p>
    </div>
  `
  const anim = BoxAtmung({
    onDone: () => {
      // Nach der Animation: kurzes "Wie war's?" + zurück
      setTimeout(() => history.back(), 1500)
    },
  })
  container.appendChild(anim)
}

// ── Audio-Übung (Übungskarte) ───────────────────────────────
function renderAudioExercise(container, exercise) {
  container.classList.add('exercise-body--audio')
  container.innerHTML = `
    <div class="exercise-card">
      <h2 class="exercise-title">${escape(exercise.title)}</h2>
      <p class="exercise-desc">${escape(exercise.description || '')}</p>
      <div class="exercise-subtitle-box">
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
      ${exercise.guidedText ? `<details class="exercise-instructions"><summary>Anleitung</summary><div class="exercise-instructions-body">${escape(exercise.guidedText).replace(/\n/g, '<br>')}</div></details>` : ''}
      <div class="exercise-rating" style="display:none">
        <h3 class="exercise-rating-title">Wie hilfreich war die Übung?</h3>
        <div class="likert">
          ${['😟','😕','😐','🙂','😊'].map((e, i) => `
            <div class="likert-item" data-value="${i + 1}">
              <div class="likert-emoji">${e}</div>
              <span class="likert-label">${['gar nicht','wenig','okay','gut','super'][i]}</span>
            </div>
          `).join('')}
        </div>
        <button class="btn-primary exercise-done" type="button" disabled>Fertig</button>
      </div>
    </div>
  `

  const subtitleEl = container.querySelector('.exercise-subtitle')
  const seekEl     = container.querySelector('.audio-seek')
  const currentTimeEl = container.querySelector('.audio-current')
  const durationEl    = container.querySelector('.audio-duration')
  const playBtn    = container.querySelector('.exercise-play')
  const ratingEl   = container.querySelector('.exercise-rating')
  const doneBtn    = container.querySelector('.exercise-done')

  let audio = null
  let selectedRating = null

  const subtitles = exercise.subtitles || []
  const hasAudio = !!exercise.audioUrl

  function updateSubtitle(time) {
    if (!subtitles.length) return
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
    audio.addEventListener('ended', showRating)
  } else {
    audio.ontimeupdate = update
    audio.onended = showRating
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

  function showRating() {
    playBtn.innerHTML = '&#9654;'
    ratingEl.style.display = ''
    container.querySelectorAll('.likert-item').forEach(item => {
      item.addEventListener('click', () => {
        container.querySelectorAll('.likert-item').forEach(i => i.classList.remove('selected'))
        item.classList.add('selected')
        selectedRating = parseInt(item.dataset.value)
        doneBtn.disabled = false
      })
    })
    doneBtn.addEventListener('click', async () => {
      if (selectedRating) {
        await saveQuestionnaire('exercise_rating', [
          { slug: exercise.slug, rating: selectedRating },
        ])
      }
      if (audio && audio instanceof Audio) { audio.pause(); audio.src = '' }
      history.back()
    })
  }

  updateSubtitle(0)
}

// ── Guided-Text-Übung (Fallback) ────────────────────────────
function renderGuidedText(container, exercise) {
  container.classList.add('exercise-body--text')
  container.innerHTML = `
    <div class="exercise-card">
      <h2 class="exercise-title">${escape(exercise.title)}</h2>
      <p class="exercise-desc">${escape(exercise.description || '')}</p>
      ${exercise.guidedText ? `<div class="exercise-text">${escape(exercise.guidedText).replace(/\n/g, '<br>')}</div>` : ''}
      <button class="btn-primary exercise-close" type="button">Fertig</button>
    </div>
  `
  container.querySelector('.exercise-close').addEventListener('click', () => history.back())
}

function escape(s) {
  return String(s || '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}
