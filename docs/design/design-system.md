# PUZZLE STUDIO – Design System

> **Single Source of Truth:** [`packages/ui/src/tokens.ts`](../../packages/ui/src/tokens.ts)
> Diese Datei beschreibt die Regeln. Werte stehen ausschließlich im Code.
> Visuelle Übersicht: [`concept/concept-design-tokens.png`](concept/concept-design-tokens.png)

**Stil:** Soft Pastel Cartoon · Whimsical Illustration · Premium Kids App · Gentle Playful UI
**Stil-Update 2026-11-04 (PO-Referenz):** frisches **Mint/Grün** statt Lavendel/Lila, weiches glänzendes 3D beim Maskottchen, dunkelgrüne Haupt-Knöpfe mit weißer Schrift. Gelb, Himmelblau, Pfirsich bleiben Akzentfarben (Sterne, Belohnungen, Kategorien).
Grundlage: [reference-analysis.md](reference-analysis.md)

## 1. Prinzipien

1. **Sanft statt laut** – Pastell, weiche Verläufe, keine Neon- oder Alarmfarben (auch Fehler sind Peach, nicht Rot).
2. **Eine Hauptaktion pro Screen** – klar erkennbar, groß, unten im Daumenbereich.
3. **Illustration statt Icon-Font** – eigene, runde, zweifarbige Icons und Illustrationen.
4. **Ruhige Ränder, freie Mitte** – Dekoration nur am Rand; Inhalt hat immer Vorrang.
5. **Kinderhände** – Touch-Ziele ≥ 56 dp, primäre Buttons 64 dp.
6. **Konsistenz vor Kreativität pro Screen** – keine Screen-individuellen Button- oder Kartenstile.

## 2. Farben

| Rolle                | Token                                    | Wert                              | Verwendung                                                       |
| -------------------- | ---------------------------------------- | --------------------------------- | ---------------------------------------------------------------- |
| Haupt-Hintergrund    | `color.background.primary` (`mist`)      | `#F4FAF6`                         | dominante Fläche, Mint-Weiß                                      |
| Sekundär-Hintergrund | `color.background.secondary` (`mist200`) | `#E8F4EC`                         | Verläufe, Sektionen                                              |
| Marke                | `color.brand.soft` / `.main` / `.strong` | `#93D6AC` / `#4DAA7A` / `#1D4A36` | Tab-Blase, Auswahl, Fortschritt; `strong` für kleinen Markentext |
| Haupt-Aktion         | `color.action.accent` (`forest`)         | `#1D4A36`                         | „Los geht's“, „Zum Atelier“ – weiße Schrift                      |
| Bestätigen           | `color.action.primary` (`leaf700`)       | `#2F7F57`                         | „Weiter“, „Fertig“ – weiße Schrift                               |
| Akzente              | `palette.yellow`, `sky`, `peach`, `pink` | `#FFE18A` …                       | Sterne, Belohnungen, Kategorie-Karten                            |
| Text primär          | `color.text.primary` (`ink`)             | `#1E2D26`                         | Titel, Labels                                                    |
| Text sekundär        | `color.text.secondary` (`slate`)         | `#56655D`                         | Fließtext                                                        |

Tonstufen `*100` = Kartenflächen, `leaf600/700` = Icons/Schalter, `forest` = kleiner Markentext und Haupt-Knöpfe.

**Kontrastregeln (WCAG 2.2 AA, in `tokens.test.ts` geprüft):**

- `ink` auf allen Flächen ≥ 12 : 1, `slate` ≥ 5,2 : 1 ✅
- Weiß auf `forest` ≈ 10 : 1, auf `leaf700` ≈ 4,9 : 1 – beide Knopfvarianten für jede Schriftgröße ✅
- `leaf600`/`leaf` nur für Flächen, Symbole und große Formen, **nie** für kleinen Text.
- **Schalter** (`color.control.*`, WCAG 1.4.11 Nicht-Text-Kontrast ≥ 3 : 1, Phase 8): An = gefüllte Spur `leaf700` mit weißem Knopf (≥ 4,2 : 1 auf allen Kartenflächen), Aus = umrandete Spur mit dunklem Knopf `slate` (≥ 5,2 : 1). Der Zustand ist zusätzlich an der Knopfposition erkennbar – nie nur an der Farbe. Getestet in `packages/ui/test/tokens.test.ts`.

## 3. Verläufe

| Token                                     | Einsatz                                            |
| ----------------------------------------- | -------------------------------------------------- |
| `gradient.screenWarm`                     | Standard-Hintergrund (Creme → Blush)               |
| `gradient.screenDream`                    | Erzähl-/Creator-Screens (Mint-Hauch)               |
| `gradient.playTable`                      | Spieltisch – kontrastarm, damit Teile hervortreten |
| `gradient.buttonAccent` / `buttonPrimary` | Buttons (vertikal, hell → satt)                    |
| `gradient.meadow`, `gradient.mascotBody`  | Illustration                                       |

