// components/BoxAtmung.js
// Box-Atmungs-Animation: 4 Sek einatmen / 4 Sek halten / 4 Sek ausatmen / 4 Sek halten.
// 4 Durchgänge. Keine Skip-Möglichkeit — User soll die Übung wirklich machen.
// Nach Abschluss erscheint ein "Weiter"-Button, der onDone aufruft.
//
// Usage: el.appendChild(BoxAtmung({ onDone: () => { ... } }))

const PHASES = [
  { label: 'einatmen',       duration: 4000 },
  { label: 'Atem halten',    duration: 4000 },
  { label: 'ausatmen',       duration: 4000 },
  { label: 'Atem halten',    duration: 4000 },
]
const TOTAL_ROUNDS = 4

export function BoxAtmung({ onDone } = {}) {
  const root = document.createElement('div')
  root.className = 'boxatmung'
  root.innerHTML = `
    <div class="boxatmung-header">
      <span class="boxatmung-round">Durchgang <span class="boxatmung-round-num">1</span> / ${TOTAL_ROUNDS}</span>
    </div>
    <div class="boxatmung-stage">
      <div class="boxatmung-box">
        <div class="boxatmung-dot"></div>
        <div class="boxatmung-label">einatmen</div>
      </div>
    </div>
    <div class="boxatmung-controls">
      <button class="btn-primary boxatmung-done" type="button" hidden>Weiter</button>
    </div>
  `

  const roundEl  = root.querySelector('.boxatmung-round-num')
  const dotEl    = root.querySelector('.boxatmung-dot')
  const labelEl  = root.querySelector('.boxatmung-label')
  const doneBtn  = root.querySelector('.boxatmung-done')

  let phaseIdx   = 0
  let roundNum   = 1
  let timeoutId  = null
  let finished   = false

  function advance() {
    if (finished) return

    const phase = PHASES[phaseIdx]
    labelEl.textContent = phase.label
    dotEl.className = `boxatmung-dot boxatmung-dot--phase-${phaseIdx}`
    // Trigger Reflow, damit die Animation bei gleichem Klassenwechsel läuft
    void dotEl.offsetWidth
    dotEl.style.animationDuration = `${phase.duration}ms`

    timeoutId = setTimeout(() => {
      phaseIdx++
      if (phaseIdx >= PHASES.length) {
        phaseIdx = 0
        roundNum++
        if (roundNum > TOTAL_ROUNDS) {
          finish()
          return
        }
        roundEl.textContent = String(roundNum)
      }
      advance()
    }, phase.duration)
  }

  function finish() {
    finished = true
    clearTimeout(timeoutId)
    labelEl.textContent = 'Schön. Du hast es geschafft.'
    dotEl.style.animation = 'none'
    dotEl.style.opacity = '0'
    doneBtn.hidden = false
  }

  doneBtn.addEventListener('click', () => {
    if (typeof onDone === 'function') onDone()
  })

  // Cleanup when element is removed (z.B. Navigation während laufender Übung)
  const observer = new MutationObserver(() => {
    if (!root.isConnected) {
      clearTimeout(timeoutId)
      observer.disconnect()
    }
  })
  observer.observe(document.body, { childList: true, subtree: true })

  advance()
  return root
}
