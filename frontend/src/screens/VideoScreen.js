// screens/VideoScreen.js
// Video-Screen für Psychoedukation + Kopfsachen-Vorstellung.
// Auto-Close nach Videoende → history.back().

import { getVideoContent } from '../api.js'
import { t } from '../data/ui-texts.js'

const DEMO_VIDEOS = {
  'kopfsachen-intro': {
    slug: 'kopfsachen-intro',
    title: 'Kopfsachen vorstellen',
    videoSource: 'placeholder',
    transcript: 'Kopfsachen e.V. ist ein gemeinnütziger Verein, der sich für die mentale Gesundheit junger Menschen einsetzt.',
  },
  'was-ist-kopfsachen': {
    slug: 'was-ist-kopfsachen',
    title: 'Was ist Kopfsachen?',
    videoSource: 'youtube',
    videoUrl: 'https://youtube.com/shorts/hhkigSg0jt8',
  },
  'erholung-und-innerer-sicherer-ort': {
    slug: 'erholung-und-innerer-sicherer-ort',
    title: 'Erholung und Innerer sicherer Ort',
    videoSource: 'placeholder',
    transcript: 'Hier würde ein Video einer/eines Psycholog*in laufen, das erklärt, wie Erholung funktioniert und was ein innerer sicherer Ort ist.',
  },
}

function youtubeEmbedUrl(url) {
  if (!url) return null
  // Unterstützt: youtu.be/<id>, watch?v=<id>, /shorts/<id>, /embed/<id>
  const match = url.match(/(?:v=|youtu\.be\/|\/shorts\/|\/embed\/)([a-zA-Z0-9_-]{11})/)
  return match ? `https://www.youtube-nocookie.com/embed/${match[1]}?autoplay=1&rel=0&playsinline=1` : null
}

function vimeoEmbedUrl(url) {
  if (!url) return null
  const match = url.match(/vimeo\.com\/(\d+)/)
  return match ? `https://player.vimeo.com/video/${match[1]}?autoplay=1` : null
}

export function VideoScreen(path) {
  const slug = (path?.replace('/video/', '') || '').split('/')[0]
  const el = document.createElement('div')
  el.className = 'screen video-screen'

  el.innerHTML = `
    <div class="topbar video-topbar">
      <button class="btn-menu video-back" type="button" aria-label="Überspringen">&#10005;</button>
      <h1 class="video-heading"></h1>
      <div style="width:44px"></div>
    </div>
    <div class="video-stage"></div>
    <div class="video-footer">
      <button class="btn-primary video-continue" type="button" hidden>${escape(t('video.continue', 'Weiter'))}</button>
    </div>
  `

  const stageEl    = el.querySelector('.video-stage')
  const headingEl  = el.querySelector('.video-heading')
  const continueBtn = el.querySelector('.video-continue')

  el.querySelector('.video-back').addEventListener('click', () => history.back())

  async function init() {
    let loaded = null
    try {
      if (slug) {
        const results = await getVideoContent(slug)
        loaded = Array.isArray(results) ? results[0] : results
      }
    } catch (e) {
      console.warn('Strapi nicht erreichbar, nutze Demo-Video:', e.message)
    }

    const video = loaded || DEMO_VIDEOS[slug] || null

    if (!video) {
      headingEl.textContent = t('video.heading.default', 'Video')
      stageEl.innerHTML = `<div class="video-placeholder">
        <p>Kein Video mit Slug <code>${escape(slug)}</code> gefunden.</p>
      </div>`
      continueBtn.hidden = false
      continueBtn.addEventListener('click', () => history.back())
      return
    }

    headingEl.textContent = video.title || t('video.heading.default', 'Video')

    if (video.videoSource === 'youtube') {
      stageEl.innerHTML = `<iframe class="video-iframe" src="${youtubeEmbedUrl(video.videoUrl) || ''}" allow="autoplay; encrypted-media" allowfullscreen></iframe>`
      // iframes können 'ended' nicht nativ signalisieren → Continue-Button einblenden
      continueBtn.hidden = false
      continueBtn.addEventListener('click', () => history.back())
    } else if (video.videoSource === 'vimeo') {
      stageEl.innerHTML = `<iframe class="video-iframe" src="${vimeoEmbedUrl(video.videoUrl) || ''}" allow="autoplay; fullscreen" allowfullscreen></iframe>`
      continueBtn.hidden = false
      continueBtn.addEventListener('click', () => history.back())
    } else if (video.videoSource === 'upload' && video.videoFile?.url) {
      stageEl.innerHTML = `<video class="video-player" controls autoplay playsinline src="${video.videoFile.url}"></video>`
      const player = stageEl.querySelector('video')
      player.addEventListener('ended', () => history.back())
      continueBtn.hidden = false
      continueBtn.addEventListener('click', () => history.back())
    } else {
      // Platzhalter (kein Asset hochgeladen)
      stageEl.innerHTML = `
        <div class="video-placeholder">
          <div class="video-placeholder-icon">🎬</div>
          <p class="video-placeholder-title">${escape(video.title || t('video.heading.default', 'Video'))}</p>
          ${video.transcript ? `<p class="video-placeholder-transcript">${escape(video.transcript)}</p>` : ''}
          <p class="video-placeholder-hint">${escape(t('video.placeholder.hint', 'Video wird demnächst in Strapi hinterlegt.'))}</p>
        </div>
      `
      continueBtn.hidden = false
      continueBtn.addEventListener('click', () => history.back())
    }
  }

  init()
  return el
}

function escape(s) {
  return String(s || '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}
