// Dialog-Engine: Sprechblasen, Choices, Likert-Inline, Character-Wechsel, Spielstand.

import { getDialogScene } from '../api.js'
import { getProgress, saveProgress, saveQuestionnaire, getSettings, saveSettings, completeChapter } from '../store.js'
import { TopMenu } from '../components/TopMenu.js'
import { CharacterAvatar, hasAvatar } from '../components/CharacterAvatar.js'
import { ONBOARDING_NODES } from '../data/onboarding.js'
import { KAPITEL_1_NODES }   from '../data/kapitel-1.js'


const SPEAKER_CONFIG = {
  evu:      { label: 'Evu',      color: '#F59E0B' },
  toni:     { label: 'Toni',     color: 'var(--accent)' },
  neo:      { label: 'Neo',      color: '#4ADE80' },
  manu:     { label: 'Manu',     color: '#38BDF8' },
  psycholog:{ label: 'Psycholog*in', color: '#A855F7' },
  user:     { label: 'Du',       color: 'var(--text-muted)' },
  narrator: { label: '',         color: 'var(--text-muted)' },
}

// Slug → Fallback-Nodes (wenn Strapi nichts liefert)
const DEMO_NODES_BY_SLUG = {
  'onboarding':                ONBOARDING_NODES,
  'ein-moment-nur-fuer-dich':  KAPITEL_1_NODES,
}

// Layout-Typ je Speaker:
//   - monologue: Text oben, große Figur unten-mittig, kein Bubble-Rahmen (Evu, Mika)
//   - compact:   Figur klein oben-rechts, Content (Likert / Liste / Buttons) im Hauptbereich
//   - scene:     Sprechblase oben mit Tail, Figur in Mitte, Thought-Pill-Choices (Toni, Neo, Manu, Psycholog)
//   - narrator:  zentrierter kursiver Text, keine Figur
//   - user:      keine Figur, kein Bubble bei Choice-only
function getLayoutForSpeaker(speaker) {
  switch (speaker) {
    case 'evu':
    case 'mika':
      return 'monologue'
    case 'toni':
    case 'neo':
    case 'manu':
    case 'psycholog':
      return 'scene'
    case 'narrator':
      return 'narrator'
    case 'user':
    default:
      return 'user'
  }
}

// Wenn Evu/Mika eine Likert-Frage stellen ODER eine Liste präsentieren →
// compact (Figur klein oben-rechts, Inhalt mittig prominent).
function getLayoutForNode(node) {
  const base = getLayoutForSpeaker(node.speaker)
  if (base === 'monologue' && (node.likert || node.list)) return 'compact'
  return base
}

// ── Screen ───────────────────────────────────────────────────

