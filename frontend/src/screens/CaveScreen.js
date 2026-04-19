// screens/CaveScreen.js
// Innerer sicherer Ort: 3 Tabs (Hintergründe / Elemente / Athmo) mit progressivem Freischalten.
// Nach dem Speichern: zurück zur aufrufenden Route (Novel-Dialog).

import { getCaveAssets } from '../api.js'
import { getCave, saveCave } from '../store.js'

const DEMO_ASSETS = {
  background: [
    { key: 'forest',   label: 'Wald',          color: '#2D5016' },
    { key: 'beach',    label: 'Strand',        color: '#0EA5E9' },
    { key: 'mountain', label: 'Berge',         color: '#6B7280' },
    { key: 'space',    label: 'Weltraum',      color: '#1E1B4B' },
    { key: 'meadow',   label: 'Wiese',         color: '#84CC16' },
    { key: 'cave',     label: 'Höhle',         color: '#44403C' },
  ],
  sticker: [
    { key: 'candle',  emoji: '🕯️', label: 'Kerze' },
    { key: 'plant',   emoji: '🪴', label: 'Pflanze' },
    { key: 'cat',     emoji: '🐱', label: 'Katze' },
    { key: 'dog',     emoji: '🐶', label: 'Hund' },
    { key: 'star',    emoji: '⭐', label: 'Stern' },
    { key: 'moon',    emoji: '🌙', label: 'Mond' },
    { key: 'book',    emoji: '📖', label: 'Buch' },
    { key: 'blanket', emoji: '🧶', label: 'Decke' },
    { key: 'cloud',   emoji: '☁️', label: 'Wolke' },
    { key: 'tea',     emoji: '🍵', label: 'Tee' },
  ],
  sound: [
    { key: 'silence', label: 'Stille' },
    { key: 'rain',    label: 'Regen' },
    { key: 'fire',    label: 'Kaminfeuer' },
    { key: 'ocean',   label: 'Meeresrauschen' },
    { key: 'birds',   label: 'Vogelgezwitscher' },
    { key: 'wind',    label: 'Windrauschen' },
  ],
}

const TABS = [
  { key: 'background', label: 'Hintergründe' },
  { key: 'sticker',    label: 'Elemente' },
  { key: 'sound',      label: 'Athmo' },
]

