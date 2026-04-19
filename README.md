okay weiter# Kopfsachen

Psychosoziale Präventions-App für Jugendliche.

## Repo-Struktur

```
kopfsachen/
├── frontend/                  # Vite + Vanilla JS App
│   ├── src/
│   │   ├── screens/           # Ein Screen pro Datei
│   │   ├── api.js             # Strapi Cloud Client
│   │   ├── store.js           # IndexedDB Spielstand
│   │   └── router.js          # Hash-Router
│   ├── .env.example           # → kopieren zu .env.local
│   └── vite.config.js
│
├── cms/                       # Strapi Cloud Projekt
│   └── src/
│       ├── api/               # Content-Type Schemas
│       │   ├── chapter/
│       │   ├── dialog-scene/
│       │   ├── dialog-node/
│       │   ├── journal-page/
│       │   ├── exercise/
│       │   ├── cave-asset/
│       │   └── help-resource/
│       └── components/        # Wiederverwendbare Komponenten
│           ├── dialog/        # choice.json
│           └── journal/       # 6 Templates + sticker-placement
│
└── infra/                     # NixOS + Deployment
    ├── nixos/
    │   ├── configuration.nix
    │   └── flake.nix
    └── setup-server.sh
```

## Lokale Entwicklung

```bash
# Frontend
cd frontend
cp .env.example .env.local     # VITE_STRAPI_URL + TOKEN eintragen
npm install
npm run dev                    # → localhost:3000

# CMS (Strapi lokal)
cd cms
npm install
npm run develop                # → localhost:1337/admin
```

## Deployment

| Was | Wie | Wo |
|-----|-----|----|
| Frontend | `git push main` → GitHub Actions → rsync | Hetzner VPS (NixOS) |
| CMS Schemas | `git push main` → Strapi Cloud auto-deploy | Strapi Cloud |
| CMS Inhalte | Direkt im Strapi Cloud Admin | Strapi Cloud |

## GitHub Secrets (einmalig anlegen)

| Secret | Beschreibung |
|--------|-------------|
| `VITE_STRAPI_URL` | z.B. `https://kopfsachen.strapiapp.com` |
| `VITE_STRAPI_TOKEN` | Read-only API Token aus Strapi Cloud |
| `SSH_PRIVATE_KEY` | Ed25519 Key für Hetzner VPS |
| `SERVER_HOST` | IP des Hetzner VPS |
| `SERVER_USER` | `deploy` |
