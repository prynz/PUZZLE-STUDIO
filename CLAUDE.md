# CLAUDE.md – Arbeitsregeln für PUZZLE STUDIO

Kindgerechte Puzzle-App (iOS + Android), Expo/React Native, TypeScript, pnpm-Monorepo.
Produkt: [PROJECT_BRIEF.md](PROJECT_BRIEF.md) · Architektur: [docs/architecture/overview.md](docs/architecture/overview.md) · Design: [docs/design/design-system.md](docs/design/design-system.md)

## Aktueller Stand

Phase 8 (QA & Optimierung) umgesetzt – Tests auf echten Geräten offen ([test-protocol.md](docs/qa/test-protocol.md)). **Jetzt: Überarbeitung nach eigener Nutzung des PO, Schritt für Schritt** ([Änderungsberichte](docs/previews/milestone-reports/)); Veröffentlichung (Phase 9) ist noch weit entfernt und startet nur nach Freigabe des Product Owners (siehe [docs/product/roadmap.md](docs/product/roadmap.md)). Maskottchen und Styles sind **noch nicht final** – Änderungen nur zentral (Tokens, `packages/ui/src/mascot`, `packages/ui/src/illustrations`).

PO-Vorgaben aus der Freigabe von Phase 1 (dauerhaft gültig):

1. Originalbilder nie destruktiv verändern – Engine nutzt nur abgeleitete Arbeitsversionen ([data-model.md](docs/architecture/data-model.md)).
2. Engine-Performance früh mit 256 Teilen auf echten Geräten messen (256-Teile-Test, [testing.md](docs/development/testing.md)).
3. Kompatibilität pnpm / Expo Router / native Module zuerst prüfen (erledigt, [setup.md §5](docs/development/setup.md)).
4. Designsystem zentral halten – keine individuellen Farb-/Abstandswerte in Screens.
5. Android und iOS immer parallel berücksichtigen (CI baut beide).
6. Spielhilfe-Profile (Kleinkind/Kind/Profi) steuern die Bedienlogik unabhängig von der Teilezahl ([gameplay-concept.md](docs/product/gameplay-concept.md)).
7. Kein Force-Push, keine Änderungen an der Remote-Konfiguration.

## Arbeitsweise

1. Vor Änderungen: Repo-Zustand, betroffene Dateien, Abhängigkeiten prüfen. Nichts Funktionierendes blind überschreiben.
2. Kleine, nachvollziehbare Schritte; klare Commit-Messages (Englisch, Imperativ, z. B. `engine: add seeded edge generator`).
3. Unklare Entscheidungen: sinnvoll entscheiden und in der passenden Doku begründen. Nur rückfragen, wenn nicht verlässlich entscheidbar.
4. Nach jeder Phase: `pnpm typecheck` → `pnpm lint` → `pnpm test` → Build-Prüfung → Doku aktualisieren → Milestone-Report.

## Architekturregeln

- `packages/puzzle-engine`, `image-processing`, `game-progression`: **reines TypeScript**, keine Imports von `react`, `react-native`, `expo-*`. Deterministisch, seed-basiert, vollständig getestet.
- `apps/mobile/app/` (Expo Router) enthält nur dünne Routen; Logik in `features/*`, Expo-Zugriffe in `services/*`, Persistenz in `storage/*`.
- Persistente Daten → SQLite. Zustand nur für flüchtigen UI-/Session-State.
- App-Imports **ohne Dateiendung** (Metro löst sonst `*.web.ts`/`*.native.ts` nicht auf). Pfad-Alias `@/` = `apps/mobile/`.
- Routen in `app/` sind nur Re-Exports von Screens aus `features/*`.
- Skia nur lazy laden (`React.lazy` + `loadSkia()`), nie direkt in Routen importieren.
- Reanimated Shared Values in Komponenten via `.get()`/`.set()`; in Worklets `.value` erlaubt.
- Neue Abhängigkeiten nur mit Begründung (in PR/Commit + ggf. `docs/security/privacy.md` SDK-Liste). Expo/RN-Pakete nur via `npx expo install`.
- Keine leeren Module/Ordner „für später“.

## Code-Standards

- TypeScript strict (inkl. `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`). Kein `any`; Type-Casts nur mit Kommentar-Begründung.
- Kleine Komponenten (Richtwert < 200 Zeilen), keine Duplikate, keine ungenutzten Dateien.
- Fehlerzustände sichtbar und freundlich behandeln; keine verschluckten Fehler.
- **Keine Fake-Funktionen, keine toten Buttons, keine Platzhalter, die Fertigkeit vortäuschen.**
- Texte über i18n-Schlüssel, nicht als Literale in Komponenten.

## Designregeln

- Nur Tokens aus `packages/ui/src/tokens.ts` – **keine Hex-Werte, Radien oder Schriftgrößen direkt in Screens**. ESLint verbietet Roh-Farben in `app/` und `features/`; Transparenzen über `withAlpha(palette.x, a)`.
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
pnpm install                     # nach JEDER package.json-Änderung – pnpm-lock.yaml mitcommitten
pnpm install --frozen-lockfile   # so prüft CI; muss lokal grün sein
pnpm typecheck
pnpm lint
pnpm format:check
pnpm test
pnpm --filter @puzzle-studio/mobile export:native   # Metro-Bundle Android + iOS prüfen
pnpm design:preview   # Konzept-Mockups neu rendern
pnpm brand:assets     # Interims-Icon/Splash/Beispielbild neu rendern
```

Native Builds & echte Screenshots: GitHub Actions `android.yml` (bei Push) und `ios.yml` (manuell). Details: [docs/development/setup.md](docs/development/setup.md).
