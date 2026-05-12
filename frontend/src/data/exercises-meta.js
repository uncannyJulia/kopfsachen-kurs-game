// data/exercises-meta.js
// Übungs-Metadaten als Fallback wenn Strapi nichts liefert.
// Wird von ExerciseScreen UND ToolboxScreen genutzt.

// Welche Übungen werden in welchem Kapitel kennengelernt?
// Wird genutzt, damit die Wohlfühl-Schachtel auch dann gefüllt ist,
// wenn ein User das Kapitel abgeschlossen hat ohne dass beim Öffnen
// der einzelnen Übungen explizit ge-unlockt wurde.
export const CHAPTER_EXERCISES = {
  'ein-moment-nur-fuer-dich': [
    'box-atmung',
    'innerer-sicherer-ort-vorstellung',
    'energie-reflexion',
    'wenn-dann-plan',
  ],
}

export const EXERCISES_BY_SLUG = {
  'box-atmung': {
    slug: 'box-atmung',
    title: 'Box-Atmung',
    category: 'box_atmung',
    type: 'guided_text',
    duration: 240,
    description: 'Zu viel los im Kopf? Angespannt? Gestresst? Diese Atemtechnik hilft dir, wieder runterzukommen.',
    icon: '🌬️',
    targetRoute: 'exercise',
  },
  'innerer-sicherer-ort-vorstellung': {
    slug: 'innerer-sicherer-ort-vorstellung',
    title: 'Innerer sicherer Ort',
    category: 'innerer_ort',
    type: 'audio',
    duration: 600,
    description: 'Ein persönlicher Ort in deiner Vorstellung, an den du dich zurückziehen kannst.',
    subtitle: 'Audio-Anleitung, ca. 10 Minuten.',
    audioUrl: null,
    icon: '🏝️',
    targetRoute: 'exercise',
    subtitles: [
      { time: 0,   text: 'Finde eine bequeme Position.' },
      { time: 15,  text: 'Atme tief ein und aus.' },
      { time: 30,  text: 'Stell dir einen Ort vor, an dem du dich sicher fühlst.' },
      { time: 90,  text: 'Was siehst du? Welche Farben, Formen?' },
      { time: 180, text: 'Was hörst du an diesem Ort?' },
      { time: 270, text: 'Wie fühlt sich die Luft an?' },
      { time: 360, text: 'Bleib so lange du willst. Genieß die Ruhe.' },
      { time: 480, text: 'Komm langsam zurück. Bewege Hände und Füße.' },
    ],
  },
  // Reflexions-/Plan-Übungen — landen in der Wohlfühl-Schachtel zum Wiederholen.
  // targetRoute: 'content' weil sie via ContentScreen gerendert werden.
  'energie-reflexion': {
    slug: 'energie-reflexion',
    title: 'Energie-Fresser & -Geber',
    description: 'Sortiere Aktivitäten der letzten Woche nach Energie-Bilanz.',
    icon: '⚖️',
    targetRoute: 'content',
  },
  'wenn-dann-plan': {
    slug: 'wenn-dann-plan',
    title: 'Wenn-Dann-Plan',
    description: 'Plane konkrete Energie-Boost-Momente für die nächste Woche.',
    icon: '📝',
    targetRoute: 'content',
  },
}
