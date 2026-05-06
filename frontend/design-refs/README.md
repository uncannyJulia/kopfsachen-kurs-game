# Design References – Wireframes aus dem Konzept-Dokument

Diese Bilder sind **Wireframes/Mockups** aus `Aktuelles Konzept zu Aktion Mensch.docx` (Version 2026-05-04). Sie dienen als visuelle Referenz für die Frontend-Entwicklung — keine fertigen Assets.

Beim Vite-Build werden die Dateien **nicht** mit ausgeliefert (`design-refs/` liegt nicht in `public/` und wird nicht aus `src/` importiert).

## Mapping

| Wireframe | Beschreibung | Implementiert in |
|-----------|--------------|------------------|
| `topbar-spec.png` | Top-Menu (Home/K-Logo/Hilfsangebote/Progress) | `components/TopMenu.js` |
| `chapters-evu-list.png` | Onboarding-Kursstruktur mit Evu | `data/onboarding.js` Node 91-93 |
| `chapters-locked.png` | Kapitelauswahl mit Lock-Icons | `screens/ChaptersScreen.js` |
| `onboarding-mika-flow.png` | Mika-Fallbeispiel-Sequenz (Frage 4-6) | `data/onboarding.js` Node 54-59 |
| `toni-fitnessstudio-1.png` | Toni vor dem Fitnessstudio (Denkblasen + Pill-Choices) | `screens/NovelScreen.js` C4-Pass |
| `toni-fitnessstudio-2.png` | Toni Stress-Eskalation | `screens/NovelScreen.js` C4-Pass |
| `box-atmung-card-with-toggles.png` | Box-Atmung lila Card mit Audio + Toggles | `screens/ExerciseScreen.js` C6-Pass |
| `box-atmung-fullscreen.png` | Box-Atmung Vollbild-Variante | `screens/ExerciseScreen.js` C6-Pass |
| `cave-three-states.png` | Innerer sicherer Ort: leer / Sticker-Auswahl / fertig | `screens/CaveScreen.js` C5-Pass |
| `innerer-ort-uebungskarte.png` | Übungskarte Innerer sicherer Ort | `screens/ExerciseScreen.js` C7-Pass |
| `energie-buttons-variant1.png` | Energie-Sortierung Buttons (Fresser/skip/Geber farbig) | `screens/ContentScreen.js` C8-Pass |
| `energie-buttons-variant2.png` | Energie-Sortierung Buttons (alle gleichwertig outlined) | `screens/ContentScreen.js` C8-Pass |
| `energie-buttons-variant3.png` | Energie-Sortierung „ist nicht passiert" (Variante) | `screens/ContentScreen.js` C8-Pass |
| `energie-rating-fresser.png` | Skala 1-5 nach Fresser-Klick (X-Badge, fliegt links) | `screens/ContentScreen.js` C8-Pass |
| `energie-rating-geber.png` | Skala 1-5 nach Geber-Klick (Heart-Badge, fliegt rechts) | `screens/ContentScreen.js` C8-Pass |
| `energie-auswertung-1.png` | Auswertung Fresser-Liste mit Eingabe-Pop-Up | `screens/ContentScreen.js` C8-Pass |
| `energie-auswertung-2.png` | Auswertung Geber-Liste mit Eingabe-Pop-Up | `screens/ContentScreen.js` C8-Pass |
| `energie-final-list-1.png` | Sortierte Endliste Fresser+Geber | `screens/ContentScreen.js` C8-Pass |
| `energie-final-list-2.png` | Sortierte Endliste (alternative Darstellung) | `screens/ContentScreen.js` C8-Pass |
| `wenn-dann-flow.png` | Wenn-Dann-Plan: Intro → Multi-Select → mehrere Plan-Karten | `screens/ContentScreen.js` C9-Pass |
| `wenn-dann-result-cards.png` | Plan-Karten mit „Anders formulieren"-Option | `screens/ContentScreen.js` C9-Pass |
| `evu-standard-screen.png` | Standard-Layout für Evu-Erklärungen (Text oben, Evu unten) | `screens/NovelScreen.js` Evu-Speaker |
| `abschluss-evu-knospt.png` | Abschluss-Screen + Evu-Wachstums-Animation | `screens/NovelScreen.js` C10-Pass |
| `extra-image5.png`, `extra-image6.png`, `extra-image15.png` | Zusatz-Bilder (z.B. Wünsche-Layout, Onboarding-Detail) | bei Bedarf |

## Charakter-Designs

- **Evu**: hairy/fuzzy potato-like creature, freundliches Gesicht, in `chapters-evu-list.png` und `evu-standard-screen.png` zu sehen — gleiche Illustration wie Mika.
- **Toni**: schwarze Silhouette mit Katzenohren, in `toni-fitnessstudio-*.png` zu sehen.
- **Manu**: kommt im aktuellen Wireframe-Set nicht eindeutig vor — wahrscheinlich vergleichbar zu Toni-Stil oder eigener Charakter, TBD.
- **Mika**: gleicher Stil wie Evu (hairy creature) — siehe `onboarding-mika-flow.png`.

## Source

Originale aus `Aktuelles Konzept zu Aktion Mensch.docx` (eingebettete `word/media/image*.png`). Die Bilder werden hier eingecheckt damit:

1. Designer:innen einen versionierten Snapshot haben
2. Customer (Kopfsachen e.V.) im Repo nachsehen kann
3. Diese Datei als Single Source für „Wie sollte Screen X aussehen?" dient

Bei Konzept-Update: docx Bilder neu extrahieren und Files überschreiben (Namen beibehalten).
