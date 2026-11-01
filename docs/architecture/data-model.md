# Datenmodell (Entwurf)

Status: **Entwurf** – wird mit Phase 3/5 als SQLite-Migration `001_initial.sql` umgesetzt und hier aktualisiert.

## Speicherorte

| Daten | Ort | Hinweis |
|---|---|---|
| Original (zugeschnitten, max. 2048 px Kante, JPEG q≈0,85, ohne EXIF) | `documentDirectory/images/<imageId>/source.jpg` | wird nie geloggt |
| Spielbild (max. 1536 px) | `…/<imageId>/play.jpg` | Skia-Textur |
| Thumbnail (512 px) | `…/<imageId>/thumb.jpg` | Sammlung/Home |
| Metadaten, Fortschritt, Einstellungen | SQLite `puzzle-studio.db` | |
| Temporäre Picker-/Crop-Dateien | `cacheDirectory` | nach Erstellung gelöscht |

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

`deletePuzzle(id)`: Transaktion löscht `puzzle` (+ `puzzle_state` per Cascade); falls das Bild von keinem anderen Puzzle genutzt wird, werden `image`-Zeile **und** der Ordner `images/<imageId>/` entfernt. „Alle lokalen Daten löschen“ (Elternbereich) entfernt DB-Datei und `images/` vollständig.

## Settings-Keys (MVP)

`onboarding.completed`, `play.defaultDifficulty`, `sound.enabled`, `sound.music`, `haptics.enabled`, `motion.reduced`, `parent.gate.lastPassedAt`.
