// screens/CaveScreen.js
// Innerer sicherer Ort: 3 Tabs (Hintergründe / Elemente / Athmo) mit progressivem Freischalten.
// Nach dem Speichern: zurück zur aufrufenden Route (Novel-Dialog).

import { getCaveAssets } from '../api.js'
import { getCave, saveCave } from '../store.js'

const DEMO_ASSETS = {
  background: [
    { key: 'wald',     label: 'Wald',     color: '#2D5016', image: '/cave/bg/wald.webp' },
    { key: 'berge',    label: 'Berge',    color: '#6B7280', image: '/cave/bg/berge.webp' },
    { key: 'weltraum', label: 'Weltraum', color: '#1E1B4B', image: '/cave/bg/weltraum.webp' },
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
  { key: 'background', label: 'Orte' },
  { key: 'sticker',    label: 'Sticker' },
  { key: 'sound',      label: 'Atmo' },
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
  let placedStickers = []   // [{ id, key, x, y }]
  let selectedSound = null
  let activeTab = 'background'
  let unlocked = { background: true, sticker: false, sound: false }
  let nextStickerId = 1

  async function init() {
    const saved = await getCave()
    selectedBg = saved.backgroundKey
    selectedSound = saved.soundKey

    // Migration: alte stickerKeys → neue placedStickers mit Default-Position
    if (Array.isArray(saved.stickers) && saved.stickers.length) {
      placedStickers = saved.stickers.map(s => ({ ...s }))
    } else if (Array.isArray(saved.stickerKeys) && saved.stickerKeys.length) {
      placedStickers = saved.stickerKeys.map((key, i) => ({
        id: ++nextStickerId,
        key,
        x: 25 + (i * 15) % 50,
        y: 30 + (i * 20) % 40,
      }))
    }
    nextStickerId = Math.max(nextStickerId, ...placedStickers.map(s => s.id || 0)) + 1

    // Freischalt-Status aus Spielstand rekonstruieren
    if (selectedBg)                  unlocked.sticker = true
    if (placedStickers.length > 0)   unlocked.sound = true

    try {
      const strapi = await getCaveAssets()
      if (strapi && strapi.length) {
        assets = groupAssets(strapi)
      }
    } catch (e) {
      console.warn('Strapi nicht erreichbar, nutze Demo-Cave-Assets:', e.message)
    }

    // BG-Bilder im Hintergrund vorladen — Tab-Wechsel zur ersten Auswahl ist dann instant.
    ;(assets.background || []).forEach(b => { if (b.image) new Image().src = b.image })

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
        (activeTab === 'sound'      && selectedSound === item.key)
      if (isSelected) btn.classList.add('cave-item--selected')

      if (activeTab === 'background') {
        const swatchStyle = item.image
          ? `background:url('${item.image}') center/cover, ${item.color || 'var(--border)'}`
          : `background:${item.color || 'var(--border)'}`
        btn.innerHTML = `<span class="cave-item-swatch" style="${swatchStyle}"></span><span>${item.label}</span>`
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
        flashHint('Super. Jetzt kannst du Sticker platzieren.')
      } else {
        renderPanel()
      }
    } else if (activeTab === 'sticker') {
      // Neuen Sticker zentral hinzufügen — User kann ihn dann verschieben.
      placedStickers = [
        ...placedStickers,
        { id: nextStickerId++, key: item.key, x: 50, y: 50 },
      ]
      if (!unlocked.sound && placedStickers.length > 0) {
        unlocked.sound = true
        renderTabs()
        flashHint('Du kannst jetzt auch eine Atmo wählen. Tippe einen Sticker zum Entfernen, ziehe ihn zum Verschieben.')
      }
    } else if (activeTab === 'sound') {
      selectedSound = selectedSound === item.key ? null : item.key
      renderPanel()
    }
    renderCanvas()
  }

  function renderCanvas() {
    const bg = (assets.background || []).find(b => b.key === selectedBg)
    if (bg && bg.image) {
      // Illustriertes BG: Bild als Cover + Farbe als Fade-In/Fallback während des Bild-Loads
      canvasEl.style.background = `url('${bg.image}') center/cover, ${bg.color || 'var(--accent-light)'}`
    } else {
      canvasEl.style.background = bg ? (bg.color || 'var(--accent-light)') : 'var(--accent-light)'
    }
    canvasEl.innerHTML = ''

    placedStickers.forEach(p => {
      const s = (assets.sticker || []).find(st => st.key === p.key)
      if (!s) return
      const node = document.createElement('span')
      node.className = 'cave-canvas-sticker'
      node.textContent = s.emoji || '·'
      node.style.left = `${p.x}%`
      node.style.top  = `${p.y}%`
      node.dataset.stickerId = String(p.id)
      attachStickerInteractions(node, p)
      canvasEl.appendChild(node)
    })

    if (!selectedBg && !placedStickers.length) {
      const hint = document.createElement('span')
      hint.className = 'cave-canvas-hint'
      hint.textContent = 'Wähle einen Hintergrund, um zu starten.'
      canvasEl.appendChild(hint)
    }
  }

  // Drag (verschieben) + Tap (entfernen) für Sticker auf dem Canvas
  function attachStickerInteractions(node, sticker) {
    let startX = 0, startY = 0
    let origX = 0, origY = 0
    let dragging = false
    let moved = false

    node.addEventListener('pointerdown', (e) => {
      e.preventDefault()
      dragging = true
      moved = false
      startX = e.clientX
      startY = e.clientY
      origX = sticker.x
      origY = sticker.y
      node.setPointerCapture(e.pointerId)
      node.classList.add('cave-canvas-sticker--dragging')
    })

    node.addEventListener('pointermove', (e) => {
      if (!dragging) return
      const dx = e.clientX - startX
      const dy = e.clientY - startY
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) moved = true
      const rect = canvasEl.getBoundingClientRect()
      // Pixel → Prozent
      const newX = origX + (dx / rect.width)  * 100
      const newY = origY + (dy / rect.height) * 100
      sticker.x = Math.max(2, Math.min(98, newX))
      sticker.y = Math.max(2, Math.min(98, newY))
      node.style.left = `${sticker.x}%`
      node.style.top  = `${sticker.y}%`
    })

    function endDrag() {
      if (!dragging) return
      dragging = false
      node.classList.remove('cave-canvas-sticker--dragging')
      // Wenn nicht bewegt → als Tap interpretieren = Sticker entfernen
      if (!moved) {
        placedStickers = placedStickers.filter(p => p.id !== sticker.id)
        renderCanvas()
      }
    }

    node.addEventListener('pointerup', endDrag)
    node.addEventListener('pointercancel', endDrag)
  }

  function flashHint(text) {
    const hint = document.createElement('div')
    hint.className = 'cave-flash'
    hint.textContent = text
    el.appendChild(hint)
    setTimeout(() => hint.remove(), 2600)
  }

  el.querySelector('.cave-save').addEventListener('click', async () => {
    await saveCave({
      backgroundKey: selectedBg,
      stickers: placedStickers,
      stickerKeys: placedStickers.map(s => s.key),  // legacy compat falls jemand stickerKeys liest
      soundKey: selectedSound,
    })
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
