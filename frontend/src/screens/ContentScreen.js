// screens/ContentScreen.js
// Generischer Content-Screen: Figur klein, Haupt-Area baut Blöcke auf.
// Dispatcht je nach Slug zu einer spezifischen View.
//
// Slugs:
//   energie-reflexion  — Energie-Fresser/Geber-Swipe
//   wenn-dann-plan     — Wenn-Dann-Plan-Zusammenbau

import { getEnergieAktivitaeten, getWennDannSituations } from '../api.js'
import { saveCourseData, getCourseData } from '../store.js'

const DEMO_ENERGIE_AKTIVITAETEN = [
  { text: 'Viele Aufgaben gleichzeitig erledigen', sortOrder: 1 },
  { text: 'Lernen oder arbeiten unter Zeitdruck', sortOrder: 2 },
  { text: 'Über die eigene Zukunft nachdenken', sortOrder: 3 },
  { text: 'In der Freizeit arbeitsbezogene Nachrichten lesen', sortOrder: 4 },
  { text: 'Eine Prüfung schreiben', sortOrder: 5 },
  { text: 'Streit mit Familienmitgliedern oder Freund*innen', sortOrder: 6 },
  { text: 'Weniger als 7 Stunden schlafen', sortOrder: 7 },
  { text: 'Eine Serie schauen', sortOrder: 8 },
  { text: 'Mit Freund*innen texten', sortOrder: 9 },
  { text: '1h am Stück auf Social Media verbringen', sortOrder: 10 },
  { text: 'Bewusst Pause machen und nichts tun', sortOrder: 11 },
  { text: 'Nach Schule/Arbeit nicht mehr darüber nachdenken', sortOrder: 12 },
  { text: 'Dinge aufschreiben, um sie loszulassen', sortOrder: 13 },
  { text: 'Etwas erledigen und abhaken', sortOrder: 14 },
  { text: 'Etwas Neues lernen oder ausprobieren', sortOrder: 15 },
  { text: 'Völlig spontan und frei entscheiden, wie man einen Abend verbringt', sortOrder: 16 },
  { text: 'Zeit mit Freund*innen oder anderen Menschen verbringen', sortOrder: 17 },
]

const DEMO_WENN_DANN_SITUATIONS = [
  { text: 'Wenn ich nach einem anstrengenden Tag nach Hause komme', sortOrder: 1 },
  { text: 'Wenn ich merke, dass ich total gestresst bin',            sortOrder: 2 },
  { text: 'Wenn ich lange am Handy war und mich leer fühle',         sortOrder: 3 },
  { text: 'Wenn ich mich einsam fühle',                              sortOrder: 4 },
  { text: 'Wenn ich mich nach dem Lernen erschöpft fühle',           sortOrder: 5 },
]

export function ContentScreen(path) {
  const slug = (path?.replace('/content/', '') || '').split('/')[0]
  const el = document.createElement('div')
  el.className = 'screen content-screen'

  el.innerHTML = `
    <div class="topbar content-topbar">
      <button class="btn-menu content-back" type="button" aria-label="Zurück">&#8592;</button>
      <h1 class="content-heading"></h1>
      <div class="content-figure"><span class="content-figure-emoji">🧡</span></div>
    </div>
    <div class="content-body"></div>
  `

  el.querySelector('.content-back').addEventListener('click', () => history.back())

  const bodyEl = el.querySelector('.content-body')
  const headingEl = el.querySelector('.content-heading')

  if (slug === 'energie-reflexion') {
    headingEl.textContent = 'Was gibt mir Energie?'
    renderEnergieReflexion(bodyEl)
  } else if (slug === 'wenn-dann-plan') {
    headingEl.textContent = 'Dein Energie-Plan'
    renderWennDannPlan(bodyEl)
  } else if (slug === 'wuensche-auswahl') {
    headingEl.textContent = 'Was wünschst du dir?'
    renderWuenscheAuswahl(bodyEl)
  } else {
    headingEl.textContent = 'Content'
    bodyEl.innerHTML = `<p class="content-placeholder">Kein Content für Slug '${escape(slug)}' gefunden.</p>`
  }

  return el
}

