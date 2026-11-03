# Testprotokoll – Phase 8 (QA & Optimierung)

Status: **Phase 8 – automatisierbarer Teil umgesetzt (2026-11-03)**; Tests auf echten Geräten stehen aus (Abschnitt 5, braucht Geräte beim PO).

## 1. Automatische Prüfungen (bei jedem Push in CI)

| Prüfung                             | Ergebnis                                                                                                                                             |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| TypeScript strict, ESLint, Prettier | ✅                                                                                                                                                   |
| Unit-/UI-Tests                      | ✅ 238 Tests: Engine 91 (100 % Zeilen), UI 49, App 67, image-processing 21, game-progression 10                                                      |
| Lockfile (`--frozen-lockfile`)      | ✅                                                                                                                                                   |
| Metro-Bundle Android + iOS          | ✅                                                                                                                                                   |
| Native Builds                       | ✅ Android (Gradle) · ✅ iOS-Simulator (xcodebuild)                                                                                                  |
| Android-Manifest                    | ✅ keine Medien-, Mikrofon- oder Standort-Berechtigung (Kamera erst bei Bedarf); **neu:** CI bricht ab, wenn `android:allowBackup` nicht `false` ist |
| Maestro Android-Emulator            | ✅ kompletter Ablauf (23 Bilder) inkl. Eltern-Schranke und Systemcheck „Cloud-Sicherung“                                                             |
| Maestro iOS-Simulator               | siehe Milestone-Report 08 (abhängig von freien macOS-Rechnern bei GitHub)                                                                            |

## 2. Security-Review

| Bereich                              | Befund                                                                                                                                                                                                                                                   | Bewertung                    |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| Netzwerk                             | Kein `fetch`, `XMLHttpRequest`, `WebSocket` oder Netzwerk-SDK im App-Code; keine Analytics/Werbung/Crash-Reporting.                                                                                                                                      | ✅                           |
| Cloud / Backup                       | iOS: Dokumentenordner von iCloud-/Computer-Sicherung ausgeschlossen (eigenes Modul, im Systemcheck sichtbar). Android: `allowBackup: false` (CI-Prüfung).                                                                                                | ✅ (PO-Entscheidung)         |
| Logs                                 | Nur zwei Log-Stellen (Bild speichern, Backup-Ausschluss). Fehlertexte laufen durch `describeError`, das Pfade/URIs durch `<path>` ersetzt (getestet). Keine Bildinhalte, Dateinamen oder EXIF in Logs.                                                   | ✅                           |
| Datenbank                            | Alle SQL-Abfragen mit Platzhaltern (`?`), keine zusammengesetzten Nutzereingaben. Fremdschlüssel aktiv (`PRAGMA foreign_keys = ON`).                                                                                                                     | ✅                           |
| Gespeicherte Daten                   | Nur im App-Sandbox-Ordner; Verschlüsselung durch das Betriebssystem (iOS Data Protection, Android dateibasierte Verschlüsselung). Spielstände werden beim Laden geprüft (`parseState`, wirft nie).                                                       | ✅                           |
| Originalfotos                        | Werden nur gelesen, nie verändert; EXIF-Daten gehen bei der Arbeitsversion verloren (JPEG-Neukodierung).                                                                                                                                                 | ✅                           |
| Elternbereich                        | Eltern-Schranke vor allen Einstellungen und dem Löschen; jedes Öffnen fragt neu.                                                                                                                                                                         | ✅                           |
| Deep Links (`puzzlestudio://`)       | Erreichbar sind nur App-Bildschirme. Der Elternbereich zeigt auch per Link immer zuerst die Schranke. Systemcheck und 256-Teile-Test sind per Link ohne Schranke erreichbar – sie zeigen keine Daten, ändern nichts und verlinken nicht nach außen.      | ✅ akzeptiert (dokumentiert) |
| Abhängigkeiten (`pnpm audit --prod`) | 5 Meldungen (1 niedrig, 4 mittel) in `glob`, `minimatch`, `deepmerge` – **nur in Entwicklungswerkzeugen** (Expo-CLI, Jest), nicht im App-Paket auf dem Gerät. Behebung kommt mit Expo-Updates; keine Zwangs-Overrides, um das Expo-SDK nicht zu brechen. | ✅ kein Risiko für Nutzer    |
| Neue Abhängigkeiten Phase 7/8        | Keine (das Backup-Modul ist eigener Code in `apps/mobile/modules/backup-exclusion`).                                                                                                                                                                     | ✅                           |

