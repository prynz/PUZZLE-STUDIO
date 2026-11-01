# Puzzle Engine – Serialisierung (Spezifikation)

Status: **Spezifikation (Phase 4/5)**.

## Grundsatz

Geometrie wird **nie** gespeichert, sondern aus `PuzzleDefinition` (Seed, rows, cols, shape, imageSize, `engineVersion`) neu erzeugt. Gespeichert wird nur der veränderliche `PuzzleState`.

```ts
interface PuzzleStateV1 {
  v: 1;
  pieces: Array<{
    id: number;
    x: number; y: number;      // normalisiert 0..1 relativ zum Spielfeld (geräteunabhängig)
    placed: boolean;
    group?: number;            // für Nachbar-Snapping
  }>;
  z: number[];                 // z-Order (Piece-IDs)
  moves: number;
  referenceVisible: boolean;
}
```

## Regeln

- `engineVersion` im Puzzle-Datensatz: Ändert sich der Kanten-Algorithmus, bleibt die alte Version für bestehende Puzzles erhalten (Geometrie identisch beim Wiederherstellen).
- `v` im State: Migrationsfunktionen `migrateState(vN → vN+1)`, getestet.
- Laden validiert den State (Typ-Guards, IDs vollständig, Werte im Bereich). Ungültiger State → Puzzle wird frisch gemischt, Nutzer sieht einen freundlichen Hinweis; nie ein Absturz.
- Speichern: debounced (500 ms) nach jedem Snap/Drop + sofort bei `AppState → background`.