## 4. Typografie

Eine Familie: **Nunito** (600/700/800/900), in der App via `@expo-google-fonts/nunito` eingebettet (offline, kein Netzwerkabruf).

| Token       | Größe/Zeile | Gewicht | Einsatz                                   |
| ----------- | ----------- | ------- | ----------------------------------------- |
| `hero`      | 40/46       | 900     | Onboarding-Titel                          |
| `title1`    | 32/38       | 900     | Screen-Titel                              |
| `title2`    | 26/32       | 800     | Karten-Hero                               |
| `title3`    | 21/27       | 800     | Sektionen                                 |
| `bodyLarge` | 18/26       | 600     | Untertitel                                |
| `body`      | 16/23       | 600     | Fließtext (Minimum für Kinder)            |
| `button`    | 20/24       | 800     | Buttons                                   |
| `label`     | 15/20       | 700     | Chips, Karten-Labels                      |
| `caption`   | 13/18       | 700     | Meta-Infos (nur Eltern-relevante Details) |

Regeln: keine Gewichte < 600, keine Großbuchstaben-Fließtexte, Dynamic Type bis 130 % ohne Layoutbruch.

## 5. Abstände, Radien, Größen

- **4-pt-Raster:** `spacing.xxs 4` … `huge 56`. Screen-Rand = `xl (24)`.
- **Radien:** `sm 12` (Thumbnails klein) · `md 18` (Bilder in Karten) · `lg 24` (Karten) · `xl 32` (Navigation, Sheets) · `sheet 36` · `pill` (Buttons, Chips).
- **Touch:** `touch.min 48` · `touch.child 56` · `touch.cta 64`.
- **Icons:** `20 / 28 / 36 / 48`, Illustrationen `72`.
- **Gliederung (PO-Feedback nach Phase 6):** Screens bestehen aus klar getrennten **Abschnitten** (`<Section>`: eigene Karte, Titelzeile, `radius.xl`, optional zarter Farbton). Abstand zwischen Abschnitten `layout.sectionGap 20`, innerhalb `layout.itemGap 12`. Lange Seiten werden in umschaltbare Bereiche geteilt (`<SegmentedControl>`), Hauptaktionen bleiben unten sichtbar (`Screen footer`). Ziel: Start, Atelier und „Neues Puzzle“ ohne Scrollen auf einem Handy.

## 6. Schatten

Grün-getönt (`ink`), max. zwei Ebenen pro Screen: `shadow.card` (Karten), `shadow.raised` (Buttons, Navigation), `shadow.lifted` (gezogenes Puzzleteil). Android über `elevation`.

## 7. Bewegung

| Token                | Wert               | Einsatz                                |
| -------------------- | ------------------ | -------------------------------------- |
| `duration.fast`      | 160 ms             | Press-Feedback                         |
| `duration.base`      | 240 ms             | Übergänge                              |
| `duration.gentle`    | 360 ms             | Karten erscheinen                      |
| `duration.celebrate` | 1400 ms            | Abschluss-Feier                        |
| `spring.press`       | —                  | Button-Scale auf `pressScale 0.96`     |
| `spring.snap`        | —                  | Teil rastet ein (+ leichtes Overshoot) |
| `spring.glide`       | —                  | Tab-Blase gleitet zum gewählten Tab    |
| `easing.playful`     | `0.34,1.56,0.64,1` | „Boop“-Effekte                         |

**Bewegte Elemente (dezent, zum Pastell-Stil passend):**

| Baustein                                            | Wirkung                                                                                                                                                                                                                                                                                                                                                                                                                         |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `<Appear variant="rise"/"pop">` + `staggerDelay(i)` | Inhalte steigen sanft auf bzw. poppen nacheinander herein (max. 360 ms Versatz)                                                                                                                                                                                                                                                                                                                                                 |
| `usePressBounce()`                                  | Karten, Chips, Schalen, Tabs federn beim Antippen                                                                                                                                                                                                                                                                                                                                                                               |
| Tab-Leiste (`BottomNavigation`)                     | Weiße Leiste (Ecken `radius.md`) mit weicher Mulde; die äußeren Tabs rücken so weit ein, dass neben der Mulde immer Leiste bis zur Ecke bleibt. Schatten folgt der Form, nichts scheint in der Mulde durch. Der aktive Tab sitzt in einer lila Blase mit weißem Ring darüber. Beim Wechsel gleiten Mulde und Blase federnd hinüber (`spring.glide`), das Symbol poppt kurz auf, der Name wird fett (seit 2026-11-04, PO-Wunsch) |
| `<StarRow animated>`                                | Sterne der Feier poppen einzeln auf                                                                                                                                                                                                                                                                                                                                                                                             |
| `<Sparkles>`                                        | einige funkelnde Sterne um Pino (Feier, Erfolge)                                                                                                                                                                                                                                                                                                                                                                                |
| `<Burst>`                                           | kurzer goldener Punkte-Funken, wenn ein Teil einrastet                                                                                                                                                                                                                                                                                                                                                                          |
| Fortschritt im Spiel                                | Zähler „12/36“ hüpft bei jedem eingerasteten Teil                                                                                                                                                                                                                                                                                                                                                                               |

