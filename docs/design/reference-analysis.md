# Analyse der Designreferenz

**Datei:** [`reference/visual-style-reference.png`](reference/visual-style-reference.png) (1190 × 793 px, vom Product Owner bereitgestellt, am 2026-11-01 aus dem Chat-Upload abgelegt)

Die Referenz zeigt drei Onboarding-Screens einer fremden App („Peekaboo“). Für PUZZLE STUDIO ist sie **verbindlich für Stil und Stimmung**. Inhalt, Marke, Logo und Figur werden **nicht** übernommen.

## 1. Gesamteindruck

| Merkmal | Beobachtung | Übernahme für PUZZLE STUDIO |
|---|---|---|
| Stil | Soft-Pastel-Cartoon, gemalte 2D-Illustration mit weichen Verläufen, keine harten Konturen | ✅ Gleicher Illustrationsstil |
| Stimmung | Ruhig, warm, freundlich, „gentle“ | ✅ Leitmotiv „sanft & spielerisch“ |
| Dichte | Sehr wenig Text pro Screen, eine Hauptaktion | ✅ Max. 1 primäre CTA pro Screen |
| Aufbau | Titel oben → Untertitel → Figur als Bildmittelpunkt → CTA unten | ✅ Onboarding identisch aufgebaut, Home/Creator angelehnt |

## 2. Farbe (gemessen)

Farbproben aus der Referenz (Pixel-Clustering, 24er Quantisierung), mit der Brief-Palette abgeglichen:

| Bereich | gemessen (ca.) | Token |
|---|---|---|
| Screen-Hintergrund 1 | `#F0F0D8`–`#FFF1D8` (warmes Creme) | `cream #FFF8ED` |
| Screen-Hintergrund 2 | `#F0D8D8`–`#F0E3EC` (Blush/Lavendel) | `pink #F9EAF0`, `gradient.screenDream` |
| Gelber Button | `#F0D890` → `#F0C060` (Verlauf von hell nach Honig) | `gradient.buttonAccent` |
| Lila Button | `#9078C0` → `#7860C0` | `gradient.buttonPrimary` (`#B3A0F0 → #9983D4 → #7E68BE`) |
| Fortschritts-Punkt aktiv | `#8465AF` | `purple` / `purple600` |
| Fortschritts-Punkt inaktiv | `#DDC2DB` | `lavender200` |
| Auswahlkarten | Mint-/Gelb-/Rosé-Tönungen | `surface.mint / yellow / pink` |
| Wiese | `#AAB06C`, Pastellgrün | `green`, `green600` |
| Wangen | `#F7BCCB` | `peach` (Maskottchen `#FFA996` @55 %) |

Ergebnis: Die Brief-Palette deckt die Referenz gut ab. Ergänzt wurden **Tonstufen** (100/200/600/700) für Flächen, gedrückte Zustände und kontrastreichen Text.

**Bewusste Abweichung:** `Text Secondary #77718A` erreicht auf Creme nur 4,41 : 1 (WCAG AA verlangt 4,5 : 1). Token auf `#6C6680` abgedunkelt (5,17 : 1 auf Creme, ≥ 4,6 : 1 auf allen getönten Flächen).

## 3. Typografie

- Gerundete, fette Sans (Referenz wirkt wie Nunito/Quicksand Bold). Überschriften sehr fett (≈ 800–900), zweizeilig, zentriert.
- Fließtext klein, mittelgrau-lila, max. 2 Zeilen.
- → **Nunito** in 600/700/800/900. Keine zweite Schrift nötig (Inter entfällt vorerst, siehe [design-system.md](design-system.md)).

## 4. Formen & Komponenten

- **Buttons:** volle Pillenform, ~64 px hoch, vertikaler Verlauf, weißer Innenrand, kleiner runder Pfeil-Kreis rechts, weicher Schatten.
- **Karten:** große Radien (~24 px), helle getönte Flächen, weißer Rand, Illustration oben, Label unten.
- **Fortschritt:** Punkte (aktiver Punkt dunkler) bzw. Ring mit „2 of 3“.
- **Schatten:** sehr weich, niedrige Deckkraft, leicht farbig – nie schwarz.

## 5. Illustration & Hintergrund

- Wolken (weiß, halbtransparent), kleine gelbe/lila Sterne, Funkel-Sterne, Blätter, Blüten am Rand, Wiese am unteren Rand.
- Dekoration nur an den Rändern, nie hinter Text oder Buttons.
- Leicht gemalte Textur → in der App über sanfte Verläufe + Glanzlichter (Skia/SVG) angenähert, ohne Bitmap-Texturen (Performance, Speicher).

## 6. Figur

Rundliche, weiche Figur mit großen dunklen Augen mit zwei Glanzpunkten, rosa Wangen, kleinem Mund, kurzen Armen, Spross auf dem Kopf.
→ Wir übernehmen **nur die Prinzipien** (Rundheit, Augen, Wangen, Proportionen). Eigene Figur **„Pino“**: ein gelbes, weiches Puzzleteil (andere Farbe, andere Silhouette, Puzzle-Tab statt Spross, Lavendel-Stern statt Pflanze). Details: [mascot-guidelines.md](mascot-guidelines.md).
