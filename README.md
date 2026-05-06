# Kopfsachen

Psychosoziale Präventions-App für Jugendliche ab 16. Verhaltenstherapeutische Übungen, emotionale Selbstwirksamkeit, 8 Einheiten à 45 min.

> **Quelle des Konzepts:** `Aktuelles Konzept zu Aktion Mensch.docx` + `Kopfsachen_Screen_Flowchart.pdf`. Bei Konflikt zwischen Code und Konzept gewinnt das Konzept-PDF.

---

## Inhaltsverzeichnis

- [Konzept-Kurzfassung](#konzept-kurzfassung)
- [Tech-Stack](#tech-stack)
- [Repo-Struktur](#repo-struktur)
- [Lokale Entwicklung](#lokale-entwicklung)
- [Strapi-CMS](#strapi-cms)
- [Deployment](#deployment)
- [Für Content-Editor:innen (Kopfsachen e.V.)](#für-content-editorinnen-kopfsachen-ev)
- [Coding-Regeln](#coding-regeln)
- [Aktueller Status](#aktueller-status)

---

## Konzept-Kurzfassung

### Charaktere

| Name | Rolle |
|------|-------|
| **Evu** | App-Begleiterin ("Stimme der App"). Führt durchs Onboarding, leitet jede Kapitelphase ein/aus. Wächst mit Fortschritt im Kurs. |
| **Toni** | Hauptfigur der fiktiven Geschichte. User:in spielt Toni in Phase "Erleben". |
| **Neo** | Toni's verschollene:r Freund:in. Roter Faden über alle Kapitel. |
| **Manu** | Freund:in von Toni, "in sich ruhend". Taucht in Kapitel 1 auf. |
| **Mika** | Fallbeispiel im Onboarding-Fragebogen (Stigma-Items). |
| **Psycholog\*in** | Nur im Video der Phase "Informieren". |

### 8 Kapitel

| # | Titel | Untertitel |
|---|-------|------------|
| 1 | **Ein Moment nur für dich** | Ankommen und durchatmen *(einziges ausgespieltes Kapitel)* |
| 2 | Wie geht es dir? Danke gut. | Gefühle wahrnehmen und verstehen |
| 3 | Unter Druck | Mit Stress umgehen |
| 4 | Früh merken, wenn's zu viel wird | Deine Warnsignale verstehen |
| 5 | Gut zu dir sein | Selbstmitgefühl statt Selbstkritik |
| 6 | Was will ich eigentlich? | Orientierung und Richtung finden |
| 7 | Was trägt dich? | Ressourcen stärken |
| 8 | Dein Weg | Recap und langfristig am Ball bleiben |

Kapitel 2–8 sind **1 Woche nach Abschluss des Vorkapitels** freigeschaltet (Zeitgate).

### 5 Phasen je Kapitel

| Phase | Dauer | Inhalt | Screen-Typ |
|-------|-------|--------|------------|
| 1. Ankommen | 5–10 min | Evu leitet ein | Interaktionsfenster |
| 2. Eine Geschichte erleben | 5–10 min | Toni + NPCs | Novel/Interaktionsfenster |
| 3. Einordnen und informieren | 5 min | Psycholog\*in-Video | Video Screen + Evu rahmt ein |
| 4. Üben und selbst aktiv werden | 10–20 min | Übungen, Notizbuch | Übungskarte / Content Screen / Cave |
| 5. In deinen Alltag bringen | 5 min | Wenn-Dann-Plan via Evu | Content Screen |

### Onboarding (einmalig vor Kapitel 1)

Start → Evu Willkommen → Hilfebedürftigkeits-Abfrage → Kopfsachen-Vorstellung + Video → Zeitabfrage (45 min) → **Prä-Fragebogen 14 Fragen** (inkl. Mika-Fallbeispiel + Zukunftsängste) → Hilfeseite zeigen → Wünsche abfragen (Multi-Select) → Kursstruktur-Vorstellung → Kapitelauswahl.

### Zertifizierungsvorgabe

Kein Zurück-Button im Kursverlauf. "Zurück" nur, wenn ein Kapitel erneut besucht wird.

---

## Tech-Stack

| Was | Technologie |
|-----|-------------|
| **Frontend** | Vanilla JS + Vite (kein Framework) |
| **CMS** | Strapi Cloud (v5) |
| **Spielstand** | IndexedDB via `frontend/src/store.js` (kein localStorage) |
| **Styling** | Reines CSS, Custom Properties in `frontend/styles/main.css` |
| **Routing** | Hash-Router in `frontend/src/router.js` |
| **Frontend-Hosting** | Netlify (auto-deploy bei Push auf `main`) |
| **CMS-Hosting** | Strapi Cloud |

---

## Repo-Struktur

```
kopfsachen-kurs-game/
├── frontend/                       # Vite + Vanilla JS
│   ├── src/
│   │   ├── app.js                  # Einstiegspunkt + Router-Setup
│   │   ├── router.js               # Hash-basierter Router
│   │   ├── api.js                  # Strapi-Client (mit 4s Timeout)
│   │   ├── store.js                # IndexedDB: Progress, Cave, Settings
│   │   ├── screens/                # Ein Screen = eine Datei
│   │   │   ├── SplashScreen.js
│   │   │   ├── HomeScreen.js       # 2 Zustände (initial / nach Kapitel 1)
│   │   │   ├── ChaptersScreen.js   # 8 Kapitel mit Zeitgate
│   │   │   ├── NovelScreen.js      # Dialog-Engine (Likert, Trigger, Avatar)
│   │   │   ├── ContentScreen.js    # Energie-Swipe, Wenn-Dann, Wünsche
│   │   │   ├── CaveScreen.js       # Innerer sicherer Ort
│   │   │   ├── ExerciseScreen.js   # Box-Atmung + Audio-Übungen
│   │   │   ├── VideoScreen.js
│   │   │   ├── ToolboxScreen.js    # Selfcare-Schachtel
│   │   │   ├── HilfsangeboteScreen.js
│   │   │   └── KopfsachenScreen.js
│   │   ├── components/
│   │   │   ├── TopMenu.js          # Home/K-Logo/Hilfsangebote/Progress
│   │   │   ├── CharacterAvatar.js  # SVG-Platzhalter je Speaker
│   │   │   └── BoxAtmung.js        # Atemübungs-Animation
│   │   └── data/                   # Demo-Daten als Fallback
│   │       ├── onboarding.js       # 14-Fragen-Sequenz mit Evu
│   │       ├── kapitel-1.js        # Fitnessstudio/Manu-Story
│   │       └── exercises-meta.js   # Übungs-Metadaten + CHAPTER_EXERCISES
│   ├── styles/main.css             # Alle Styles (CSS-Variablen)
│   ├── design-refs/                # 26 Wireframe-PNGs (Konzept-Referenz)
│   ├── .env.example                # → kopieren nach .env.local
│   └── vite.config.js
│
├── cms/                            # Strapi v5 Projekt
│   ├── src/
│   │   ├── api/                    # Content-Type Schemas
│   │   │   ├── chapter/
│   │   │   ├── dialog-scene/
│   │   │   ├── dialog-node/
│   │   │   ├── exercise/
│   │   │   ├── cave-asset/
│   │   │   ├── help-resource/
│   │   │   ├── video-content/
│   │   │   ├── questionnaire-question/
│   │   │   ├── energie-aktivitaet/
│   │   │   └── wenn-dann-situation/
│   │   └── components/dialog/      # choice.json
│   ├── seed/
│   │   ├── data/                   # JSON-Quelldaten für Strapi
│   │   │   ├── chapters.json
│   │   │   ├── help-resources.json
│   │   │   ├── questionnaire-questions.json
│   │   │   ├── energie-aktivitaeten.json
│   │   │   ├── wenn-dann-situations.json
│   │   │   └── exercises.json
│   │   └── README.md
│   └── scripts/seed.js             # Idempotenter Upsert nach Strapi
│
├── README.md                       # ← du bist hier
├── CLAUDE.md                       # Anweisungen für KI-Assistenten
├── netlify.toml                    # Build-Config für Netlify
└── Aktuelles Konzept zu Aktion Mensch.docx  # Quelle der Wahrheit
```

---

## Lokale Entwicklung

### Frontend

```bash
cd frontend
cp .env.example .env.local
# In .env.local eintragen:
#   VITE_STRAPI_URL   = https://great-duck-fb760ac22d.strapiapp.com
#   VITE_STRAPI_TOKEN = read-only Token aus Strapi-Admin
npm install
npm run dev          # → http://localhost:3000
```

Build-Test:
```bash
npm run build        # Vite-Build → dist/
```

### Strapi (lokal optional)

```bash
cd cms
cp .env.example .env
# Generiere Secrets, z.B.: openssl rand -base64 32
npm install
npm run develop      # → http://localhost:1337/admin
```

Lokales Strapi nutzt SQLite in `cms/.tmp/data.db`.

### Spielstand zurücksetzen

In der laufenden App:
- **Kopfsachen-Menü** → "Spielstand zurücksetzen" → bestätigen
- Lädt die App komplett frisch.

Alternativ: Browser-DevTools → Application → IndexedDB → `kopfsachen` löschen.

---

## Strapi-CMS

### Was wo lebt

- **Schema** (Content-Types, Felder, Enums) → Code im Repo unter `cms/src/api/*/content-types/*/schema.json`. Änderungen werden bei Push auf `main` automatisch von Strapi Cloud deployed.
- **Inhalte** (Texte, Bilder, Übungen) → Strapi-Admin-UI ODER Seed-Skript.
- **Single Source of Truth für Initialdaten** → `cms/seed/data/*.json`.

### Seed laufen lassen

Damit alle Initialdaten in Strapi landen:

```bash
cd cms
STRAPI_URL=https://great-duck-fb760ac22d.strapiapp.com \
STRAPI_API_TOKEN=<full-access-token> \
npm run seed
```

Optional: nur einzelne Content-Types
```bash
npm run seed -- --only=chapters,exercises
```

Dry-Run (schaut nur, schreibt nicht):
```bash
npm run seed:dry
```

Das Skript ist idempotent: vorhandene Einträge (gefunden via Unique-Feld wie `slug` oder `questionId`) werden aktualisiert, neue angelegt. Mehrfaches Ausführen ändert nichts, solange die Quelldaten gleich bleiben.

### API-Token erstellen

Strapi-Admin → **Settings → API Tokens → Create new API Token**:
- Type: **Full access** (für Seed-Skript) oder **Read-only** (für Frontend in Production)
- Duration: 30 days oder unlimited

---

## Deployment

| Komponente | Wie | Trigger |
|-----------|------|---------|
| **Frontend** | Netlify auto-build aus `frontend/` (siehe `netlify.toml`) | Push auf `main` |
| **CMS-Schema** | Strapi Cloud auto-deploy | Push auf `main` |
| **CMS-Inhalte** | Im Admin-Panel oder per `npm run seed` | Manuell |

### Netlify

- Site verknüpft mit dem Repo `uncannyJulia/kopfsachen-kurs-game`
- `netlify.toml`:
  ```toml
  [build]
    base = "frontend"
    command = "npm run build"
    publish = "dist"
  ```
- **Env-Vars** im Netlify-Dashboard setzen:
  - `VITE_STRAPI_URL`
  - `VITE_STRAPI_TOKEN` (read-only)

### Strapi Cloud

- Project verknüpft mit dem Repo `uncannyJulia/kopfsachen-kurs-game`, Branch `main`
- Build wird automatisch nach Push getriggert
- Bei Schema-Änderung kann das Admin-Panel kurz Cache-Probleme zeigen → **Hard-Reload** (Cmd/Ctrl+Shift+R)

---

## Für Content-Editor:innen (Kopfsachen e.V.)

Inhalte können direkt im Strapi-Admin-Panel editiert werden:

**URL:** https://great-duck-fb760ac22d.strapiapp.com/admin

**Was du dort findest und ändern kannst:**

| Content-Type | Inhalt |
|---|---|
| **Chapter** | Titel, Untertitel, Beschreibung der 8 Kapitel |
| **Exercise** | Übungs-Title, Beschreibung, Anleitungstext, Audio-Datei |
| **Help Resource** | Anlaufstellen (Krisenchat, JugendNotmail, …) |
| **Questionnaire Question** | Fragen + Antwort-Skalen für den Prä-Fragebogen |
| **Energie Aktivitaet** | Liste der 17 Aktivitäten für die Energie-Reflexion |
| **Wenn-Dann Situation** | Vorgefertigte "Wenn …"-Sätze für den Plan |
| **Cave Asset** | Hintergründe, Sticker, Sounds für den inneren sicheren Ort |
| **Video Content** | Psychoedukations-Videos für Phase "Informieren" |
| **Dialog Scene / Node** | Dialoge mit Toni/Evu/Manu (komplexer — nur mit Dev-Support) |

**Wichtig:**
- Nach Änderung **"Save"** und **"Publish"** drücken — Drafts erscheinen nicht im Frontend.
- Wenn Strapi keinen Eintrag liefert, fällt die App auf **eingebaute Demo-Daten** zurück (siehe `frontend/src/data/`). Editierte Strapi-Daten überschreiben diese Demo-Daten automatisch.

---

## Coding-Regeln

> Detail siehe `CLAUDE.md`. Kurzfassung:

- **Vanilla JS, kein Framework.** Jeder Screen ist eine Funktion, die ein `HTMLElement` zurückgibt.
- **CSS Custom Properties** verwenden (`var(--accent)` statt `#7C3AED`).
- **Spielstand nur über `store.js`** (`getProgress`, `saveProgress`, `saveCourseData`, `unlockExercise`).
- **API-Calls nur über `api.js`** — nie direkt `fetch()` mit Strapi-URL.
- **Kein Zurück-Button** im Kursverlauf (Zertifizierungsvorgabe).
- **Bilder** in `frontend/design-refs/` sind **Wireframes**, nicht final.

### Dialog-Engine (NovelScreen)

Dialoge als `DialogNode[]`:

```js
{
  nodeId: 1,
  speaker: 'evu',         // evu | toni | neo | manu | psycholog | mika | user | narrator
  text: 'Hallo!',
  emotion: 'neutral',
  nextNodeId: 2,
  choices: [{ text: '...', nextNodeId: 3 }],
  likert: { questionId, questionText, emojis, labels, nextNodeId },
  triggerAction: 'open_exercise',  // optional
  triggerPayload: 'box-atmung',    // optional, slug für die Route
}
```

Trigger-Actions:
- `open_exercise` (+ Payload = Slug)
- `open_cave`
- `open_content` (+ Payload = `energie-reflexion` | `wenn-dann-plan` | `wuensche-auswahl`)
- `open_video` (+ Payload = Video-Slug)
- `open_hilfsangebote`
- `complete_onboarding`
- `complete_chapter`
- `exit_to_home`

---

## Aktueller Status

**Fertig:**
- 8-Kapitel-Struktur mit Zeitgate
- Onboarding-Flow mit 14-Fragen-Prä-Fragebogen (inkl. Mika-Fallbeispiel)
- Kapitel 1 inhaltlich ausgespielt: Story Toni/Manu, Box-Atmung, Cave (Innerer sicherer Ort), Audio-Übung, Energie-Swipe, Wenn-Dann-Plan, Abschluss
- TopMenu mit Progress-Bar
- Selfcare-Schachtel mit kennengelernten Übungen
- Strapi-Schemas + Seed-Skript (alle Initialdaten populiert)
- 26 Wireframe-Bilder als Design-Referenz

**Noch offen:**
- Echtes Character-Art (aktuell SVG-Platzhalter in `CharacterAvatar.js`)
- Echte Audio-Files für Übungen (Innerer sicherer Ort, Box-Atmung)
- Hintergrund-Fotos für Cave-Screen (aktuell solide Farben)
- Psycholog\*in-Video für Phase "Informieren" (aktuell Platzhalter)
- Handout-E-Mail nach Kapitel-Abschluss (braucht E-Mail-Backend)
- Kapitel 2–8 inhaltlich (aktuell nur Titel + Subtitle)
- Evu-Wachstum-Animation nach Kapitelabschluss (aktuell Trigger ohne Visual)

---

## Hilfe

| Problem | Lösung |
|---------|--------|
| Strapi-Admin lädt nicht (`Failed to fetch dynamically imported module`) | Hard-Reload: Cmd/Ctrl+Shift+R |
| App "Sequenz beendet" sofort beim Start | Spielstand zurücksetzen (Kopfsachen-Menü) |
| Keine Hilfsangebote sichtbar | Strapi prüfen oder Demo-Fallback nutzen (passiert automatisch) |
| Netlify-Build fehlgeschlagen | Lokal `cd frontend && npm run build` testen |
| Seed scheitert mit 400 "Invalid key" | Strapi-Cloud-Build noch nicht durch — warten + Hard-Reload |

Bei tieferen Problemen: `CLAUDE.md` enthält die technischen Details für KI-gestützte Bug-Suche.
