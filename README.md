# PUZZLE STUDIO

Kindgerechte Puzzle-App für iOS und Android: aus eigenen Fotos werden Puzzles – erstellen, spielen, sammeln, entdecken.

## Projektstand

**Phase 2 – Design & Navigation umgesetzt** (wartet auf Review): Pino als Komponente, Onboarding mit Spielhilfe-Profil, Home, Tab-Navigation. Davor Phase 1: Expo-App (SDK 58, Expo Router) im pnpm-Monorepo, zentrales Designsystem (`packages/ui`), Systemcheck aller nativen Module, früher 256-Teile-Performance-Test, ESLint/Prettier/Vitest/Jest, GitHub-Actions-CI mit nativen Android- und iOS-Builds, EAS-Konfiguration.
Aktueller Bericht: [docs/previews/milestone-reports/2026-11-02-milestone-02-design-navigation.md](docs/previews/milestone-reports/2026-11-02-milestone-02-design-navigation.md)

**Web-Vorschau im Browser:** https://prynz.github.io/PUZZLE-STUDIO/ (wird bei jedem Push automatisch aktualisiert; SQLite/Dateispeicher sind im Web deaktiviert)

Konzept-Mockups (keine App-Screenshots): [docs/design/concept/](docs/design/concept/) · Echte Screenshots: [docs/previews/screenshots/](docs/previews/screenshots/)

## Struktur

```text
apps/mobile/              Expo-App (Expo Router, Skia, Reanimated, Gesture Handler, SQLite)
packages/ui/              Design-Tokens + Basiskomponenten (Single Source of Truth)
scripts/design-preview/   Renderer für Mockups, Interims-Icons und Beispielbilder
.github/workflows/        CI · Android-Build + Emulator-Screenshots · iOS-Simulator-Build
docs/                     Produkt, Architektur, Design, Engine, Datenschutz, Entwicklung, Previews
```

## Voraussetzungen

Node.js ≥ 22.18, pnpm 10 (`corepack enable`). Für native Builds: Android Studio (Android) bzw. EAS CLI + Expo-Konto (iOS-Geräte, TestFlight). Details: [docs/development/setup.md](docs/development/setup.md).

## Befehle

```bash
pnpm install
```

```bash
pnpm typecheck && pnpm lint && pnpm test
```

```bash
cd apps/mobile && pnpm android
```

```bash
cd apps/mobile && pnpm web
```

EAS-Builds, TestFlight und Android-APK/AAB: [docs/development/setup.md §4](docs/development/setup.md) · Tests: [docs/development/testing.md](docs/development/testing.md)

## Dokumentation

[PROJECT_BRIEF.md](PROJECT_BRIEF.md) · [CLAUDE.md](CLAUDE.md) · [Architektur](docs/architecture/overview.md) · [Design System](docs/design/design-system.md) · [Roadmap](docs/product/roadmap.md) · [Datenschutz](docs/security/privacy.md)
