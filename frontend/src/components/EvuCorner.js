// components/EvuCorner.js
// Kleine Evu-Illustration für Content-Frame-Screens (Kapitelauswahl, Wünsche-Auswahl etc.)
// Position: oben rechts, klein. Nutzt die idle-Lottie.

import { CharacterAvatar } from './CharacterAvatar.js'

export function EvuCorner() {
  const wrap = document.createElement('div')
  wrap.className = 'evu-corner'
  const avatar = CharacterAvatar('evu', { size: '8rem' })
  if (avatar) {
    avatar.classList.add('evu-corner-avatar')
    wrap.appendChild(avatar)
  }
  return wrap
}
