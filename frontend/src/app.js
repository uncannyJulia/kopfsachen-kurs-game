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
import { ensureUiTextsLoaded } from './data/ui-texts.js'

// UI-Texte aus Strapi vorladen — fire and forget. Screens ohne Strapi-Daten
// fallen automatisch auf hartcodierte Fallbacks zurück.
ensureUiTextsLoaded()

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

router.start()
