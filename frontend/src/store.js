// store.js
// Lokaler Spielstand via IndexedDB.
// Kein localStorage – robuster, kein 5MB-Limit.
// API ist async/await, einfach zu benutzen.

const DB_NAME    = 'kopfsachen'
const DB_VERSION = 1

let _db = null

function openDB() {
  if (_db) return Promise.resolve(_db)

  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)

    req.onupgradeneeded = (e) => {
      const db = e.target.result
      // Spielstand
      if (!db.objectStoreNames.contains('progress')) {
        db.createObjectStore('progress', { keyPath: 'id' })
      }
      // Cave-Konfiguration
      if (!db.objectStoreNames.contains('cave')) {
        db.createObjectStore('cave', { keyPath: 'id' })
      }
      // Fragebögen
      if (!db.objectStoreNames.contains('questionnaire')) {
        const qs = db.createObjectStore('questionnaire', { keyPath: 'id', autoIncrement: true })
        qs.createIndex('type', 'type')
      }
      // Einstellungen
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'id' })
      }
    }

    req.onsuccess  = (e) => { _db = e.target.result; resolve(_db) }
    req.onerror    = (e) => reject(e.target.error)
  })
}

function tx(storeName, mode = 'readonly') {
  return openDB().then(db => db.transaction(storeName, mode).objectStore(storeName))
}

function idbGet(store, key) {
  return tx(store).then(s => new Promise((res, rej) => {
    const r = s.get(key); r.onsuccess = () => res(r.result); r.onerror = rej
  }))
}

function idbPut(store, value) {
  return tx(store, 'readwrite').then(s => new Promise((res, rej) => {
    const r = s.put(value); r.onsuccess = () => res(); r.onerror = rej
  }))
}

// ── Spielstand ───────────────────────────────────────────────

const DEFAULT_PROGRESS = {
  id: 'main',
  currentChapter: null,
  currentNodeId: 0,
  completedChapters: [],
  chapterCompletions: {},  // { [slug]: ISO-Timestamp } — für Zeitgate
  lastActive: null,
}

export async function getProgress() {
  const p = await idbGet('progress', 'main')
  return p ?? { ...DEFAULT_PROGRESS }
}

export async function saveProgress(patch) {
  const current = await getProgress()
  await idbPut('progress', { ...current, ...patch, lastActive: new Date().toISOString() })
}

export async function completeChapter(slug) {
  const p = await getProgress()
  const completed = [...new Set([...p.completedChapters, slug])]
  const completions = { ...(p.chapterCompletions || {}), [slug]: new Date().toISOString() }
  await saveProgress({ completedChapters: completed, chapterCompletions: completions })
}

// ── Cave-Konfiguration ────────────────────────────────────────

const DEFAULT_CAVE = {
  id: 'main',
  backgroundKey: null,
  stickerKeys: [],
  soundKey: null,
}

export async function getCave() {
  const c = await idbGet('cave', 'main')
  return c ?? { ...DEFAULT_CAVE }
}

export async function saveCave(patch) {
  const current = await getCave()
  await idbPut('cave', { ...current, ...patch })
}

// ── Einstellungen ─────────────────────────────────────────────

const DEFAULT_SETTINGS = {
  id: 'main',
  username: null,
  onboardingDone: false,
  language: 'de',
}

export async function getSettings() {
  const s = await idbGet('settings', 'main')
  return s ?? { ...DEFAULT_SETTINGS }
}

export async function saveSettings(patch) {
  const current = await getSettings()
  await idbPut('settings', { ...current, ...patch })
}

// ── Kapitel-spezifische Daten (z.B. Energie-Reflexion, Wenn-Dann-Plan) ──

export async function saveCourseData(key, value) {
  const p = await getProgress()
  const courseData = { ...(p.courseData || {}), [key]: value }
  await saveProgress({ courseData })
}

export async function getCourseData(key) {
  const p = await getProgress()
  return (p.courseData || {})[key]
}

// ── Fragebögen ────────────────────────────────────────────────

export async function saveQuestionnaire(type, answers) {
  const store = await tx('questionnaire', 'readwrite')
  return new Promise((res, rej) => {
    const r = store.add({ type, answers, answeredAt: new Date().toISOString() })
    r.onsuccess = res; r.onerror = rej
  })
}