**Reduced Motion:** Systemeinstellung (`AccessibilityInfo.isReduceMotionEnabled`) + eigener Schalter im Elternbereich → Feder-Animationen werden zu kurzen Fades, Maskottchen-Idle und Partikel entfallen. Keine Dauer-Animationen im Hintergrund.

## 8. Hintergrund- & Dekorationssystem

Bausteine: `CloudIllustration`, `StarDecoration` (Stern, Funkeln), `Leaf`, `Flower`, `Meadow`.
`DecorativeBackground` bekommt ein **Preset** pro Screen-Typ statt freier Platzierung:

| Preset   | Screens                 | Elemente                          |
| -------- | ----------------------- | --------------------------------- |
| `meadow` | Welcome, Erfolg         | Wolken oben, Wiese + Blumen unten |
| `sky`    | Home, Sammlung, Erfolge | 1–2 Wolken, 3–4 Sterne am Rand    |
| `dream`  | Onboarding 2, Creator   | Mint-Verlauf, Wolken, Funkeln     |
| `table`  | Gameplay                | keine Dekoration (Fokus)          |
| `calm`   | Elternbereich           | nur Verlauf                       |

Dekoration ist `pointerEvents="none"`, `accessible={false}` und liegt nie hinter Text.

## 9. Ikonografie

Eigene SVG-Icons (abgerundete Linien 2,6 px, zweifarbig: dunkle Kontur (`ink`) + Pastellfüllung; aktiv = Gelb-Füllung). Kein generisches Icon-Set als Ersatz für Illustrationen. Vorlage: `scripts/design-preview/decor.mjs` → in Phase 2 nach `packages/ui` portiert.

## 10. Plattformkonsistenz

- Gleiche Optik auf iOS und Android (keine nativen Standard-Controls ohne Anpassung).
- Safe Areas via `react-native-safe-area-context`.
- Android-Ripple deaktiviert zugunsten des gemeinsamen Scale-Feedbacks.

## 11. Änderbarkeit (Styles sind noch nicht final)

Alle Gestaltungswerte sind zentral – spätere Anpassungen sind eine Änderung an **einer** Stelle:

| Änderung                                                                 | Datei                                                                                                  | wirkt auf                         |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ | --------------------------------- |
| Farben, Verläufe, Schatten, Radien, Abstände, Schriftgrößen, Animationen | `packages/ui/src/tokens.ts`                                                                            | alle Screens + Mockups            |
| Aussehen von Buttons, Karten, Navigation …                               | `packages/ui/src/components/*`                                                                         | jede Verwendung                   |
| Wolken, Sterne, Wiese, Icons                                             | `packages/ui/src/illustrations/`                                                                       | alle Hintergründe/Icons + Mockups |
| Hintergrund-Zusammenstellung pro Screen-Typ                              | `packages/ui/src/illustrations/backgrounds.ts` (Presets)                                               | alle Screens mit diesem Preset    |
| Maskottchen                                                              | siehe [mascot-guidelines.md](mascot-guidelines.md#austauschbarkeit-po-maskottchen-wird-noch-angepasst) | überall                           |

Absicherung: ESLint verbietet Roh-Farben in Screens; Vitest prüft nach jeder Token-Änderung automatisch die WCAG-Kontraste, das 4-pt-Raster und Touch-Größen. CI zeigt sofort, wenn eine Stiländerung die Lesbarkeit verschlechtert.

## 12. Design-QA-Checkliste (vor „fertig“)

- [ ] Entspricht der Referenz (Pastell, Rundungen, Stimmung)?
- [ ] Nur Tokens, keine Hex-Werte im Screen?
- [ ] Maskottchen aus der `Mascot`-Komponente (keine Einzelgrafik)?
- [ ] Touch-Ziele ≥ 56 dp, CTA 64 dp?
- [ ] Kontrast AA geprüft?
- [ ] Eine klare Hauptaktion?
- [ ] Alle sichtbaren Elemente funktionieren?
- [ ] Reduced Motion geprüft?
- [ ] iOS- und Android-Screenshot verglichen?
