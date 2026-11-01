# Entwicklungsumgebung

Status: **Phase 1** – Expo-App lauffähig (Web-Vorschau lokal geprüft, native Builds über GitHub Actions bzw. EAS).

## 1. Voraussetzungen (Windows 11)

| Tool                    | Version                 | Hinweis                                                                          |
| ----------------------- | ----------------------- | -------------------------------------------------------------------------------- |
| Node.js                 | ≥ 22.18 (LTS)           | Type-Stripping für `.ts`-Imports in Node-Skripten                                |
| pnpm                    | 10.28 (über `corepack`) | `corepack enable` – Version kommt aus `packageManager` in `package.json`         |
| Git                     | aktuell                 | `git config core.autocrlf input`; Repo in kurzen Pfad klonen (z. B. `C:\dev\ps`) |
| VS Code                 | aktuell                 | Extensions: ESLint, Prettier, Expo Tools                                         |
| Android Studio          | aktuell                 | Android SDK 36 + Emulator (Pixel, API 34+), `ANDROID_HOME` setzen                |
| JDK                     | 17                      | in Android Studio enthalten (`JAVA_HOME` auf das JBR von Android Studio)         |
| EAS CLI                 | aktuell                 | `pnpm add -g eas-cli`, danach `eas login`                                        |
| Expo-Konto              | —                       | für EAS Build                                                                    |
| Apple Developer Account | —                       | für iOS-Gerätebuilds & TestFlight (nicht für den Simulator-Build in CI)          |

Lokales Xcode ist nicht nötig: iOS-Builds laufen über **EAS Cloud Build** (Gerät/TestFlight) bzw. über den GitHub-Actions-Workflow `ios.yml` (Simulator, unsigniert).

> **Windows-Hinweis:** Lange Pfade verursachen bei Gradle/CMake (Skia, Reanimated) Fehler. Repo in einen kurzen Pfad klonen und `git config --system core.longpaths true` setzen.

## 2. Erste Schritte

```bash
corepack enable
pnpm install
pnpm typecheck
pnpm lint
pnpm test
```

## 3. App starten

Skia, Reanimated, Gesture Handler und SQLite sind native Module → **Development Build** (kein Expo Go).

**Android, lokal (Emulator oder USB-Gerät):**

```bash
cd apps/mobile
pnpm android
```

`pnpm android` (= `expo run:android`) erzeugt beim ersten Mal den `android/`-Ordner (nicht versioniert), baut die Dev-App und startet Metro.

**Android ohne lokales SDK:** Die Development-APK (`puzzle-studio-development-apk`) und die Preview-APK (`puzzle-studio-preview-apk`) stehen nach jedem Push als Artefakte im Workflow „Android build & emulator screenshots“ zum Download bereit. Die Development-APK installieren und dann:

```bash
cd apps/mobile
pnpm start
```

**iOS-Gerät (EAS):**

```bash
eas device:create
```

```bash
cd apps/mobile
eas build --profile development --platform ios
```

**Web-Vorschau** (nur zur Review, kein Zielsystem; SQLite/Dateisystem sind dort bewusst deaktiviert):

```bash
cd apps/mobile
pnpm web
```

## 4. EAS Build

Konfiguration: `apps/mobile/eas.json`; die Variante wird über `APP_VARIANT` gesteuert (`app.config.ts`).

| Profil                  | Bundle-ID / Package            | Zweck                             |
| ----------------------- | ------------------------------ | --------------------------------- |
| `development`           | `com.puzzlestudio.app.dev`     | Dev-Client, interne Verteilung    |
| `development-simulator` | `com.puzzlestudio.app.dev`     | Dev-Client für den iOS-Simulator  |
| `preview`               | `com.puzzlestudio.app.preview` | interne Testbuilds (APK / Ad-hoc) |
| `production`            | `com.puzzlestudio.app`         | Store (AAB / IPA), Auto-Increment |

Einmalige Einrichtung (benötigt Expo-Konto, wird **vom Product Owner** ausgeführt):

```bash
cd apps/mobile
eas init
```

`eas init` trägt die `projectId` ein, die anschließend in `app.config.ts` unter `extra.eas.projectId` übernommen wird.

```bash
eas build --profile development --platform android
```

```bash
eas build --profile preview --platform all
```

```bash
eas build --profile production --platform all
```

```bash
eas submit --platform ios --profile production
```

> ⚠️ **Bundle-ID** `com.puzzlestudio.app` vor dem ersten Production-Build bestätigen – sie ist nach dem ersten Store-Upload nicht mehr änderbar.

## 5. Kompatibilitätsprüfung pnpm · Expo Router · native Module (Phase 1)

| Prüfung                                                     | Ergebnis                                                                                 |
| ----------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `expo install` (SDK-58-Versionen aller nativen Module)      | ✅ (offline-Modus, da `api.expo.dev` in der Cloud-Umgebung gesperrt ist; in CI mit Netz) |
| Metro-Bundle Android + iOS (Hermes) aus dem pnpm-Workspace  | ✅ `pnpm --filter @puzzle-studio/mobile export:native`                                   |
| Metro-Bundle Web + Ausführung im Browser (Chromium)         | ✅ inkl. Skia (CanvasKit), Gesten, Reanimated, Navigation                                |
| Workspace-Paket `@puzzle-studio/ui` (TS-Quellcode) in Metro | ✅ ohne zusätzliche Metro-Konfiguration                                                  |
| Native Kompilierung Android (Gradle) / iOS (xcodebuild)     | über GitHub Actions – Ergebnis im Milestone-Report 01                                    |

**Entscheidungen:**

- `node-linker=hoisted` (`.npmrc`): flaches `node_modules` – zuverlässigste Variante für React-Native-Autolinking, Gradle und Windows (keine Symlink-/Pfadlängenprobleme).
- **Imports in der App ohne Dateiendung** (`'@/services/skiaLoader'`). Mit expliziter Endung (`.ts`) umgeht Metro plattformspezifische Dateien (`*.web.ts`, `*.native.ts`) – im Spike nachgewiesen. In `packages/*` sind Endungen erlaubt (Node-Skripte importieren die Tokens direkt).
- Reanimated-Shared-Values in Komponenten über `.get()` / `.set()` (React-Compiler-kompatibel, von ESLint erzwungen).

## 6. Hilfsskripte

```bash
pnpm design:preview   # Konzept-Mockups → docs/design/concept/ (Playwright + Chromium)
pnpm brand:assets     # Interims-App-Icon, Splash, Beispielbild aus Pino-Geometrie
pnpm format           # Prettier
```
