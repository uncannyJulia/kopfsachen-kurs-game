// components/CharacterAvatar.js
// Platzhalter-SVG-Illustrationen je Speaker, bis echtes Character-Art da ist.
// Stilstuf: einfache, freundliche Vektoren in den Speaker-Farben.

const SVG_BY_SPEAKER = {
  // Evu: weicher, "haariger" Blob (analog Mika)
  evu: `
    <svg viewBox="0 0 100 100" aria-hidden="true">
      <ellipse cx="50" cy="55" rx="36" ry="40" fill="#fde68a"/>
      <g stroke="#92400e" stroke-width="1.5" stroke-linecap="round" fill="none">
        <path d="M 18 80 L 16 96"/>
        <path d="M 28 86 L 26 98"/>
        <path d="M 38 89 L 38 98"/>
        <path d="M 50 90 L 50 99"/>
        <path d="M 62 89 L 62 98"/>
        <path d="M 72 86 L 74 98"/>
        <path d="M 82 80 L 84 96"/>
      </g>
      <circle cx="40" cy="50" r="2.5" fill="#1f2937"/>
      <circle cx="60" cy="50" r="2.5" fill="#1f2937"/>
      <path d="M 40 64 Q 50 70 60 64" stroke="#1f2937" stroke-width="1.6" fill="none" stroke-linecap="round"/>
    </svg>
  `,
  // Mika: gleiche Optik wie Evu (gleicher Illustratoren-Stil im Konzept)
  mika: `
    <svg viewBox="0 0 100 100" aria-hidden="true">
      <ellipse cx="50" cy="55" rx="36" ry="40" fill="#fde68a"/>
      <g stroke="#92400e" stroke-width="1.5" stroke-linecap="round" fill="none">
        <path d="M 18 80 L 16 96"/>
        <path d="M 28 86 L 26 98"/>
        <path d="M 38 89 L 38 98"/>
        <path d="M 50 90 L 50 99"/>
        <path d="M 62 89 L 62 98"/>
        <path d="M 72 86 L 74 98"/>
        <path d="M 82 80 L 84 96"/>
      </g>
      <circle cx="40" cy="50" r="2.5" fill="#1f2937"/>
      <circle cx="60" cy="50" r="2.5" fill="#1f2937"/>
      <path d="M 40 64 Q 50 70 60 64" stroke="#1f2937" stroke-width="1.6" fill="none" stroke-linecap="round"/>
    </svg>
  `,
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

export function CharacterAvatar(speaker, { size = '4rem' } = {}) {
  const svg = SVG_BY_SPEAKER[speaker]
  if (!svg) return null
  const wrap = document.createElement('div')
  wrap.className = `character-avatar character-avatar--${speaker}`
  wrap.style.width = size
  wrap.style.height = size
  wrap.innerHTML = svg
  return wrap
}

export function hasAvatar(speaker) {
  return !!(SVG_BY_SPEAKER[speaker] && SVG_BY_SPEAKER[speaker].trim())
}
