# Maskottchen „Pino“

Status: **Umgesetzt; seit 2026-11-04 nach dem Konzeptbild des PO als glänzendes Puzzleteil. Gelieferte Original-Bilder des PO: `greeting`, `thinking` (seit 2026-11-05 in der App); übrige Stimmungen vorerst als Vektor-Nachzeichnung.** Quelle: [`packages/ui/src/mascot/pino.ts`](../../packages/ui/src/mascot/pino.ts) (Zeichnung), [`theme.ts`](../../packages/ui/src/mascot/theme.ts) (Farben), App-Komponente `<Mascot emotion=… />`. Übersicht: [`concept/concept-mascot-sheet.png`](concept/concept-mascot-sheet.png).
Die React-Native-Komponente `<Mascot emotion="…" />` entsteht in Phase 2 aus derselben Geometrie.

## Charakter

Pino ist ein kleines, weiches **Puzzleteil**. Er ist neugierig, geduldig und freut sich über jeden Fortschritt – nie ungeduldig, nie enttäuscht.

| Merkmal    | Umsetzung                                                                                                                          |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Herkunft   | **Eigenes Konzeptbild des PO** (2026-11-04): „genau dieses Maskottchen“                                                            |
| Silhouette | Weich aufgeblasenes **Puzzleteil mit vier Knubbeln** (oben, rechts, unten, links), fließende Übergänge, leicht schräg (−4 … −12°)  |
| Farbe      | Verlauf **Limette `#E2F55A` → Grün `#4DB97D` → Petrol `#1E8A6C`** von oben links nach unten rechts, dunklere Petrol-Unterseite     |
| Licht      | Großer weicher Glanz oben links, kleiner Glanz auf dem oberen Knubbel, zarter Limette-Schein um die Form, Petrol-Leuchten am Boden |
| Gesicht    | Kleine dunkle ovale Augen mit Glanzpunkt, schmales Lächeln – keine Wangen, keine Kontur                                            |
| Effekte    | **Neon-Limette `#C7F03A`** mit Leuchten: Funkeln, Ring, „?“, „!“-Striche, Krone, Herz, Zzz – je Stimmung eines                     |

## Zustände (Vektor-Fassung)

| `emotion`   | Gesicht                 | Neon-Effekt      |
| ----------- | ----------------------- | ---------------- |
| `greeting`  | Augen offen, Lächeln    | Funkeln          |
| `happy`     | Zwinkern, offener Mund  | leuchtender Ring |
| `thinking`  | Blick nach oben, „hmm“  | Fragezeichen     |
| `surprised` | große Augen, „o“        | „!“-Striche      |
| `excited`   | lachende Augen, Grinsen | „!“-Striche      |
| `success`   | stolzer Blick, Lächeln  | Krone            |
| `encourage` | lachende Augen, Lächeln | Herz             |
| `sleeping`  | geschlossene Augen      | Zzz              |

## Original-Dateien (Lieferung durch den PO)

Damit Pino **pixelgenau** wie im Konzeptbild aussieht, werden die Original-Dateien eingesetzt, sobald sie da sind:

- **Je Stimmung eine Datei**, Dateiname = `emotion` (z. B. `greeting.png`, `happy.png` …, die 8 Namen oben).
- **Bevorzugt SVG** (bleibt in jeder Größe scharf, ohne Text/Schriften), sonst **PNG mit transparentem Hintergrund**, quadratisch, mindestens **1024 × 1024 px**.
- **Nur die Figur samt ihrem Effekt** (Krone, Herz …) – kein Hintergrund, keine Bühne, kein Rahmen; Figur mittig mit etwas Rand.
- Optional: App-Icon hell/dunkel als 1024 × 1024 px ohne abgerundete Ecken (die Ecken setzt das System).
- Ablage: einfach hier im Chat senden oder ins Repo unter `apps/mobile/assets/mascot/`.

Die Screens ändern sich dafür nicht – `<Mascot>` zeigt für jede Stimmung mit geliefertem Bild dieses Bild, sonst die Vektor-Fassung.

