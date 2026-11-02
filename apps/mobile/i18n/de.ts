/**
 * German UI strings (MVP language). Screens use `t('key')`, never literals.
 * English follows as a second dictionary with the same keys.
 */
export const de = {
  'app.name': 'Puzzle Studio',
  'start.title': 'Hallo, ich bin Pino!',
  'start.subtitle': 'Hier entsteht deine Puzzle-Welt. Gerade bauen wir das Fundament.',
  'start.phaseBadge': 'Entwicklungsstand · Phase 1',
  'start.systemCheck': 'Systemcheck',
  'start.benchmark': '256-Teile-Test',
  'start.mascotLabel': 'Pino winkt dir zu',

  'check.title': 'Systemcheck',
  'check.intro': 'Prüft, ob alle Bausteine der App auf diesem Gerät funktionieren.',
  'check.status.ok': 'OK',
  'check.status.fail': 'Fehler',
  'check.status.pending': 'Prüft …',
  'check.status.unsupported': 'Nicht auf dieser Plattform',
  'check.platform': 'Plattform',
  'check.fonts': 'Schrift Nunito',
  'check.tokens': 'Design-Tokens',
  'check.sqlite': 'Datenbank (SQLite)',
  'check.fs': 'Dateispeicher',
  'check.skia': 'Grafik (Skia)',
  'check.gesture': 'Gesten & Animation',
  'check.gestureHint': 'Zieh das Puzzleteil – es federt zurück.',
  'check.gestureDone': 'Gezogen!',
  'check.picker': 'Bildauswahl & Bildverarbeitung',
  'check.pickerButton': 'Bild auswählen',
  'check.pickerHint': 'Das Bild wird nur verkleinert angezeigt und nicht gespeichert.',
  'check.pickerCanceled': 'Abgebrochen',
  'check.back': 'Zurück',

  'bench.title': '256-Teile-Test',
  'bench.intro': 'Leistungstest für die Puzzle-Darstellung. Zieh ein Teil und beobachte die Bildrate.',
  'bench.pieces': 'Teile',
  'bench.build': 'Aufbau ms',
  'bench.fps': 'fps',
  'bench.minFps': 'min',
  'bench.moves': 'Züge',
  'bench.shuffle': 'Mischen',
  'bench.loading': 'Lädt …',
} as const;

export type MessageKey = keyof typeof de;
