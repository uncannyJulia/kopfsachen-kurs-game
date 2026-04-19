// components/TopMenu.js
// Immer sichtbare Top-Leiste während des Kurses.
// Enthält: Home-Icon, Kopfsachen-Logo, Hilfsangebote-Button, Progress-Bar.
//
// Usage:
//   el.appendChild(TopMenu({ progress: 0.4 }))
//
// progress: 0..1 (Anteil des Kapitel-Fortschritts). null/undefined → Bar versteckt.

export function TopMenu({ progress = null } = {}) {
  const nav = document.createElement('nav')
  nav.className = 'top-menu'
  nav.innerHTML = `
    <a href="#/home" class="top-menu-home" aria-label="Home" title="Home">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M3 11 12 3l9 8"/>
        <path d="M5 10v10h14V10"/>
      </svg>
    </a>
    <a href="#/kopfsachen" class="top-menu-logo" aria-label="Kopfsachen" title="Kopfsachen">
      <span class="top-menu-logo-k">K</span>
    </a>
    <a href="#/hilfsangebote" class="top-menu-hilfsangebote">Hilfsangebote</a>
    <div class="top-menu-progress" ${progress === null ? 'hidden' : ''}>
      <span class="top-menu-progress-label">Dein Fortschritt</span>
      <div class="top-menu-progress-track">
        <div class="top-menu-progress-fill" style="width:${clamp01(progress) * 100}%"></div>
      </div>
    </div>
  `
  return nav
}

function clamp01(v) {
  if (typeof v !== 'number' || Number.isNaN(v)) return 0
  return Math.max(0, Math.min(1, v))
}
