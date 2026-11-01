# CLAUDE.md – Arbeitsregeln für PUZZLE STUDIO

Kindgerechte Puzzle-App (iOS + Android), Expo/React Native, TypeScript, pnpm-Monorepo.
Produkt: [PROJECT_BRIEF.md](PROJECT_BRIEF.md) · Architektur: [docs/architecture/overview.md](docs/architecture/overview.md) · Design: [docs/design/design-system.md](docs/design/design-system.md)

## Aktueller Stand

Phase 0 (Analyse & Konzept) abgeschlossen. **Keine größeren Implementierungen ohne Freigabe des Product Owners** für die jeweils nächste Phase (siehe [docs/product/roadmap.md](docs/product/roadmap.md)).

## Arbeitsweise

1. Vor Änderungen: Repo-Zustand, betroffene Dateien, Abhängigkeiten prüfen. Nichts Funktionierendes blind überschreiben.
2. Kleine, nachvollziehbare Schritte; klare Commit-Messages (Englisch, Imperativ, z. B. `engine: add seeded edge generator`).
3. Unklare Entscheidungen: sinnvoll entscheiden und in der passenden Doku begründen. Nur rückfragen, wenn nicht verlässlich entscheidbar.
4. Nach jeder Phase: `pnpm typecheck` → `pnpm lint` → `pnpm test` → Build-Prüfung → Doku aktualisieren → Milestone-Report.

## Architekturregeln

- `packages/puzzle-engine`, `image-processing`, `game-progression`: **reines TypeScript**, keine Imports von `react`, `react-native`, `expo-*`. Deterministisch, seed-basiert, vollständig getestet.
- `apps/mobile/app/` (Expo Router) enthält nur dünne Routen; Logik in `features/*`, Expo-Zugriffe in `services/*`, Persistenz in `storage/*`.
- Persistente Daten → SQLite. Zustand nur für flüchtigen UI-/Session-State.
- Neue Abhängigkeiten nur mit Begründung (in PR/Commit + ggf. `docs/security/privacy.md` SDK-Liste). Expo/RN-Pakete nur via `npx expo install`.
- Keine leeren Module/Ordner „für später“.

## Code-Standards

- TypeScript strict (inkl. `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`). Kein `any`; Type-Casts nur mit Kommentar-Begründung.
- Kleine Komponenten (Richtwert < 200 Zeilen), keine Duplikate, keine ungenutzten Dateien.
- Fehlerzustände sichtbar und freundlich behandeln; keine verschluckten Fehler.
- **Keine Fake-Funktionen, keine toten Buttons, keine Platzhalter, die Fertigkeit vortäuschen.**
- Texte über i18n-Schlüssel, nicht als Literale in Komponenten.

## Designregeln

- Nur Tokens aus `packages/ui/src/tokens.ts` – **keine Hex-Werte, Radien oder Schriftgrößen direkt in Screens**.
- Nur Komponenten aus `packages/ui` für Buttons, Karten, Chips, Modals usw.; keine screen-eigenen Varianten.
- Maskottchen ausschließlich über `<Mascot emotion=… />` ([Guidelines](docs/design/mascot-guidelines.md)). Nie die Referenzfigur oder fremde Marken nachbilden.
- Touch-Ziele ≥ 56 dp, CTA 64 dp, Kontrast WCAG AA, Reduced Motion respektieren.
- Ein Screen ist erst fertig, wenn die Design-QA-Checkliste ([design-system.md §11](docs/design/design-system.md)) erfüllt ist.

## Datenschutzregeln (Kinder-App)

- Keine Analytics, Werbung, Tracking-, Standort- oder Netzwerk-SDKs. Kein automatischer Upload.
- **Nie** Bildinhalte, Nutzer-Dateinamen, Pfade mit Nutzerbezug oder EXIF-Daten loggen.
- System-Photo-Picker statt Medienbibliotheks-Berechtigung. Kamera-Berechtigung erst bei Bedarf.
- Details: [docs/security/privacy.md](docs/security/privacy.md).

## Tests

- Engine & reine Pakete: Vitest, Pflicht für Geometrie, Kanten, Grid, Snap, Hit-Test, Serialisierung.
- App: Jest (`jest-expo`) + React Native Testing Library; Flows/Screenshots: Maestro.
- Fehler nie durch Workarounds verstecken (kein `skip`, kein `@ts-ignore` ohne Begründung).

## Dokumentation & Previews

- Doku muss dem **tatsächlichen** Stand entsprechen (Status-Zeile oben in jedem Dokument pflegen).
- Nach Meilensteinen: echte Screenshots aus Simulator/Emulator/Gerät nach `docs/previews/screenshots/YYYY-MM-DD-milestone-NN-<screen>.png` + Report in `docs/previews/milestone-reports/`.
- Mockups nur unter `docs/design/concept/` und immer als **Mockup** gekennzeichnet. Nie als App-Screenshot ausgeben.

## Befehle

```bash
pnpm install
pnpm typecheck
pnpm test
pnpm design:preview   # Konzept-Mockups neu rendern
```
