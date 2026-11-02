# Milestone 02 – Design & Navigation (Phase 2)

**Datum:** 2026-11-02 · **Phase:** 2 · **Status:** umgesetzt, **wartet auf Review durch den PO**

> Alle Screenshots stammen aus der **laufenden App** (iOS-Simulator und Android-Emulator via GitHub Actions/Maestro, Web via Chromium). Konzept-Mockups liegen getrennt unter `docs/design/concept/`.
> Gestaltung von Pino und einzelnen Styles ist laut PO **noch nicht final** – siehe Abschnitt „Änderbarkeit“.

## 1. Umgesetzt

| Bereich                        | Ergebnis                                                                                                                                                                                                                        |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Pino als Komponente**        | `<Mascot emotion=… />` mit allen 8 Emotionen, sanftem Idle-Wippen (aus bei „Bewegung reduzieren“), Accessibility-Label. Zeichnung + Farben zentral in `packages/ui/src/mascot/`, **eine Quelle** für App, App-Icon und Mockups. |
| **Designsystem**               | Neu: `Icon`, `DecorativeBackground` (Presets meadow/sky/dream/table/calm), `ProgressDots`, `SelectionCard`, `FeatureCard`, `IconButton`, `SpeechBubble`, `BottomNavigation`, `EmptyState`; `Screen` mit Dekor-Ebene.            |
| **Onboarding**                 | 3 Schritte nach Referenz: Willkommen → Versprechen → **„Wer puzzelt?“** (Spielhilfe-Profil Kleinkind/Kind/Profi). Überspringbar (Standard: Kind).                                                                               |
| **Home**                       | Pino-Begrüßung mit Sprechblase, Hauptaktion „Puzzle erstellen“, Sammlung (ehrlich leer), Zugang Elternbereich.                                                                                                                  |
| **Navigation**                 | Schwebende Tab-Leiste mit eigenen Icons: Start · Erstellen · Sammlung · Erfolge.                                                                                                                                                |
| **Noch nicht verfügbare Tabs** | Freundliche, **ehrliche** Leer-Zustände mit Pino („bald“) – keine Attrappen, keine toten Buttons.                                                                                                                               |
| **Elternbereich (Vorschau)**   | Profil ändern, Begrüßung erneut zeigen, Werkzeuge (Systemcheck, 256-Teile-Test). Elternschranke folgt in Phase 7.                                                                                                               |
| **Speicherung**                | Einstellungen in **SQLite** mit versionierten Migrationen (iOS/Android), `localStorage` in der Web-Vorschau. Überlebt App-Neustart (per Maestro geprüft).                                                                       |

## 2. Änderbarkeit (PO-Frage: Maskottchen & Styles später anpassen)

Ja – und ohne Umbau der Screens:

- **Styles:** alle Werte in `packages/ui/src/tokens.ts`; Komponenten in `packages/ui/src/components/`. Eine Änderung wirkt überall. Tests prüfen danach automatisch Kontraste und Touch-Größen.
- **Pino:** Farben in `mascot/theme.ts`, Zeichnung in `mascot/pino.ts`. Finale Illustrationen können später **je Emotion als SVG** eingesetzt werden; die Screens nutzen nur `<Mascot emotion=… />`.
- **Hintergründe/Icons:** `packages/ui/src/illustrations/`.
- Icon, Splash und Mockups werden per Skript aus denselben Quellen neu erzeugt.

Details: [design-system.md §11](../../design/design-system.md) · [mascot-guidelines.md → Austauschbarkeit](../../design/mascot-guidelines.md)

## 3. Qualität

| Prüfung                           | Ergebnis                                                                                                                          |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| TypeScript strict                 | ✅                                                                                                                                |
| ESLint (inkl. „keine Roh-Farben“) | ✅                                                                                                                                |
| Prettier                          | ✅                                                                                                                                |
| Vitest `packages/ui`              | ✅ 48 Tests (Tokens/WCAG, Pino 8 Emotionen, Hintergründe)                                                                         |
| Jest `apps/mobile`                | ✅ 19 Tests (Onboarding-Ablauf + Profil gespeichert, Überspringen, Home-Navigation, Tab-Leiste, Einstellungen, App-Konfiguration) |
| Metro-Bundle Android + iOS        | ✅                                                                                                                                |
| Native Builds + Maestro           | siehe Abschnitt 5                                                                                                                 |

## 4. Design-QA

- ✅ Pastellwelt, Rundungen, weiche Schatten, Wolken/Sterne/Wiese wie in der Referenz; Onboarding-Aufbau (Titel → Text → Figur → CTA) entspricht der Referenz.
- ✅ Eine Hauptaktion pro Screen; Touch-Ziele ≥ 56 dp (CTA 64 dp); Pino-Größen ≥ 64 dp außer in Auswahlkarten (dort dekorativ, ohne Screenreader-Label).
- ✅ Keine Roh-Farben in Screens (ESLint), Texte über i18n.
- ⚠️ Pino und Hintergründe sind Vektor-Interimsgrafik – finale Illustrationen offen (PO).
- ⚠️ Startbildschirm ohne Seitenwechsel-Animation zwischen Onboarding-Schritten (nur sanftes Einblenden) – bewusst ruhig gehalten.

## 5. Screenshots (echt)

### Web (Chromium, 390 × 844)

