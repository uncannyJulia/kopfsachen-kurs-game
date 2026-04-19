# CLAUDE.md – Kopfsachen

Psychosoziale Präventions-App für Jugendliche (ab 16).
Verhaltenstherapeutische Übungen, emotionale Selbstwirksamkeit, 8 Einheiten à 45 min.

**Quelle des Konzepts:** `Aktuelles Konzept zu Aktion Mensch.pdf` + `Kopfsachen_Screen_Flowchart.pdf`.
Bei Konflikt zwischen Code und Konzept → Konzept-PDF ist die Wahrheit.

---

## Konzept-Kurzfassung

### Charaktere

| Name | Rolle |
|------|-------|
| **Evu** | App-Begleiterin ("Stimme der App"), führt durch Onboarding + leitet jede Kapitel-Phase ein/aus. Wächst mit Fortschritt. |
| **Toni** | Hauptfigur der fiktiven Geschichte. User spielt Toni in "Erleben". |
| **Neo** | Toni's verschollene:r Freund:in. Roter Faden über alle Kapitel. |
| **Manu** | Freund:in von Toni, "in sich ruhend". Taucht in Kapitel 1 auf. |
| **Psycholog*in** | Nur im Video der Phase "Informieren". |

Weitere Kapitel bringen weitere NPCs. Alte Charaktere **Noen** und **Furi** sind obsolet (→ Neo, Manu).

### 8 Kapitel (fest, mit Titeln)

1. **Ein Moment nur für dich** — Ankommen und durchatmen *(einziges ausgespieltes Kapitel)*
2. **Wie geht es dir? Danke gut.** — Mit dir selbst in Verbindung kommen
3. **Unter Druck** — Mit Stress umgehen
4. **Früh merken, wenn's zu viel wird** — Deine Warnsignale verstehen
5. **Deine größte Unterstützung: du selbst!** — Selbstmitgefühl statt Selbstkritik
6. **Was will ich eigentlich?** — Orientierung und Richtung finden
7. **Was trägt dich?** — Ressourcen stärken
8. **Dein Weg** — Recap und langfristig am Ball bleiben

Kapitel 2–8 sind **1 Woche nach Abschluss** des Vorkapitels freigeschaltet (Zeitgate).

### 5 Phasen je Kapitel

| Phase | Dauer | Inhalt |
|-------|-------|--------|
| 1. Ankommen | 5–10 min | Evu leitet ein (Interaktionsfenster) |
| 2. Eine Geschichte erleben | 5–10 min | Toni + NPCs (Novel/Interaktionsfenster) |
| 3. Einordnen und informieren | 5 min | Psycholog*in-Video (Video Screen, Evu rahmt ein) |
| 4. Üben und selbst aktiv werden | 10–20 min | Übungen, Notizbuch, Content Screen |
| 5. In deinen Alltag bringen | 5 min | Transfer/Wenn-Dann-Plan via Evu |

### Onboarding (einmalig vor Kapitel 1)

Start → Evu Willkommen → Hilfebedürftigkeits-Abfrage → Kopfsachen-Vorstellung + Video → Zeitabfrage (45 min) → **Prä-Fragebogen 12 Fragen** (inkl. Fallbeispiel "Mika" für Stigma) → Hilfe-Seite zeigen → Wünsche abfragen → Kursstruktur-Vorstellung → Kapitelauswahl.

### Zertifizierungsvorgabe

Kein Zurück-Button im Kursverlauf. "Zurück" nur, wenn Kapitel erneut besucht wird (nach Abschluss).

---

## Stack

| Was | Technologie |
|-----|-------------|
| Frontend | Vanilla JS + Vite (kein Framework) |
| CMS | Strapi Cloud (Schemas im Repo unter `cms/`) |
| Spielstand | IndexedDB via `src/store.js` (kein localStorage) |
| Styling | Reines CSS, Custom Properties in `styles/main.css` |
| Routing | Hash-Router in `src/router.js` |
| Hosting | Hetzner VPS (NixOS), Deploy via GitHub Actions |

---

## Projektstruktur

```
frontend/
├── index.html
├── vite.config.js
├── styles/main.css          ← Alle CSS-Variablen & globale Komponenten
└── src/
    ├── app.js               ← Einstiegspunkt, Router-Setup
    ├── router.js            ← Hash-basierter Router
    ├── api.js               ← Strapi Cloud Client (import.meta.env)
    ├── store.js             ← IndexedDB: Spielstand, Cave, Questionnaire
    └── screens/             ← Ein Screen = eine Datei
        ├── NovelScreen.js
        ├── CaveScreen.js
        ├── ExerciseScreen.js
        └── ...

cms/src/
├── api/                     ← Strapi Content-Type Schemas (nicht anfassen)
└── components/              ← Strapi Komponenten-Schemas (nicht anfassen)
```

