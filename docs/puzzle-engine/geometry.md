# Puzzle Engine – Geometrie (Spezifikation)

Status: **umgesetzt (Phase 4)** in `packages/puzzle-engine` – reines TypeScript, 87 Vitest-Tests, Zeilenabdeckung 100 %. Der Mockup-Prototyp `scripts/design-preview/jigsaw.mjs` bleibt davon getrennt (nur Konzeptbilder).

## Grid-Berechnung

Eingabe: gewünschte Teilezahl `n` (Preset 4…256) oder `rows × cols`, Bildseitenverhältnis `a = w / h`.

1. Ideal: `cols ≈ sqrt(n · a)`, `rows ≈ n / cols`.
2. Kandidaten `(r, c)` in der Umgebung bewerten nach (a) Abweichung von `n`, (b) Abweichung des Teile-Seitenverhältnisses `(w/c)/(h/r)` von 1.
3. Ergebnis zeigt die tatsächliche Teilezahl an (z. B. 16 gewünscht, Querformat 4:3 → 4 × 4 = 16; 16:9 → 3 × 5 = 15 oder 3 × 6 = 18 → der passendere Wert wird angezeigt).
4. Manuelle Eingabe: 2 ≤ rows, cols ≤ 16.

Umsetzung `chooseGrid(n, a)`: Bewertung = `4 · |r·c − n| / n + |ln(Teil-Seitenverhältnis)|` über alle 2…16 × 2…16; bei Gleichstand gewinnt der erste Kandidat (deterministisch). Presets: `PIECE_PRESETS` = 4, 9, 16, 25, 36, 49, 64, 100, 144, 196, 256. Getestet für alle Presets × 4:3, 1:1, 3:4, 16:9, 9:16 (Abweichung ≤ 25 %, Teile nie extrem schmal).

## Kanten

- Jede **innere Kante** wird genau einmal erzeugt (Seed-PRNG `mulberry32`): Richtung (Tab/Blank), leichte Positions-/Größen-Variation.
- Beide Nachbarn verwenden **dieselbe Kurve** (einmal vorwärts, einmal umgekehrt) → exakte Passform, keine Lücken/Überlappungen.
- Randkanten sind gerade.
- Form `square`: alle Kanten gerade (für 2–4-Jährige).
- Kurven als kubische Bézier-Segmente; Tab-Höhe ≤ 25 % der **kürzeren Teilseite** (Vorlage 21,6 % × Größe 0,92–1,1 → max. 23,8 %), damit die Bounding-Box pro Teil = Zelle ± 25 % – auch bei nicht quadratischen Teilen.
- Zufallsfolge je innerer Kante: Richtung, Verschiebung (±4 %), Größe. Die Reihenfolge der Zufallszahlen ist Teil von `ENGINE_VERSION` (= 1).

## Ausgabe

```ts
interface PieceShape {
  id: number; // row * cols + col
  row: number;
  col: number;
  cell: Rect; // Zielzelle im Bildraum
  bounds: Rect; // inkl. Tabs
  path: PathCommand[]; // Bildraum, renderer-unabhängig
  outline: number[]; // abgeflachter Umriss [x0, y0, …] für den Hit-Test (≤ 96 Punkte)
  edges: { top; right; bottom; left }; // 1 Nase, -1 Bucht, 0 gerade
  kind: 'corner' | 'edge' | 'inner';
}
```

Bildmapping: Der Bildraum des Puzzles **ist** der Bildraum der Arbeitsversion (`width`/`height` der Definition). `cell` ist damit direkt der Bildausschnitt eines Teils; `fitBoard()` skaliert das Brett in eine Bildschirmfläche. `toSvgPath()` liefert den Pfad für Skia (`MakeFromSVGString`).

## Hit-Testing (256 Teile)

- Uniform-Grid-Buckets über dem Spielfeld; Teil wird in alle Buckets seiner Bounds eingetragen.
- Kandidaten aus Bucket → absteigend nach z-Order → Bounds-Test → Punkt-in-Polygon auf vorab abgeflachtem Pfad (≈ 48 Punkte/Teil).
- Ziel: < 0,5 ms pro Touch bei 256 Teilen auf Mittelklasse-Android (wird per Benchmark-Test geprüft).
- Umsetzung: `hitShapesFor()` (statisch) + `buildHitGrid()` (nach jedem Ablegen neu, O(n)) + `hitTest()`. Nur Arrays/Objekte und `'worklet'`-Direktive → läuft auf JS- und UI-Thread. Teile außerhalb der Fläche landen in Randbuckets (Abfragen bleiben korrekt).
- Messung: Vitest-Benchmark (Node) + Anzeige „Treffer µs“ im 256-Teile-Test auf dem Gerät.

## Snapping

- Teil rastet ein, wenn Abstand zur Zielposition ≤ `snapTolerance` × kürzere Teilseite. Je Spielhilfe-Profil (`assistFor`): Kleinkind 35 %, Kind 26 %, Profi 18 %.
- Nachbar-Snapping (Gruppen) ist Post-MVP und deshalb **nicht** angelegt.
- Eingerastete Teile sind **fest (locked)**: nicht mehr greifbar, nicht im Hit-Test, werden in die Brett-Ebene eingebacken (PO-Vorgabe, siehe [gameplay-concept.md](../product/gameplay-concept.md)).
- Toleranz je Hilfe-Stufe. Fehlplatzierung (`dropPiece`): `nudge` → `findFreeSpot()` sucht in quadratischen Ringen (Schritt ¼ Teilseite, max. 24 Ringe) den nächsten Platz ohne Überlappung mit eingerasteten und losen Teilen, innerhalb der Spielfläche und **nicht** auf dem eigenen Zielplatz (sähe sonst „gelegt“ aus); kein Platz frei → zurück in die Ablage. `return` → zurück in die Ablage (dort zuerst angezeigt).

## Klassifizierung & Tipps

- `piece.kind` → `corner` | `edge` | `inner` – aus der **Gitterposition** (nicht aus geraden Kanten, damit es auch bei der Form `square` stimmt). Basis der Schalen „Ränder“/„Ecken“.
- `suggestPiece(puzzle, state, among?)` → ein noch nicht gelegtes Teil: 1. meiste eingerastete Nachbarn, 2. Rahmen zuerst (Ecke vor Rand), 3. was das Kind zuerst sieht (oberstes loses Teil, dann Ablage-Reihenfolge). `among` beschränkt auf Häppchen/Schale.
- Häppchen-Modus: `planBites()` teilt das Gitter in Blöcke aus 2–3 × 2–3 Teilen (4–9 Teile), Reihenfolge Außenring im Uhrzeigersinn ab oben links, dann nach innen; unter 25 Teilen ein einziges Häppchen. `activeBite()`, `biteTray()` (max. 4 Teile). Motiv-bezogene Häppchen („das Segelboot“) folgen, sobald Farbwerte pro Teil vorliegen (Phase 5).
- Spielhilfe-Profile: `assistFor(profile, teile)` liefert alle Regeln zentral (Toleranz, Fehlplatzierung, Häppchen, Schalen, Ablage-Reihen, Tipp-Angebot).
- Farbgruppen kommen aus `image-processing` (`pieceColorGroups`), nicht aus der Geometrie.

## Tests (Pflicht)

Determinismus (gleicher Seed → identische Pfade) · Kantenidentität Nachbarn · Flächensumme = Bildfläche (Rasterisierungstest) · Grid-Berechnung für alle Presets × Seitenverhältnisse · Hit-Test-Korrektheit an Tabs/Blanks · Snap-Schwellen · Serialisierungs-Roundtrip.
