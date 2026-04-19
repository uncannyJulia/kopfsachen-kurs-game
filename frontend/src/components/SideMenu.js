// components/SideMenu.js
// Slide-in Overlay-Menü von links. Nutzbar aus jedem Screen.

let menuEl = null

export function openSideMenu() {
  if (menuEl) { menuEl.classList.add('side-menu--open'); return }

  menuEl = document.createElement('div')
  menuEl.className = 'side-menu'
  menuEl.innerHTML = `
    <div class="side-menu-backdrop"></div>
    <nav class="side-menu-panel">
      <button class="side-menu-close" type="button">&#10005;</button>
      <ul class="side-menu-links">
        <li><a href="#/home" class="side-menu-link">Home</a></li>
        <li><a href="#/chapters" class="side-menu-link">Kapitel</a></li>
        <li><a href="#/toolbox" class="side-menu-link">Selfcare-Schachtel</a></li>
        <li><a href="#/cave" class="side-menu-link">Innerer sicherer Ort</a></li>
        <li><a href="#/hilfsangebote" class="side-menu-link">Hilfsangebote</a></li>
        <li><a href="#/kopfsachen" class="side-menu-link">Kopfsachen</a></li>
        <li><a href="https://kopfsachen.de" target="_blank" rel="noopener" class="side-menu-link side-menu-link--ext">kopfsachen.de</a></li>
      </ul>
    </nav>
  `

  document.getElementById('app').appendChild(menuEl)

  // Close handlers
  menuEl.querySelector('.side-menu-backdrop').addEventListener('click', closeSideMenu)
  menuEl.querySelector('.side-menu-close').addEventListener('click', closeSideMenu)
  menuEl.querySelectorAll('.side-menu-link').forEach(link => {
    link.addEventListener('click', closeSideMenu)
  })

  // Open with slight delay for CSS transition
  requestAnimationFrame(() => menuEl.classList.add('side-menu--open'))
}

export function closeSideMenu() {
  if (!menuEl) return
  menuEl.classList.remove('side-menu--open')
}