export function NovelScreen(path) {
  const el = document.createElement('div')
  el.className = 'screen novel-screen'

  // Chapter-Slug aus Route extrahieren (z.B. /novel/kapitel-1)
  const slug = path?.replace('/novel/', '') || 'intro'

  // TopMenu oben; Progress initial 0, wird in goToNode aktualisiert.
  const topMenu = TopMenu({ progress: 0 })
  el.appendChild(topMenu)

  const main = document.createElement('div')
  main.className = 'novel-main'
  main.innerHTML = `
    <div class="novel-bg"></div>
    <div class="novel-content">
      <div class="novel-character"></div>
      <div class="novel-speaker-label"></div>
      <div class="novel-bubble-area">
        <div class="speech-bubble novel-bubble"></div>
        <svg class="novel-bubble-tail" viewBox="0 0 40 50" preserveAspectRatio="xMinYMid meet" aria-hidden="true">
          <!-- Speech-Tail Drop-Form: 2 saubere Quadratic-Curves vom oberen Bubble-Anschluss
               zur Spitze unten-rechts und zurück. Stroke/Fill via CSS (siehe main.css). -->
          <path d="M 6 0 Q 2 28 36 48 Q 26 22 18 0 Z"
                stroke-width="2.5"
                stroke-linejoin="round"
                stroke-linecap="round" />
        </svg>
      </div>
      <div class="novel-list" hidden></div>
      <div class="novel-likert" style="display:none"></div>
      <div class="novel-choices"></div>
      <div class="novel-input" style="display:none">
        <input type="text" class="novel-name-input" placeholder="Dein Name …" maxlength="30" autocomplete="off" />
        <button class="btn-primary novel-input-submit" type="button">OK</button>
      </div>
      <button class="novel-continue btn-primary" type="button">Weiter</button>
    </div>
    <div class="novel-loading">
      <p>Lade Dialog …</p>
    </div>
  `
  el.appendChild(main)

  const progressTrack = topMenu.querySelector('.top-menu-progress-fill')
  function setProgress(frac) {
    if (progressTrack) progressTrack.style.width = `${Math.max(0, Math.min(1, frac)) * 100}%`
  }

  const bubbleArea   = main.querySelector('.novel-bubble-area')
  const bubble       = el.querySelector('.novel-bubble')
  const bubbleTailSvg = main.querySelector('.novel-bubble-tail')
  const speakerLabel = el.querySelector('.novel-speaker-label')
  const characterEl  = el.querySelector('.novel-character')
  const choicesEl    = el.querySelector('.novel-choices')
  const likertEl     = el.querySelector('.novel-likert')
  const listEl       = el.querySelector('.novel-list')
  const bgEl         = el.querySelector('.novel-bg')
  const continueBtn  = el.querySelector('.novel-continue')
  const loadingEl    = el.querySelector('.novel-loading')
  const contentEl    = el.querySelector('.novel-content')
  const nameInputEl  = el.querySelector('.novel-input')
  const nameInput    = el.querySelector('.novel-name-input')
  const nameSubmit   = el.querySelector('.novel-input-submit')

  let nodes = []
  let currentNode = null
  let likertAnswers = [] // Collect all inline Likert answers
  let username = null    // Loaded from settings or entered by user
  let lastSpeaker = null // Cached, damit Avatar nicht bei jedem Klick neu lädt
  let lastLayout  = null // Für FLIP-Transition Avatar zwischen monologue/scene/compact
  let lastImage   = null // Aktuell gerendertes Backdrop-Bild
  let storyImageActive = null // Story-Comic bleibt über mehrere Nodes erhalten

  // ── Node rendern ─────────────────────────────────────────

  function renderNode(node) {
    currentNode = node
    if (!node) return handleSceneEnd()

    // Progress-Bar aktualisieren (Anteil im aktuellen Node-Array)
    if (nodes.length > 0) {
      const idx = nodes.findIndex(n => n.nodeId === node.nodeId)
      if (idx >= 0) setProgress((idx + 1) / nodes.length)
    }

    const config = SPEAKER_CONFIG[node.speaker] || SPEAKER_CONFIG.narrator
    const speakerChanged = node.speaker !== lastSpeaker
    const layout = getLayoutForNode(node)
    const layoutChanged = layout !== lastLayout

    // FLIP-Vorbereitung: Wenn dieselbe Figur über einen Layout-Wechsel hinweg bleibt
    // (z.B. Evu monologue → compact), Position/Größe VOR dem Klassen-Swap merken.
    let flipFromRect = null
    if (!speakerChanged && layoutChanged && lastLayout !== null) {
      const av = activeAvatar()
      if (av) flipFromRect = av.getBoundingClientRect()
    }

    // Layout-Klasse auf .novel-content setzen (steuert via CSS Position der Elemente)
    const contentClasses = ['novel-content', `novel-layout--${layout}`]
    contentEl.className = contentClasses.join(' ')

    // Story-Comic-Bild bleibt über mehrere Nodes hinweg sichtbar (auch bei narrator/user/Choices).
    // Wechsel: explizites neues node.image oder Speaker = Evu/Mika (Kursleitung übernimmt → Story-Pause).
    if (node.image) {
      storyImageActive = node.image
    } else if (node.speaker === 'evu' || node.speaker === 'mika') {
      storyImageActive = null
    }

    // Backdrop-Render: Cross-Fade. Neues Bild wird ÜBER dem alten geladen und sanft eingeblendet —
    // sobald sichtbar, fliegt das alte raus. Kein weißer Blitz mehr zwischen den Panels.
    if (storyImageActive !== lastImage) {
      if (storyImageActive) {
        const img = document.createElement('img')
        img.src = storyImageActive
        img.className = 'novel-bg-image novel-bg-image--entering'
        img.alt = ''
        img.draggable = false
        const finishFade = () => {
          // Vorgänger ausblenden (gibt's nur, wenn schon mal ein Bild da war)
          Array.from(bgEl.querySelectorAll('.novel-bg-image')).forEach(prev => {
            if (prev !== img) prev.remove()
          })
          img.classList.remove('novel-bg-image--entering')
        }
        if (img.complete && img.naturalWidth) {
          // Aus dem Preload-Cache → direkt in den nächsten Frame ein-faden
          requestAnimationFrame(() => requestAnimationFrame(finishFade))
        } else {
          img.addEventListener('load',  finishFade, { once: true })
          img.addEventListener('error', finishFade, { once: true })
        }
        bgEl.appendChild(img)
      } else {
        // Story endet (Evu übernimmt) → alle Backdrops weg
        bgEl.innerHTML = ''
      }
      lastImage = storyImageActive
    }

    // Character-Avatar (Lottie/SVG) nur wenn KEIN Story-Bild aktiv. Sonst dominiert das Comic-Image.
    if (speakerChanged || (!!storyImageActive !== characterEl._suppressed)) {
      characterEl.innerHTML = ''
      if (storyImageActive) {
        characterEl.style.display = 'none'
        characterEl._suppressed = true
      } else if (hasAvatar(node.speaker)) {
        const av = CharacterAvatar(node.speaker)
        if (av) characterEl.appendChild(av)
        characterEl.style.display = ''
        characterEl._suppressed = false
      } else {
        characterEl.style.display = 'none'
        characterEl._suppressed = false
      }
    }

    // FLIP-Play: jetzt liegt der Avatar bereits an der NEUEN Position. Inverse-Transform
    // anwenden, dann per RAF auf identity zurückanimieren → wirkt wie ein sanfter Flug.
    // Beim Übergang in Compact (z.B. Evu zeigt Liste/Likert) zusätzlich die Lottie
    // 'fliegt_hoch' abspielen — die Animation flattert visuell während die Box sich verschiebt.
    if (flipFromRect) {
      const av = activeAvatar()
      if (av) {
        const goingToCompact = layout === 'compact' && lastLayout !== 'compact'
        // Lottie-Dauer 'fliegt_hoch' = 2.43s; bei normalem Layout-Wechsel reichen 900ms
        const durMs = goingToCompact && (node.speaker === 'evu' || node.speaker === 'mika') ? 1500 : 900
        const toRect = av.getBoundingClientRect()
        const dx = flipFromRect.left   - toRect.left
        const dy = flipFromRect.top    - toRect.top
        const sx = toRect.width  ? flipFromRect.width  / toRect.width  : 1
        const sy = toRect.height ? flipFromRect.height / toRect.height : 1
        av.style.transformOrigin = 'top left'
        av.style.transition = 'none'
        av.style.transform = `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`
        // Force reflow → dann mit Transition zurück auf 0
        void av.offsetWidth
        av.style.transition = `transform ${durMs}ms cubic-bezier(0.34, 1.05, 0.5, 1)`
        av.style.transform  = ''

        // Lottie-Flugzustand für den Übergang: einmal abspielen und am letzten Frame stehen bleiben.
        // transitionInFlight blockt typewriter-getriggerte talking/idle-Wechsel solange.
        // Kein Auto-Reset auf idle — die Lottie ist so designed, dass Evu am Zielort
        // (Größe + Position) frozen bleibt. Idle würde sie sonst innerhalb des Frames neu zentrieren.
        if (goingToCompact && typeof av.setState === 'function' && !node.avatarState) {
          transitionInFlight = true
          av.setState('fliegt_hoch')
          setTimeout(() => { transitionInFlight = false }, durMs + 100)
        }

        const cleanup = () => {
          av.style.transition = ''
          av.style.transform = ''
          av.style.transformOrigin = ''
        }
        av.addEventListener('transitionend', cleanup, { once: true })
        // Safety: falls transitionend nicht feuert (z.B. Lottie-internal repaint)
        setTimeout(cleanup, durMs + 200)
      }
    }
    lastLayout = layout

    // Optional: Node-spezifischer Avatar-State (z.B. evu zeigt_hilfe / zeigt_kopfsachen).
    // Lock setzen, bevor typeText() die Talking/Idle-Übergänge versucht.
    lockedAvatarState = node.avatarState || null
    if (lockedAvatarState) {
      const av = activeAvatar()
      if (av && typeof av.setState === 'function') av.setState(lockedAvatarState)
    }

    // User-Choice-Nodes ohne Text: weder Bubble noch "Du"-Label zeigen,
    // sonst sieht's aus wie eine leere Sprechblase.
    const isEmptyUserChoice = node.speaker === 'user'
      && !(node.text && node.text.trim())
      && !node.inputType
      && !node.likert

    // Speaker-Label generell ausgeblendet — die Wireframes zeigen kein Label
    // (außer bei narrator, das ohnehin leer wäre).
    speakerLabel.textContent = ''
    speakerLabel.style.display = 'none'

    // Bubble-Styling je nach Speaker
    bubbleArea.className = 'novel-bubble-area'
    bubbleArea.classList.add(`novel-bubble--${node.speaker}`)
    bubbleArea.style.display = isEmptyUserChoice ? 'none' : ''

    // Sprechblase vs Gedankenblase — und Tail-Richtung zum Speaker
    // Default-Richtung pro Speaker basierend auf den Comic-Frames:
    //   toni links, manu rechts, neo links. user/narrator/evu/mika ohne Richtung.
    const SPEAKER_SIDE = { toni: 'left', neo: 'left', manu: 'right', psycholog: 'right' }
    const side = SPEAKER_SIDE[node.speaker] || null
    bubble.className = 'speech-bubble novel-bubble'
    if (node.bubble === 'thought') bubble.classList.add('novel-bubble--thought')

    // SVG-Tail nur bei Sprech-Nodes mit Speaker-Side, nicht bei Gedanken/Narrator/User.
    // Visibility via CSS-Klasse (SVG-Elemente reagieren nicht zuverlässig auf das `hidden`-Attribut).
    if (bubbleTailSvg) {
      const showTail = !!side && node.bubble !== 'thought' && getLayoutForNode(node) === 'scene'
      bubbleTailSvg.classList.toggle('novel-bubble-tail--visible', showTail)
      bubbleTailSvg.classList.toggle('novel-bubble-tail--right', showTail && side === 'right')
      bubbleTailSvg.classList.toggle('novel-bubble-tail--left',  showTail && side === 'left')
    }

    // Bubble-Border-Farbe — CSS-Variable auf BUBBLE-AREA setzen, damit Bubble UND SVG-Tail
    // dieselbe Farbe nutzen (SVG ist Sibling der Bubble, also muss var() vom gemeinsamen Parent kommen)
    bubble.style.borderColor = config.color
    bubbleArea.style.setProperty('--bubble-color', config.color)
    bubble.style.color = node.speaker === 'narrator' ? 'var(--text-muted)' : 'var(--text)'

    // Interpolate [Username] in text
    const displayText = username
      ? (node.text || '').replace(/\[Username\]/g, username)
      : (node.text || '')

    // Slide-In-Animation der Bubble nur bei Speaker-Wechsel — sonst nur Typewriter
    if (speakerChanged) {
      bubble.classList.remove('novel-bubble--enter')
      void bubble.offsetWidth
      bubble.classList.add('novel-bubble--enter')
    }

    // Speaker erst NACH allen speakerChanged-Vergleichen aktualisieren
    lastSpeaker = node.speaker

    // Text mit Typewriter-Effekt
    typeText(bubble, displayText)

    // Emotion als Data-Attribut (für späteres Character-Bild)
    el.dataset.emotion = node.emotion || 'neutral'
    el.dataset.speaker = node.speaker

    // Reset UI
    likertEl.style.display = 'none'
    likertEl.innerHTML = ''
    nameInputEl.style.display = 'none'
    listEl.hidden = true
    listEl.innerHTML = ''

    // Liste statt Speech-Bubble (z.B. Kapitel-Übersicht). Bubble + Typewriter aus.
    if (node.list) {
      // Bubble komplett aus dem Bild — sonst sieht man eine "geisterhafte" Restblase
      bubbleArea.style.display = 'none'
      bubble.classList.remove('novel-bubble--enter')
      bubble.textContent = ''
      clearInterval(typeTimer); typeTimer = null

      const { icon, title, items, ordered, style } = node.list
      listEl.hidden = false

      if (style === 'bubbles') {
        // 8-Kapitel-Variante: jedes Item als kleine Bubble/Chip mit Nummer + Titel
        listEl.classList.add('novel-list--bubbles')
        listEl.innerHTML = `
          ${title ? `<div class="novel-list-title">${icon ? `<span class="novel-list-icon">${escapeHtml(icon)}</span>` : ''}${escapeHtml(title)}</div>` : ''}
          <div class="novel-list-bubbles">
            ${(items || []).map((it, i) => `
              <div class="novel-list-bubble" style="animation-delay:${i * 60}ms">
                <span class="novel-list-bubble-num">${i + 1}</span>
                <span class="novel-list-bubble-text">${escapeHtml(it)}</span>
              </div>
            `).join('')}
          </div>
        `
      } else {
        listEl.classList.remove('novel-list--bubbles')
        const tag = ordered ? 'ol' : 'ul'
        listEl.innerHTML = `
          ${title ? `<div class="novel-list-title">${icon ? `<span class="novel-list-icon">${escapeHtml(icon)}</span>` : ''}${escapeHtml(title)}</div>` : ''}
          <${tag} class="novel-list-items${ordered ? ' novel-list-items--ordered' : ''}">
            ${(items || []).map(it => `<li>${escapeHtml(it)}</li>`).join('')}
          </${tag}>
        `
      }
    } else {
      listEl.classList.remove('novel-list--bubbles')
    }

    // Text input (e.g. name entry)
    if (node.inputType === 'text') {
      continueBtn.style.display = 'none'
      choicesEl.innerHTML = ''
      choicesEl.style.display = 'none'
      nameInputEl.style.display = ''
      nameInput.placeholder = node.inputPlaceholder || 'Eingabe …'
      nameInput.value = username || ''
      nameInput.focus()
      return
    }

    // Inline-Likert (Fragebogen im Dialog)
    if (node.likert) {
      continueBtn.style.display = 'none'
      choicesEl.innerHTML = ''
      choicesEl.style.display = 'none'
      renderInlineLikert(node.likert)
      return
    }

    // Choices oder Weiter-Button
    const hasChoices = node.choices && node.choices.length > 0
    const hasTrigger = node.triggerAction && node.triggerAction !== 'none'
    const hasNext    = node.nextNodeId !== null && node.nextNodeId !== undefined

    if (hasChoices) {
      continueBtn.style.display = 'none'
      renderChoices(node.choices)
    } else {
      // Trigger hat Vorrang – Button bekommt Action-Label, nextNodeId dient als Resume-Point.
      if (hasTrigger)      continueBtn.textContent = actionLabel(node.triggerAction)
      else if (hasNext)    continueBtn.textContent = 'Weiter'
      else                 continueBtn.textContent = 'Szene beenden'
      continueBtn.style.display = ''
      choicesEl.innerHTML = ''
      choicesEl.style.display = 'none'
    }
  }

  function renderChoices(choices) {
    choicesEl.style.display = ''
    choicesEl.innerHTML = ''
    choices.forEach(choice => {
      const btn = document.createElement('button')
      btn.className = 'btn-secondary novel-choice'
      btn.textContent = choice.text
      btn.addEventListener('click', () => {
        goToNode(choice.nextNodeId)
      })
      choicesEl.appendChild(btn)
    })
  }

  // ── Inline-Likert (Fragebogen im Dialog) ────────────────

  function renderInlineLikert(likert) {
    likertEl.style.display = ''
    likertEl.innerHTML = ''
    // Slide-In-Animation neu starten
    likertEl.classList.remove('novel-likert--enter')
    void likertEl.offsetWidth
    likertEl.classList.add('novel-likert--enter')

    // Kein zusätzlicher Statement-Text — Frage steht schon in der Bubble.
    // (Mika-Aussagen müssen kombiniert in den Bubble-Text geschrieben werden.)
    const scale = document.createElement('div')
    scale.className = 'likert'

    likert.emojis.forEach((emoji, i) => {
      const item = document.createElement('div')
      item.className = 'likert-item'
      item.innerHTML = `
        <div class="likert-emoji">${emoji}</div>
        <span class="likert-label">${likert.labels[i] || ''}</span>
      `
      item.addEventListener('click', () => {
        scale.querySelectorAll('.likert-item').forEach(it => it.classList.remove('selected'))
        item.classList.add('selected')

        // Save answer and advance
        likertAnswers.push({
          questionId: likert.questionId,
          questionText: likert.questionText,
          value: i + 1,
        })

        // Short delay so user sees selection
        setTimeout(() => {
          likertEl.style.display = 'none'
          goToNode(likert.nextNodeId)
        }, 400)
      })
      scale.appendChild(item)
    })

    likertEl.appendChild(scale)
  }

  // ── Name input handler ──────────────────────────────────

  function submitName() {
    const name = nameInput.value.trim()
    if (!name) return
    username = name
    saveSettings({ username: name })
    nameInputEl.style.display = 'none'
    goToNode(currentNode.nextNodeId)
  }

  nameSubmit.addEventListener('click', submitName)
  nameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') submitName()
  })

  // ── Typewriter ───────────────────────────────────────────

  let typeTimer = null

  // Aktuelle Avatar-Instance (mit setState-API für talking/idle)
  function activeAvatar() {
    return characterEl.firstElementChild
  }
  // Wenn ein Node `avatarState` setzt (z.B. 'zeigt_hilfe'), pinnen wir diesen State
  // und blocken talking/idle vom Typewriter — sonst flickert die Geste.
  let lockedAvatarState = null
  // Während eines Layout-Übergangs (Lottie 'fliegt_hoch') soll talking/idle blockiert sein.
  let transitionInFlight = false
  function setAvatarState(state) {
    if ((lockedAvatarState || transitionInFlight) && (state === 'talking' || state === 'idle')) return
    const av = activeAvatar()
    if (av && typeof av.setState === 'function') av.setState(state)
  }

  function typeText(target, text) {
    clearInterval(typeTimer)
    target.textContent = ''
    if (!text) {
      target.textContent = ''
      setAvatarState('idle')
      return
    }
    setAvatarState('talking')
    let i = 0
    typeTimer = setInterval(() => {
      if (i < text.length) {
        target.textContent += text[i]
        i++
      } else {
        clearInterval(typeTimer)
        typeTimer = null
        setAvatarState('idle')
      }
    }, 25)

    // Tap auf Bubble = sofort komplett anzeigen
    target.onclick = () => {
      if (typeTimer) {
        clearInterval(typeTimer)
        typeTimer = null
        target.textContent = text
        setAvatarState('idle')
      }
    }
  }

  // ── Navigation ───────────────────────────────────────────

  function goToNode(nodeId) {
    const node = nodes.find(n => n.nodeId === nodeId)
    if (node) {
      renderNode(node)
      saveProgress({ currentChapter: slug, currentNodeId: nodeId })
    } else {
      handleSceneEnd()
    }
  }

  continueBtn.addEventListener('click', () => {
    if (!currentNode) return

    // Trigger hat Vorrang (auch mit nextNodeId, das als Resume-Point genutzt wird)
    if (currentNode.triggerAction && currentNode.triggerAction !== 'none') {
      handleTrigger(currentNode.triggerAction)
      return
    }

    if (currentNode.nextNodeId === null || currentNode.nextNodeId === undefined) {
      handleSceneEnd()
      return
    }

    goToNode(currentNode.nextNodeId)
  })

  async function handleTrigger(action) {
    // Save questionnaire answers if we collected any before navigating
    if (likertAnswers.length > 0) {
      saveQuestionnaire('prae_fragebogen', [...likertAnswers])
      likertAnswers = []
    }

    // Save progress to NEXT node so returning doesn't re-trigger
    if (currentNode?.nextNodeId) {
      saveProgress({ currentChapter: slug, currentNodeId: currentNode.nextNodeId })
    } else {
      saveProgress({ currentChapter: slug, currentNodeId: currentNode.nodeId })
    }

    // Spezial-Trigger: Onboarding fertig → Settings markieren + zu Kapitelauswahl
    if (action === 'complete_onboarding') {
      await saveSettings({ onboardingDone: true })
      saveProgress({ currentChapter: null, currentNodeId: 0 })
      window.location.hash = '#/chapters'
      return
    }

    // Spezial-Trigger: Onboarding verlassen (User hat keine Zeit) → Home.
    // Progress zurücksetzen, sonst startet der User beim nächsten Mal
    // direkt wieder beim Abschiedsgruß-Node statt von vorne.
    if (action === 'exit_to_home') {
      await saveProgress({ currentChapter: null, currentNodeId: 0 })
      window.location.hash = '#/home'
      return
    }

    // Spezial-Trigger: Kapitel abgeschlossen → Home
    if (action === 'complete_chapter') {
      await completeChapter(slug)
      saveProgress({ currentChapter: null, currentNodeId: 0 })
      window.location.hash = '#/home'
      return
    }

    const routes = {
      open_cave:          '#/cave',
      open_exercise:      '#/exercise',
      open_hilfsangebote: '#/hilfsangebote',
      open_toolbox:       '#/toolbox',
      open_questionnaire: '#/questionnaire',
      open_video:         '#/video',
      open_content:       '#/content',
    }
    const route = routes[action]
    if (route) {
      const payload = currentNode?.triggerPayload
      window.location.hash = payload ? `${route}/${payload}` : route
    }
  }

  function handleSceneEnd() {
    // Save collected questionnaire answers
    if (likertAnswers.length > 0) {
      saveQuestionnaire('prae_fragebogen', [...likertAnswers])
      likertAnswers = []
    }

    bubble.textContent = 'Szene beendet.'
    speakerLabel.style.display = 'none'
    choicesEl.innerHTML = ''
    choicesEl.style.display = 'none'
    likertEl.style.display = 'none'
    continueBtn.textContent = 'Zurück zur Übersicht'
    continueBtn.style.display = ''
    continueBtn.onclick = () => {
      window.location.hash = '#/chapters'
    }
  }

  function actionLabel(action) {
    const labels = {
      open_cave:           'Sicheren Ort öffnen',
      open_exercise:       'Übung starten',
      open_hilfsangebote:  'Hilfsangebote anzeigen',
      open_toolbox:        'Wohlfühl-Schachtel',
      open_questionnaire:  'Fragebogen',
      open_video:          'Video abspielen',
      open_content:        'Weiter',
      complete_onboarding: 'Zur Kapitelauswahl',
      complete_chapter:    'Kapitel abschließen',
      exit_to_home:        'Zurück',
    }
    return labels[action] || 'Weiter'
  }

  // ── Init ─────────────────────────────────────────────────

  async function init() {
    let loadedNodes = null

    // Wenn wir Demo-Daten für diesen Slug haben, überspringen wir Strapi —
    // sonst bekommt der User beim Zurückkehren einen langen Loading-Hänger.
    // (Customer-Edits werden später wieder berücksichtigt, wenn Strapi befüllt ist.)
    const hasDemo = !!DEMO_NODES_BY_SLUG[slug]
    if (!hasDemo) {
      try {
        const scenes = await getDialogScene(slug)
        if (scenes && scenes.length > 0) {
          const scene = scenes[0]
          loadedNodes = scene.nodes
        }
      } catch (e) {
        console.warn('Strapi nicht erreichbar, nutze Demo-Daten:', e.message)
      }
    }

    nodes = loadedNodes || DEMO_NODES_BY_SLUG[slug] || []
    loadingEl.style.display = 'none'
    contentEl.style.display = ''

    // Story-Bilder im Hintergrund vorladen — sobald init fertig ist, holt der Browser
    // parallel alle Comic-Panels rein. Beim Klick durch die Story sind sie dann im Cache.
    const uniqueImages = [...new Set(nodes.map(n => n.image).filter(Boolean))]
    uniqueImages.forEach(src => { const img = new Image(); img.src = src })

    // Unbekannter Slug oder leeres Node-Set → ab zur Kapitelauswahl, statt "Szene beendet"
    if (!nodes.length) {
      console.warn(`Keine Dialog-Nodes für slug "${slug}" gefunden — leite weiter`)
      saveProgress({ currentChapter: null, currentNodeId: 0 })
      window.location.hash = '#/chapters'
      return
    }

    // Load username from settings
    const settings = await getSettings()
    if (settings.username) username = settings.username

    // Fortschritt laden → ggf. an letzter Stelle weitermachen
    const progress = await getProgress()
    let startId = (progress.currentChapter === slug && progress.currentNodeId > 0)
      ? progress.currentNodeId
      : nodes[0].nodeId

    // Defensive: gespeicherter Node existiert nicht (z.B. nach Datenmodell-Wechsel) → von vorne starten
    if (!nodes.find(n => n.nodeId === startId)) {
      console.warn(`Gespeicherter Node ${startId} nicht in slug "${slug}" — starte von vorne`)
      startId = nodes[0].nodeId
      saveProgress({ currentChapter: slug, currentNodeId: startId })
    }

    goToNode(startId)
  }

  contentEl.style.display = 'none'
  init()

  return el
}

function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}
