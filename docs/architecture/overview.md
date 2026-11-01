# Architektur – Überblick

Status: **Vorschlag (Phase 0)** – zur Freigabe. Implementiert ist bisher nur `packages/ui` (Design-Tokens).

## 1. Leitprinzipien

Local-First · Offline-First · Modular · Type-Safe · Engine unabhängig von React Native · Keine unnötigen SDKs · Datenschutz als Architekturprinzip.

## 2. Stack (Stand npm 2026-11-01)

| Bereich | Wahl | Bemerkung |
|---|---|---|
| Framework | Expo SDK 58 (React Native 0.88, New Architecture) | Versionen aller `expo-*`/RN-Pakete ausschließlich über `npx expo install` setzen |
| Sprache | TypeScript 5.9, `strict` + `noUncheckedIndexedAccess` + `exactOptionalPropertyTypes` | `tsconfig.base.json` |
| Navigation | Expo Router (Datei-basiert) | Typed Routes aktiv |
| Rendering Puzzle | `@shopify/react-native-skia` | Ein Canvas für Brett + alle Teile, Bild-Shader pro Teil |
| Gesten | `react-native-gesture-handler` | ein Pan-Gesture-Handler auf dem Canvas, Hit-Test in der Engine |
| Animation | `react-native-reanimated` 4 | Shared Values für Drag/Snap, UI-Thread |
| Datenbank | `expo-sqlite` | Migrations versioniert in `apps/mobile/storage/migrations` |
| Bilder | `expo-image-picker` (System-Picker), `expo-image-manipulator`, `expo-file-system` | keine Medienbibliotheks-Vollberechtigung |
| State | `zustand` (nur für UI-Session-State) | Persistente Daten = SQLite, nicht Zustand |
| Tests | Vitest (reine TS-Pakete), Jest + `jest-expo` + RNTL (App), Maestro (E2E/UI-Flows, Screenshots) | |
| Build | EAS Build (iOS Cloud, Android) | Windows-Entwicklung, kein lokales Xcode |
| Package Manager | pnpm 10 Workspaces | `node-linker=hoisted` für Metro-Kompatibilität (wird beim Expo-Setup geprüft) |
| Cloud-Backup | Supabase – **nicht im MVP** | nur Schnittstelle vorbereitet |

## 3. Monorepo

```text
puzzle-studio/
├── apps/mobile/                 Expo-App (Phase 1)
│   ├── app/                     Expo-Router-Routen (dünn: nur Komposition)
│   ├── features/<feature>/      Screens, Hooks, feature-lokale Komponenten
│   │   onboarding · home · creator · puzzle · collection · achievements · parent
│   ├── services/                Adapter zu Expo-APIs (Picker, FS, Haptics, Audio)
│   ├── storage/                 SQLite-Zugriff, Repositories, Migrations
│   └── store/                   Zustand-Stores (Session/UI)
├── packages/
│   ├── ui/                      ✅ Tokens · (Phase 2) Komponenten, Mascot, Dekor
│   ├── puzzle-engine/           (Phase 4) reines TS: Grid, Geometrie, Hit-Test, Snap, Serialisierung
│   ├── image-processing/        (Phase 3) reines TS: Crop-Mathe, Größen, Seitenverhältnisse
│   ├── game-progression/        (Phase 6) reines TS: Achievements, Belohnungen
│   └── shared/                  (bei Bedarf) gemeinsame Typen/IDs/Result-Typen
├── scripts/design-preview/      ✅ Konzept-Mockup-Renderer
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

Pakete ohne UI dürfen weder `react-native` noch `expo-*` importieren – wird per ESLint `no-restricted-imports` erzwungen und durch Vitest in Node geprüft.

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