| Willkommen                                                                | Versprechen                                                               | Wer puzzelt?                                                              | Start                                                       |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ----------------------------------------------------------- |
| ![](../screenshots/2026-11-02-milestone-02-web-01-onboarding-welcome.png) | ![](../screenshots/2026-11-02-milestone-02-web-02-onboarding-promise.png) | ![](../screenshots/2026-11-02-milestone-02-web-03-onboarding-profile.png) | ![](../screenshots/2026-11-02-milestone-02-web-04-home.png) |

| Erstellen (bald)                                                  | Erfolge (bald)                                                    | Elternbereich                                                  |
| ----------------------------------------------------------------- | ----------------------------------------------------------------- | -------------------------------------------------------------- |
| ![](../screenshots/2026-11-02-milestone-02-web-05-tab-create.png) | ![](../screenshots/2026-11-02-milestone-02-web-06-tab-awards.png) | ![](../screenshots/2026-11-02-milestone-02-web-07-parents.png) |

### iOS-Simulator (iOS 26.5) – Maestro in GitHub Actions

| Willkommen                                                                | Versprechen                                                               | Wer puzzelt?                                                              | Start                                                       | Erstellen                                                         |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ----------------------------------------------------------- | ----------------------------------------------------------------- |
| ![](../screenshots/2026-11-02-milestone-02-ios-01-onboarding-welcome.png) | ![](../screenshots/2026-11-02-milestone-02-ios-02-onboarding-promise.png) | ![](../screenshots/2026-11-02-milestone-02-ios-03-onboarding-profile.png) | ![](../screenshots/2026-11-02-milestone-02-ios-04-home.png) | ![](../screenshots/2026-11-02-milestone-02-ios-05-tab-create.png) |

| Erfolge                                                           | Elternbereich                                                  | Systemcheck                                                         | Nach Neustart                                                                      |
| ----------------------------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| ![](../screenshots/2026-11-02-milestone-02-ios-06-tab-awards.png) | ![](../screenshots/2026-11-02-milestone-02-ios-07-parents.png) | ![](../screenshots/2026-11-02-milestone-02-ios-08-system-check.png) | ![](../screenshots/2026-11-02-milestone-02-ios-09-after-relaunch-profile-kept.png) |

### Android-Emulator (Pixel 6, API 34) – Maestro in GitHub Actions

| Willkommen                                                                    | Versprechen                                                                   | Wer puzzelt?                                                                  | Start                                                           | Erstellen                                                             |
| ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | --------------------------------------------------------------- | --------------------------------------------------------------------- |
| ![](../screenshots/2026-11-02-milestone-02-android-01-onboarding-welcome.png) | ![](../screenshots/2026-11-02-milestone-02-android-02-onboarding-promise.png) | ![](../screenshots/2026-11-02-milestone-02-android-03-onboarding-profile.png) | ![](../screenshots/2026-11-02-milestone-02-android-04-home.png) | ![](../screenshots/2026-11-02-milestone-02-android-05-tab-create.png) |

| Erfolge                                                               | Elternbereich                                                      | Systemcheck                                                             | Nach Neustart                                                                          |
| --------------------------------------------------------------------- | ------------------------------------------------------------------ | ----------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| ![](../screenshots/2026-11-02-milestone-02-android-06-tab-awards.png) | ![](../screenshots/2026-11-02-milestone-02-android-07-parents.png) | ![](../screenshots/2026-11-02-milestone-02-android-08-system-check.png) | ![](../screenshots/2026-11-02-milestone-02-android-09-after-relaunch-profile-kept.png) |

Beide Plattformen bestehen den kompletten Flow inkl. **Persistenzprüfung**: Nach einem App-Neustart ohne Datenlöschung wird das Onboarding übersprungen und das gewählte Profil „Kleine Puzzler“ ist weiterhin aktiv (SQLite).

## 6. In diesem Meilenstein gefundene und behobene Fehler

| Fehler                                                                                                                                                                                                                                                              | Gefunden durch                                    | Behebung                                                                                                                  |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| **Barrierefreiheit:** Bei abgeschalteten System-Animationen (Android „Animationen entfernen“, auch von Menschen mit Bewegungsempfindlichkeit genutzt) blieben Titel und Text des Onboardings **unsichtbar** – Reanimated-Layout-Animationen hingen bei Deckkraft 0. | Android-Emulator in CI (UI-Hierarchie ohne Texte) | Neue Komponente `<Appear>` zeigt Inhalte bei „Bewegung reduzieren“ sofort; ESLint verbietet `entering`/`exiting` künftig. |
| Lockfile nicht aktualisiert nach neuer Peer-Abhängigkeit → CI-Installation schlug fehl                                                                                                                                                                              | CI                                                | Lockfile aktualisiert; CLAUDE.md verlangt `pnpm install --frozen-lockfile` lokal vor jedem Push.                          |
| Emulator-Infrastruktur (System-ANR-Dialog, defekter Systemabbild-Download)                                                                                                                                                                                          | CI                                                | Emulator-Lauf wartet nach dem Booten, schließt Systemdialoge, wiederholt Maestro einmal; kein App-Fehler.                 |

## 7. Nächster Schritt – Phase 3 (Image Workflow)

Bildauswahl (System-Picker), Kamera, Zuschnitt/Drehen (nicht-destruktiv: Original bleibt, Arbeitsversion wird abgeleitet), Thumbnails, Ablage in SQLite/Dateisystem, eigene Beispielbilder, Farbgruppen pro Teil (Grundlage der Sortier-Schalen). Der Tab „Erstellen“ bekommt damit seinen ersten echten Ablauf.
