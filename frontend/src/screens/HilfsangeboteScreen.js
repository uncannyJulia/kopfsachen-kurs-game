// screens/HilfsangeboteScreen.js
// Hilfsangebote & Krisenanlaufstellen. Früher: HelpScreen.

import { getHelpResources } from '../api.js'

const DEMO_RESOURCES = [
  {
    id: 1,
    name: 'Krisenchat',
    description: 'Online-Chat für Krisen und Themen aller Art für junge Erwachsene bis 25 Jahre.',
    availability: '24/7',
    phone: null,
    url: 'https://www.krisenchat.de/',
  },
  {
    id: 2,
    name: 'JugendNotmail',
    description: 'Online-Beratung bei Depression, Selbstverletzung, Suizidgedanken, Gewalt, Mobbing, Missbrauch, familiären Problemen oder Essstörungen.',
    availability: 'Live-Chat: Mo, Di & Do · Themenchat: Mo 19-20:30 Uhr',
    phone: null,
    url: 'https://jugendnotmail.de/',
  },
  {
    id: 3,
    name: 'Patientenservice: Psychotherapie',
    description: 'Wenn du unter psychischen Belastungen leidest und Unterstützung von einem*einer Psychotherapeut*in möchtest, kannst du hier einen Termin vereinbaren.',
    availability: null,
    phone: '116 117',
    url: 'https://www.116117.de/de/psychotherapie.php',
  },
]

export function HilfsangeboteScreen() {
  const el = document.createElement('div')
  el.className = 'screen hilfsangebote-screen'

  el.innerHTML = `
    <div class="topbar">
      <button class="btn-menu hilfsangebote-back" type="button">&#8592;</button>
      <h1 class="hilfsangebote-heading">Hilfsangebote</h1>
      <div style="width:44px"></div>
    </div>
    <div class="hilfsangebote-intro">
      <p>Du bist nicht allein. Hier findest du Anlaufstellen, die dir weiterhelfen können.</p>
    </div>
    <div class="hilfsangebote-list"></div>
    <div class="hilfsangebote-loading">Lade Anlaufstellen …</div>
  `

  const listEl = el.querySelector('.hilfsangebote-list')
  const loadingEl = el.querySelector('.hilfsangebote-loading')

  el.querySelector('.hilfsangebote-back').addEventListener('click', () => {
    history.back()
  })

  async function init() {
    let resources = null
    try {
      resources = await getHelpResources()
    } catch (e) {
      console.warn('Strapi nicht erreichbar, nutze Demo-Daten:', e.message)
    }

    resources = resources || DEMO_RESOURCES
    loadingEl.style.display = 'none'

    resources.forEach(r => {
      const card = document.createElement('div')
      card.className = 'hilfsangebote-card'

      card.innerHTML = `
        <h3 class="hilfsangebote-card-name">${r.name}</h3>
        <p class="hilfsangebote-card-desc">${r.description}</p>
        ${r.availability ? `<span class="hilfsangebote-card-avail">${r.availability}</span>` : ''}
        <div class="hilfsangebote-card-actions">
          ${r.phone ? `<a href="tel:${r.phone.replace(/\s/g, '')}" class="btn-primary">${r.phone}</a>` : ''}
          ${r.url ? `<a href="${r.url}" target="_blank" rel="noopener" class="btn-secondary">Website</a>` : ''}
        </div>
      `

      listEl.appendChild(card)
    })
  }

  init()
  return el
}
