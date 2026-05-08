// store.js
// Lokaler Spielstand via IndexedDB.
// Kein localStorage – robuster, kein 5MB-Limit.
// API ist async/await, einfach zu benutzen.

const DB_NAME    = 'kopfsachen'
// Bei jedem Bump werden bestehende Daten ALLER User komplett geplättet —
// nutze das, wenn das Datenmodell breaking inkompatibel zum vorherigen Stand ist.
//   Version 1 → 2 (2026-05-04): Reset wegen Konzept-v2-Umbau (Slugs/Nodes geändert)
const DB_VERSION = 2

let _db = null

function _openOnce(timeoutMs) {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    const failsafe = setTimeout(() => reject(new Error('IndexedDB-Open-Timeout')), timeoutMs)
    const done = (fn) => (e) => { clearTimeout(failsafe); fn(e) }

    req.onupgradeneeded = (e) => {
      const db = e.target.result
      Array.from(db.objectStoreNames).forEach(name => db.deleteObjectStore(name))
      db.createObjectStore('progress', { keyPath: 'id' })
      db.createObjectStore('cave', { keyPath: 'id' })
      const qs = db.createObjectStore('questionnaire', { keyPath: 'id', autoIncrement: true })
      qs.createIndex('type', 'type')
      db.createObjectStore('settings', { keyPath: 'id' })
    }

    req.onsuccess  = done((e) => resolve(e.target.result))
    req.onerror    = done((e) => reject(e.target.error))
    req.onblocked  = done(() => reject(new Error('IndexedDB-Blocked')))
  })
}

function _deleteDB() {
  return new Promise((resolve) => {
    try {
      const req = indexedDB.deleteDatabase(DB_NAME)
      const t = setTimeout(resolve, 500)  // egal ob blocked, weiter probieren
      req.onsuccess = req.onerror = req.onblocked = () => { clearTimeout(t); resolve() }
    } catch { resolve() }
  })
}

// In-Memory-Fallback: wenn IndexedDB komplett tot ist (z.B. wegen Browser-Bug
// nach HMR-Reload, gesperrte DB, Inkognito-Restriktion), fahren wir die App
// auf einer Map weiter, damit Navigation und State im aktuellen Tab funktionieren.
let _useMemoryFallback = false
const _memStores = {
  progress: new Map(),
  cave: new Map(),
  questionnaire: new Map(),
  settings: new Map(),
}
let _qAutoId = 1

let _openingPromise = null
function openDB() {
  if (_useMemoryFallback) return Promise.reject(new Error('IndexedDB-Disabled'))
  if (_db) return Promise.resolve(_db)
  if (_openingPromise) return _openingPromise

  _openingPromise = (async () => {
    try {
      _db = await _openOnce(1500)
      return _db
    } catch (err) {
      console.warn('IndexedDB hängt, versuche Reset:', err.message)
      try {
        await _deleteDB()
        _db = await _openOnce(2000)
        return _db
      } catch (err2) {
        console.warn('IndexedDB unbrauchbar, schalte auf Memory-Fallback:', err2.message)
        _useMemoryFallback = true
        throw new Error('IndexedDB-Disabled')
      }
    } finally {
      _openingPromise = null
    }
  })()

  return _openingPromise
}

function tx(storeName, mode = 'readonly') {
  return openDB().then(db => db.transaction(storeName, mode).objectStore(storeName))
}

function idbGet(store, key) {
  return tx(store).then(s => new Promise((res, rej) => {
    const r = s.get(key); r.onsuccess = () => res(r.result); r.onerror = rej
  })).catch((err) => {
    if (_useMemoryFallback) return _memStores[store]?.get(key)
    throw err
  })
}

function idbPut(store, value) {
  return tx(store, 'readwrite').then(s => new Promise((res, rej) => {
    const r = s.put(value); r.onsuccess = () => res(); r.onerror = rej
  })).catch((err) => {
    if (_useMemoryFallback) {
      const map = _memStores[store]
      if (!map) throw err
      // Auto-increment für questionnaire (kein expliziter id-Key)
      if (store === 'questionnaire' && (value.id == null)) value.id = _qAutoId++
      map.set(value.id, value)
      return
    }
    throw err
  })
}

// ── Spielstand ───────────────────────────────────────────────

const DEFAULT_PROGRESS = {
  id: 'main',
  currentChapter: null,
  currentNodeId: 0,
  completedChapters: [],
  chapterCompletions: {},  // { [slug]: ISO-Timestamp } — für Zeitgate
  unlockedExercises: [],   // Slugs aller Übungen die der User schon gesehen hat → Selfcare-Schachtel
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

// Lazy-loaded um Zirkular-Imports zu vermeiden (data/exercises-meta.js wird
// vom Frontend-Code importiert, nicht über Bundler-Kette).
let _CHAPTER_EXERCISES = null
async function getChapterExercises() {
  if (_CHAPTER_EXERCISES) return _CHAPTER_EXERCISES
  const m = await import('./data/exercises-meta.js')
  _CHAPTER_EXERCISES = m.CHAPTER_EXERCISES || {}
  return _CHAPTER_EXERCISES
}

export async function completeChapter(slug) {
  const p = await getProgress()
  const completed = [...new Set([...p.completedChapters, slug])]
  const completions = { ...(p.chapterCompletions || {}), [slug]: new Date().toISOString() }
  // Übungen des Kapitels in Selfcare-Schachtel freischalten
  const chapterEx = await getChapterExercises()
  const newlyUnlocked = chapterEx[slug] || []
  const unlocked = [...new Set([...(p.unlockedExercises || []), ...newlyUnlocked])]
  await saveProgress({
    completedChapters: completed,
    chapterCompletions: completions,
    unlockedExercises: unlocked,
  })
}

export async function unlockExercise(slug) {
  const p = await getProgress()
  const current = p.unlockedExercises || []
  if (current.includes(slug)) return
  await saveProgress({ unlockedExercises: [...current, slug] })
}

// ── Cave-Konfiguration ────────────────────────────────────────

const DEFAULT_CAVE = {
  id: 'main',
  backgroundKey: null,
  // Platzierte Sticker mit Position: [{ id, key, x, y }]  — x/y in % (0-100)
  stickers: [],
  // Legacy: nur Slugs ohne Position. Beim Lesen migrieren wir, falls noch vorhanden.
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
  const entry = { type, answers, answeredAt: new Date().toISOString() }
  try {
    const store = await tx('questionnaire', 'readwrite')
    return new Promise((res, rej) => {
      const r = store.add(entry)
      r.onsuccess = res; r.onerror = rej
    })
  } catch (err) {
    if (_useMemoryFallback) {
      entry.id = _qAutoId++
      _memStores.questionnaire.set(entry.id, entry)
      return
    }
    throw err
  }
}
