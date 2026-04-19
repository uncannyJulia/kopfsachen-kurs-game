// api.js
// Strapi Cloud Client – Vanilla JS, kein Build-Step.
// Config via data-Attribute im HTML oder Konstante hier.

// Vite ersetzt import.meta.env.VITE_* zur Build-Zeit mit den
// tatsächlichen Werten aus .env.local / .env.production
const env = import.meta.env || {}
const STRAPI_URL   = env.VITE_STRAPI_URL   || 'http://localhost:1337'
const STRAPI_TOKEN = env.VITE_STRAPI_TOKEN || ''

// Einfacher In-Memory Cache pro Session
const _cache = new Map()

async function fetchAPI(path, populate = '*') {
  const sep = path.includes('?') ? '&' : '?'
  const url = `${STRAPI_URL}/api${path}${sep}populate=${populate}`

  if (_cache.has(url)) return _cache.get(url)

  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(STRAPI_TOKEN ? { Authorization: `Bearer ${STRAPI_TOKEN}` } : {}),
    },
  })

  if (!res.ok) throw new Error(`Strapi ${res.status}: ${path}`)

  const json = await res.json()
  _cache.set(url, json.data)
  return json.data
}

// ── API-Funktionen ────────────────────────────────────────────

export const getChapters = () =>
  fetchAPI('/chapters?sort=order:asc')

export const getChapter = (slug) =>
  fetchAPI(`/chapters?filters[slug][$eq]=${slug}`)

export const getDialogScene = (chapterSlug) =>
  fetchAPI(
    `/dialog-scenes?filters[chapter][slug][$eq]=${chapterSlug}&sort=sceneOrder:asc`,
    'nodes.choices,chapter'
  )

export const getExercises = () =>
  fetchAPI('/exercises')

export const getExercise = (slug) =>
  fetchAPI(`/exercises?filters[slug][$eq]=${slug}`)

export const getCaveAssets = () =>
  fetchAPI('/cave-assets')

export const getHelpResources = () =>
  fetchAPI('/help-resources?sort=sortOrder:asc&filters[isActive][$eq]=true')

export const getVideoContent = (slug) =>
  fetchAPI(`/video-contents?filters[slug][$eq]=${slug}`)

export const getQuestionnaireQuestions = (type = 'prae') =>
  fetchAPI(`/questionnaire-questions?filters[questionnaire][$eq]=${type}&sort=order:asc`)

export const getEnergieAktivitaeten = () =>
  fetchAPI('/energie-aktivitaeten?sort=sortOrder:asc&filters[isActive][$eq]=true')

export const getWennDannSituations = () =>
  fetchAPI('/wenn-dann-situations?sort=sortOrder:asc&filters[isActive][$eq]=true')
