// screens/NovelScreen.js
// Dialog-Engine: Sprechblasen, Choices, Likert-Inline, Character-Wechsel, Spielstand.

import { getDialogScene } from '../api.js'
import { getProgress, saveProgress, saveQuestionnaire, getSettings, saveSettings, completeChapter } from '../store.js'
import { TopMenu } from '../components/TopMenu.js'
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

// ── Screen ───────────────────────────────────────────────────

export function NovelScreen(path) {
  const el = document.createElement('div')
  el.className = 'screen novel-screen'

  // Chapter-Slug aus Route extrahieren (z.B. /novel/kapitel-1)
  const slug = path?.replace('/novel/', '') || 'intro'

  el.innerHTML = `
    <div class="novel-bg"></div>
    <div class="novel-content">
      <div class="novel-speaker-label"></div>
      <div class="novel-bubble-area">
        <div class="speech-bubble novel-bubble"></div>
      </div>
      <div class="novel-likert" style="display:none"></div>
      <div class="novel-choices"></div>
      <div class="novel-input" style="display:none">
        <input type="text" class="novel-name-input" placeholder="Dein Name …" maxlength="30" autocomplete="off" />
        <button class="btn-primary novel-input-submit" type="button">OK</button>
      </div>
      <button class="novel-continue btn-primary" type="button">Weiter</button>
    </div>
    <div class="side-tabs">
      <button class="side-tab side-tab--purple" type="button" data-action="cave" title="Sicherer Ort" style="display:none">&#127807;</button>
      <button class="side-tab side-tab--orange" type="button" data-action="toolbox" title="Schachtel" style="display:none">&#129520;</button>
      <button class="side-tab" style="background:var(--border);display:none" type="button" data-action="menu" title="Menü">&#9776;</button>
    </div>
    <div class="novel-loading">
      <p>Lade Dialog …</p>
    </div>
  `

  el.querySelectorAll('.side-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const action = tab.dataset.action
      if (action === 'cave') window.location.hash = '#/cave'
      else if (action === 'toolbox') window.location.hash = '#/toolbox'
      else if (action === 'menu') openSideMenu()
    })
  })

  const bubbleArea   = el.querySelector('.novel-bubble-area')
  const bubble       = el.querySelector('.novel-bubble')
  const speakerLabel = el.querySelector('.novel-speaker-label')
  const choicesEl    = el.querySelector('.novel-choices')
  const likertEl     = el.querySelector('.novel-likert')
  const continueBtn  = el.querySelector('.novel-continue')
  const loadingEl    = el.querySelector('.novel-loading')
  const contentEl    = el.querySelector('.novel-content')
  const nameInputEl  = el.querySelector('.novel-input')
  const nameInput    = el.querySelector('.novel-name-input')
  const nameSubmit   = el.querySelector('.novel-input-submit')

  // Side-tab elements for progressive reveal
  const tabCave    = el.querySelector('[data-action="cave"]')
  const tabToolbox = el.querySelector('[data-action="toolbox"]')
  const tabMenu    = el.querySelector('[data-action="menu"]')

  let nodes = []
  let currentNode = null
  let likertAnswers = [] // Collect all inline Likert answers
  let username = null    // Loaded from settings or entered by user

  // Reveal a side-tab
  function showTab(tab) { if (tab) tab.style.display = '' }

  // Reveal tabs based on which nodes the user has already passed
  function revealTabsForNode(nodeId) {
    if (nodeId >= 40) showTab(tabMenu)
    if (nodeId >= 50) showTab(tabToolbox)
    if (nodeId >= 52) showTab(tabCave)
  }

  // ── Node rendern ─────────────────────────────────────────

  function renderNode(node) {
    currentNode = node
    if (!node) return handleSceneEnd()

    // Progressive tab reveal
    revealTabsForNode(node.nodeId)

    const config = SPEAKER_CONFIG[node.speaker] || SPEAKER_CONFIG.narrator

    // Speaker-Label
    if (node.speaker === 'narrator') {
      speakerLabel.textContent = ''
      speakerLabel.style.display = 'none'
    } else {
      speakerLabel.textContent = config.label
      speakerLabel.style.display = ''
      speakerLabel.style.color = config.color
    }

    // Bubble-Styling je nach Speaker
    bubbleArea.className = 'novel-bubble-area'
    bubbleArea.classList.add(`novel-bubble--${node.speaker}`)

    // Bubble-Border-Farbe
    bubble.style.borderColor = config.color
    bubble.style.color = node.speaker === 'narrator' ? 'var(--text-muted)' : 'var(--text)'

    // Interpolate [Username] in text
    const displayText = username
      ? (node.text || '').replace(/\[Username\]/g, username)
      : (node.text || '')

    // Text mit Typewriter-Effekt
    typeText(bubble, displayText)

    // Emotion als Data-Attribut (für späteres Character-Bild)
    el.dataset.emotion = node.emotion || 'neutral'
    el.dataset.speaker = node.speaker

    // Reset UI
    likertEl.style.display = 'none'
    likertEl.innerHTML = ''
    nameInputEl.style.display = 'none'

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

  function typeText(target, text) {
    clearInterval(typeTimer)
    target.textContent = ''
    if (!text) { target.textContent = ''; return }
    let i = 0
    typeTimer = setInterval(() => {
      if (i < text.length) {
        target.textContent += text[i]
        i++
      } else {
        clearInterval(typeTimer)
        typeTimer = null
      }
    }, 25)

    // Tap auf Bubble = sofort komplett anzeigen
    target.onclick = () => {
      if (typeTimer) {
        clearInterval(typeTimer)
        typeTimer = null
        target.textContent = text
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

    // Spezial-Trigger: Onboarding verlassen (User hat keine Zeit) → Home
    if (action === 'exit_to_home') {
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
      open_toolbox:        'Selfcare-Schachtel',
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

    try {
      const scenes = await getDialogScene(slug)
      if (scenes && scenes.length > 0) {
        const scene = scenes[0]
        loadedNodes = scene.nodes
      }
    } catch (e) {
      console.warn('Strapi nicht erreichbar, nutze Demo-Daten:', e.message)
    }

    nodes = loadedNodes || DEMO_NODES_BY_SLUG[slug] || []
    loadingEl.style.display = 'none'
    contentEl.style.display = ''

    // Load username from settings
    const settings = await getSettings()
    if (settings.username) username = settings.username

    // Fortschritt laden → ggf. an letzter Stelle weitermachen
    const progress = await getProgress()
    const startId = (progress.currentChapter === slug && progress.currentNodeId > 0)
      ? progress.currentNodeId
      : nodes[0]?.nodeId || 1

    // Reveal tabs for all nodes up to the start point
    revealTabsForNode(startId)

    goToNode(startId)
  }

  contentEl.style.display = 'none'
  init()

  return el
}
