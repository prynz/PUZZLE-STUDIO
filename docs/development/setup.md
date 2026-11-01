# Entwicklungsumgebung

Status: Phase 0 – nur Tokens + Mockup-Renderer lauffähig. Die Expo-Abschnitte werden in Phase 1 verifiziert und ergänzt.

## Voraussetzungen (Windows 11)

| Tool | Version | Hinweis |
|---|---|---|
| Node.js | ≥ 22.18 (LTS) | Type-Stripping für `.ts`-Imports in Node-Skripten |
| pnpm | 10.x | `corepack enable` und dann `corepack prepare pnpm@10.28.0 --activate` |
| Git | aktuell | `git config core.autocrlf input` empfohlen |
| VS Code | aktuell | Extensions: ESLint, Prettier, Expo Tools |
| Android Studio | aktuell | Emulator + SDK für Android-Dev-Builds |
| EAS CLI | aktuell | `pnpm add -g eas-cli`, `eas login` |
| Expo-Konto | — | für EAS Build / iOS-Builds |
| Apple Developer Account | — | für iOS-Geräte-Builds & TestFlight |

Lokales Xcode ist nicht nötig: iOS-Builds laufen über **EAS Cloud Build**.

## Jetzt verfügbar

```bash
pnpm install
pnpm typecheck          # Token-Paket
pnpm design:preview     # rendert docs/design/concept/*.png (braucht Playwright + Chromium)
```

Playwright für den Mockup-Renderer bei Bedarf: `pnpm dlx playwright install chromium` und Playwright global oder per `NODE_PATH` verfügbar machen.

## Ab Phase 1 (geplant)

```bash
pnpm --filter mobile start                 # Metro / Dev-Server
eas build --profile development --platform android   # Dev-Client APK
eas build --profile development --platform ios       # Dev-Client (Gerät, registriert via eas device:create)
eas build --profile preview --platform all           # interne Testbuilds
eas build --profile production --platform all        # Store-Builds (AAB / IPA)
eas submit --platform ios                            # TestFlight
```

Da Skia, Reanimated und Gesture Handler native Module sind, wird **ein Development Build** (kein Expo Go) verwendet.
