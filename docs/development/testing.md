# Teststrategie

| Ebene          | Werkzeug                                                                     | Umfang                                                                  | Wann              |
| -------------- | ---------------------------------------------------------------------------- | ----------------------------------------------------------------------- | ----------------- |
| Typen          | `tsc --noEmit` (strict)                                                      | alle Pakete                                                             | jede Änderung, CI |
| Lint           | ESLint (+ `no-restricted-imports` für reine Pakete)                          | alle                                                                    | jede Änderung, CI |
| Unit           | Vitest (Node)                                                                | `puzzle-engine`, `image-processing` (Mathe), `game-progression`, Tokens | jede Änderung, CI |
| Integration    | Jest + `jest-expo`, In-Memory-SQLite/Mocks der Expo-Module                   | Repositories, Migrations, Erstellen/Speichern/Wiederherstellen/Löschen  | CI                |
| Komponenten/UI | React Native Testing Library                                                 | Komponenten, Screens, Navigation                                        | CI                |
| E2E / Flows    | Maestro (Android-Emulator lokal, iOS über EAS-Build + Gerät/Simulator-Cloud) | Onboarding, Erstellen, Puzzeln, Sammlung, Elternbereich                 | pro Meilenstein   |
| Screenshots    | Maestro `takeScreenshot` → `docs/previews/screenshots/`                      |                                                                         | pro Meilenstein   |
| Manuell        | Checkliste (iOS + Android, klein/groß, Gesten, Accessibility, Performance)   |                                                                         | pro Meilenstein   |

## Pflicht-Tests der Engine

Geometrie, Kanten, Grid, Snapping, Bildkoordinaten, Hit-Test, Serialisierung/Wiederherstellung, Determinismus. Zielabdeckung ≥ 95 % (Zeilen) für `packages/puzzle-engine`.

## Performance-Budget

- Gameplay 256 Teile: 60 fps beim Ziehen auf Referenz-Android (Mittelklasse, ~4 GB RAM) und iPhone 12 oder neuer.
- Puzzle-Erzeugung (256 Teile): < 300 ms.
- Kaltstart bis Home: < 2 s.

## Nach jeder Phase

1. `pnpm typecheck` 2. `pnpm lint` 3. `pnpm test` 4. Build-Prüfung (`eas build` bzw. `expo prebuild` + Gradle lokal für Android) 5. Doku aktualisieren.