// ══════════════════════════════════════════════════════════
// Wünsche-Auswahl (Multi-Select + Freitext)
// ══════════════════════════════════════════════════════════
async function renderWuenscheAuswahl(container) {
  const OPTIONS = [
    'Ich möchte besser verstehen, was in mir vorgeht.',
    'Ich möchte wissen, was mir hilft, wenn es mir nicht gut geht.',
    'Ich möchte lernen, wie ich mit schwierigen Gefühlen umgehe.',
    'Ich bin einfach neugierig.',
    'Ich weiß es noch nicht genau.',
  ]

  const saved = (await getCourseData('wuensche')) || { selected: [], freetext: '' }
  const selected = new Set(saved.selected || [])

  container.innerHTML = `
    <p class="wuensche-intro">Wähle alles aus, was zutrifft.</p>
    <ul class="wuensche-list"></ul>
    <div class="wuensche-freetext">
      <label for="wuensche-freitext-input">Etwas anderes:</label>
      <input id="wuensche-freitext-input" type="text" class="wuensche-freetext-input" placeholder="Schreib deinen Wunsch …" value="${escape(saved.freetext || '')}">
    </div>
    <button class="btn-primary wuensche-save" type="button">Weiter</button>
  `

  const listEl = container.querySelector('.wuensche-list')
  const freiInput = container.querySelector('.wuensche-freetext-input')
  const saveBtn = container.querySelector('.wuensche-save')

  OPTIONS.forEach(opt => {
    const li = document.createElement('li')
    li.innerHTML = `
      <label class="wuensche-option ${selected.has(opt) ? 'wuensche-option--checked' : ''}">
        <input type="checkbox" class="wuensche-checkbox" ${selected.has(opt) ? 'checked' : ''}>
        <span class="wuensche-text">${escape(opt)}</span>
      </label>
    `
    const cb = li.querySelector('input')
    const wrapper = li.querySelector('label')
    cb.addEventListener('change', () => {
      if (cb.checked) {
        selected.add(opt)
        wrapper.classList.add('wuensche-option--checked')
      } else {
        selected.delete(opt)
        wrapper.classList.remove('wuensche-option--checked')
      }
    })
    listEl.appendChild(li)
  })

  saveBtn.addEventListener('click', async () => {
    await saveCourseData('wuensche', {
      selected: Array.from(selected),
      freetext: freiInput.value.trim(),
      savedAt: new Date().toISOString(),
    })
    history.back()
  })
}