---

## Coding-Regeln

**Vanilla JS – kein Framework.**
Kein React, kein Vue, kein jQuery. Jeder Screen ist eine Funktion die ein `HTMLElement` zurückgibt.

```js
// ✅ Richtig
export function MyScreen() {
  const el = document.createElement('div')
  el.className = 'screen'
  el.innerHTML = `...`
  return el
}

// ❌ Falsch – kein JSX, keine Komponenten-Bibliotheken
```

**CSS Custom Properties verwenden.**
Farben, Abstände und Radii immer über Variablen aus `styles/main.css`:
```css
/* ✅ */
color: var(--accent);
padding: var(--space-md);

/* ❌ */
color: #7C3AED;
padding: 16px;
```

**Kein direktes DOM-Schreiben von Spielstand.**
Immer über `store.js`:
```js
import { saveProgress, getProgress } from '../store.js'
```

**API-Calls immer über `api.js`.**
Nie direkt `fetch()` mit Strapi-URL aufrufen.

---

## Screens

Jeder Screen:
- exportiert eine Funktion `export function XyzScreen()`
- gibt ein `div.screen` Element zurück
- ist in `src/screens/XyzScreen.js` definiert
- wird in `src/app.js` registriert

Aktuelle Screens und ihre Routes:

| Screen | Route | Status |
|--------|-------|--------|
| SplashScreen | `#/` | Stub |
| HomeScreen | `#/home` | Stub (2 Zustände: initial / nach Kapitel 1) |
| ChaptersScreen | `#/chapters` | Stub (8 Kapitel, Zeitgate) |
| NovelScreen | `#/novel/:slug` | Implementiert (Dialog-Engine mit Likert + Name-Input) |
| ContentScreen | `#/content/:slug` | **TODO** (Figur klein, Info-Blöcke bauen sich auf) |
| VideoScreen | `#/video/:slug` | **TODO** (Controls-Overlay, Auto-Close bei Ende) |
| CaveScreen | `#/cave` | Stub (Innerer sicherer Ort, 3 Tabs + Sticker) |
| ExerciseScreen | `#/exercise/:slug` | Stub (Übungskarte mit Audio + Anleitung) |
| ToolboxScreen | `#/toolbox` | Stub (= Selfcare-Schachtel) |
| HilfsangeboteScreen | `#/hilfsangebote` | Stub (früher: HelpScreen) |
| KopfsachenScreen | `#/kopfsachen` | **TODO** (Kontakt/Credits/FAQ Submenu) |
| QuestionnaireScreen | `#/questionnaire` | Stub (12 Fragen, inkl. Mika-Fallbeispiel) |

### Screen-Typen (Formenspiel)

- **Interaktionsfenster** — Novel-artig mit Evu oder Toni, Sprechblase + Weiter/Options. Für Ankommen, Erleben, Transfer.
- **Content Frame / Content Screen** — Figur klein oben rechts, Hauptfläche für Info-Blöcke/Grafiken die sich aufbauen. Für Kursstruktur-Erklärung, Notizbuch, Wenn-Dann-Plan.
- **Video Screen** — Controls-Overlay, Auto-Close bei Video-Ende. Für Psycholog*in-Talking-Head in "Informieren".
- **Übungskarte** — Intro + Audio + Anleitung + Info-Tabs + Abschlussabfrage (Smiley 1-5). Für geführte Übungen.
- **Cave / Innerer sicherer Ort** — Gestaltungs-Screen mit 3 Tabs (Hintergründe/Elemente/Athmo) und Sticker-Mechanik.

### Globales UI

- **TopMenu** (`components/TopMenu.js`) — immer sichtbar während Kurs. Enthält: Home-Icon, Kopfsachen-K-Logo, Hilfsangebote-Button, Progress-Bar "Dein Fortschritt".
- **Kein Zurück-Button** im Kursverlauf.

---

## Dialog-Engine (NovelScreen)

Dialoge kommen als `DialogNode[]` aus Strapi. Jeder Node:

```js
{
  nodeId: 1,
  speaker: 'evu',         // evu | toni | neo | manu | user | narrator
  text: 'Hallo!',
  emotion: 'neutral',     // neutral | happy | sad | surprised | thinking
  nextNodeId: 2,          // null = Ende der Szene
  choices: [              // nur bei Verzweigungen
    { text: 'Ja!', nextNodeId: 3 },
    { text: 'Nein', nextNodeId: 4 }
  ]
}
```

