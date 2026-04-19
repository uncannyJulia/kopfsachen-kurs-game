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
  } else {
    headingEl.textContent = 'Content'
    bodyEl.innerHTML = `<p class="content-placeholder">Kein Content für Slug '${escape(slug)}' gefunden.</p>`
  }

  return el
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
  let stage = 'sort' // sort → rate → done
  let pendingTendency = null

  container.innerHTML = `
    <div class="energie-intro">
      <p>Denke an deine letzte Woche.</p>
      <p><strong>Energie-Fresser?</strong> Karte nach links.<br><strong>Energie-Geber?</strong> Nach rechts.<br><strong>Nicht erlebt?</strong> Mitte.</p>
    </div>
    <div class="energie-card"></div>
    <div class="energie-actions"></div>
    <div class="energie-progress"></div>
  `
  const cardEl    = container.querySelector('.energie-card')
  const actionsEl = container.querySelector('.energie-actions')
  const progressEl = container.querySelector('.energie-progress')

  function renderCurrent() {
    progressEl.textContent = `${Math.min(idx + 1, items.length)} / ${items.length}`

    if (idx >= items.length) {
      stage = 'done'
      return renderDone()
    }

    const current = items[idx]

    if (stage === 'sort') {
      cardEl.innerHTML = `
        <div class="energie-card-label">Situation</div>
        <div class="energie-card-text">${escape(current.text)}</div>
      `
      actionsEl.innerHTML = `
        <button class="btn-secondary energie-fresser" type="button">Energie-Fresser ←</button>
        <button class="btn-secondary energie-skip"    type="button">Nicht erlebt</button>
        <button class="btn-secondary energie-geber"   type="button">→ Energie-Geber</button>
      `
      actionsEl.querySelector('.energie-fresser').addEventListener('click', () => chooseTendency('fresser'))
      actionsEl.querySelector('.energie-geber').addEventListener('click',   () => chooseTendency('geber'))
      actionsEl.querySelector('.energie-skip').addEventListener('click',    () => skipCurrent())
    } else if (stage === 'rate') {
      const prompt = pendingTendency === 'fresser'
        ? 'Wie viel Energie hat dich das gekostet?'
        : 'Wie viel Energie hat dir das gegeben?'
      cardEl.innerHTML = `
        <div class="energie-card-label">${prompt}</div>
        <div class="energie-card-text">${escape(current.text)}</div>
      `
      actionsEl.innerHTML = `
        <div class="energie-scale">
          ${[1, 2, 3, 4, 5].map(n =>
            `<button class="energie-scale-btn" data-value="${n}" type="button">${n}</button>`
          ).join('')}
        </div>
      `
      actionsEl.querySelectorAll('.energie-scale-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const rating = parseInt(btn.dataset.value)
          responses[current.text] = { tendency: pendingTendency, rating }
          idx++
          stage = 'sort'
          pendingTendency = null
          renderCurrent()
        })
      })
    }
  }

  function chooseTendency(tendency) {
    pendingTendency = tendency
    stage = 'rate'
    renderCurrent()
  }

  function skipCurrent() {
    responses[items[idx].text] = { tendency: 'skip' }
    idx++
    renderCurrent()
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
