# Architektur – Überblick

Status: **Freigegeben (PO, nach Phase 0)** · **umgesetzt bis Phase 1**: Monorepo, `apps/mobile` (Expo SDK 58), `packages/ui` (Tokens + Basiskomponenten), Tooling, CI. Engine-, Bild- und Progressions-Pakete folgen in ihren Phasen.

## 1. Leitprinzipien

Local-First · Offline-First · Modular · Type-Safe · Engine unabhängig von React Native · Keine unnötigen SDKs · Datenschutz als Architekturprinzip.

## 2. Stack (Stand npm 2026-11-01)

| Bereich          | Wahl                                                                                                       | Bemerkung                                                                        |
| ---------------- | ---------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Framework        | Expo SDK 58 (React Native 0.88, New Architecture)                                                          | Versionen aller `expo-*`/RN-Pakete ausschließlich über `npx expo install` setzen |
| Sprache          | TypeScript 6.0 (Expo-SDK-58-Vorgabe), `strict` + `noUncheckedIndexedAccess` + `exactOptionalPropertyTypes` | `tsconfig.base.json`                                                             |
| Navigation       | Expo Router (Datei-basiert)                                                                                | Typed Routes aktiv                                                               |
| Rendering Puzzle | `@shopify/react-native-skia`                                                                               | Ein Canvas für Brett + alle Teile, Bild-Shader pro Teil                          |
| Gesten           | `react-native-gesture-handler`                                                                             | ein Pan-Gesture-Handler auf dem Canvas, Hit-Test in der Engine                   |
| Animation        | `react-native-reanimated` 4.7 + `react-native-worklets` 0.13                                               | Shared Values für Drag/Snap, UI-Thread                                           |
| Datenbank        | `expo-sqlite`                                                                                              | Migrations versioniert in `apps/mobile/storage/migrations`                       |
| Bilder           | `expo-image-picker` (System-Picker), `expo-image-manipulator`, `expo-file-system`                          | keine Medienbibliotheks-Vollberechtigung                                         |
| State            | `zustand` (nur für UI-Session-State)                                                                       | Persistente Daten = SQLite, nicht Zustand                                        |
| Tests            | Vitest (reine TS-Pakete), Jest + `jest-expo` + RNTL (App), Maestro (E2E/UI-Flows, Screenshots)             |                                                                                  |
| Build            | EAS Build (iOS Cloud, Android)                                                                             | Windows-Entwicklung, kein lokales Xcode                                          |
| Package Manager  | pnpm 10 Workspaces                                                                                         | `node-linker=hoisted` – in Phase 1 geprüft und festgelegt (siehe setup.md §5)    |
| Cloud-Backup     | Supabase – **nicht im MVP**                                                                                | nur Schnittstelle vorbereitet                                                    |

## 3. Monorepo

```text
puzzle-studio/
├── apps/mobile/                 ✅ Expo-App (Phase 1)
│   ├── app/                     Expo-Router-Routen (dünn: nur Re-Exports der Feature-Screens)
│   ├── features/<feature>/      Screens, Hooks, feature-lokale Komponenten
│   │   ✅ foundation · system-check · benchmark (Dev-Werkzeug, 256-Teile-Test)
│   │   ✅ onboarding · home · creator (Atelier, Beispielbilder, Zuschnitt) · parents (Vorschau)
│   │   ✅ puzzle (Neues Puzzle, Spieltisch: Skia-Brett, Ablage, Schalen, Tipps, Häppchen, Speichern)
│   │   ✅ collection (Sammlung) · awards (Erfolge, Belohnungen)
│   ├── services/                Plattform-Adapter (✅ skiaLoader / .web)
│   ├── i18n/                    ✅ typisierte Texte (de)
│   ├── assets/                  ✅ brand/ (Interims-Icon, Splash), samples/ (eigene Beispielbilder)
│   ├── .maestro/                ✅ E2E-/Screenshot-Flows
│   ├── storage/                 ✅ SQLite-Migrationen, Settings, Bilder (nativ: Dateien + DB; Web: Speicher)
│   ├── store/                   ✅ React-Kontexte (Settings, Bilder)
│   ├── app.config.ts · eas.json ✅ Varianten development/preview/production
├── packages/
│   ├── ui/                      ✅ Tokens · Text · PrimaryButton · SecondaryButton · Surface · Screen · StatusPill
│   ├── puzzle-engine/           ✅ Phase 4 – reines TS (Grid, Kanten, Hit-Test, Einrasten, Tipps, Häppchen, Spielstand)
│   ├── image-processing/        ✅ reines TS: Zuschnitt/Drehung/Größen, Transform-Hash, Farbgruppen
│   ├── game-progression/        ✅ Phase 6 – reines TS (Sterne, Meilensteine, Belohnungen)
│   └── shared/                  bei Bedarf
├── scripts/design-preview/      ✅ Mockup-, Icon- und Beispielbild-Renderer
├── .github/workflows/           ✅ ci.yml · android.yml · ios.yml
└── docs/
```

