# Datenschutz & Kindersicherheit

Status: **Konzept, Stand Phase 3** (Berechtigungen und SDK-Liste sind umgesetzt bzw. aktuell) – wird mit jeder Phase fortgeschrieben. Dies ist keine Rechtsberatung; vor Veröffentlichung sind DSGVO (inkl. Art. 8), Apple App Store Kids Category (Guideline 1.3, 5.1.4) und Google Play Families Policy fachlich/rechtlich zu prüfen.

## Grundsätze (verbindlich)

Keine Registrierung · keine Werbung · keine Analytics/Tracking-SDKs · kein Standort · kein Chat · keine öffentliche Galerie · kein automatischer Upload · keine Klarnamen erforderlich · keine Drittanbieter-SDKs ohne dokumentierte Notwendigkeit.

## Verarbeitete Daten (MVP)

| Daten                                                            | Zweck                    | Ort                                                     | Verlässt das Gerät? |
| ---------------------------------------------------------------- | ------------------------ | ------------------------------------------------------- | ------------------- |
| Vom Kind gewählte/aufgenommene Bilder (zugeschnitten, ohne EXIF) | Puzzle erzeugen          | App-Sandbox `documentDirectory/images`                  | Nein                |
| Puzzle-Metadaten & Fortschritt                                   | Fortsetzen, Sammlung     | SQLite (App-Sandbox)                                    | Nein                |
| Erfolge, Einstellungen (u. a. Spielhilfe-Profil)                 | Belohnungen, Präferenzen | SQLite; in der Web-Vorschau `localStorage` des Browsers | Nein                |
| Absturzberichte                                                  | —                        | —                                                       | Nicht erhoben (MVP) |

## Berechtigungen

| Plattform                                       | Berechtigung                                        | Wann                                                                | Begründung     |
| ----------------------------------------------- | --------------------------------------------------- | ------------------------------------------------------------------- | -------------- |
| iOS/Android                                     | Kamera                                              | erst beim Tippen auf „Foto aufnehmen“                               | Foto aufnehmen |
| iOS                                             | Fotos                                               | **keine** – System-Picker (PHPicker) braucht keine Vollberechtigung |                |
| Android 13+                                     | **keine** Medienberechtigung – Android Photo Picker |                                                                     |                |
| Mikrofon, Standort, Kontakte, Netzwerk-Tracking | **nie**                                             |                                                                     |                |

Umsetzung (Phase 1): `expo-image-picker` mit `photosPermission: false` und `microphonePermission: false`; in `app.config.ts` sind `RECORD_AUDIO`, `READ/WRITE_EXTERNAL_STORAGE`, `READ_MEDIA_*` und Standort als `blockedPermissions` gesetzt. Der Android-CI-Workflow prüft das **gemergte Manifest** und schlägt fehl, falls eine dieser Berechtigungen auftaucht; die tatsächliche Berechtigungsliste liegt jedem Build als `permissions.txt` bei. Ein Unit-Test sichert die Konfiguration ab.

## Bildverarbeitung

- **Original bleibt unverändert** (nicht-destruktiv, siehe [data-model.md](../architecture/data-model.md)). Es liegt ausschließlich in der App-Sandbox, wird nie hochgeladen, exportiert oder geloggt. Es kann – wie vom Gerät geliefert – EXIF-/GPS-Metadaten enthalten; diese werden nie ausgelesen oder angezeigt.
- Alle **Arbeitsversionen und Thumbnails** werden neu encodiert: EXIF-Orientierung wird angewendet, **EXIF/GPS-Metadaten werden verworfen**. Nur Arbeitsversionen werden von Engine und UI verwendet.
- Optionaler späterer Export (Post-MVP) nutzt ausschließlich metadatenfreie Arbeitsversionen.
- Interne Dateinamen sind zufällige IDs; Originaldateinamen werden **nie gelesen oder gespeichert** – die Dateiendung kommt ausschließlich aus dem MIME-Typ (umgesetzt in `services/imageSources.ts`, getestet).
- Kamera-Berechtigung wird erst beim Tippen auf „Foto aufnehmen“ angefragt; Ablehnung wird freundlich erklärt (kein stilles Scheitern).
- Beispielbilder sind eigene Illustrationen, in der App gebündelt (offline, keine Fremdinhalte).
- Web-Vorschau: Bilder bleiben nur im Speicher des Browser-Tabs (kein Dateisystem, kein Upload).
- **Logging-Regel:** Keine Bildinhalte, Pfade mit Nutzerbezug, EXIF-Daten oder Dateinamen in Logs. Logger-Wrapper erlaubt nur IDs und Fehlercodes.

## Löschen

Einzelnes Puzzle (inkl. ungenutztem Bild) · alle Puzzles · „Alle lokalen Daten löschen“ im Elternbereich. App-Deinstallation entfernt alle Daten.

## Backup-Verhalten

- iOS: App-Daten sind standardmäßig Teil des iCloud-Gerätebackups des Elterngeräts. Entscheidung Phase 7: Bilder mit `isExcludedFromBackup` markieren **oder** bewusst im Gerätebackup lassen – wird im Elternbereich transparent erklärt.
- Android: `allowBackup` wird in Phase 7 bewusst konfiguriert (Standard-Vorschlag: `false` bzw. `dataExtractionRules` ohne Bildordner).
- Optionales Cloud-Backup (Post-MVP): nur über Elternbereich, ausdrückliche Einwilligung, Ende-zu-Ende-Konzept vor Implementierung.

## Eltern-Schranke

Zufällige Rechenaufgabe in Worten bzw. „Halte die Taste 3 Sekunden gedrückt und tippe auf die Zahl …“, ohne visuelle Hinweise für Leseanfänger. **Die Schranke ersetzt keine rechtlich erforderliche Einwilligung.**

## SDK-Liste (Stand Phase 3, `apps/mobile/package.json`)

| Paket                                                                                                              | Zweck                                                                       | Netzwerk / Daten nach außen    |
| ------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------- | ------------------------------ |
| `expo`, `expo-router`, `expo-linking`, `expo-constants`, `expo-status-bar`, `expo-system-ui`, `expo-splash-screen` | App-Grundgerüst, Navigation                                                 | nein                           |
| `expo-dev-client`                                                                                                  | Nur Development-Build (Verbindung zum lokalen Metro-Server des Entwicklers) | nur im Dev-Build, lokal        |
| `expo-font`, `@expo-google-fonts/nunito`                                                                           | Schrift, **in der App gebündelt**                                           | nein (kein Abruf zur Laufzeit) |
| `expo-image`, `expo-linear-gradient`, `react-native-svg`                                                           | Darstellung                                                                 | nein                           |
| `expo-image-picker`, `expo-image-manipulator`, `expo-file-system`, `expo-asset`                                    | Bildauswahl, -verarbeitung, Ablage, gebündelte Beispielbilder               | nein                           |
| `expo-sqlite`                                                                                                      | Lokale Datenbank                                                            | nein                           |
| `@shopify/react-native-skia`, `react-native-reanimated`, `react-native-worklets`, `react-native-gesture-handler`   | Puzzle-Rendering, Animation, Gesten                                         | nein                           |
| `react-native-safe-area-context`, `react-native-screens`, `react-native-web`, `react-dom`                          | Layout / Web-Vorschau                                                       | nein                           |

Keine Analytics-, Werbe-, Crash-Reporting-, Login- oder Cloud-SDKs. Neue Abhängigkeiten werden hier vor dem Merge eingetragen.