export function CaveScreen() {
  const el = document.createElement('div')
  el.className = 'screen cave-screen'

  el.innerHTML = `
    <div class="topbar">
      <button class="btn-menu cave-back" type="button" aria-label="Zurück">&#8592;</button>
      <h1 class="cave-heading">Dein sicherer Ort</h1>
      <div style="width:44px"></div>
    </div>
    <div class="cave-stage">
      <div class="cave-canvas"></div>
    </div>
    <nav class="cave-tabs" role="tablist">
      ${TABS.map((t, i) => `
        <button class="cave-tab" role="tab" data-tab="${t.key}" ${i > 0 ? 'disabled' : ''}>${t.label}</button>
      `).join('')}
    </nav>
    <div class="cave-panel"></div>
    <div class="cave-footer">
      <button class="btn-primary cave-save" type="button">Speichern &amp; zurück</button>
    </div>
  `

  const canvasEl = el.querySelector('.cave-canvas')
  const tabsEl   = el.querySelector('.cave-tabs')
  const panelEl  = el.querySelector('.cave-panel')

  el.querySelector('.cave-back').addEventListener('click', () => history.back())

  let assets = DEMO_ASSETS
  let selectedBg = null
  let selectedStickers = []
  let selectedSound = null
  let activeTab = 'background'
  let unlocked = { background: true, sticker: false, sound: false }

  async function init() {
    const saved = await getCave()
    selectedBg = saved.backgroundKey
    selectedStickers = saved.stickerKeys || []
    selectedSound = saved.soundKey

    // Freischalt-Status aus Spielstand rekonstruieren
    if (selectedBg)                    unlocked.sticker = true
    if (selectedStickers.length > 0)   unlocked.sound = true

    try {
      const strapi = await getCaveAssets()
      if (strapi && strapi.length) {
        assets = groupAssets(strapi)
      }
    } catch (e) {
      console.warn('Strapi nicht erreichbar, nutze Demo-Cave-Assets:', e.message)
    }

    renderTabs()
    renderPanel()
    renderCanvas()
  }

  function renderTabs() {
    tabsEl.querySelectorAll('.cave-tab').forEach(btn => {
      const tab = btn.dataset.tab
      btn.disabled = !unlocked[tab]
      btn.classList.toggle('cave-tab--active', tab === activeTab)
      btn.onclick = () => {
        if (!unlocked[tab]) return
        activeTab = tab
        renderTabs()
        renderPanel()
      }
    })
  }

  function renderPanel() {
    panelEl.innerHTML = ''
    const list = assets[activeTab] || []

    list.forEach(item => {
      const btn = document.createElement('button')
      btn.className = 'cave-item'

      const isSelected =
        (activeTab === 'background' && selectedBg === item.key) ||
        (activeTab === 'sticker'    && selectedStickers.includes(item.key)) ||
        (activeTab === 'sound'      && selectedSound === item.key)
      if (isSelected) btn.classList.add('cave-item--selected')

      if (activeTab === 'background') {
        btn.innerHTML = `<span class="cave-item-swatch" style="background:${item.color || 'var(--border)'}"></span><span>${item.label}</span>`
      } else if (activeTab === 'sticker') {
        btn.innerHTML = `<span class="cave-item-emoji">${item.emoji || '·'}</span><span>${item.label}</span>`
      } else {
        btn.innerHTML = `<span>${item.label}</span>`
      }

      btn.addEventListener('click', () => onSelect(item))
      panelEl.appendChild(btn)
    })
  }

  function onSelect(item) {
    if (activeTab === 'background') {
      selectedBg = item.key
      if (!unlocked.sticker) {
        unlocked.sticker = true
        activeTab = 'sticker'
        renderTabs()
        renderPanel()
        flashHint('Super. Jetzt kannst du Elemente platzieren.')
      } else {
        renderPanel()
      }
    } else if (activeTab === 'sticker') {
      if (selectedStickers.includes(item.key)) {
        selectedStickers = selectedStickers.filter(k => k !== item.key)
      } else {
        selectedStickers = [...selectedStickers, item.key]
      }
      if (!unlocked.sound && selectedStickers.length > 0) {
        unlocked.sound = true
        renderTabs()
        flashHint('Du kannst jetzt auch eine Athmo wählen.')
      }
      renderPanel()
    } else if (activeTab === 'sound') {
      selectedSound = selectedSound === item.key ? null : item.key
      renderPanel()
    }
    renderCanvas()
  }

  function renderCanvas() {
    const bg = (assets.background || []).find(b => b.key === selectedBg)
    canvasEl.style.background = bg ? (bg.color || 'var(--accent-light)') : 'var(--accent-light)'
    canvasEl.innerHTML = ''

    selectedStickers.forEach((key, i) => {
      const s = (assets.sticker || []).find(st => st.key === key)
      if (!s) return
      const span = document.createElement('span')
      span.className = 'cave-canvas-sticker'
      span.textContent = s.emoji || '·'
      span.style.left = `${10 + (i * 17) % 75}%`
      span.style.top  = `${20 + (i * 31) % 60}%`
      canvasEl.appendChild(span)
    })

    if (!selectedBg && !selectedStickers.length) {
      const hint = document.createElement('span')
      hint.className = 'cave-canvas-hint'
      hint.textContent = 'Wähle einen Hintergrund, um zu starten.'
      canvasEl.appendChild(hint)
    }
  }

  function flashHint(text) {
    const hint = document.createElement('div')
    hint.className = 'cave-flash'
    hint.textContent = text
    el.appendChild(hint)
    setTimeout(() => hint.remove(), 2600)
  }

  el.querySelector('.cave-save').addEventListener('click', async () => {
    await saveCave({ backgroundKey: selectedBg, stickerKeys: selectedStickers, soundKey: selectedSound })
    history.back()
  })

  init()
  return el
}

// Strapi cave-assets: array of { type, key, label, file, ... } → nach Typ gruppieren
function groupAssets(list) {
  const grouped = { background: [], sticker: [], sound: [] }
  list.forEach(a => {
    if (grouped[a.type]) grouped[a.type].push(a)
  })
  return grouped
}
