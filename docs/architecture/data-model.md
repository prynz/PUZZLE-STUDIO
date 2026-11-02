# Datenmodell (Entwurf)

Status: **Teilweise umgesetzt (Phase 3)**: Tabellen `schema_migration`, `setting` (Migration 1) und `image` (Migration 2, siehe `apps/mobile/storage/migrations.ts`) sind live. Die Tabelle `image` speichert Zuschnitt/Drehung sowie die Dateinamen von Arbeitsversion und Thumbnail direkt (je Bild eine aktuelle Arbeitsversion); `puzzle`, `puzzle_state`, Erfolge folgen in Phase 4–6. In der DB stehen nur **Dateinamen**, keine absoluten Pfade (iOS-Containerpfade ändern sich bei Updates).

## Speicherorte – nicht-destruktiver Bild-Workflow

**Grundsatz (PO-Vorgabe Phase 1):** Das Original wird **nie überschrieben oder verändert**. Zuschnitt, Drehung und Skalierung sind **Parameter**, keine Bearbeitung des Originals. Die Puzzle-Engine arbeitet ausschließlich mit **abgeleiteten Arbeitsversionen**, die jederzeit aus Original + Parametern neu erzeugt werden können.

| Daten                                                                                                         | Ort                                                 | Hinweis                                                  |
| ------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- | -------------------------------------------------------- |
| **Original** – bytegleiche Kopie dessen, was Picker/Kamera liefern (Galerie-Foto des Geräts bleibt unberührt) | `documentDirectory/images/<imageId>/original.<ext>` | read-only behandelt, nie geloggt, verlässt das Gerät nie |
| **Arbeitsversion** – Zuschnitt/Drehung angewendet, max. 1536 px, JPEG q≈0,85, **ohne EXIF/GPS**               | `…/<imageId>/work-<transformHash>.jpg`              | Skia-Textur der Engine; Cache, jederzeit neu erzeugbar   |
| **Thumbnail** – 512 px, ohne EXIF                                                                             | `…/<imageId>/thumb-<transformHash>.jpg`             | Sammlung/Home; Cache                                     |
| Metadaten, Zuschnitt-Parameter, Fortschritt, Einstellungen                                                    | SQLite `puzzle-studio.db`                           |                                                          |
| Temporäre Picker-/Crop-Dateien                                                                                | `cacheDirectory`                                    | nach Übernahme gelöscht                                  |

`transformHash` = Hash aus (Crop-Rechteck, Drehung, Zielgröße, Pipeline-Version). Ändert sich ein Parameter, entsteht eine neue Arbeitsversion; die alte wird aufgeräumt, wenn kein Puzzle sie mehr nutzt. Mehrere Puzzles aus demselben Foto (z. B. 9 und 64 Teile, anderer Ausschnitt) teilen sich ein Original.

Speicherplatz: Originale können groß sein (12–48 MP). Der Elternbereich zeigt den Verbrauch und erlaubt „Originale nach Fertigstellung entfernen“ (dann bleibt nur die Arbeitsversion; Neu-Zuschnitt nicht mehr möglich – wird vorher erklärt).

## Tabellen

```sql
CREATE TABLE image (
  id            TEXT PRIMARY KEY,          -- UUID v4, nie Dateiname des Nutzers
  source_kind   TEXT NOT NULL,             -- 'camera' | 'library' | 'sample'
  width         INTEGER NOT NULL,
  height        INTEGER NOT NULL,
  bytes         INTEGER NOT NULL,
  created_at    INTEGER NOT NULL
);

CREATE TABLE puzzle (
  id            TEXT PRIMARY KEY,
  image_id      TEXT NOT NULL REFERENCES image(id) ON DELETE CASCADE,
  title         TEXT,                      -- optional, lokal
  crop_x        REAL NOT NULL,             -- Zuschnitt relativ zum Original (0..1), nicht-destruktiv
  crop_y        REAL NOT NULL,
  crop_w        REAL NOT NULL,
  crop_h        REAL NOT NULL,
  rotation      INTEGER NOT NULL DEFAULT 0,-- 0 | 90 | 180 | 270
  work_file     TEXT NOT NULL,             -- abgeleitete Arbeitsversion (Cache, neu erzeugbar)
  rows          INTEGER NOT NULL,
  cols          INTEGER NOT NULL,
  shape         TEXT NOT NULL,             -- 'classic' | 'square'
  seed          INTEGER NOT NULL,          -- deterministische Geometrie
  engine_version INTEGER NOT NULL,
  status        TEXT NOT NULL,             -- 'new' | 'in_progress' | 'completed'
  created_at    INTEGER NOT NULL,
  updated_at    INTEGER NOT NULL,
  completed_at  INTEGER,
  best_moves    INTEGER                    -- keine Zeitmessung als Druckmittel
);

CREATE TABLE puzzle_state (
  puzzle_id     TEXT PRIMARY KEY REFERENCES puzzle(id) ON DELETE CASCADE,
  state_version INTEGER NOT NULL,
  state_json    TEXT NOT NULL,             -- serialisierter PuzzleState (Positionen, Gruppen, z-Order)
  placed_count  INTEGER NOT NULL,
  updated_at    INTEGER NOT NULL
);

CREATE TABLE achievement_unlock (
  achievement_id TEXT PRIMARY KEY,         -- z. B. 'first_solve'
  unlocked_at    INTEGER NOT NULL
);

CREATE TABLE reward_unlock (
  reward_id     TEXT PRIMARY KEY,          -- Rahmen, Sticker, Hintergründe
  unlocked_at   INTEGER NOT NULL
);

CREATE TABLE setting (
  key           TEXT PRIMARY KEY,
  value_json    TEXT NOT NULL
);

CREATE TABLE schema_migration (version INTEGER PRIMARY KEY, applied_at INTEGER NOT NULL);
```

Achievement-Definitionen sind **Code** (`packages/game-progression`), nicht Daten – die DB speichert nur Freischaltungen.

## Löschen

`deletePuzzle(id)`: Transaktion löscht `puzzle` (+ `puzzle_state` per Cascade) und nicht mehr genutzte Arbeitsversionen; falls das Original von keinem anderen Puzzle genutzt wird, werden `image`-Zeile **und** der Ordner `images/<imageId>/` (inkl. Original) entfernt. Löschen ist die einzige Operation, die ein Original entfernt – und nur auf ausdrückliche Aktion hin. „Alle lokalen Daten löschen“ (Elternbereich) entfernt DB-Datei und `images/` vollständig.

## Settings-Keys (MVP)

`onboarding.completed`, `play.profile` (`toddler` | `kid` | `pro`), `play.misplaceMode`, `play.defaultDifficulty`, `sound.enabled`, `sound.music`, `haptics.enabled`, `motion.reduced`, `parent.gate.lastPassedAt`.
