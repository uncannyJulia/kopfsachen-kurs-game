// screens/ChaptersScreen.js
// Kapitelauswahl: 8 Kapitel mit Zeitgate (Kapitel 2-8 erst 1 Woche nach Vorkapitel-Abschluss).

import { getChapters } from '../api.js'
import { getProgress } from '../store.js'

// Fallback — Titel decken sich mit cms/seed/data/chapters.json
const DEMO_CHAPTERS = [
  { slug: 'ein-moment-nur-fuer-dich',                title: 'Ein Moment nur für dich',                subtitle: 'Ankommen und durchatmen',             order: 1, unlockAfterDays: 0 },
  { slug: 'wie-geht-es-dir-danke-gut',               title: 'Wie geht es dir? Danke gut.',            subtitle: 'Mit dir selbst in Verbindung kommen', order: 2, unlockAfterDays: 7 },
  { slug: 'unter-druck',                             title: 'Unter Druck',                            subtitle: 'Mit Stress umgehen',                  order: 3, unlockAfterDays: 7 },
  { slug: 'frueh-merken-wenns-zu-viel-wird',         title: "Früh merken, wenn's zu viel wird",       subtitle: 'Deine Warnsignale verstehen',         order: 4, unlockAfterDays: 7 },
  { slug: 'deine-groesste-unterstuetzung-du-selbst', title: 'Deine größte Unterstützung: du selbst!', subtitle: 'Selbstmitgefühl statt Selbstkritik',  order: 5, unlockAfterDays: 7 },
  { slug: 'was-will-ich-eigentlich',                 title: 'Was will ich eigentlich?',               subtitle: 'Orientierung und Richtung finden',    order: 6, unlockAfterDays: 7 },
  { slug: 'was-traegt-dich',                         title: 'Was trägt dich?',                        subtitle: 'Ressourcen stärken',                  order: 7, unlockAfterDays: 7 },
  { slug: 'dein-weg',                                title: 'Dein Weg',                               subtitle: 'Recap und langfristig am Ball bleiben', order: 8, unlockAfterDays: 7 },
]

const MS_PER_DAY = 24 * 60 * 60 * 1000

export function ChaptersScreen() {
  const el = document.createElement('div')
  el.className = 'screen chapters-screen'

  el.innerHTML = `
    <div class="topbar">
      <button class="btn-menu chapters-back" type="button" aria-label="Zurück">&#8592;</button>
      <h1 class="chapters-heading">Kapitel</h1>
      <div style="width:44px"></div>
    </div>
    <div class="chapters-list"></div>
    <div class="chapters-loading">Lade Kapitel …</div>
  `

  const listEl = el.querySelector('.chapters-list')
  const loadingEl = el.querySelector('.chapters-loading')

  el.querySelector('.chapters-back').addEventListener('click', () => {
    window.location.hash = '#/home'
  })

  async function init() {
    let chapters = null
    try {
      chapters = await getChapters()
    } catch (e) {
      console.warn('Strapi nicht erreichbar, nutze Demo-Daten:', e.message)
    }
    chapters = (chapters && chapters.length ? chapters : DEMO_CHAPTERS)
      .slice()
      .sort((a, b) => (a.order || 0) - (b.order || 0))

    const progress = await getProgress()
    const completed = progress.completedChapters || []
    const completions = progress.chapterCompletions || {}

    loadingEl.style.display = 'none'

    // Erstes nicht-abgeschlossenes Kapitel bestimmen (current)
    const currentIndex = chapters.findIndex(ch => !completed.includes(ch.slug))

    chapters.forEach((ch, i) => {
      const isCompleted = completed.includes(ch.slug)
      const isCurrent   = i === currentIndex
      const lockInfo    = computeLock(ch, chapters, i, completed, completions)

      const card = document.createElement('button')
      card.className = 'chapter-card'
      if (isCompleted) card.classList.add('chapter-card--done')
      if (isCurrent && !lockInfo.locked)  card.classList.add('chapter-card--current')
      if (lockInfo.locked) card.classList.add('chapter-card--locked')
      card.disabled = lockInfo.locked && !isCompleted

      const statusIcon = isCompleted ? '✓' : (lockInfo.locked ? '🔒' : '')
      const daysLeftHint = lockInfo.locked && lockInfo.daysLeft > 0
        ? `<span class="chapter-unlock-hint">Freigeschaltet in ${lockInfo.daysLeft} ${lockInfo.daysLeft === 1 ? 'Tag' : 'Tagen'}</span>`
        : lockInfo.locked
          ? `<span class="chapter-unlock-hint">Erst nach Abschluss von Kapitel ${i}</span>`
          : ''

      card.innerHTML = `
        <span class="chapter-number">${ch.order || i + 1}</span>
        <div class="chapter-info">
          <span class="chapter-title">${escapeHtml(ch.title)}</span>
          ${ch.subtitle ? `<span class="chapter-subtitle">${escapeHtml(ch.subtitle)}</span>` : ''}
          ${daysLeftHint}
        </div>
        <span class="chapter-status">${statusIcon}</span>
      `

      if (!card.disabled) {
        card.addEventListener('click', () => {
          window.location.hash = `#/novel/${ch.slug}`
        })
      }

      listEl.appendChild(card)
    })
  }

  init()
  return el
}

// Lock-Logik:
//  - Kapitel 1 (order === 1 / index 0) ist immer offen.
//  - Kapitel n ist offen, wenn Kapitel n-1 abgeschlossen UND unlockAfterDays seit Abschluss vergangen sind.
function computeLock(ch, chapters, idx, completed, completions) {
  if (idx === 0) return { locked: false, daysLeft: 0 }
  if (completed.includes(ch.slug)) return { locked: false, daysLeft: 0 }

  const prev = chapters[idx - 1]
  if (!prev || !completed.includes(prev.slug)) {
    return { locked: true, daysLeft: 0 }
  }

  const completedAt = completions[prev.slug]
  if (!completedAt) return { locked: false, daysLeft: 0 }

  const days = (ch.unlockAfterDays ?? 7)
  if (days <= 0) return { locked: false, daysLeft: 0 }

  const now = Date.now()
  const unlockAt = new Date(completedAt).getTime() + days * MS_PER_DAY
  const diff = unlockAt - now
  if (diff <= 0) return { locked: false, daysLeft: 0 }

  return { locked: true, daysLeft: Math.ceil(diff / MS_PER_DAY) }
}

function escapeHtml(s) {
  return String(s || '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}