Bewusst **noch nicht angelegt** (keine leeren Module): `packages/validation` (Schema-Validierung wird erst mit Serialisierung in `puzzle-engine` gebraucht; ggf. dort integriert), `packages/config` (gemeinsame ESLint/TS-Config – entsteht mit dem zweiten Paket, das sie braucht), `supabase/` (Post-MVP).

### Abhängigkeitsregeln

```text
apps/mobile ──► packages/ui ──► (react-native, react-native-svg / skia)
     │
     ├──► packages/puzzle-engine     (keine RN-Imports!)
     ├──► packages/image-processing  (keine RN-Imports!)
     └──► packages/game-progression  (keine RN-Imports!)
```

Pakete ohne UI dürfen weder `react-native` noch `expo-*` importieren – wird per ESLint `no-restricted-imports` erzwungen (heute für `tokens.ts`, ab Phase 3/4 für die reinen Pakete) und durch Vitest in Node geprüft.

### Plattform-Dateien & Imports

- Plattformspezifisches Verhalten über `*.web.ts` / `*.native.ts`-Dateien (z. B. `services/skiaLoader.web.ts`).
- App-Imports **ohne Dateiendung** – sonst ignoriert Metro die Plattform-Varianten.
- Skia-Module werden **lazy** geladen (`React.lazy` nach `loadSkia()`), damit Web (CanvasKit/WASM) und Native denselben Code nutzen.

## 4. Laufzeit-Architektur

```text
 Screen (features/*)          ← nur Darstellung + Events
   │ hooks
   ▼
 Feature-Hook / Store          ← Session-State (zustand), Orchestrierung
   │
   ├─► Repository (storage/)   ← SQLite (Metadaten, Fortschritt)
   ├─► Service (services/)     ← Expo-APIs (Picker, FS, Manipulator)
   └─► Engine (packages/*)     ← reine Logik, deterministisch, getestet
```

### Rendering-Strategie (im 256-Teile-Test validiert)

- Ruhende Teile → **eine** gecachte `SkPicture` (neu aufgezeichnet nur bei Drag-Start/Drop).
- Gezogenes Teil → live aus Reanimated Shared Values auf dem UI-Thread.
- Hit-Test als Worklet auf dem UI-Thread: Engine-`hitTest` (Bucket-Gitter + Bounding-Box + Punkt-in-Umriss + z-Order), seit Phase 4 auch im 256-Teile-Test.
- Offener Punkt für Phase 5: Picture-Neuaufzeichnung bei 256 Teilen auf echten Geräten messen; Alternative: Teile in Kacheln/Ebenen gruppieren.

### Gameplay-Datenfluss

1. `PuzzleDefinition` (Seed, Reihen, Spalten, Bildgröße, Form) → Engine erzeugt deterministisch Geometrie (`PieceShape[]` mit Pfaden).
2. Skia rendert pro Teil: `Path` als Clip + `ImageShader` des optimierten Bildes; Positionen als Reanimated Shared Values.
3. Pan-Gesture → Engine-Hit-Test (Grid-Bucket + Pfad-Test, oberstes Teil zuerst) → Drag auf UI-Thread.
4. Loslassen → Engine `trySnap` (Distanz zur Zielposition < Toleranz, ggf. auch an bereits verbundene Nachbarn) → Spring-Animation.
5. Zustandsänderung → debounced Save (`PuzzleState` serialisiert, versioniert) in SQLite.

## 5. Erweiterbarkeit (Post-MVP)

- **Spielmodi** als Strategie-Objekte in der Engine (`SnapPolicy`, `RotationPolicy`, `AssistPolicy`) – Classic/Easy Assist/Rotation ohne Gameplay-Umbau.
- **Creative Workshop** als eigenes Feature, liefert nur ein Bild an den Creator (gleiche Schnittstelle wie Picker).
- **Puzzle Room / Export** konsumieren `completed`-Puzzles aus dem Repository.
- **Cloud-Backup** als optionaler `BackupProvider` hinter Eltern-Gate; Standard = `NoopBackupProvider`.

## 6. Technische Risiken

Siehe Milestone-Report [`../previews/milestone-reports/2026-11-01-milestone-00-analysis-and-concept.md`](../previews/milestone-reports/2026-11-01-milestone-00-analysis-and-concept.md#technische-risiken).