**Stand der Lieferung**

| `emotion`  | Quelle                                                                                           | Hinweis                                                                         |
| ---------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------- |
| `greeting` | **Original PO – Hauptlogo** (Pino mit Funkeln, 2026-11-05), auch App-Icon, Startbild, Ladescreen | 1312 × 1199 px; Hintergrund war eingebrannt (Karomuster) und wurde freigestellt |
| `thinking` | **Original PO** (Pino mit Lupe)                                                                  | 517 × 401 px – größer besser                                                    |
| übrige 6   | Vektor-Nachzeichnung (`pino.ts`)                                                                 | Bilder folgen vom PO                                                            |

**So kommt ein neues Bild in die App:** Original unverändert nach `docs/design/mascot-art/` (Datum + Stimmung im Namen), daraus die quadratisch zugeschnittene, transparente App-Fassung nach `packages/ui/assets/mascot/<emotion>.png`, Eintrag in `mascot/art.ts` und `mascot/artSources.ts` (ein Test prüft, dass beide übereinstimmen und die Datei existiert), danach `pnpm brand:assets` und `pnpm design:preview`.

## Abgrenzung zu fremden Figuren

Pino entsteht aus dem **eigenen Konzeptbild des PO**. Fremde Figuren aus Stil-Referenzen (lila Blob mit Spross, grüner Wolken-Blob) werden nicht nachgebildet; keine fremden Logos oder Markenbestandteile.

## Regeln

- Immer über die `Mascot`-Komponente – keine eingebetteten Einzelbilder.
- Mindestgröße 64 dp (darunter verliert das Gesicht an Lesbarkeit).
- Nicht verzerren, nicht umfärben.
- Max. **ein** Maskottchen pro Screen.
- Animation: dezentes Atmen/Wippen (≤ 3 % Scale, 2,4 s) nur auf Welcome/Erfolg; bei Reduced Motion statisch.
- Pino spricht in kurzen, positiven Sätzen in Du-Form („Fast geschafft!“, „Super gemacht!“). Nie Druck, nie Zeitlimits.
- Barrierefreiheit: `accessibilityLabel` z. B. „Pino freut sich“; rein dekorative Verwendung → `accessible={false}`.

## Austauschbarkeit (PO: Maskottchen wird noch angepasst)

Pino ist bewusst so gebaut, dass er **später ohne App-Umbau** geändert oder ersetzt werden kann:

| Was soll sich ändern?                                        | Wo                                                           | Auswirkung                                  |
| ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------- |
| Farben (Verlauf, Glanz, Neon …)                              | `packages/ui/src/mascot/theme.ts`                            | überall sofort: App, Icons, Splash, Mockups |
| Form, Gesicht, Posen                                         | `packages/ui/src/mascot/pino.ts`                             | überall sofort                              |
| Komplett neue Illustrationen (z. B. von einer Illustratorin) | `pinoSvg()` liefert dann je Emotion die gelieferte SVG-Datei | keine Änderung an Screens                   |
| Neue Emotion                                                 | Eintrag in `MASCOT_EMOTIONS`                                 | Tests prüfen automatisch Vollständigkeit    |

Feste Schnittstelle für alle Screens: `<Mascot emotion="greeting" size={160} animated />` mit den 8 Emotionen. Screens zeichnen Pino **nie selbst**. App-Icon, Splash und Konzept-Mockups werden per `pnpm brand:assets` bzw. `pnpm design:preview` aus derselben Quelle neu erzeugt. Lieferformat für finale Illustrationen: SVG (Vektor, viewBox quadratisch, ohne Text/Schriften) – je Emotion eine Datei.

## Offene Punkte

- Finales Illustrations-Polishing (ggf. durch Illustrator:in) – die Geometrie bleibt Vektor, damit sie in Skia/SVG skalierbar und klein bleibt.
- App-Icon auf Basis von Pino (Phase 9).
