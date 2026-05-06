// components/CharacterAvatar.js
// Avatare je Speaker.
//   - Evu / Mika: Lottie-Animation (echtes Character-Art aus assets/Evu/evu_statisch.json)
//   - alle anderen: SVG-Platzhalter bis echte Assets vorliegen.

import lottie from 'lottie-web'

// Welche Speaker nutzen Lottie-Animationen + welche State-Animations gibt's?
// Default-State ist immer 'idle'.
const LOTTIE_ANIMATIONS = {
  evu: {
    idle:    '/lottie/evu_idle.json',
    talking: '/lottie/evu_talking.json',
    static:  '/lottie/evu_statisch.json',
  },
  // Mika nutzt das gleiche Char-Art wie Evu (Konzept) — vorerst nur statisch
  mika: {
    idle:    '/lottie/evu_statisch.json',
    talking: '/lottie/evu_statisch.json',
    static:  '/lottie/evu_statisch.json',
  },
}

const SVG_BY_SPEAKER = {
  // Toni: schwarze Silhouette mit Katzenohren
  toni: `
    <svg viewBox="0 0 100 100" aria-hidden="true">
      <polygon points="22,32 27,8 44,28" fill="#1f2937"/>
      <polygon points="56,28 73,8 78,32" fill="#1f2937"/>
      <ellipse cx="50" cy="55" rx="32" ry="34" fill="#1f2937"/>
      <circle cx="40" cy="52" r="3" fill="#ffffff"/>
      <circle cx="60" cy="52" r="3" fill="#ffffff"/>
      <path d="M 47 64 L 50 67 L 53 64 Z" fill="#ffffff"/>
    </svg>
  `,
  // Manu: ruhige, zentrierte Person mit geschlossenen Augen
  manu: `
    <svg viewBox="0 0 100 100" aria-hidden="true">
      <circle cx="50" cy="52" r="36" fill="#bfdbfe"/>
      <path d="M 33 48 Q 38 52 43 48" stroke="#1e3a8a" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M 57 48 Q 62 52 67 48" stroke="#1e3a8a" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M 42 64 Q 50 68 58 64" stroke="#1e3a8a" stroke-width="1.6" fill="none" stroke-linecap="round"/>
    </svg>
  `,
  // Neo: grüner Sprössling/Pflanze
  neo: `
    <svg viewBox="0 0 100 100" aria-hidden="true">
      <ellipse cx="50" cy="58" rx="32" ry="34" fill="#86efac"/>
      <rect x="48" y="14" width="4" height="14" rx="2" fill="#16a34a"/>
      <ellipse cx="40" cy="20" rx="8" ry="5" fill="#16a34a" transform="rotate(-25 40 20)"/>
      <ellipse cx="60" cy="20" rx="8" ry="5" fill="#16a34a" transform="rotate(25 60 20)"/>
      <circle cx="40" cy="54" r="2.5" fill="#14532d"/>
      <circle cx="60" cy="54" r="2.5" fill="#14532d"/>
      <path d="M 40 68 Q 50 72 60 68" stroke="#14532d" stroke-width="1.6" fill="none" stroke-linecap="round"/>
    </svg>
  `,
  // Psycholog*in: Talking-Head mit Brille
  psycholog: `
    <svg viewBox="0 0 100 100" aria-hidden="true">
      <circle cx="50" cy="50" r="34" fill="#c4b5fd"/>
      <path d="M 22 38 Q 30 18 50 16 Q 70 18 78 38" fill="#6d28d9"/>
      <circle cx="40" cy="50" r="6" fill="none" stroke="#1f2937" stroke-width="1.8"/>
      <circle cx="60" cy="50" r="6" fill="none" stroke="#1f2937" stroke-width="1.8"/>
      <line x1="46" y1="50" x2="54" y2="50" stroke="#1f2937" stroke-width="1.8"/>
      <path d="M 42 64 Q 50 68 58 64" stroke="#1f2937" stroke-width="1.6" fill="none" stroke-linecap="round"/>
    </svg>
  `,
  // User & Narrator: keine Avatare → leerer Stub, der nicht gerendert wird
  user: '',
  narrator: '',
}

// Cache der bereits geladenen Lottie-JSONs, damit jede Anzeige sofort startet
const _lottieCache = new Map()

async function loadLottie(path) {
  if (_lottieCache.has(path)) return _lottieCache.get(path)
  const data = await fetch(path).then(r => r.json())
  _lottieCache.set(path, data)
  return data
}

// Wechselt das Lottie-Animation-File auf einem bestehenden Wrap.
// Verhindert sichtbares Re-Mount: das alte Animation-Instance wird erst
// nach erfolgreichem Laden des neuen JSON destroyed.
async function swapLottie(wrap, path) {
  if (!wrap.isConnected || wrap._lottiePath === path) return
  wrap._lottiePath = path
  let animationData
  try {
    animationData = await loadLottie(path)
  } catch (err) {
    console.warn('Lottie konnte nicht geladen werden:', err)
    return
  }
  if (!wrap.isConnected || wrap._lottiePath !== path) return  // inzwischen anderer State angefordert

  // Alte Instance destroyen und Container leeren
  if (wrap._lottieAnim) {
    try { wrap._lottieAnim.destroy() } catch {}
  }
  wrap.innerHTML = ''
  wrap._lottieAnim = lottie.loadAnimation({
    container: wrap,
    renderer: 'svg',
    loop: true,
    autoplay: true,
    animationData,
  })
}

export function CharacterAvatar(speaker, { size = '45rem', state = 'idle' } = {}) {
  const animations = LOTTIE_ANIMATIONS[speaker]
  if (animations) {
    const wrap = document.createElement('div')
    wrap.className = `character-avatar character-avatar--${speaker} character-avatar--lottie`
    // Lottie-Datei ist Portrait (1080×1920 ≈ 9:16). Höhe als Anker, Breite via aspect-ratio.
    // Cap an Viewport, damit Bubble + Buttons noch sichtbar bleiben.
    const h = `min(${size}, 55vh)`
    wrap.style.height = h
    wrap.style.width  = `calc(${h} * 9 / 16)`

    swapLottie(wrap, animations[state] || animations.idle)

    // Public-API: setState('talking' | 'idle' | 'static') auf dem Wrap-Element
    wrap.setState = (nextState) => {
      const path = animations[nextState] || animations.idle
      swapLottie(wrap, path)
    }
    return wrap
  }

  const svg = SVG_BY_SPEAKER[speaker]
  if (!svg) return null
  const wrap = document.createElement('div')
  wrap.className = `character-avatar character-avatar--${speaker}`
  const cap = `min(${size}, 55vh)`
  wrap.style.width = cap
  wrap.style.height = cap
  wrap.innerHTML = svg
  // No-op setState für Konsistenz
  wrap.setState = () => {}
  return wrap
}

export function hasAvatar(speaker) {
  if (LOTTIE_ANIMATIONS[speaker]) return true
  return !!(SVG_BY_SPEAKER[speaker] && SVG_BY_SPEAKER[speaker].trim())
}
