// data/kapitel-1.js
// Kapitel 1: "Ein Moment nur für dich" — Ankommen und durchatmen
//
// Aufbau in 5 Phasen:
//   Ankommen (Evu)   →  Erleben (Toni/Manu)  →  Informieren (Video)
//   →  Üben (Cave + Übung + Energie)  →  Alltag (Wenn-Dann-Plan)

export const KAPITEL_1_NODES = [
  // ══════════════════════════════════════════════════════
  // Phase 1: ANKOMMEN — Evu leitet das Kapitel ein
  // ══════════════════════════════════════════════════════
  { nodeId: 1, speaker: 'evu', text: 'Schön, dass du da bist, [Username].', emotion: 'happy', nextNodeId: 2 },
  { nodeId: 2, speaker: 'evu', text: 'In diesem Kapitel geht es um einen kleinen Moment nur für dich — Ankommen und durchatmen.', emotion: 'neutral', nextNodeId: 3 },
  { nodeId: 3, speaker: 'evu', text: 'Gleich begleitest du Toni durch eine kurze, fiktive Geschichte.', emotion: 'neutral', nextNodeId: 4 },
  { nodeId: 4, speaker: 'evu', text: 'Manches wird dir vielleicht bekannt vorkommen, mit anderem kannst du dich weniger identifizieren. Versuche, dich auf Tonis Welt einzulassen.', emotion: 'happy', nextNodeId: null, choices: [
    { text: 'Los geht\'s', nextNodeId: 11 },
  ]},

  // ══════════════════════════════════════════════════════
  // Phase 2: ERLEBEN — Toni vor dem Fitnessstudio
  // ══════════════════════════════════════════════════════
  // (Frühere narrator-Platzhalter wie "Toni schaut aufs Handy" wurden entfernt —
  //  die Comic-Bilder zeigen die Aktion bereits visuell.)
  { nodeId: 11, speaker: 'toni', text: 'Ich warte jetzt schon 10 Minuten auf Neo.', emotion: 'worried', image: '/story/01_Toni_ich_warte.webp', nextNodeId: 12 },
  { nodeId: 12, speaker: 'user', text: '', image: '/story/01_Toni_ich_warte.webp', nextNodeId: null, choices: [
    { text: 'Hat Neo vielleicht etwas geschrieben?', nextNodeId: 14 },
  ]},
  { nodeId: 14, speaker: 'toni', text: 'Keine Nachricht von Neo.', emotion: 'sad', image: '/story/02_Toni_keine_nachricht.webp', nextNodeId: 15 },
  { nodeId: 15, speaker: 'toni', text: 'Wir wollten doch zusammen zu diesem Sportkurs.', emotion: 'sad', image: '/story/03_Toni_wir_wollten_doch.webp', nextNodeId: 16 },
  { nodeId: 16, speaker: 'toni', text: 'Soll ich da alleine hingehen?', emotion: 'worried', image: '/story/04_Toni_soll_ich_da.webp', nextNodeId: null, choices: [
    { text: 'Lieber nicht.',        nextNodeId: 17 },
    { text: 'Ja komm, das passt schon.', nextNodeId: 18 },
  ]},
  { nodeId: 17, speaker: 'toni', text: 'Ich war da auch noch nie und ich kenne da niemanden.', emotion: 'worried', image: '/story/05_Toni_ich_war_da.webp', nextNodeId: 20 },
  { nodeId: 18, speaker: 'toni', text: 'Ich war da aber noch nie und ich kenne da niemanden.', emotion: 'worried', image: '/story/05_Toni_ich_war_da.webp', nextNodeId: 20 },
  { nodeId: 20, speaker: 'toni', text: 'Ich habe echt keine Lust, das jetzt alleine zu machen. Das ist mir zu stressig.', emotion: 'sad', image: '/story/06_Toni_ich_habe_echt_das_ist_mir_zu_wieso_meldet_sich.webp', nextNodeId: 21 },
  { nodeId: 21, speaker: 'toni', text: 'Wieso meldet sich Neo nicht?!', emotion: 'sad', image: '/story/06_Toni_ich_habe_echt_das_ist_mir_zu_wieso_meldet_sich.webp', nextNodeId: null, choices: [
    { text: 'Okay, erstmal kurz entspannen.', nextNodeId: 25 },
    { text: 'Komm schon. Reiß dich zusammen!', nextNodeId: 22 },
  ]},
  { nodeId: 22, speaker: 'toni', text: 'Ich merke richtig Druck in der Brust.', emotion: 'worried', image: '/story/07_Toni_ich_merke_richtig.webp', nextNodeId: null, choices: [
    { text: 'Vielleicht helfen ein paar tiefe Atemzüge.',     nextNodeId: 25 },
    { text: 'Das ist alles Neos Schuld.',                     nextNodeId: 23 },
  ]},
  { nodeId: 23, speaker: 'toni', text: 'Ich glaub, ich sollte mal kurz entspannt durchatmen.', emotion: 'thinking', image: '/story/08_Toni_ich_glaube_ich_sollte.webp', nextNodeId: 25 },

  // ── Box-Atmung ────────────────────────────────────────
  { nodeId: 25, speaker: 'evu', text: 'Probier mal eine kurze Box-Atmung. Ich zeig dir gleich, wie das geht.', emotion: 'neutral', nextNodeId: 26, triggerAction: 'open_exercise', triggerPayload: 'box-atmung' },
  { nodeId: 26, speaker: 'toni', text: 'Okay, jetzt fühl ich mich ein bisschen klarer.', emotion: 'calm', image: '/story/09_Toni_ok_jetzt_fuehl.webp', nextNodeId: 27 },
  { nodeId: 27, speaker: 'user', text: '', nextNodeId: null, choices: [
    { text: 'Weiter warten',            nextNodeId: 28 },
    { text: 'Alleine zum Kurs gehen',   nextNodeId: 29 },
  ]},
  { nodeId: 28, speaker: 'toni', text: 'Ich glaube, Neo wird nicht mehr kommen — und der Kurs hat jetzt sowieso schon angefangen.', emotion: 'sad', image: '/story/10_Toni_der_kurs_hat_jetzt.webp', nextNodeId: 30 },
  { nodeId: 29, speaker: 'toni', text: 'Mist, der Kurs hat jetzt schon angefangen.', emotion: 'sad', image: '/story/10_Toni_der_kurs_hat_jetzt.webp', nextNodeId: 30 },
  { nodeId: 30, speaker: 'toni', text: 'Manu wohnt doch gleich hier um die Ecke.', emotion: 'thinking', image: '/story/11_Toni_manu_wohnt_doch.webp', nextNodeId: null, choices: [
    { text: 'Zu Manu gehen', nextNodeId: 35 },
  ]},

  // ── Bei Manu ──────────────────────────────────────────
  { nodeId: 35, speaker: 'manu', text: 'Sehr ärgerlich und merkwürdig. Neo ist doch eigentlich zuverlässig.', emotion: 'worried', image: '/story/12_Manu_sehr_aergerlich.webp', nextNodeId: null, choices: [
    { text: 'Ich verstehe es auch nicht.', nextNodeId: 36 },
    { text: 'Richtig nervig.',             nextNodeId: 36 },
  ]},
  { nodeId: 36, speaker: 'toni', text: 'Neo hat sich einfach nicht gemeldet. Ich wollte nicht alleine gehen und schließlich war es auch zu spät.', emotion: 'sad', image: '/story/13_Toni_neo_hat_sich_einfach.webp', nextNodeId: 37 },
  { nodeId: 37, speaker: 'manu', text: 'Das hört sich stressig an.', emotion: 'calm', image: '/story/14_Manu_das_hoert_sich.webp', nextNodeId: 38 },
  { nodeId: 38, speaker: 'toni', text: 'Ich hab dann irgendwann tief durchgeatmet. Das hat mich etwas entspannt. Dann fiel mir ein, dass du hier in der Nähe wohnst.', emotion: 'calm', image: '/story/15_Toni_ich_hab_dann_irgendwann.webp', nextNodeId: 39 },
  { nodeId: 39, speaker: 'manu', text: 'Ja, ruhiges und tiefes Atmen kann bei stressigen Situationen richtig hilfreich sein, um etwas runterzukommen.', emotion: 'happy', image: '/story/16_Manu_ja_ruhiges_und_tiefes.webp', nextNodeId: 40 },
  { nodeId: 40, speaker: 'toni', text: 'Mich ärgert, dass Neo gerade heute nicht gekommen ist. Ich hatte schon einen super vollen Tag.', emotion: 'sad', image: '/story/17_Toni_mich_aergert_dass.webp', nextNodeId: 41 },
  { nodeId: 41, speaker: 'toni', text: 'Ich war arbeiten und musste lernen. Dann hatte ich noch einen Streit am Telefon mit meinem Vater.', emotion: 'sad', image: '/story/17_Toni_mich_aergert_dass.webp', nextNodeId: 42 },
  { nodeId: 42, speaker: 'toni', text: 'Ich hatte eigentlich keine Energie mehr für den neuen Kurs.', emotion: 'sad', image: '/story/17_Toni_mich_aergert_dass.webp', nextNodeId: 43 },
  { nodeId: 43, speaker: 'manu', text: 'Vielleicht hat dich das deshalb so gestresst?', emotion: 'thinking', image: '/story/18_Manu_vielleicht_hat_dich.webp', nextNodeId: null, choices: [
    { text: 'Mein Fass war schon so voll.',    nextNodeId: 44 },
    { text: 'Ich hatte heute zu wenig Pausen.', nextNodeId: 45 },
  ]},
  { nodeId: 44, speaker: 'toni', text: 'Vermutlich hat die Situation mein Fass zum Überlaufen gebracht.', emotion: 'thinking', image: '/story/19_Toni_vermutlich_mein_fass_haette_mehr_pausen.webp', nextNodeId: 46 },
  { nodeId: 45, speaker: 'toni', text: 'Ich hätte heute einfach mehr Pausen gebraucht.', emotion: 'thinking', image: '/story/19_Toni_vermutlich_mein_fass_haette_mehr_pausen.webp', nextNodeId: 46 },
  { nodeId: 46, speaker: 'manu', text: 'Ja, Erholungszeiten — gerade in stressigen Zeiten — sind super wichtig.', emotion: 'happy', image: '/story/20_Manu_ja_erholungszeiten.webp', nextNodeId: 47 },
  { nodeId: 47, speaker: 'manu', text: 'Als wir uns kürzlich getroffen haben, meintest du schon, dass alles gerade etwas viel ist.', emotion: 'neutral', image: '/story/20_Manu_ja_erholungszeiten.webp', nextNodeId: 48 },
  { nodeId: 48, speaker: 'manu', text: 'Ich glaube, wenn du heute mit mehr Energie hingegangen wärst, hättest du den Kurs auch alleine besucht.', emotion: 'thinking', image: '/story/20_Manu_ja_erholungszeiten.webp', nextNodeId: 49 },
  { nodeId: 49, speaker: 'toni', text: 'Ja, vielleicht hast du Recht.', emotion: 'thinking', image: '/story/21_Toni_ja_vielleicht_hast_du.webp', nextNodeId: 51 },

  // ── Nachricht von Neo ─────────────────────────────────
  // (narrator-Platzhalter "Tonis Handy vibriert" und "Toni öffnet die Nachricht" entfernt)
  { nodeId: 51, speaker: 'toni', text: 'Eine Nachricht von Neo.', emotion: 'surprised', image: '/story/22_Toni_eine_nachricht.webp', nextNodeId: 52 },
  { nodeId: 52, speaker: 'manu', text: 'Na endlich.', emotion: 'happy', image: '/story/23_Manu_na_endlich.webp', nextNodeId: 54 },
  { nodeId: 54, speaker: 'toni', text: 'Mmh.', emotion: 'thinking', image: '/story/24_Toni_mmh.webp', nextNodeId: 55 },
  { nodeId: 55, speaker: 'manu', text: 'Alles okay?', emotion: 'worried', image: '/story/25_Manu_alles_okay.webp', nextNodeId: 56 },
  { nodeId: 56, speaker: 'toni', text: 'Ich weiß nicht. Irgendwie… erleichtert? Oder doch noch sauer? Beides gleichzeitig?', emotion: 'thinking', image: '/story/26_Toni_ich_weiss_nicht.webp', nextNodeId: 57 },
  { nodeId: 57, speaker: 'manu', text: 'Gefühle sind manchmal echt komisch, oder?', emotion: 'happy', image: '/story/27_Manu_gefuehle_sind_manchmal.webp', nextNodeId: 58 },
  { nodeId: 58, speaker: 'toni', text: 'Ja. Ich glaub, ich hab da noch nie so drüber nachgedacht.', emotion: 'thinking', image: '/story/28_Toni_ja_ich_glaub_ich_hab_da.webp', nextNodeId: 60 },

  // ══════════════════════════════════════════════════════
  // Phase 3: INFORMIEREN — Evu leitet zum Video über
  // ══════════════════════════════════════════════════════
  { nodeId: 60, speaker: 'evu', text: 'Zwischen Schule, Studium, Job und allem anderen bleibt Erholung oft auf der Strecke.', emotion: 'neutral', nextNodeId: 61 },
  { nodeId: 61, speaker: 'evu', text: 'Was man da machen kann und was wirklich hilft, erklärt dir jetzt ein*e Psycholog*in.', emotion: 'happy', nextNodeId: 62, triggerAction: 'open_video', triggerPayload: 'erholung-und-innerer-sicherer-ort' },
  { nodeId: 62, speaker: 'evu', text: 'Wie es mit Toni weiter geht, erfährst du im nächsten Kapitel.', emotion: 'happy', nextNodeId: 65 },

  // ══════════════════════════════════════════════════════
  // Phase 4: ÜBEN — Innerer sicherer Ort + Energie-Reflexion
  // ══════════════════════════════════════════════════════
  { nodeId: 65, speaker: 'evu', text: 'Jetzt kannst du aktiv werden und dir hier in der App einen sicheren Wohlfühlort bauen — einen Ort, den du frei gestalten kannst.', emotion: 'happy', nextNodeId: 66, triggerAction: 'open_cave' },

  // ── Nach Cave-Gestaltung ──────────────────────────────
  { nodeId: 66, speaker: 'evu', text: 'Schön, dass du dir einen Ort gestaltet hast.', emotion: 'happy', nextNodeId: 67 },
  { nodeId: 67, speaker: 'evu', text: 'Noch größere Freiheit hast du, wenn du dir den Ort in deiner Vorstellung vorstellst.', emotion: 'neutral', nextNodeId: 68 },
  { nodeId: 68, speaker: 'evu', text: 'Wenn du dir diesen Ort in deinem Kopf installierst, kannst du jederzeit dorthin gehen, ohne auf dein Handy schauen zu müssen.', emotion: 'happy', nextNodeId: 69 },
  { nodeId: 69, speaker: 'evu', text: 'Bist du gerade an einem Ort, an dem du für 5 Minuten die Augen zumachen kannst, um die Übung zu machen?', emotion: 'neutral', nextNodeId: null, choices: [
    { text: 'Ja, los geht\'s.',       nextNodeId: 70 },
    { text: 'Nein, leider nicht.',    nextNodeId: 72 },
  ]},
  { nodeId: 70, speaker: 'evu', text: 'Super. Such dir einen bequemen Platz.', emotion: 'calm', nextNodeId: 71, triggerAction: 'open_exercise', triggerPayload: 'innerer-sicherer-ort-vorstellung' },
  { nodeId: 71, speaker: 'evu', text: 'Wie war die Übung für dich?', emotion: 'neutral', nextNodeId: null,
    likert: { questionId: 'innerer_ort_rating', questionText: 'Wie hilfreich war die Übung?', emojis: ['😟', '😕', '😐', '🙂', '😊'], labels: ['gar nicht gut', 'nicht so', 'geht so', 'gut', 'sehr gut'], nextNodeId: 75 } },
  { nodeId: 72, speaker: 'evu', text: 'Dann mach die Übung einfach zu einem ruhigeren Zeitpunkt. Du findest sie jederzeit in deiner Selfcare-Schachtel.', emotion: 'happy', nextNodeId: 75 },
  { nodeId: 75, speaker: 'evu', text: 'Auf dem Startbildschirm findest du ab sofort die Selfcare-Schachtel. Alle Übungen, die du kennenlernst, landen dort.', emotion: 'happy', nextNodeId: 76 },

  // ── Energie-Reflexion ─────────────────────────────────
  { nodeId: 76, speaker: 'evu', text: 'Du hast jetzt einiges darüber gehört, was helfen kann, sich zu erholen.', emotion: 'neutral', nextNodeId: 77 },
  { nodeId: 77, speaker: 'evu', text: 'Aber entscheidend ist: Was funktioniert für dich?', emotion: 'thinking', nextNodeId: 78 },
  { nodeId: 78, speaker: 'evu', text: 'Denke an deine letzte Woche. Was hat dich Energie gekostet? Was hat dir Energie gegeben?', emotion: 'neutral', nextNodeId: 79, triggerAction: 'open_content', triggerPayload: 'energie-reflexion' },

  // ══════════════════════════════════════════════════════
  // Phase 5: IN DEINEN ALLTAG BRINGEN — Wenn-Dann-Plan
  // ══════════════════════════════════════════════════════
  { nodeId: 79, speaker: 'evu', text: 'Jetzt, wo du weißt, was dir Energie gibt: Was möchtest du in der nächsten Woche ganz bewusst einbauen?', emotion: 'happy', nextNodeId: 80, triggerAction: 'open_content', triggerPayload: 'wenn-dann-plan' },

  // ── Abschluss ─────────────────────────────────────────
  { nodeId: 80, speaker: 'evu', text: 'Super. Du hast einen Energie-Boost-Plan für die nächste Woche.', emotion: 'happy', nextNodeId: 81 },
  { nodeId: 81, speaker: 'evu', text: 'Damit dein Plan nicht nur ein guter Gedanke bleibt: Merk dir kurz, was du vorhast. Und achte in der nächsten Woche darauf, wie es dir damit geht.', emotion: 'neutral', nextNodeId: 82 },
  { nodeId: 82, speaker: 'evu', text: 'Am Anfang von Kapitel 2 frage ich dich kurz, wie es gelaufen ist.', emotion: 'happy', nextNodeId: 83 },
  { nodeId: 83, speaker: 'evu', text: 'Du hast heute viel über Erholung und Energiemanagement gelernt. Das ist ein wichtiger Schritt für deine mentale Gesundheit.', emotion: 'happy', nextNodeId: 84 },
  { nodeId: 84, speaker: 'evu', text: 'In einer Woche geht es mit Kapitel 2 weiter. Ich freu mich auf dich. Bis dahin alles Gute!', emotion: 'happy', nextNodeId: null, choices: [
    { text: 'Kapitel abschließen', nextNodeId: 85 },
  ]},
  { nodeId: 85, speaker: 'evu', text: 'Bis bald!', emotion: 'happy', nextNodeId: null, triggerAction: 'complete_chapter' },
]