// ══════════════════════════════════════════════════════════
// Energie-Fresser/Geber-Swipe
// ══════════════════════════════════════════════════════════
async function renderEnergieReflexion(container) {
  container.innerHTML = `<div class="content-loading">Lade …</div>`

  let items = null
  try {
    items = await getEnergieAktivitaeten()
  } catch (e) {
    console.warn('Strapi nicht erreichbar, nutze Demo-Aktivitäten:', e.message)
  }
  items = (items && items.length ? items : DEMO_ENERGIE_AKTIVITAETEN)
    .slice()
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))

  const responses = {}  // { text: { tendency: 'fresser'|'geber'|'skip', rating?: 1-5 } }
  let idx = 0
  let pendingTendency = null   // null → swipe-Phase; 'fresser'|'geber' → rating-Phase
  const SWIPE_THRESHOLD = 100  // Pixel die geswiped werden müssen

  container.innerHTML = `
    <div class="energie-intro">
      <p>Denke an deine letzte Woche.</p>
      <p>Wische die Karte <strong>nach links</strong>, wenn dich das Energie gekostet hat — <strong>nach rechts</strong>, wenn es dir Energie gegeben hat.</p>
    </div>
    <div class="energie-stage">
      <div class="energie-tray energie-tray--left" aria-label="Energie-Fresser">
        <span class="energie-tray-icon">✕</span>
        <div class="energie-tray-dots"></div>
      </div>
      <div class="energie-card-wrap">
        <div class="energie-card" role="button" aria-label="Karte zum Wischen">
          <div class="energie-card-label">Situation</div>
          <div class="energie-card-text"></div>
          <div class="energie-card-badge"></div>
        </div>
      </div>
      <div class="energie-tray energie-tray--right" aria-label="Energie-Geber">
        <span class="energie-tray-icon">♥</span>
        <div class="energie-tray-dots"></div>
      </div>
    </div>
    <div class="energie-rating-area" hidden>
      <p class="energie-rating-prompt"></p>
      <div class="energie-scale">
        ${[1, 2, 3, 4, 5].map(n => `<button class="energie-scale-btn" data-value="${n}" type="button">${n}</button>`).join('')}
      </div>
    </div>
    <div class="energie-bottom">
      <button class="energie-skip-btn" type="button">ist nicht passiert</button>
    </div>
    <div class="energie-progress"></div>
  `

  const cardWrap   = container.querySelector('.energie-card-wrap')
  const cardEl     = container.querySelector('.energie-card')
  const cardTextEl = container.querySelector('.energie-card-text')
  const cardBadge  = container.querySelector('.energie-card-badge')
  const trayLeftDots  = container.querySelector('.energie-tray--left  .energie-tray-dots')
  const trayRightDots = container.querySelector('.energie-tray--right .energie-tray-dots')
  const ratingArea = container.querySelector('.energie-rating-area')
  const ratingPrompt = container.querySelector('.energie-rating-prompt')
  const skipBtn    = container.querySelector('.energie-skip-btn')
  const progressEl = container.querySelector('.energie-progress')

  function renderCurrent() {
    progressEl.textContent = `${Math.min(idx + 1, items.length)} / ${items.length}`

    if (idx >= items.length) {
      return renderDone()
    }

    const current = items[idx]
    cardTextEl.textContent = current.text
    cardBadge.textContent = ''
    cardBadge.className = 'energie-card-badge'
    cardEl.style.transition = ''
    cardEl.style.transform = ''
    cardEl.style.opacity = ''
    pendingTendency = null
    ratingArea.hidden = true
    skipBtn.hidden = false

    // Drift-Animation für jede neue Bubble neu starten
    cardEl.style.animation = 'none'
    void cardEl.offsetWidth
    cardEl.style.animation = ''

    enableSwipe()
  }

  // ── Swipe-Logik ──────────────────────────────────────────
  let dragging = false
  let startX = 0, currentX = 0

  function enableSwipe() {
    cardEl.addEventListener('pointerdown', onPointerDown, { passive: true })
  }
  function disableSwipe() {
    cardEl.removeEventListener('pointerdown', onPointerDown)
  }
  function onPointerDown(e) {
    if (pendingTendency) return
    dragging = true
    startX = e.clientX
    currentX = 0
    cardEl.setPointerCapture(e.pointerId)
    cardEl.style.transition = 'none'
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp, { once: true })
    window.addEventListener('pointercancel', onPointerUp, { once: true })
  }
  function onPointerMove(e) {
    if (!dragging) return
    currentX = e.clientX - startX
    const rotation = currentX / 20  // °
    cardEl.style.transform = `translateX(${currentX}px) rotate(${rotation}deg)`
    // Badge-Hinweis je nach Richtung
    if (currentX < -30) {
      cardBadge.textContent = '✕'
      cardBadge.className = 'energie-card-badge energie-card-badge--fresser'
    } else if (currentX > 30) {
      cardBadge.textContent = '♥'
      cardBadge.className = 'energie-card-badge energie-card-badge--geber'
    } else {
      cardBadge.textContent = ''
      cardBadge.className = 'energie-card-badge'
    }
  }
  function onPointerUp() {
    if (!dragging) return
    dragging = false
    window.removeEventListener('pointermove', onPointerMove)

    if (Math.abs(currentX) >= SWIPE_THRESHOLD) {
      const tendency = currentX < 0 ? 'fresser' : 'geber'
      flyOutAndRate(tendency)
    } else {
      // Nicht weit genug → zurück
      cardEl.style.transition = 'transform var(--transition)'
      cardEl.style.transform = ''
      cardBadge.textContent = ''
      cardBadge.className = 'energie-card-badge'
    }
  }

  function flyOutAndRate(tendency) {
    pendingTendency = tendency
    disableSwipe()
    cardEl.style.transition = 'transform 280ms ease, opacity 280ms ease'
    const offset = tendency === 'fresser' ? -window.innerWidth : window.innerWidth
    cardEl.style.transform = `translateX(${offset}px) rotate(${tendency === 'fresser' ? -25 : 25}deg)`
    cardEl.style.opacity = '0.4'

    // Rating-Bereich einblenden
    setTimeout(() => {
      ratingPrompt.textContent = tendency === 'fresser'
        ? `Wie viel Energie hat dich das gekostet?`
        : `Wie viel Energie hat dir das gegeben?`
      ratingArea.hidden = false
      skipBtn.hidden = true
    }, 100)
  }

  // Rating-Click
  ratingArea.querySelectorAll('.energie-scale-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!pendingTendency) return
      const rating = parseInt(btn.dataset.value)
      const current = items[idx]
      responses[current.text] = { tendency: pendingTendency, rating }
      addDot(pendingTendency)
      idx++
      renderCurrent()
    })
  })

  // Skip-Button
  skipBtn.addEventListener('click', () => {
    if (pendingTendency) return
    responses[items[idx].text] = { tendency: 'skip' }
    cardEl.style.transition = 'transform 240ms ease, opacity 240ms ease'
    cardEl.style.transform = `translateY(${window.innerHeight}px)`
    cardEl.style.opacity = '0'
    setTimeout(() => {
      idx++
      renderCurrent()
    }, 250)
  })

  function addDot(tendency) {
    const target = tendency === 'fresser' ? trayLeftDots : trayRightDots
    const dot = document.createElement('span')
    dot.className = `energie-dot energie-dot--${tendency}`
    target.appendChild(dot)
  }

  async function renderDone() {
    const fresser = Object.entries(responses)
      .filter(([_, r]) => r.tendency === 'fresser')
      .sort((a, b) => (b[1].rating || 0) - (a[1].rating || 0))
    const geber = Object.entries(responses)
      .filter(([_, r]) => r.tendency === 'geber')
      .sort((a, b) => (b[1].rating || 0) - (a[1].rating || 0))

    await saveCourseData('energieReflexion', { responses, completedAt: new Date().toISOString() })

    container.innerHTML = `
      <div class="energie-done">
        <h2 class="energie-done-title">Deine Woche</h2>
        <div class="energie-done-group">
          <h3 class="energie-done-subtitle">Deine Top-Energie-Fresser</h3>
          ${fresser.length ? `<ul class="energie-done-list">${fresser.map(([t, r]) =>
            `<li>${escape(t)} <span class="energie-rating">${r.rating}/5</span></li>`
          ).join('')}</ul>` : '<p class="energie-empty">— keine —</p>'}
        </div>
        <div class="energie-done-group">
          <h3 class="energie-done-subtitle">Deine Top-Energie-Geber</h3>
          ${geber.length ? `<ul class="energie-done-list">${geber.map(([t, r]) =>
            `<li>${escape(t)} <span class="energie-rating">${r.rating}/5</span></li>`
          ).join('')}</ul>` : '<p class="energie-empty">— keine —</p>'}
        </div>
        <p class="energie-hint">Gerade vor und nach Aktivitäten, die dich viel Energie kosten, ist es hilfreich, bewusst Zeiten für Erholung einzuplanen.</p>
        <button class="btn-primary energie-continue" type="button">Weiter</button>
      </div>
    `
    container.querySelector('.energie-continue').addEventListener('click', () => history.back())
  }

  renderCurrent()
}

