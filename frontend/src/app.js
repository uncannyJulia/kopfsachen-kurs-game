// app.js
// Einstiegspunkt. Registriert alle Routes und startet den Router.

import { Router }              from './router.js'
import { SplashScreen }        from './screens/SplashScreen.js'
import { HomeScreen }          from './screens/HomeScreen.js'
import { ChaptersScreen }      from './screens/ChaptersScreen.js'
import { NovelScreen }         from './screens/NovelScreen.js'
import { CaveScreen }          from './screens/CaveScreen.js'
import { ExerciseScreen }      from './screens/ExerciseScreen.js'
import { ContentScreen }       from './screens/ContentScreen.js'
import { VideoScreen }         from './screens/VideoScreen.js'
import { ToolboxScreen }       from './screens/ToolboxScreen.js'
import { HilfsangeboteScreen } from './screens/HilfsangeboteScreen.js'
import { KopfsachenScreen }    from './screens/KopfsachenScreen.js'
import { QuestionnaireScreen } from './screens/QuestionnaireScreen.js'

const app    = document.getElementById('app')
const router = new Router(app)

router
  .on('/',               () => SplashScreen())
  .on('/home',           () => HomeScreen())
  .on('/chapters',       () => ChaptersScreen())
  .on('/novel',          (path) => NovelScreen(path))
  .on('/cave',           () => CaveScreen())
  .on('/exercise',       (path) => ExerciseScreen(path))
  .on('/content',        (path) => ContentScreen(path))
  .on('/video',          (path) => VideoScreen(path))
  .on('/toolbox',        () => ToolboxScreen())
  .on('/hilfsangebote',  () => HilfsangeboteScreen())
  .on('/kopfsachen',     () => KopfsachenScreen())
  .on('/questionnaire',  (path) => QuestionnaireScreen(path))

// Dev-Navigationsleiste (nur in Entwicklung sichtbar)
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  mountDevNav(app, router)
}

router.start()

// ── Dev-Navigation ────────────────────────────────────────────
// Nur lokal sichtbar – zum schnellen Zwischen-Screens-Wechseln.
function mountDevNav(app, router) {
  const routes = [
    ['/', 'Splash'],
    ['/home', 'Home'],
    ['/chapters', 'Kapitel'],
    ['/novel/onboarding', 'Onboarding'],
    ['/novel/ein-moment-nur-fuer-dich', 'Kapitel 1'],
    ['/cave', 'Cave'],
    ['/exercise/box-atmung', 'Box-Atmung'],
    ['/exercise/innerer-sicherer-ort-vorstellung', 'Innerer Ort'],
    ['/content/energie-reflexion', 'Energie'],
    ['/content/wenn-dann-plan', 'Wenn-Dann'],
    ['/toolbox', 'Schachtel'],
    ['/hilfsangebote', 'Hilfsangebote'],
    ['/kopfsachen', 'Kopfsachen'],
    ['/questionnaire', 'Fragebogen'],
  ]

  const nav = document.createElement('div')
  nav.style.cssText = `
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(28,25,23,0.95);
    display: flex;
    overflow-x: auto;
    gap: 2px;
    padding: 6px;
    z-index: 9999;
    -webkit-overflow-scrolling: touch;
  `

  routes.forEach(([path, label]) => {
    const btn = document.createElement('button')
    btn.textContent = label
    btn.style.cssText = `
      flex-shrink: 0;
      background: #374151;
      color: #fff;
      border: none;
      border-radius: 6px;
      padding: 4px 10px;
      font-size: 11px;
      cursor: pointer;
      white-space: nowrap;
    `
    btn.onclick = () => router.go(path)
    nav.appendChild(btn)
  })

  app.appendChild(nav)

  // Hauptbereich nach oben schieben damit Nav nicht überlappt
  app.style.paddingBottom = '40px'
}
