# Seed – Kopfsachen

Initialdaten werden aus `cms/seed/data/*.json` in Strapi populiert.

## Nutzung

```bash
# Lokal (Strapi läuft auf localhost:1337)
STRAPI_API_TOKEN=xxx npm run seed

# Strapi Cloud
STRAPI_URL=https://kopfsachen.strapiapp.com STRAPI_API_TOKEN=xxx npm run seed

# Nur bestimmte Content-Types
npm run seed -- --only=chapters,help-resources

# Dry-Run (zeigt nur was passieren würde)
npm run seed:dry
```

## API-Token erstellen

Strapi-Admin → **Settings → API Tokens → Create new API Token**
- Token type: `Full access` (oder `Custom` mit Read/Create/Update auf alle relevanten Content-Types)
- Duration: `Unlimited` für Dev, `1 month` für Cloud

## Wie funktioniert's

Idempotent. Für jeden Eintrag wird per eindeutigem Feld geprüft, ob er schon existiert:

| Content-Type | Unique-Feld |
|---|---|
| chapters | `slug` |
| help-resources | `name` |
| questionnaire-questions | `questionId` |
| energie-aktivitaeten | `text` |
| wenn-dann-situations | `text` |
| exercises | `slug` |

Existiert er: Update. Existiert er nicht: Create.

Mehrfaches Ausführen ändert nichts am Strapi-Zustand, außer die Quelldaten haben sich geändert.

## Dateien bearbeiten

Die JSON-Dateien in `data/` sind die Source of Truth. Kunden editieren im Strapi-Admin, aber Änderungen am Repo überschreiben wieder, wenn seed.js ausgeführt wird.

**Deshalb:** seed.js wird **nicht automatisch im Deploy** gelaufen, sondern nur auf Anforderung (`npm run seed`).
