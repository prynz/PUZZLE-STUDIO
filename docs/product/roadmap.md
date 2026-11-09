# Roadmap & Entwicklungsphasen

| Phase                      | Inhalt                                                                                                                                                         | Ergebnis / Abnahme                                     | Status                              |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ | ----------------------------------- |
| **0 – Analyse & Konzept**  | Repo-Analyse, Referenzanalyse, Design-System, Mockups, Architektur, Basisdoku                                                                                  | Milestone-Report 00, Freigabe durch PO                 | ✅ abgeschlossen, freigegeben       |
| 1 – Foundation             | Expo-App in `apps/mobile`, pnpm/Metro-Setup, TS strict, ESLint/Prettier, Vitest/Jest, CI (GitHub Actions: typecheck, lint, test), EAS-Profile, Fonts           | App startet auf iOS (EAS Dev Build) + Android, CI grün | ✅ abgeschlossen                    |
| 2 – Design & Navigation    | `packages/ui`-Komponenten, Mascot, Hintergrund-Presets, Onboarding, Home, Tabs, i18n, Spieltisch-Komponenten (PieceTray, SortBasket, HintButton, ZoomControls) | Erste echte Screenshots (Milestone 02)                 | ✅ abgeschlossen                    |
| 3 – Image Workflow         | Picker, Kamera, Crop/Rotate, Resize, Thumbnails, Dateiablage, Beispielbilder, Farbgruppen pro Teil (Sortier-Schalen)                                           | Bild → gespeichertes `image`                           | ✅ abgeschlossen, freigegeben       |
| 4 – Puzzle Engine          | Grid, Kanten, Geometrie, Bildmapping, Hit-Test, Snap + Einrasten (locked), Rand/Ecke-Klassifizierung, Tipp-Auswahl, Häppchen, Serialisierung + Tests           | ≥ 95 % Coverage Engine, Benchmarks                     | ✅ abgeschlossen, freigegeben       |
| 5 – Gameplay               | Skia-Rendering, Spieltisch mit Ablage, Sortier-Schalen, Tipps, Zoom, Drag & Drop, Vorlage, Fortschritt, Save/Restore, Feier                                    | 256 Teile flüssig auf Referenzgeräten                  | ✅ abgeschlossen, freigegeben       |
| 6 – Sammlung & Progression | Galerie, Filter, Sortierung, Achievements, Belohnungen                                                                                                         |                                                        | ✅ umgesetzt, freigegeben           |
| 7 – Elternbereich          | Eltern-Schranke, Einstellungen, Speicherverwaltung, Datenschutz, Backup-Schnittstelle                                                                          |                                                        | ✅ umgesetzt, freigegeben           |
| 8 – QA & Optimierung       | Geräte-Tests, Performance, Accessibility, Security-Review                                                                                                      | [Testprotokoll](../qa/test-protocol.md), Geräte offen  | ✅ umgesetzt, **wartet auf Review** |
| 9 – Release                | EAS Production Builds, TestFlight, Play Internal Testing, Icons, Splash, Store-Assets, Datenschutzangaben                                                      | Store-Einreichung                                      | geplant                             |

Spieltisch-Konzept (PO-Feedback nach Phase 1): [gameplay-concept.md](gameplay-concept.md)

**Neu (Entwurf, 2026-11-09):** [Konzept 2 – Pino für die Kleinsten](concept-v2-toddler.md) – 2–5 Jahre, 2–12 Teile, Reise mit Welten, Minispiele. Wartet auf PO-Entscheidungen.

## Nach dem MVP

1. Spielmodi: Easy Assist, Silhouette, Rotation, Memory, Educational, Family Puzzle
2. Creative Workshop (Zeichnen, Sticker, Rahmen, Collagen, Text)
3. Puzzle Room (fertige Puzzles aufhängen, Räume dekorieren)
4. Export (Bild, druckfähiges PDF), später physische Produkte
5. Optionales Cloud-Backup (Supabase, nur mit Eltern-Einwilligung)
