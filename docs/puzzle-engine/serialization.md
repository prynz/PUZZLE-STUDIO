# Puzzle Engine – Serialisierung (Spezifikation)

Status: **umgesetzt (Phase 4)** – `serializeState` / `parseState` / `migrateState` in `packages/puzzle-engine/src/serialize.ts`. Speichern in SQLite folgt mit dem Spielbrett (Phase 5).

## Grundsatz

Geometrie wird **nie** gespeichert, sondern aus `PuzzleDefinition` (Seed, rows, cols, shape, imageSize, `engineVersion`) neu erzeugt. Gespeichert wird nur der veränderliche `PuzzleState`.

```ts
interface PuzzleStateV1 {
  v: 1;
  pieces: Array<{
    id: number;
    x: number;
    y: number; // relativ zur Brettgröße (0..1 = auf dem Brett; lose Teile daneben dürfen < 0 / > 1 sein, Grenze ±10)
    state: 'tray' | 'loose' | 'locked'; // locked = eingerastet, unveränderlich
    basket?: string; // id der eigenen Schale („mine-1“ … „mine-3“), in die das Kind das Teil gelegt hat
  }>;
  z: number[]; // z-Order der losen Teile (Piece-IDs)
  trayOrder: number[]; // Reihenfolge in der Ablage
  baskets: Array<{ id: string; label?: string; order: number; custom?: true }>; // umbenannt/umsortiert; custom = „Meine Schale“ (max. 3)
  misplaceMode: 'nudge' | 'return'; // falsch gelegt: zum freien Platz gleiten | zurück in die Schale
  moves: number;
  referenceVisible: boolean;
}
```

## Regeln

- `locked` ist endgültig: Laden erzwingt bei `locked` die exakte Zielposition (Positionswerte werden ignoriert); nur „Puzzle neu starten“ setzt zurück.

- `engineVersion` im Puzzle-Datensatz: Ändert sich der Kanten-Algorithmus, bleibt die alte Version für bestehende Puzzles erhalten (Geometrie identisch beim Wiederherstellen).
- `v` im State: Migrationsfunktionen `migrateState(vN → vN+1)`, getestet.
- Laden validiert den State (Typ-Guards, IDs vollständig, Werte im Bereich). Ungültiger State → Puzzle wird frisch gemischt, Nutzer sieht einen freundlichen Hinweis; nie ein Absturz.
- Speichern: debounced (500 ms) nach jedem Snap/Drop + sofort bei `AppState → background` (App-Seite, Phase 5).
- `group` (Nachbar-Snapping) ist Post-MVP und deshalb nicht Teil von v1.
- Laufzeit-Positionen liegen im Bildraum (obere linke Ecke der Zelle); erst beim Speichern wird durch Breite/Höhe geteilt.
