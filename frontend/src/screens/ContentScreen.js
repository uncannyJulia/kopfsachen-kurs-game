// screens/ContentScreen.js
// Generischer Content-Screen: Figur klein, Haupt-Area baut Blöcke auf.
// Dispatcht je nach Slug zu einer spezifischen View.
//
// Slugs:
//   energie-reflexion  — Energie-Fresser/Geber-Swipe
//   wenn-dann-plan     — Wenn-Dann-Plan-Zusammenbau

import { getEnergieAktivitaeten, getWennDannSituations } from '../api.js'
import { saveCourseData, getCourseData } from '../store.js'
import { t } from '../data/ui-texts.js'
import { EvuCorner } from '../components/EvuCorner.js'

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

  // Bei Auswahl-/Listen-Screens kommt Evu klein oben-rechts dazu (Wireframe-Pattern).
  // Mit `evu-corner--fly-in` läuft beim Mount eine Transition center → corner.
  const screensWithEvu = new Set(['wuensche-auswahl', 'wenn-dann-plan', 'energie-reflexion'])
  if (screensWithEvu.has(slug)) {
    const corner = EvuCorner()
    corner.classList.add('evu-corner--fly-in')
    el.appendChild(corner)
    // Trigger Transition: nach einem Frame Klasse entfernen, damit CSS animiert
    requestAnimationFrame(() => {
      requestAnimationFrame(() => corner.classList.remove('evu-corner--fly-in'))
    })
  }

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
    <p class="wuensche-intro">${escape(t('wuensche.intro', 'Wähle alles aus, was zutrifft.'))}</p>
    <ul class="wuensche-list"></ul>
    <div class="wuensche-freetext">
      <label for="wuensche-freitext-input">${escape(t('wuensche.freitext.label', 'Etwas anderes:'))}</label>
      <input id="wuensche-freitext-input" type="text" class="wuensche-freetext-input" placeholder="${escape(t('wuensche.freitext.placeholder', 'Schreib deinen Wunsch …'))}" value="${escape(saved.freetext || '')}">
    </div>
    <button class="btn-primary wuensche-save" type="button">${escape(t('wuensche.continue', 'Weiter'))}</button>
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
  let selectedRating = null
  const SWIPE_THRESHOLD = 100  // Pixel die geswiped werden müssen

  container.innerHTML = `
    <div class="energie-intro">
      <p>${escape(t('energie.intro.1', 'Denke an deine letzte Woche.'))}</p>
      <p>${t('energie.intro.2', 'Wähle die Stärke (1–5), dann wische die Karte <strong>nach links</strong>, wenn es Energie gekostet hat — <strong>nach rechts</strong>, wenn es Energie gegeben hat.')}</p>
    </div>
    <div class="energie-stage">
      <div class="energie-tray energie-tray--left" aria-label="Energie-Fresser">
        <span class="energie-tray-icon">✕</span>
        <div class="energie-tray-dots"></div>
      </div>
      <div class="energie-card-wrap">
        <div class="energie-card" role="button" aria-label="Karte zum Wischen">
          <div class="energie-card-label">${escape(t('energie.card.label', 'Situation'))}</div>
          <div class="energie-card-text"></div>
          <div class="energie-card-badge"></div>
        </div>
      </div>
      <div class="energie-tray energie-tray--right" aria-label="Energie-Geber">
        <span class="energie-tray-icon">♥</span>
        <div class="energie-tray-dots"></div>
      </div>
    </div>
    <div class="energie-rating-area">
      <p class="energie-rating-prompt">${escape(t('energie.rating.prompt', 'Wie stark?'))}</p>
      <div class="energie-scale">
        ${[1, 2, 3, 4, 5].map(n => `<button class="energie-scale-btn" data-value="${n}" type="button">${n}</button>`).join('')}
      </div>
    </div>
    <div class="energie-bottom">
      <button class="energie-skip-btn" type="button">${escape(t('energie.skip.button', 'ist nicht passiert'))}</button>
    </div>
    <div class="energie-progress"></div>
  `

  const cardEl     = container.querySelector('.energie-card')
  const cardTextEl = container.querySelector('.energie-card-text')
  const cardBadge  = container.querySelector('.energie-card-badge')
  const trayLeftDots  = container.querySelector('.energie-tray--left  .energie-tray-dots')
  const trayRightDots = container.querySelector('.energie-tray--right .energie-tray-dots')
  const ratingArea = container.querySelector('.energie-rating-area')
  const skipBtn    = container.querySelector('.energie-skip-btn')
  const progressEl = container.querySelector('.energie-progress')

  function clearRatingSelection() {
    selectedRating = null
    ratingArea.querySelectorAll('.energie-scale-btn--selected').forEach(b =>
      b.classList.remove('energie-scale-btn--selected')
    )
  }

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
    skipBtn.hidden = false
    clearRatingSelection()

    // Drift-Animation für jede neue Bubble neu starten
    cardEl.style.animation = 'none'
    void cardEl.offsetWidth
    cardEl.style.animation = ''

    enableSwipe()
  }

  // Rating: Click toggelt Auswahl. Klick auf gleiche Zahl entfernt Markierung,
  // Klick auf andere Zahl wechselt die Auswahl.
  ratingArea.querySelectorAll('.energie-scale-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const value = parseInt(btn.dataset.value)
      if (selectedRating === value) {
        clearRatingSelection()
      } else {
        clearRatingSelection()
        btn.classList.add('energie-scale-btn--selected')
        selectedRating = value
      }
    })
  })

  // ── Swipe-Logik ──────────────────────────────────────────
  let dragging = false
  let startX = 0, currentX = 0
  let swipeEnabled = false

  function enableSwipe() {
    if (swipeEnabled) return
    swipeEnabled = true
    cardEl.addEventListener('pointerdown', onPointerDown, { passive: true })
  }
  function disableSwipe() {
    if (!swipeEnabled) return
    swipeEnabled = false
    cardEl.removeEventListener('pointerdown', onPointerDown)
  }
  function onPointerDown(e) {
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
      commitAndAdvance(tendency)
    } else {
      // Nicht weit genug → zurück
      cardEl.style.transition = 'transform var(--transition)'
      cardEl.style.transform = ''
      cardBadge.textContent = ''
      cardBadge.className = 'energie-card-badge'
    }
  }

  function commitAndAdvance(tendency) {
    disableSwipe()
    cardEl.style.transition = 'transform 280ms ease, opacity 280ms ease'
    const offset = tendency === 'fresser' ? -window.innerWidth : window.innerWidth
    cardEl.style.transform = `translateX(${offset}px) rotate(${tendency === 'fresser' ? -25 : 25}deg)`
    cardEl.style.opacity = '0.4'

    const current = items[idx]
    responses[current.text] = { tendency, rating: selectedRating }
    addDot(tendency)

    setTimeout(() => {
      idx++
      renderCurrent()
    }, 280)
  }

  // Skip-Button
  skipBtn.addEventListener('click', () => {
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

  function renderDone() {
    const fresser = Object.entries(responses)
      .filter(([_, r]) => r.tendency === 'fresser')
      .sort((a, b) => (b[1].rating || 0) - (a[1].rating || 0))
      .map(([text, r]) => ({ text, rating: r.rating }))
    const geber = Object.entries(responses)
      .filter(([_, r]) => r.tendency === 'geber')
      .sort((a, b) => (b[1].rating || 0) - (a[1].rating || 0))
      .map(([text, r]) => ({ text, rating: r.rating }))

    // Listen-State: User darf später eigene Einträge ergänzen (siehe Wireframe energie-auswertung-1.png)
    // editFor: null | 'fresser' | 'geber'  → welche Liste gerade bearbeitet wird
    // editStep: 'ask' | 'input'            → Sub-Schritt im Bearbeiten-Flow
    let editFor = null
    let editStep = 'ask'

    function persist() {
      const merged = {}
      for (const it of fresser) merged[it.text] = { tendency: 'fresser', rating: it.rating }
      for (const it of geber) merged[it.text] = { tendency: 'geber', rating: it.rating }
      // Skip-Items übernehmen wir aus den Original-Responses
      for (const [txt, r] of Object.entries(responses)) {
        if (r.tendency === 'skip' && !(txt in merged)) merged[txt] = r
      }
      saveCourseData('energieReflexion', { responses: merged, completedAt: new Date().toISOString() })
        .catch(err => console.warn('Energie-Reflexion konnte nicht gespeichert werden:', err))
    }

    function renderListItems(items) {
      if (!items.length) {
        return `<p class="energie-empty">${escape(t('energie.done.empty', '— keine —'))}</p>`
      }
      return `<ul class="energie-done-list">${items.map(it => `
        <li>
          <span class="energie-done-text">${escape(it.text)}</span>
          ${it.rating != null ? `<span class="energie-rating">${it.rating}/5</span>` : ''}
        </li>
      `).join('')}</ul>`
    }

    function render() {
      const editPanel = editFor ? renderEditPanel() : ''
      container.innerHTML = `
        <div class="energie-done">
          <h2 class="energie-done-title">${escape(t('energie.done.title', 'Erfolg Auswertung'))}</h2>
          <p class="energie-done-intro">${escape(t('energie.done.intro', 'Hier findest du die Übersicht über deine Energie-Fresser und -Geber der letzten Woche.'))}</p>

          <div class="energie-done-group">
            <h3 class="energie-done-subtitle">${escape(t('energie.done.fresser', 'Deine Top-Energie-Fresser'))}</h3>
            ${renderListItems(fresser)}
            ${editFor === 'fresser' ? editPanel : `
              <button class="energie-edit-btn" type="button" data-target="fresser">
                ${escape(t('energie.done.adjust', 'Liste nochmal anpassen'))}
              </button>
            `}
          </div>

          <div class="energie-done-group">
            <h3 class="energie-done-subtitle">${escape(t('energie.done.geber', 'Deine Top-Energie-Geber'))}</h3>
            ${renderListItems(geber)}
            ${editFor === 'geber' ? editPanel : `
              <button class="energie-edit-btn" type="button" data-target="geber">
                ${escape(t('energie.done.adjust', 'Liste nochmal anpassen'))}
              </button>
            `}
          </div>

          <p class="energie-hint">${escape(t('energie.done.hint', 'Gerade vor und nach Aktivitäten, die dich viel Energie kosten, ist es hilfreich, bewusst Zeiten für Erholung einzuplanen.'))}</p>
          <button class="btn-primary energie-continue" type="button">${escape(t('energie.done.continue', 'Weiter'))}</button>
        </div>
      `
      bindHandlers()
      container.scrollTop = 0
    }

    function renderEditPanel() {
      const isFresser = editFor === 'fresser'
      const askText = isFresser
        ? t('energie.done.askFresser', 'Blicke noch einmal auf deine letzte Woche. Fehlt hier ein wichtiger Energie-Fresser, der dich Kraft gekostet hat?')
        : t('energie.done.askGeber',   'Blicke noch einmal auf deine letzte Woche. Fehlt hier ein wichtiger Energie-Geber, der dir Kraft gegeben hat?')
      const inputLabel = isFresser
        ? t('energie.done.inputFresser', 'zusätzlicher Energie-Fresser')
        : t('energie.done.inputGeber',   'zusätzlicher Energie-Geber')
      const ratingPrompt = isFresser
        ? t('energie.done.ratingFresser', 'Wie viel Energie hat es gekostet?')
        : t('energie.done.ratingGeber',   'Wie viel Energie hat es gegeben?')

      if (editStep === 'ask') {
        return `
          <div class="energie-edit-panel">
            <p class="energie-edit-prompt">${escape(askText)}</p>
            <div class="energie-edit-actions">
              <button class="energie-edit-no" type="button">${escape(t('energie.done.no', 'Nein, ist gut'))}</button>
              <button class="energie-edit-yes" type="button">${escape(t('energie.done.yes', 'Ja, ergänzen'))}</button>
            </div>
          </div>
        `
      }
      // input step
      return `
        <div class="energie-edit-panel">
          <label class="energie-edit-input-label" for="energie-extra-input">${escape(inputLabel)}</label>
          <input id="energie-extra-input" type="text" class="energie-edit-input" placeholder="${escape(t('energie.done.inputPlaceholder', 'z.B. lange Bildschirmzeit am Abend'))}" />
          <p class="energie-edit-rating-prompt">${escape(ratingPrompt)}</p>
          <div class="energie-edit-rating">
            ${[1, 2, 3, 4, 5].map(n => `<button class="energie-edit-rating-btn" data-value="${n}" type="button">${n}</button>`).join('')}
          </div>
          <div class="energie-edit-actions">
            <button class="energie-edit-cancel" type="button">${escape(t('energie.done.cancel', 'Abbrechen'))}</button>
            <button class="energie-edit-save btn-primary" type="button" disabled>${escape(t('energie.done.save', 'Speichern'))}</button>
          </div>
        </div>
      `
    }

    function bindHandlers() {
      container.querySelector('.energie-continue').addEventListener('click', () => history.back())

      container.querySelectorAll('.energie-edit-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          editFor = btn.dataset.target
          editStep = 'ask'
          render()
        })
      })

      const noBtn  = container.querySelector('.energie-edit-no')
      const yesBtn = container.querySelector('.energie-edit-yes')
      if (noBtn)  noBtn.addEventListener('click',  () => { editFor = null; render() })
      if (yesBtn) yesBtn.addEventListener('click', () => { editStep = 'input'; render() })

      const cancelBtn = container.querySelector('.energie-edit-cancel')
      if (cancelBtn) cancelBtn.addEventListener('click', () => { editFor = null; render() })

      const input    = container.querySelector('.energie-edit-input')
      const saveBtn  = container.querySelector('.energie-edit-save')
      const ratingBtns = container.querySelectorAll('.energie-edit-rating-btn')
      let extraRating = null
      function refreshSaveState() {
        const ready = !!(input?.value.trim()) && extraRating != null
        if (saveBtn) saveBtn.disabled = !ready
      }
      ratingBtns.forEach(b => {
        b.addEventListener('click', () => {
          ratingBtns.forEach(x => x.classList.remove('energie-edit-rating-btn--selected'))
          b.classList.add('energie-edit-rating-btn--selected')
          extraRating = parseInt(b.dataset.value)
          refreshSaveState()
        })
      })
      input?.addEventListener('input', refreshSaveState)
      saveBtn?.addEventListener('click', () => {
        const text = input.value.trim()
        if (!text || extraRating == null) return
        const newItem = { text, rating: extraRating }
        if (editFor === 'fresser') {
          fresser.push(newItem)
          fresser.sort((a, b) => (b.rating || 0) - (a.rating || 0))
        } else {
          geber.push(newItem)
          geber.sort((a, b) => (b.rating || 0) - (a.rating || 0))
        }
        editFor = null
        persist()
        render()
      })
    }

    render()
    persist()
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
  const selectedSituations = new Set()  // Multi-Select

  container.innerHTML = `
    <section class="wenn-dann-section">
      <h2 class="wenn-dann-title">${escape(t('wennDann.step1.title', 'Schritt 1: Dein Energie-Boost'))}</h2>
      <p class="wenn-dann-desc">${escape(t('wennDann.step1.desc', 'Wähle eine Aktivität, die du in der nächsten Woche bewusst einbauen möchtest.'))}</p>
      <div class="wenn-dann-options wenn-dann-boost-options"></div>
    </section>
    <section class="wenn-dann-section">
      <h2 class="wenn-dann-title">${escape(t('wennDann.step2.title', 'Schritt 2: Wann?'))}</h2>
      <p class="wenn-dann-desc">${escape(t('wennDann.step2.desc', 'Wann wäre dein Energie-Boost besonders hilfreich? Mehrere Antworten möglich.'))}</p>
      <div class="wenn-dann-options wenn-dann-situation-options"></div>
      <div class="wenn-dann-freitext">
        <label for="wenn-dann-frei">${escape(t('wennDann.step2.freitext', 'Oder eigene Situation:'))}</label>
        <input id="wenn-dann-frei" type="text" class="wenn-dann-freitext-input" placeholder="${escape(t('wennDann.step2.freitextPlaceholder', 'z.B. Wenn ich …'))}">
      </div>
    </section>
    <section class="wenn-dann-section wenn-dann-preview" hidden>
      <h2 class="wenn-dann-title">${escape(t('wennDann.step3.title', 'Dein Plan'))}</h2>
      <div class="wenn-dann-sentences"></div>
    </section>
    <button class="btn-primary wenn-dann-save" type="button" disabled>${escape(t('wennDann.step3.save', 'Plan merken'))}</button>
  `

  const boostOptionsEl    = container.querySelector('.wenn-dann-boost-options')
  const situationOptionsEl = container.querySelector('.wenn-dann-situation-options')
  const freiInput         = container.querySelector('.wenn-dann-freitext-input')
  const previewEl         = container.querySelector('.wenn-dann-preview')
  const sentencesEl       = container.querySelector('.wenn-dann-sentences')
  const saveBtn           = container.querySelector('.wenn-dann-save')

  // Boost (Single-Select mit Highlight)
  boostOptions.forEach(opt => {
    const btn = document.createElement('button')
    btn.className = 'wenn-dann-option'
    btn.type = 'button'
    btn.textContent = opt
    btn.addEventListener('click', () => {
      boostOptionsEl.querySelectorAll('.wenn-dann-option--selected').forEach(b =>
        b.classList.remove('wenn-dann-option--selected')
      )
      if (selectedBoost === opt) {
        selectedBoost = null
      } else {
        btn.classList.add('wenn-dann-option--selected')
        selectedBoost = opt
      }
      updatePreview()
    })
    boostOptionsEl.appendChild(btn)
  })

  // Situations (Multi-Select mit Highlight)
  situations.forEach(opt => {
    const btn = document.createElement('button')
    btn.className = 'wenn-dann-option'
    btn.type = 'button'
    btn.textContent = opt
    btn.addEventListener('click', () => {
      if (selectedSituations.has(opt)) {
        selectedSituations.delete(opt)
        btn.classList.remove('wenn-dann-option--selected')
      } else {
        selectedSituations.add(opt)
        btn.classList.add('wenn-dann-option--selected')
      }
      updatePreview()
    })
    situationOptionsEl.appendChild(btn)
  })
  freiInput.addEventListener('input', updatePreview)

  // Sammelt alle gewählten Situationen + Freitext zu einer Liste
  function collectSituations() {
    const sits = Array.from(selectedSituations)
    const frei = freiInput.value.trim()
    if (frei) sits.push(frei.startsWith('Wenn ') ? frei : `Wenn ${frei}`)
    return sits
  }

  // Live-Vorschau: zeigt die zusammengesetzten Sätze sobald Boost UND mind. 1 Situation gewählt
  function updatePreview() {
    const sits = collectSituations()
    const ready = !!selectedBoost && sits.length > 0
    saveBtn.disabled = !ready
    if (!ready) {
      previewEl.hidden = true
      sentencesEl.innerHTML = ''
      return
    }
    previewEl.hidden = false
    sentencesEl.innerHTML = sits.map(s => `
      <div class="wenn-dann-sentence">
        <span class="wenn-dann-sentence-part">${escape(s)},</span>
        <span class="wenn-dann-sentence-part">dann <strong>${escape(selectedBoost)}</strong>.</span>
      </div>
    `).join('')
  }

  saveBtn.addEventListener('click', async () => {
    const situations = collectSituations()
    if (!selectedBoost || !situations.length) return
    await saveCourseData('wennDannPlan', {
      boost: selectedBoost,
      situations,
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
