# Puzzle Engine – Geometrie (Spezifikation)

Status: **Spezifikation (Phase 4)**. Ein ungetesteter Prototyp der Kanten-Idee existiert nur für die Mockups (`scripts/design-preview/jigsaw.mjs`) und wird **nicht** in die App übernommen.

## Grid-Berechnung

Eingabe: gewünschte Teilezahl `n` (Preset 4…256) oder `rows × cols`, Bildseitenverhältnis `a = w / h`.

1. Ideal: `cols ≈ sqrt(n · a)`, `rows ≈ n / cols`.
2. Kandidaten `(r, c)` in der Umgebung bewerten nach (a) Abweichung von `n`, (b) Abweichung des Teile-Seitenverhältnisses `(w/c)/(h/r)` von 1.
3. Ergebnis zeigt die tatsächliche Teilezahl an (z. B. 16 gewünscht, Querformat 4:3 → 4 × 4 = 16; 16:9 → 3 × 5 = 15 oder 3 × 6 = 18 → der passendere Wert wird angezeigt).
4. Manuelle Eingabe: 2 ≤ rows, cols ≤ 16.

## Kanten

- Jede **innere Kante** wird genau einmal erzeugt (Seed-PRNG `mulberry32`): Richtung (Tab/Blank), leichte Positions-/Größen-Variation.
- Beide Nachbarn verwenden **dieselbe Kurve** (einmal vorwärts, einmal umgekehrt) → exakte Passform, keine Lücken/Überlappungen.
- Randkanten sind gerade.
- Form `square`: alle Kanten gerade (für 2–4-Jährige).
- Kurven als kubische Bézier-Segmente in normalisierten Koordinaten; Tab-Höhe ≤ 25 % der Kantenlänge, damit die Bounding-Box pro Teil = Zelle ± 25 %.

## Ausgabe

```ts
interface PieceShape {
  id: number;            // row * cols + col
  row: number; col: number;
  cell: Rect;            // Zielzelle im Bildraum
  bounds: Rect;          // inkl. Tabs
  path: PathCommand[];   // Bildraum, renderer-unabhängig
}
```

## Hit-Testing (256 Teile)

- Uniform-Grid-Buckets über dem Spielfeld; Teil wird in alle Buckets seiner Bounds eingetragen.
- Kandidaten aus Bucket → absteigend nach z-Order → Bounds-Test → Punkt-in-Polygon auf vorab abgeflachtem Pfad (≈ 48 Punkte/Teil).
- Ziel: < 0,5 ms pro Touch bei 256 Teilen auf Mittelklasse-Android (wird per Benchmark-Test geprüft).

## Snapping

- Teil rastet ein, wenn Abstand zur Zielposition < `snapTolerance` (Standard 18 % der Zellbreite; „Easy“ bis 35 %).
- Optional: Nachbar-Snapping (Gruppen) für größere Puzzles.
- Eingerastete Teile sind fixiert (MVP) und wandern in der z-Order nach unten.

## Tests (Pflicht)

Determinismus (gleicher Seed → identische Pfade) · Kantenidentität Nachbarn · Flächensumme = Bildfläche (Rasterisierungstest) · Grid-Berechnung für alle Presets × Seitenverhältnisse · Hit-Test-Korrektheit an Tabs/Blanks · Snap-Schwellen · Serialisierungs-Roundtrip.
