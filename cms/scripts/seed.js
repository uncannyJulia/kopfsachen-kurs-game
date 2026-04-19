#!/usr/bin/env node
// cms/scripts/seed.js
//
// Idempotent Seed-Skript: populiert Strapi-Cloud mit Initialdaten aus cms/seed/data/*.json.
// Findet Einträge per Unique-Key (slug/questionId/name/text) und legt neu an oder aktualisiert.
//
// Usage:
//   STRAPI_URL=https://xxx.strapiapp.com STRAPI_API_TOKEN=... node cms/scripts/seed.js
//   node cms/scripts/seed.js --only=chapters,help-resources
//   node cms/scripts/seed.js --dry-run
//
// Env:
//   STRAPI_URL          — z.B. https://xxx.strapiapp.com
//   STRAPI_API_TOKEN    — API Token mit full-access oder custom (Content-Manager-Berechtigungen)

'use strict'

const fs = require('fs')
const path = require('path')

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337'
const API_TOKEN  = process.env.STRAPI_API_TOKEN

const argv = process.argv.slice(2)
const dryRun = argv.includes('--dry-run')
const only = (argv.find(a => a.startsWith('--only=')) || '').replace('--only=', '').split(',').filter(Boolean)

// ── Entity-Definitionen ─────────────────────────────────────
// key:        Name in der CLI (--only=key)
// file:       Quelldatei in cms/seed/data/
// endpoint:   Strapi-Plural-Pfad
// uniqueField: Feld, nach dem gesucht wird (upsert-Schlüssel)
const ENTITIES = [
  { key: 'chapters',                file: 'chapters.json',                endpoint: 'chapters',                uniqueField: 'slug' },
  { key: 'help-resources',          file: 'help-resources.json',          endpoint: 'help-resources',          uniqueField: 'name' },
  { key: 'questionnaire-questions', file: 'questionnaire-questions.json', endpoint: 'questionnaire-questions', uniqueField: 'questionId' },
  { key: 'energie-aktivitaeten',    file: 'energie-aktivitaeten.json',    endpoint: 'energie-aktivitaeten',    uniqueField: 'text' },
  { key: 'wenn-dann-situations',    file: 'wenn-dann-situations.json',    endpoint: 'wenn-dann-situations',    uniqueField: 'text' },
  { key: 'exercises',               file: 'exercises.json',               endpoint: 'exercises',               uniqueField: 'slug' },
]

// ── HTTP ────────────────────────────────────────────────────

function authHeaders() {
  if (!API_TOKEN) {
    console.error('✗ STRAPI_API_TOKEN fehlt. Bitte als Env-Variable setzen.')
    process.exit(1)
  }
  return {
    'Authorization': `Bearer ${API_TOKEN}`,
    'Content-Type': 'application/json',
  }
}

async function req(method, url, body) {
  const res = await fetch(url, {
    method,
    headers: authHeaders(),
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`${method} ${url} → ${res.status}: ${text}`)
  }
  if (res.status === 204) return null
  return res.json()
}

async function findByField(endpoint, field, value) {
  const url = `${STRAPI_URL}/api/${endpoint}?filters[${field}][$eq]=${encodeURIComponent(value)}&pagination[pageSize]=1&status=draft`
  const json = await req('GET', url)
  return (json && json.data && json.data[0]) || null
}

async function create(endpoint, data) {
  const url = `${STRAPI_URL}/api/${endpoint}`
  return req('POST', url, { data })
}

async function update(endpoint, documentId, data) {
  const url = `${STRAPI_URL}/api/${endpoint}/${documentId}`
  return req('PUT', url, { data })
}

// ── Seed-Logik ──────────────────────────────────────────────

async function seedEntity(entity) {
  const dataPath = path.join(__dirname, '..', 'seed', 'data', entity.file)
  if (!fs.existsSync(dataPath)) {
    console.log(`  → ${entity.key}: keine Datei ${entity.file}, überspringe`)
    return
  }
  const items = JSON.parse(fs.readFileSync(dataPath, 'utf8'))
  console.log(`\n▶ ${entity.key} (${items.length} Items)`)

  let created = 0, updated = 0, skipped = 0

  for (const item of items) {
    const keyValue = item[entity.uniqueField]
    if (!keyValue) {
      console.warn(`  ⚠ überspringe (kein ${entity.uniqueField}): ${JSON.stringify(item).slice(0, 80)}…`)
      skipped++
      continue
    }

    if (dryRun) {
      console.log(`  [dry-run] ${entity.uniqueField}=${keyValue}`)
      continue
    }

    try {
      const existing = await findByField(entity.endpoint, entity.uniqueField, keyValue)
      if (existing) {
        await update(entity.endpoint, existing.documentId, item)
        console.log(`  ✎ aktualisiert: ${keyValue}`)
        updated++
      } else {
        await create(entity.endpoint, item)
        console.log(`  + angelegt: ${keyValue}`)
        created++
      }
    } catch (e) {
      console.error(`  ✗ Fehler bei ${keyValue}: ${e.message}`)
      skipped++
    }
  }

  console.log(`  ${entity.key}: ${created} neu, ${updated} aktualisiert, ${skipped} übersprungen`)
}

async function main() {
  console.log(`Seed → ${STRAPI_URL}`)
  if (dryRun) console.log('(DRY RUN – keine Schreib-Requests)')
  if (only.length) console.log(`(nur: ${only.join(', ')})`)

  const entitiesToRun = only.length
    ? ENTITIES.filter(e => only.includes(e.key))
    : ENTITIES

  if (!entitiesToRun.length) {
    console.error('✗ Keine Entitäten ausgewählt. Verfügbar:', ENTITIES.map(e => e.key).join(', '))
    process.exit(1)
  }

  for (const entity of entitiesToRun) {
    try {
      await seedEntity(entity)
    } catch (e) {
      console.error(`\n✗ Fehler beim Seeden von ${entity.key}:`, e.message)
      process.exitCode = 1
    }
  }

  console.log('\n✓ Seed fertig.')
}

main()
