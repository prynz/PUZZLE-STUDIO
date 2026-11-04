# Änderung 02 – Neuer Look: Mint und weiches 3D

**Datum:** 2026-11-04 · **Anlass:** Wunsch des PO („Maskottchen und Farben diesem Stil anpassen“, Referenzbild mit weichem, glänzendem 3D in Mint) · Entscheidung des PO: **Mint/Grün als Grundfarbe** · **Status:** umgesetzt, wartet auf Review

> Screenshots stammen aus der **laufenden App** (Web via Chromium; Android-/iOS-Läufe siehe unten). Die Pino-Übersicht ist direkt aus dem App-Code (`pinoSvg`) gerendert.

## Was sich ändert

| Bereich                             | Vorher                   | Jetzt                                                                                                                                                     |
| ----------------------------------- | ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Markenfarbe                         | Lavendel / Lila          | frisches **Mint/Grün** (`leaf`-Skala), kleiner Markentext tief-grün (`forest`)                                                                            |
| Hintergründe                        | Creme mit Rosa-Hauch     | helles **Mint-Weiß** (`mist`)                                                                                                                             |
| Haupt-Knöpfe                        | gelb mit dunkler Schrift | **tiefgrün, glänzend, weiße Schrift** wie „Get started“ in der Referenz; „Weiter“/„Fertig“ grün                                                           |
| Große Aktionskarte                  | heller Lila-Verlauf      | tiefgrüner Verlauf, weiße Schrift                                                                                                                         |
| Tab-Leiste                          | lila Blase               | grüne Blase                                                                                                                                               |
| Text                                | Navy / Grau-Lila         | grün-getöntes Fast-Schwarz (`ink`) / Grau (`slate`)                                                                                                       |
| Schatten                            | Navy-getönt              | grün-getönt, weich                                                                                                                                        |
| **Pino**                            | Honiggelb, Kontur        | **Mint, weiches 3D**: Licht von oben links, dunklere Unterseite, großer Glanz, grünes Leuchten am Boden, kaum Kontur; Stern-Clip jetzt gelb, Wangen rosig |
| App-Icon, Startbild, Beispielbilder | alt                      | neu gerendert im neuen Stil                                                                                                                               |

Gelb, Himmelblau, Pfirsich und Rosa bleiben als **Akzente** (Sterne, Belohnungen, Kategorie-Karten) – wie die gelbe und blaue Karte im Referenzbild.

**Abgrenzung:** Aus der Referenz übernommen werden nur Licht, Material und Farbstimmung. Deren Figur (grüner Wolken-Blob) wird nicht nachgebildet – Pino bleibt ein Puzzleteil mit Stern-Clip, Armen und Füßen ([Maskottchen-Richtlinien](../../design/mascot-guidelines.md)).

**Barrierefreiheit:** Alle Kontraste neu geprüft und getestet – Text ≥ 5,2 : 1, weiße Schrift auf beiden Grün-Knöpfen ≥ 4,9 : 1, Schalter ≥ 4,2 : 1.

**Zentral umgesetzt:** nur Tokens (`packages/ui/src/tokens.ts`), Maskottchen-Farben (`mascot/theme.ts`) und -Zeichnung (`mascot/pino.ts`). Screens nutzen weiter nur Tokens; der Flächen-Ton `lavender` heißt jetzt `leaf`.

## Bilder

| Begrüßung                                                   | Start                                                    | Start mit Puzzle                                                | Atelier                                                     |
| ----------------------------------------------------------- | -------------------------------------------------------- | --------------------------------------------------------------- | ----------------------------------------------------------- |
| ![](../screenshots/2026-11-04-update-02-web-01-welcome.png) | ![](../screenshots/2026-11-04-update-02-web-03-home.png) | ![](../screenshots/2026-11-04-update-02-web-09-home-filled.png) | ![](../screenshots/2026-11-04-update-02-web-04-atelier.png) |

| Wer puzzelt?                                                | Neues Puzzle                                            | Geschafft!                                               | Erfolge                                                    |
| ----------------------------------------------------------- | ------------------------------------------------------- | -------------------------------------------------------- | ---------------------------------------------------------- |
| ![](../screenshots/2026-11-04-update-02-web-02-profile.png) | ![](../screenshots/2026-11-04-update-02-web-05-new.png) | ![](../screenshots/2026-11-04-update-02-web-07-done.png) | ![](../screenshots/2026-11-04-update-02-web-08-awards.png) |

**Pino in allen 8 Stimmungen** (aus dem App-Code gerendert):

![](../screenshots/2026-11-04-update-02-pino-emotions.png)

Die Konzept-Mockups unter `docs/design/concept/` sind mit demselben Code neu gerendert (weiterhin als Mockup gekennzeichnet).

## Prüfung

TypeScript, ESLint, Prettier ✅ · Tests ✅ (UI 58, App 67, Engine 91, image-processing 21, game-progression 10) · Web ohne Fehlermeldungen ✅ · Android-Emulator / iOS-Simulator: Läufe gestartet, Ergebnis wird hier nachgetragen.

## Bewusst noch offen

- Milchglas-Effekt (Unschärfe hinter Karten) wie in der Referenz bräuchte eine neue Abhängigkeit (`expo-blur`) – erst auf Wunsch; Karten sind weiß mit weichem grünem Schatten.
- Feinschliff einzelner Screens nach deinem Eindruck.
