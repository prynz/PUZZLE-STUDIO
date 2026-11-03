# Sterne, Meilensteine und Belohnungen

Status: **umgesetzt (Phase 6)** – Logik in `packages/game-progression` (reines TypeScript, 10 Tests, 100 % Abdeckung), Oberfläche in `apps/mobile/features/awards` und `features/collection`.

## Grundsätze (aus dem Produktkonzept)

- Wenige, freundliche Meilensteine. **Keine** Zeitmessung, keine Countdowns, keine Serien („Streaks“), nichts kann verloren gehen, keine Käufe.
- Alles wird aus einem **Protokoll fertiger Puzzles** abgeleitet (Tabelle `completion`, nur anhängen). „Nochmal puzzeln“ und Löschen nehmen nie etwas weg; ein Puzzle zählt nur einmal (mit seiner größten Fertigstellung).
- Freigeschaltete Meilensteine sind dauerhaft (Tabelle `achievement_unlock`).

## Sterne

Pro fertigem Puzzle, nach Größe – nie nach Tempo: bis 16 Teile ⭐, bis 64 Teile ⭐⭐, darüber ⭐⭐⭐.

## Meilensteine und Belohnungen

| Meilenstein       | Erreicht, wenn …                                    | Belohnung                |
| ----------------- | --------------------------------------------------- | ------------------------ |
| Erstes Puzzle     | ein Puzzle fertig                                   | Rahmen „Sonne“           |
| Drei Puzzles      | drei verschiedene Puzzles fertig                    | Sticker „Pino winkt“     |
| Mein eigenes Bild | ein Puzzle aus eigenem Foto (Kamera/Galerie) fertig | Rahmen „Regenbogen“      |
| 25 Teile          | ein Puzzle mit ≥ 25 Teilen fertig                   | Sticker „Stern“          |
| Rund und eckig    | je ein Puzzle mit Puzzleteilen und eckig            | Sticker „Herz“           |
| 64 Teile          | ein Puzzle mit ≥ 64 Teilen fertig                   | Hintergrund „Wiese“      |
| Zehn Puzzles      | zehn verschiedene Puzzles fertig                    | Hintergrund „Himmel“     |
| 100 Teile         | ein Puzzle mit ≥ 100 Teilen fertig                  | Rahmen „Gold“            |
| 25 Sterne         | 25 Sterne gesammelt                                 | Hintergrund „Traumnacht“ |
| Riesen-Puzzle     | ein Puzzle mit 256 Teilen fertig                    | Sticker „Pokal“          |

Die Ids (`first_puzzle`, …) werden gespeichert und dürfen nie umbenannt werden.

## Belohnungen anwenden

- **Hintergrund** → Dekoration des Spieltischs (Wiese, Himmel, Traumnacht).
- **Rahmen** → fertige Puzzles in Sammlung und Start tragen den Rahmen.
- **Sticker** → Sticker-Album im Tab „Erfolge“.
- Auswahl wird in den Einstellungen gespeichert (`reward.background`, `reward.frame`) und nur verwendet, solange sie freigeschaltet ist; „Standard“ ist immer wählbar.
- Aussehen zentral in `packages/ui/src/illustrations/rewards.ts` – finale Illustrationen können später ohne Screen-Änderung eingesetzt werden.
