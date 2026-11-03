# Teststrategie

Status: **Phase 8** – 238 automatische Tests (Engine 91, UI 49, App 67, image-processing 21, game-progression 10); Abdeckung der Engine wird in `pnpm test` erzwungen. Testprotokoll Phase 8: [test-protocol.md](../qa/test-protocol.md).

| Ebene             | Werkzeug                                                        | Umfang (Stand Phase 1)                                                                                                                                       | Wann              |
| ----------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------- |
| Typen             | `tsc --noEmit` (strict, TS 6)                                   | `packages/ui`, `apps/mobile`                                                                                                                                 | jede Änderung, CI |
| Lint              | ESLint 9 (`eslint-config-expo` flat + Prettier)                 | alles; Roh-Farben in Screens verboten; Tokens ohne RN-Imports                                                                                                | jede Änderung, CI |
| Format            | Prettier                                                        | alles                                                                                                                                                        | CI                |
| Unit (rein TS)    | Vitest                                                          | `packages/ui`: Tokens (WCAG-Kontrast, 4-pt-Raster, Touch-Größen, Font-Mapping)                                                                               | jede Änderung, CI |
| Unit / UI (App)   | Jest 30 + `jest-expo` + React Native Testing Library            | Start-Screen + Navigation, App-Konfiguration (Varianten, Berechtigungen), i18n, Benchmark-Geometrie                                                          | jede Änderung, CI |
| Bundle            | `expo export` Android + iOS                                     | Metro/Hermes-Bundle                                                                                                                                          | CI                |
| Dependencies      | `expo-doctor`                                                   | SDK-Kompatibilität                                                                                                                                           | CI                |
| Native Build      | Gradle (`android.yml`), xcodebuild Simulator (`ios.yml`)        | Kompilierung inkl. aller nativen Module; Manifest-Berechtigungsprüfung                                                                                       | Push / manuell    |
| E2E / Screenshots | Maestro (`apps/mobile/.maestro/screenshots.yaml` + Teilabläufe) | Onboarding → Atelier → Puzzle lösen → Sammlung → Erfolge → Eltern-Schranke → Elternbereich → Systemcheck (inkl. Cloud-Sicherung) → 256-Teile-Test → Neustart | Push / manuell    |
| Manuell           | Checkliste (s. u.)                                              | Gerätetests iOS + Android                                                                                                                                    | pro Meilenstein   |

## Befehle

```bash
pnpm test
```

```bash
pnpm --filter @puzzle-studio/mobile test -- --watch
```

## Pflicht-Tests der Engine (ab Phase 4)

Geometrie, Kanten, Grid, Snapping, Bildkoordinaten, Hit-Test, Serialisierung/Wiederherstellung, Determinismus. Zielabdeckung ≥ 95 % (Zeilen) für `packages/puzzle-engine` – erzwungen über `vitest --coverage` (Schwellen: Zeilen/Funktionen/Anweisungen 95 %, Zweige 90 %; Stand: 100 % Zeilen). Abhängigkeit `@vitest/coverage-v8` (nur Entwicklung, nicht in der App).

## Barrierefreiheit (automatisch, ab Phase 8)

`apps/mobile/__tests__/a11y.test.tsx` rendert alle Hauptscreens (Onboarding, Start, Atelier, Beispielbilder, Sammlung, Erfolge, Eltern-Schranke, alle drei Reiter des Elternbereichs) und prüft mit `testing/a11yAudit.ts`, dass **jedes antippbare Element eine Rolle und einen vorlesbaren Namen** hat (das, was VoiceOver/TalkBack ansagen). Kontraste von Text und Schaltern prüft `packages/ui/test/tokens.test.ts`. Schriftgröße folgt der Systemeinstellung bis 130 % (`maxFontSizeMultiplier` zentral in `Text`).

## Performance-Budget & früher 256-Teile-Test

- Gameplay 256 Teile: 60 fps beim Ziehen auf Referenz-Android (Mittelklasse, ~4 GB RAM) und iPhone 12 oder neuer.
- Puzzle-Erzeugung (256 Teile): < 300 ms.
- Kaltstart bis Start-Screen: < 2 s.
- Speichern + Wiederherstellen eines Spielstands (256 Teile): < 100 ms.

Automatisch abgesichert (Node ≈ 10× schneller als ein Mittelklasse-Handy → ein Zehntel des Geräte-Budgets): `packages/puzzle-engine/test/budget.test.ts` (Erzeugung 256 Teile < 30 ms, gemessen ~10 ms; Speichern + Laden < 10 ms, gemessen < 1 ms) und `hitTest.test.ts` (Treffer < 0,05 ms).

Der **256-Teile-Test** (Start → „256-Teile-Test“) ist bereits in Phase 1 enthalten (PO-Vorgabe: Performance früh auf echten Geräten prüfen). Er rendert 256 Teile mit echten Puzzle-Konturen aus einem Beispielbild (eine gecachte Skia-Picture für ruhende Teile, das gezogene Teil live auf dem UI-Thread) und zeigt Aufbauzeit, Bilder/s und minimale Bilder/s.

**Messprotokoll für Geräte** (Ergebnisse in den Milestone-Report eintragen):

1. Preview-Build installieren (nicht Dev-Build – Dev-Builds sind deutlich langsamer).
2. „256-Teile-Test“ öffnen, 10 s warten, Werte notieren (Ruhe).
3. 30 s lang Teile ziehen, Werte „Bilder/s“ und „min. Bilder/s“ notieren.
4. Gerätemodell, OS-Version, RAM notieren.

| Gerät                                                               | OS         | Aufbau ms | Bilder/s Ruhe | Bilder/s Ziehen | min. Bilder/s |
| ------------------------------------------------------------------- | ---------- | --------- | ------------- | --------------- | ------------- |
| iOS-Simulator (CI, macOS) – _nicht repräsentativ_                   | iOS 26.5   | 13,8–15,5 | 60            | 60              | 60            |
| Android-Emulator Pixel 6 (CI, Software-GPU) – _nicht repräsentativ_ | Android 14 | 323       | 46            | 52              | 12–20         |
| _ausstehend_                                                        |            |           |               |                 |               |

Emulator- und Browser-Werte sind **nicht** aussagekräftig (Software-Rendering) und werden nur als Funktionsnachweis genutzt.

## Manuelle Checkliste (pro Meilenstein)

iOS + Android · kleines (≤ 5,5") und großes Display · Gesten · Dynamic Type 130 % · Reduced Motion · VoiceOver/TalkBack-Labels · Kaltstart · Offline (Flugmodus).