## 3. Barrierefreiheit

| Prüfung                                        | Ergebnis                                                                                                                                         |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Rollen + vorlesbare Namen (VoiceOver/TalkBack) | ✅ automatisch auf allen Hauptscreens und allen Reitern des Elternbereichs (`a11y.test.tsx`)                                                     |
| Textkontrast WCAG AA                           | ✅ Navy/Grau-Lila auf allen Flächen ≥ 4,5 : 1 (`tokens.test.ts`)                                                                                 |
| Kontrast von Bedienelementen (WCAG 1.4.11)     | **behoben:** Schalter hatten nur 1,7–1,9 : 1 → neue Tokens `color.control.*` (≥ 4,1 : 1), Zustand zusätzlich an Knopfposition und Form erkennbar |
| Touch-Ziele                                    | ✅ ≥ 56 dp (Kinder), CTA 64 dp (Tokens, getestet)                                                                                                |
| Schriftgröße                                   | ✅ folgt der Systemeinstellung bis 130 % (zentral), größer würde die kindgerechten Layouts sprengen                                              |
| Bewegung reduzieren                            | ✅ Systemeinstellung **und** Schalter im Elternbereich; alle animierten Komponenten nutzen `useReduceMotion`                                     |
| Ohne Lesen bedienbar                           | ✅ Kinder-Bereiche mit Pino, Symbolen und Bildern; Texte nur ergänzend                                                                           |

## 4. Performance

| Messung                                 | Budget (Gerät) | Ergebnis                                                         |
| --------------------------------------- | -------------- | ---------------------------------------------------------------- |
| Puzzle erzeugen, 256 Teile              | < 300 ms       | Node ~10 ms → Test-Budget 30 ms ✅                               |
| Spielstand speichern + laden, 256 Teile | < 100 ms       | Node < 1 ms (≈ 16 KB JSON) ✅                                    |
| Treffer-Test pro Berührung              | < 0,5 ms       | Android-Emulator 14 µs, iOS-Simulator 8 µs ✅                    |
| Arbeitsbild im Speicher                 | –              | max. 1536 px Kante (≈ 7 MB Textur), Vorschaubild 512 px ✅       |
| 60 fps beim Ziehen, 256 Teile           | 60 fps         | Emulator/Simulator nicht aussagekräftig – **echte Geräte offen** |
| Kaltstart bis Start-Screen              | < 2 s          | **echte Geräte offen**                                           |

## 5. Tests auf echten Geräten (offen – bitte durch den PO)

Echte Geräte stehen der CI nicht zur Verfügung. Voraussetzung: Preview-Build auf dem Gerät (Android: APK aus dem CI-Lauf „Android build“ → Artefakt `puzzle-studio-preview-apk`; iPhone: braucht TestFlight/EAS mit Apple-Entwicklerkonto – noch offen).

| #   | Prüfung                                                                                                             | iPhone | Android |
| --- | ------------------------------------------------------------------------------------------------------------------- | ------ | ------- |
| 1   | 256-Teile-Test: 10 s Ruhe, dann 30 s ziehen – „Bilder/s“ und „min. Bilder/s“ notieren (Messprotokoll in testing.md) |        |         |
| 2   | Kaltstart (App ganz schließen, öffnen) bis Startseite – Stoppuhr                                                    |        |         |
| 3   | Eigenes Foto (Kamera und Galerie) → Puzzle 100 Teile lösen; Ziehen flüssig?                                         |        |         |
| 4   | VoiceOver / TalkBack: Startseite, Atelier, Puzzle starten – wird alles verständlich vorgelesen?                     |        |         |
| 5   | Systemschrift auf größte Stufe: Startseite, Elternbereich, Spieltisch – nichts abgeschnitten?                       |        |         |
| 6   | „Bewegung reduzieren“ (System und Elternbereich): keine Hüpf-/Funkel-Animationen mehr                               |        |         |
| 7   | Flugmodus: alles funktioniert gleich                                                                                |        |         |
| 8   | Systemcheck → „Cloud-Sicherung“ zeigt OK                                                                            |        |         |
| 9   | Kleines Display (≤ 5,5″) und Tablet: Startseite und Spieltisch ohne Überlappungen                                   |        |         |

Gerät, OS-Version und Werte bitte in die Tabelle in [testing.md](../development/testing.md#performance-budget--früher-256-teile-test) bzw. hier eintragen.
