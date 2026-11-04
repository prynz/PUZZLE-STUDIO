# Maskottchen „Pino“

Status: **Umgesetzt (Phase 2), Stil-Update 2026-11-04 (Mint, weiches 3D), Gestaltung noch nicht final.** Quelle: [`packages/ui/src/mascot/pino.ts`](../../packages/ui/src/mascot/pino.ts) (Zeichnung), [`theme.ts`](../../packages/ui/src/mascot/theme.ts) (Farben), App-Komponente `<Mascot emotion=… />`. Übersicht: [`concept/concept-mascot-sheet.png`](concept/concept-mascot-sheet.png).
Die React-Native-Komponente `<Mascot emotion="…" />` entsteht in Phase 2 aus derselben Geometrie.

## Charakter

Pino ist ein kleines, weiches **Puzzleteil**. Er ist neugierig, geduldig und freut sich über jeden Fortschritt – nie ungeduldig, nie enttäuscht.

| Merkmal       | Umsetzung                                                                                                                                                                                                  |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Silhouette    | Abgerundetes Quadrat mit Puzzle-**Tab als Kopf-„Knubbel“**, seitliche Tabs als Arme, kurze Füße                                                                                                            |
| Farbe         | **Seit 2026-11-04 (PO-Referenz):** frisches Mint, weiches 3D – runder Lichtverlauf `#F1FFF4 → leaf #93D6AC → leaf600 #4DAA7A` von oben links, dunklere Unterseite, kaum sichtbare Kontur (`leaf700` @16 %) |
| Markenzeichen | Gelber Stern-Clip am Kopf (`palette.yellow`) – leuchtet auf dem Grün                                                                                                                                       |
| Gesicht       | Große dunkle Augen (`ink`) mit 2 Glanzpunkten, rosige Wangen @72 %, kleiner Mund                                                                                                                           |
| Licht         | Großer weicher Glanz oben links + Glanzpunkt, heller Bauch-Bogen, grünes Leuchten statt grauem Schatten am Boden                                                                                           |

## Abgrenzung zur Referenz

Die Referenzfigur (lila Blob mit Spross) wird **nicht** kopiert: andere Silhouette (Puzzleteil statt Tropfen), eigenes Accessoire (Stern statt Spross), eigener Name. Kein Peekaboo-Logo, keine fremden Markenbestandteile.

Stil-Referenz vom 2026-11-04 (weiches, glänzendes 3D in Mint, Milchglas-Karten): übernommen werden nur **Licht, Material und Farbstimmung**. Die dortige Figur (grüner Wolken-Blob) wird nicht nachgebildet – Pino bleibt ein Puzzleteil mit Stern-Clip, Armen und Füßen.

## Zustände

| #   | `emotion`   | Einsatz                                           |
| --- | ----------- | ------------------------------------------------- |
| 1   | `greeting`  | Welcome, App-Start, leere Zustände                |
| 2   | `happy`     | Home-Begrüßung, Teil eingerastet                  |
| 3   | `thinking`  | Creator (Auswahl), Laden                          |
| 4   | `surprised` | Neues Achievement entdeckt                        |
| 5   | `excited`   | Neues Puzzle erstellt                             |
| 6   | `success`   | Puzzle abgeschlossen                              |
| 7   | `encourage` | Längere Pause ohne Fortschritt, „Fast geschafft!“ |
| 8   | `sleeping`  | Pause-Screen, Ruhemodus, Nachtmodus               |

## Regeln

- Immer über die `Mascot`-Komponente – keine eingebetteten Einzelbilder.
- Mindestgröße 64 dp (darunter verliert das Gesicht an Lesbarkeit).
- Nicht verzerren, nicht umfärben, Stern-Clip immer sichtbar.
- Max. **ein** Maskottchen pro Screen.
- Animation: dezentes Atmen/Wippen (≤ 3 % Scale, 2,4 s) nur auf Welcome/Erfolg; bei Reduced Motion statisch.
- Pino spricht in kurzen, positiven Sätzen in Du-Form („Fast geschafft!“, „Super gemacht!“). Nie Druck, nie Zeitlimits.
- Barrierefreiheit: `accessibilityLabel` z. B. „Pino freut sich“; rein dekorative Verwendung → `accessible={false}`.

## Austauschbarkeit (PO: Maskottchen wird noch angepasst)

Pino ist bewusst so gebaut, dass er **später ohne App-Umbau** geändert oder ersetzt werden kann:

| Was soll sich ändern?                                        | Wo                                                           | Auswirkung                                  |
| ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------- |
| Farben (Körper, Wangen, Stern …)                             | `packages/ui/src/mascot/theme.ts`                            | überall sofort: App, Icons, Splash, Mockups |
| Form, Gesicht, Posen                                         | `packages/ui/src/mascot/pino.ts`                             | überall sofort                              |
| Komplett neue Illustrationen (z. B. von einer Illustratorin) | `pinoSvg()` liefert dann je Emotion die gelieferte SVG-Datei | keine Änderung an Screens                   |
| Neue Emotion                                                 | Eintrag in `MASCOT_EMOTIONS`                                 | Tests prüfen automatisch Vollständigkeit    |

Feste Schnittstelle für alle Screens: `<Mascot emotion="greeting" size={160} animated />` mit den 8 Emotionen. Screens zeichnen Pino **nie selbst**. App-Icon, Splash und Konzept-Mockups werden per `pnpm brand:assets` bzw. `pnpm design:preview` aus derselben Quelle neu erzeugt. Lieferformat für finale Illustrationen: SVG (Vektor, viewBox quadratisch, ohne Text/Schriften) – je Emotion eine Datei.

## Offene Punkte

- Finales Illustrations-Polishing (ggf. durch Illustrator:in) – die Geometrie bleibt Vektor, damit sie in Skia/SVG skalierbar und klein bleibt.
- App-Icon auf Basis von Pino (Phase 9).