// ══════════════════════════════════════════════════════════
// Wenn-Dann-Plan
// ══════════════════════════════════════════════════════════
async function renderWennDannPlan(container) {
  container.innerHTML = `<div class="content-loading">Lade …</div>`

  // Geber aus vorheriger Reflexion holen
  const reflexion = (await getCourseData('energieReflexion')) || { responses: {} }
  const geber = Object.entries(reflexion.responses || {})
    .filter(([_, r]) => r.tendency === 'geber')
    .sort((a, b) => (b[1].rating || 0) - (a[1].rating || 0))
    .map(([text]) => text)

  // Fallback wenn keine Geber erfasst
  const boostOptions = geber.length
    ? geber
    : ['Bewusst Pause machen', 'Zeit mit Freund*innen verbringen', 'Etwas Neues ausprobieren']

  let situations = null
  try {
    situations = await getWennDannSituations()
  } catch (e) {
    console.warn('Strapi nicht erreichbar, nutze Demo-Situationen:', e.message)
  }
  situations = (situations && situations.length ? situations : DEMO_WENN_DANN_SITUATIONS)
    .slice()
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
    .map(s => s.text)

  let selectedBoost = null
  let selectedSituation = null
  let freiText = ''

  container.innerHTML = `
    <div class="wenn-dann-step step-1">
      <h2 class="wenn-dann-title">Schritt 1: Dein Energie-Boost</h2>
      <p class="wenn-dann-desc">Wähle eine Aktivität, die du in der nächsten Woche bewusst einbauen möchtest.</p>
      <div class="wenn-dann-options"></div>
    </div>
    <div class="wenn-dann-step step-2" hidden>
      <h2 class="wenn-dann-title">Schritt 2: Wann?</h2>
      <p class="wenn-dann-desc">Wann wäre dein Energie-Boost besonders hilfreich?</p>
      <div class="wenn-dann-options"></div>
      <div class="wenn-dann-freitext">
        <label>Oder eigene Situation:</label>
        <input type="text" class="wenn-dann-freitext-input" placeholder="z.B. Wenn ich …">
      </div>
    </div>
    <div class="wenn-dann-step step-3" hidden>
      <h2 class="wenn-dann-title">Dein Plan</h2>
      <div class="wenn-dann-sentence"></div>
      <button class="btn-primary wenn-dann-save" type="button">Plan merken</button>
    </div>
  `

  const step1 = container.querySelector('.step-1')
  const step2 = container.querySelector('.step-2')
  const step3 = container.querySelector('.step-3')

  // Step 1: Boost wählen
  const step1Options = step1.querySelector('.wenn-dann-options')
  boostOptions.forEach(opt => {
    const btn = document.createElement('button')
    btn.className = 'wenn-dann-option btn-secondary'
    btn.textContent = opt
    btn.addEventListener('click', () => {
      selectedBoost = opt
      step1.hidden = true
      step2.hidden = false
    })
    step1Options.appendChild(btn)
  })

  // Step 2: Situation wählen
  const step2Options = step2.querySelector('.wenn-dann-options')
  situations.forEach(opt => {
    const btn = document.createElement('button')
    btn.className = 'wenn-dann-option btn-secondary'
    btn.textContent = opt
    btn.addEventListener('click', () => {
      selectedSituation = opt
      advanceToStep3()
    })
    step2Options.appendChild(btn)
  })
  const freiInput = step2.querySelector('.wenn-dann-freitext-input')
  freiInput.addEventListener('change', () => {
    const v = freiInput.value.trim()
    if (!v) return
    selectedSituation = v.startsWith('Wenn ') ? v : `Wenn ${v}`
    advanceToStep3()
  })

  function advanceToStep3() {
    step2.hidden = true
    step3.hidden = false
    step3.querySelector('.wenn-dann-sentence').innerHTML = `
      <span class="wenn-dann-sentence-part">${escape(selectedSituation)},</span>
      <span class="wenn-dann-sentence-part">dann <strong>${escape(selectedBoost)}</strong>.</span>
    `
  }

  step3.querySelector('.wenn-dann-save').addEventListener('click', async () => {
    await saveCourseData('wennDannPlan', {
      situation: selectedSituation,
      boost: selectedBoost,
      createdAt: new Date().toISOString(),
    })
    history.back()
  })
}

function escape(s) {
  return String(s || '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}
