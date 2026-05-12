// data/onboarding.js
// Onboarding-Dialog-Szene mit Evu:
//   Willkommen → Name → Hilfebedürftigkeit → Kopfsachen-Vorstellung →
//   Zeit-Abfrage → 12-Fragen-Prä-Fragebogen (inkl. Mika-Fallbeispiel) →
//   Hilfe-Verweis → Wünsche → Kursstruktur → Abschluss → Kapitelauswahl

const LIKERT = ['stimmt gar nicht', 'stimmt eher nicht', 'teils/teils', 'stimmt eher', 'stimmt voll']
const SMILEY = ['😟', '😕', '😐', '🙂', '😊']
const SMILEY_LABELS = ['Gar nicht gut', 'Nicht so', 'Geht so', 'Gut', 'Sehr gut']

export const ONBOARDING_NODES = [
  // ── Willkommen + Name ─────────────────────────────────
  { nodeId: 1,  speaker: 'evu', text: 'Hallo!', emotion: 'happy', nextNodeId: 2 },
  { nodeId: 2,  speaker: 'evu', text: 'Ich bin Evu. Ich begleite dich durch die App.', emotion: 'happy', nextNodeId: 3 },
  { nodeId: 3,  speaker: 'evu', text: 'Ich wachse mit deinem Fortschritt im Kurs.', emotion: 'neutral', nextNodeId: 4 },
  // Evu fragt UND Input-Feld erscheint direkt unter ihrer Frage — keine separate "leere User-Bubble"
  { nodeId: 4,  speaker: 'evu', text: 'Wie heißt du?', emotion: 'neutral', nextNodeId: 6, inputType: 'text', inputPlaceholder: 'Dein Name …' },
  { nodeId: 6,  speaker: 'evu', text: 'Hi [Username]. Schön, dass du da bist.', emotion: 'happy', nextNodeId: 10 },

  // ── Hilfebedürftigkeits-Abfrage ───────────────────────
  { nodeId: 10, speaker: 'evu', text: 'Dieses Angebot ersetzt keine Therapie.', emotion: 'neutral', nextNodeId: 11 },
  { nodeId: 11, speaker: 'evu', text: 'Wenn du dich gerade in einer akuten Krise befindest und dich stark überfordert fühlst, hol dir bitte menschliche Unterstützung.', emotion: 'worried', nextNodeId: 12 },
  { nodeId: 12, speaker: 'evu', text: "Du findest sie jederzeit oben über 'Hilfsangebote'. Schau gerne mal rein — danach geht's hier weiter.", emotion: 'neutral', avatarState: 'zeigt_hilfe', nextNodeId: 20 },

  // ── Kopfsachen-Vorstellung ────────────────────────────
  // (Video-Trigger folgt in Welle 4 mit VideoScreen. Für jetzt: Evu-Text.)
  { nodeId: 20, speaker: 'evu', text: 'Das Ganze hier kommt von Kopfsachen e.V.', emotion: 'neutral', nextNodeId: 21 },
  { nodeId: 21, speaker: 'evu', text: 'In folgendem Video erfährst du, wer und was hinter Kopfsachen steckt.', emotion: 'happy', nextNodeId: 23, triggerAction: 'open_video', triggerPayload: 'was-ist-kopfsachen' },
  { nodeId: 23, speaker: 'evu', text: 'Bei Fragen zur App findest du immer hier Hilfe von Kopfsachen — über das K-Logo oben.', emotion: 'happy', avatarState: 'zeigt_kopfsachen', nextNodeId: 30 },

  // ── Ruhiger-Ort-Abfrage ────────────────────────────────
  { nodeId: 30, speaker: 'evu', text: 'Bevor du beginnst: Bist du gerade an einem ruhigen Ort, an dem du ungestört bist?', emotion: 'neutral', nextNodeId: null, choices: [
    { text: 'Ja, los geht\'s!',   nextNodeId: 40 },
    { text: 'Jetzt gerade nicht', nextNodeId: 31 },
  ]},
  { nodeId: 31, speaker: 'evu', text: 'Dann komm einfach zurück, sobald du einen ruhigen Moment hast.', emotion: 'neutral', nextNodeId: 32 },
  { nodeId: 32, speaker: 'evu', text: 'Bis dahin!', emotion: 'happy', nextNodeId: null, choices: [
    { text: 'Okay', nextNodeId: 33 },
  ]},
  { nodeId: 33, speaker: 'evu', text: 'Bis bald!', emotion: 'happy', nextNodeId: null, triggerAction: 'exit_to_home' },

  // ── Prä-Fragebogen Intro ──────────────────────────────
  { nodeId: 40, speaker: 'evu', text: 'Bevor es richtig losgeht, bitte ich dich, den folgenden Fragebogen mit 14 Fragen zu beantworten.', emotion: 'neutral', nextNodeId: 41 },
  { nodeId: 41, speaker: 'evu', text: 'Das dauert maximal 5 Minuten.', emotion: 'neutral', nextNodeId: 42 },
  { nodeId: 42, speaker: 'evu', text: 'Deine Antworten helfen, den Kurs zu verbessern. Sie haben keinen Einfluss auf den Kursverlauf und werden anonym verarbeitet.', emotion: 'neutral', nextNodeId: 43 },
  { nodeId: 43, speaker: 'evu', text: 'Bitte beantworte die Fragen ganz spontan und ehrlich.', emotion: 'happy', nextNodeId: null, choices: [
    { text: 'Verstanden. Los geht\'s.', nextNodeId: 50 },
  ]},

  // ── Frage 1: Stimmung (Smiley) ────────────────────────
  { nodeId: 50, speaker: 'evu', text: 'Wie ging es dir die letzten 2 Wochen?', emotion: 'neutral', nextNodeId: null,
    likert: { questionId: 'stimmung_prae', questionText: 'Wie ging es dir die letzten 2 Wochen?', emojis: SMILEY, labels: SMILEY_LABELS, nextNodeId: 51 } },

  // ── Frage 2: Selfcare (Likert) ────────────────────────
  { nodeId: 51, speaker: 'evu', text: 'Weißt du, was dir hilft, wenn du einen schlechten Tag hast?', emotion: 'neutral', nextNodeId: null,
    likert: { questionId: 'mhl_selfcare_prae', questionText: 'Weißt du, was dir hilft, wenn du einen schlechten Tag hast?', emojis: SMILEY, labels: LIKERT, nextNodeId: 52 } },

  // ── Frage 3: Openness for self-disclosure ─────────────
  { nodeId: 52, speaker: 'evu', text: 'Manche sprechen mit anderen über ihre psychische Gesundheit. Andere eher weniger.', emotion: 'thinking', nextNodeId: 53 },
  { nodeId: 53, speaker: 'evu', text: 'Kannst du mit Personen, die dir nahe stehen, über deine psychische Gesundheit sprechen?', emotion: 'neutral', nextNodeId: null,
    likert: { questionId: 'mhl_self_disclosure_prae', questionText: 'Kannst du mit nahestehenden Personen über deine psychische Gesundheit sprechen?', emojis: SMILEY, labels: LIKERT, nextNodeId: 54 } },

  // ── Fallbeispiel Mika ─────────────────────────────────
  { nodeId: 54, speaker: 'evu', text: 'Jetzt eine kurze Situation. Stell dir vor:', emotion: 'neutral', nextNodeId: 55 },
  { nodeId: 55, speaker: 'narrator', text: 'Mika (16) geht eigentlich gern zur Schule, aber seit einigen Wochen fühlt sich Mika oft traurig und erschöpft. Es fällt Mika schwer, sich zu konzentrieren, und Mika zieht sich immer mehr von Freund*innen zurück.', emotion: null, nextNodeId: 56 },
  { nodeId: 56, speaker: 'narrator', text: 'Manchmal hat Mika das Gefühl, dass alles sinnlos ist. Schließlich überlegt Mika, sich Hilfe bei einer Beratungsstelle zu holen.', emotion: null, nextNodeId: 57 },
  { nodeId: 57, speaker: 'evu', text: 'Was denkst du über folgende Aussage?\n\n„Mika ist selbst schuld daran, dass es Mika so schlecht geht.“', emotion: 'neutral', nextNodeId: null,
    likert: { questionId: 'stigma_mika_1', questionText: 'Mika ist selbst schuld daran, dass es Mika so schlecht geht.', emojis: SMILEY, labels: LIKERT, nextNodeId: 58 } },
  { nodeId: 58, speaker: 'evu', text: 'Und wie stehst du hierzu?\n\n„Wenn Mika sich Hilfe sucht, ist das ein Zeichen von Schwäche.“', emotion: 'neutral', nextNodeId: null,
    likert: { questionId: 'stigma_mika_2', questionText: 'Wenn Mika sich Hilfe sucht, ist das ein Zeichen von Schwäche.', emojis: SMILEY, labels: LIKERT, nextNodeId: 59 } },
  { nodeId: 59, speaker: 'evu', text: 'Und hierzu?\n\n„Jede*r könnte sich in einer Situation wie Mika befinden.“', emotion: 'neutral', nextNodeId: null,
    likert: { questionId: 'stigma_mika_3', questionText: 'Jede*r könnte sich in einer Situation wie Mika befinden.', emojis: SMILEY, labels: LIKERT, nextNodeId: 60 } },

  // ── Openness professional help ────────────────────────
  { nodeId: 60, speaker: 'evu', text: 'Es gibt in Deutschland die Möglichkeit, Psychotherapie zu bekommen.', emotion: 'neutral', nextNodeId: 61 },
  { nodeId: 61, speaker: 'evu', text: 'Kannst du dir vorstellen, irgendwann in deinem Leben eine Psychotherapie zu machen?', emotion: 'neutral', nextNodeId: null,
    likert: { questionId: 'mhl_openness_professional_prae', questionText: 'Kannst du dir vorstellen, irgendwann Psychotherapie zu machen?', emojis: SMILEY, labels: LIKERT, nextNodeId: 62 } },

  // ── Emotionale Selbstwirksamkeit ──────────────────────
  { nodeId: 62, speaker: 'evu', text: 'Jetzt ein paar Fragen dazu, wie du mit Gefühlen umgehst.', emotion: 'happy', nextNodeId: 63 },
  { nodeId: 63, speaker: 'evu', text: 'Wenn du dich gestresst fühlst, weißt du, wie du deine Gefühle beeinflussen kannst?', emotion: 'neutral', nextNodeId: null,
    likert: { questionId: 'ese_negative_prae', questionText: 'Weißt du, wie du deine Gefühle beeinflussen kannst, wenn du gestresst bist?', emojis: SMILEY, labels: LIKERT, nextNodeId: 64 } },
  { nodeId: 64, speaker: 'evu', text: 'Kannst du erkennen, wenn du dich unglücklich oder wütend fühlst?', emotion: 'neutral', nextNodeId: null,
    likert: { questionId: 'ese_erkennen_prae', questionText: 'Kannst du deine Gefühle erkennen?', emojis: SMILEY, labels: LIKERT, nextNodeId: 65 } },
  { nodeId: 65, speaker: 'evu', text: 'Und wenn du dich unglücklich fühlst, weißt du dann auch, warum?', emotion: 'thinking', nextNodeId: null,
    likert: { questionId: 'ese_verstehen_prae', questionText: 'Weißt du, warum du dich unglücklich fühlst?', emojis: SMILEY, labels: LIKERT, nextNodeId: 66 } },
  { nodeId: 66, speaker: 'evu', text: 'Weißt du, wie man jemanden aufmuntert, wenn er oder sie sich unglücklich fühlt?', emotion: 'neutral', nextNodeId: null,
    likert: { questionId: 'ese_andere_prae', questionText: 'Weißt du, wie man jemanden aufmuntert?', emojis: SMILEY, labels: LIKERT, nextNodeId: 67 } },

  // ── Frage 12+13: Zukunftsängste ───────────────────────
  { nodeId: 67, speaker: 'evu', text: 'Sorgst du dich um mögliche Fehlschläge, die auf dich zukommen könnten?', emotion: 'thinking', nextNodeId: null,
    likert: { questionId: 'zukunftsaengste_1_prae', questionText: 'Sorgst du dich um mögliche Fehlschläge?', emojis: SMILEY, labels: LIKERT, nextNodeId: 68 } },
  { nodeId: 68, speaker: 'evu', text: 'Glaubst du, du kannst zukünftige Herausforderungen lösen, wenn sie aufkommen?', emotion: 'neutral', nextNodeId: null,
    likert: { questionId: 'zukunftsaengste_2_prae', questionText: 'Glaubst du, du kannst zukünftige Herausforderungen lösen?', emojis: SMILEY, labels: LIKERT, nextNodeId: 70 } },

  // ── Frage 14: Anlaufstellen + Hilfe-Verweis ───────────
  { nodeId: 70, speaker: 'evu', text: 'Fast geschafft. Eine letzte Frage:', emotion: 'happy', nextNodeId: 71 },
  { nodeId: 71, speaker: 'evu', text: 'Kennst du Anlaufstellen, an die man sich mit psychischen Problemen wenden kann, wie z.B. Beratungsstellen, Krisen-Hotline oder Hilfe-Chat?', emotion: 'neutral', nextNodeId: null,
    likert: { questionId: 'mhl_anlaufstellen_prae', questionText: 'Kennst du Anlaufstellen für psychische Probleme?', emojis: SMILEY, labels: LIKERT, nextNodeId: 72 } },
  { nodeId: 72, speaker: 'evu', text: 'Danke fürs Beantworten!', emotion: 'happy', nextNodeId: 73 },
  { nodeId: 73, speaker: 'evu', text: 'Wenn sich etwas für dich gerade zu schwer anfühlt, musst du da nicht alleine durch. Manche Themen brauchen Unterstützung von anderen.', emotion: 'worried', nextNodeId: 74 },
  { nodeId: 74, speaker: 'evu', text: 'Schau dir gerne oben über "Hilfsangebote" einen Überblick an. Wenn du zurückkommst, geht es hier weiter.', emotion: 'neutral', avatarState: 'zeigt_hilfe', nextNodeId: 80 },

  // ── Wünsche abfragen ──────────────────────────────────
  { nodeId: 80, speaker: 'evu', text: 'In diesem Kurs geht es um mentale Gesundheit und darum, was dir hilft, wenn es mal schwierig wird.', emotion: 'happy', nextNodeId: 81 },
  { nodeId: 81, speaker: 'evu', text: 'Was wünschst du dir von diesem Kurs? Du kannst mehrere Antworten auswählen.', emotion: 'neutral', nextNodeId: 82, triggerAction: 'open_content', triggerPayload: 'wuensche-auswahl' },
  { nodeId: 82, speaker: 'evu', text: 'Nimm diese Wünsche und Ziele mit in den Kurs. Am Ende schauen wir gemeinsam, was sich verändert hat.', emotion: 'happy', nextNodeId: 90 },

  // ── Kursstruktur vorstellen ───────────────────────────
  { nodeId: 90, speaker: 'evu', text: 'Der Kurs ist in 8 Kapitel unterteilt. Immer eine Woche nach Abschluss eines Kapitels wird das nächste freigeschaltet.', emotion: 'neutral', nextNodeId: 91 },
  { nodeId: 91, speaker: 'evu', emotion: 'happy', nextNodeId: 92,
    list: {
      icon: '📘',
      title: 'Die 8 Kapitel',
      style: 'bubbles',
      items: [
        'Ein Moment nur für dich',
        'Wie geht es dir? Danke gut.',
        'Unter Druck',
        "Früh merken, wenn's zu viel wird",
        'Gut zu dir sein',
        'Was will ich eigentlich?',
        'Was trägt dich?',
        'Dein Weg',
      ],
    } },
  { nodeId: 92, speaker: 'evu', text: 'Jedes Kapitel besteht aus 5 Schritten, jeweils ca. 5 bis 20 Minuten:', emotion: 'happy', nextNodeId: 93 },
  { nodeId: 93, speaker: 'evu', emotion: 'happy', nextNodeId: 94,
    list: {
      icon: '⏱️',
      title: 'Die 5 Schritte je Kapitel',
      ordered: true,
      items: [
        'Ankommen  (5–10 min)',
        'Eine Geschichte erleben  (5–10 min)',
        'Einordnen und informieren  (5 min)',
        'Üben und selbst aktiv werden  (10–20 min)',
        'In deinen Alltag bringen  (5 min)',
      ],
    } },
  { nodeId: 94, speaker: 'evu', text: 'Ein Kapitel dauert also ca. 45 Minuten — du kannst es jederzeit unterbrechen und später weitermachen.', emotion: 'neutral', nextNodeId: 95 },
  { nodeId: 95, speaker: 'evu', text: 'Jedes Kapitel beginnt mit einer kurzen Einleitung von mir. Dann begleitest du Toni durch eine fiktive Geschichte.', emotion: 'happy', nextNodeId: 96 },
  { nodeId: 96, speaker: 'evu', text: 'Im Trainings-Teil geht es dann ganz um dich. Zum Abschluss gibt\'s einen Impuls für deinen Alltag.', emotion: 'happy', nextNodeId: 97 },

  // ── Abschluss Onboarding ──────────────────────────────
  { nodeId: 97, speaker: 'evu', text: 'Bereit, mit dem ersten Kapitel zu starten?', emotion: 'happy', nextNodeId: null, choices: [
    { text: 'Los geht\'s!', nextNodeId: 98 },
  ]},
  { nodeId: 98, speaker: 'evu', text: 'Super. Ich freue mich auf den Kurs mit dir.', emotion: 'happy', nextNodeId: null, triggerAction: 'complete_onboarding' },
]
