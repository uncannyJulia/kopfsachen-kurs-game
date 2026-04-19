// screens/KopfsachenScreen.js
// Info-Seite über Kopfsachen e.V. mit Submenu: Kontakt, Credits, FAQ.
// Stub – wird in späteren Wellen inhaltlich gefüllt.

export function KopfsachenScreen() {
  const el = document.createElement('div')
  el.className = 'screen kopfsachen-screen'

  el.innerHTML = `
    <div class="topbar">
      <button class="btn-menu kopfsachen-back" type="button">&#8592;</button>
      <h1 class="kopfsachen-heading">Kopfsachen</h1>
      <div style="width:44px"></div>
    </div>
    <div class="kopfsachen-intro">
      <p>Dieses Angebot wird von Kopfsachen e.V. entwickelt.</p>
    </div>
    <nav class="kopfsachen-submenu">
      <a href="#/kopfsachen/kontakt" class="kopfsachen-submenu-link">
        <span class="kopfsachen-submenu-label">Kontakt</span>
        <span class="kopfsachen-submenu-hint">Frag Kopfsachen etwas</span>
      </a>
      <a href="#/kopfsachen/credits" class="kopfsachen-submenu-link">
        <span class="kopfsachen-submenu-label">Credits</span>
        <span class="kopfsachen-submenu-hint">Wer hat mitgewirkt</span>
      </a>
      <a href="#/kopfsachen/faq" class="kopfsachen-submenu-link">
        <span class="kopfsachen-submenu-label">FAQ</span>
        <span class="kopfsachen-submenu-hint">Häufig gestellte Fragen</span>
      </a>
    </nav>
  `

  el.querySelector('.kopfsachen-back').addEventListener('click', () => {
    history.back()
  })

  return el
}