- `speaker === 'user'` ohne `choices` → Weiter-Button
- `speaker === 'user'` mit `choices` → mehrere Buttons
- `nextNodeId === null` → Szene beendet, nächste Aktion auslösen
- **evu** ist die App-Stimme; Interaktionsfenster nutzt Evu in Phasen Ankommen/Informieren-Rahmen/Transfer
- **toni/neo/manu** sind fiktive Charaktere im "Erleben"

---

## Spielstand (IndexedDB)

```js
import { getProgress, saveProgress, getCave, saveCave } from '../store.js'

// Lesen
const progress = await getProgress()

// Schreiben
await saveProgress({
  currentChapter: 'kapitel-1',
  currentNodeId: 5,
  completedChapters: ['intro']
})
```

---

## Lokale Entwicklung

```bash
cd frontend
cp .env.example .env.local
# VITE_STRAPI_URL=http://localhost:1337 eintragen
npm install
npm run dev    # localhost:3000
```

Im Browser ist bei `localhost` eine Dev-Navigationsleiste sichtbar (alle Screens direkt anklickbar).

---

## Deployment

```bash
git push origin main
# → GitHub Actions baut Vite und deployt via rsync auf Hetzner
# → NixOS-Rebuild nur wenn Commit "[nixos]" enthält
```

---

## Infrastruktur (NixOS)

```
infra/
├── nixos/
│   ├── configuration.nix   ← Nginx, ACME/Let's Encrypt, deploy-User, Firewall
│   └── flake.nix           ← NixOS 24.11 Flake
├── setup-server.sh         ← Einmaliges Setup auf frischem Hetzner VPS
└── README.md               ← Schritt-für-Schritt Anleitung
```

**Einmaliges Server-Setup:**
```bash
ssh root@HETZNER_IP
bash <(curl -s https://raw.githubusercontent.com/DEIN_USERNAME/kopfsachen/main/infra/setup-server.sh)
```

**NixOS-Config ändern:**
```bash
# Änderung committen mit [nixos] im Message:
git commit -m "feat: update nginx headers [nixos]"
git push
# → GitHub Actions führt nixos-rebuild switch aus
```

**Wichtige Anpassungen vor erstem Deploy** (in `infra/nixos/configuration.nix`):
- Domain ersetzen: `kopfsachen.example.com` → echte Domain
- E-Mail für ACME: `deine@email.de` → echte E-Mail
- SSH Public Key des GitHub Actions Runners eintragen

---

## Was noch fehlt / Prioritäten (Stand 2026-04-19)

**Welle 1 — Fundament**
1. Charakter-Rename: `noen→neo`, `furi→manu`, `evu` neu (SPEAKER_CONFIG + DEMO_NODES)
2. **TopMenu**-Komponente (Home, Kopfsachen-Logo, Hilfsangebote, Progress Bar)
3. Menü-Rename: `HelpScreen→HilfsangeboteScreen`, neuer `KopfsachenScreen` (Submenu Kontakt/Credits/FAQ)

**Welle 2 — Onboarding + Kapitelauswahl**
4. **SplashScreen** – einfacher Loader/Entry
5. **HomeScreen** – 2 Zustände (initial: Start/Hilfsangebote vs. nach Kapitel 1: + Kurs fortsetzen, Kapitelauswahl, Selfcare-Schachtel, Kopfsachen)
6. **Onboarding-Flow** als Evu-Dialogszene (Willkommen → Hilfebedürftigkeit → Kopfsachen-Video → Zeit → 12-Fragen-Fragebogen → Wünsche → Kursstruktur)
7. **ChaptersScreen** – 8 Kapitel laden, Zeitgate (1 Woche), Fortschritt anzeigen

**Welle 3 — Kapitel 1 Inhalt**
8. NovelScreen `DEMO_NODES` auf neue Story umstellen (Fitnessstudio-Szene mit Manu statt Furi-Szene)
9. **Box-Atmung**-Übung (Animation, nicht 4-7-8)
10. **Innerer sicherer Ort (Cave)** — Tabs + Sticker
11. **Übung "Innerer sicherer Ort" (Vorstellung)** — Übungskarte mit Audio
12. **Energie-Fresser/Geber-Swipe** (Reflexion Erholungsräume)
13. **Wenn-Dann-Plan** (Transfer)

**Welle 4 — CMS + Polish**
14. Strapi-Schemas an neue Charaktere/Kapitel/Übungen anpassen
15. ContentScreen + VideoScreen
16. Handout-E-Mail-Integration (Abschluss-Mail nach Kapitel)
