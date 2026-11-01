# Datenschutz & Kindersicherheit

Status: **Konzept** – wird mit jeder Phase fortgeschrieben. Dies ist keine Rechtsberatung; vor Veröffentlichung sind DSGVO (inkl. Art. 8), Apple App Store Kids Category (Guideline 1.3, 5.1.4) und Google Play Families Policy fachlich/rechtlich zu prüfen.

## Grundsätze (verbindlich)

Keine Registrierung · keine Werbung · keine Analytics/Tracking-SDKs · kein Standort · kein Chat · keine öffentliche Galerie · kein automatischer Upload · keine Klarnamen erforderlich · keine Drittanbieter-SDKs ohne dokumentierte Notwendigkeit.

## Verarbeitete Daten (MVP)

| Daten | Zweck | Ort | Verlässt das Gerät? |
|---|---|---|---|
| Vom Kind gewählte/aufgenommene Bilder (zugeschnitten, ohne EXIF) | Puzzle erzeugen | App-Sandbox `documentDirectory/images` | Nein |
| Puzzle-Metadaten & Fortschritt | Fortsetzen, Sammlung | SQLite (App-Sandbox) | Nein |
| Erfolge, Einstellungen | Belohnungen, Präferenzen | SQLite | Nein |
| Absturzberichte | — | — | Nicht erhoben (MVP) |

## Berechtigungen

| Plattform | Berechtigung | Wann | Begründung |
|---|---|---|---|
| iOS/Android | Kamera | erst beim Tippen auf „Foto aufnehmen“ | Foto aufnehmen |
| iOS | Fotos | **keine** – System-Picker (PHPicker) braucht keine Vollberechtigung | |
| Android 13+ | **keine** Medienberechtigung – Android Photo Picker | | |
| Mikrofon, Standort, Kontakte, Netzwerk-Tracking | **nie** | | |

`expo-image-picker` wird so konfiguriert, dass keine unnötigen Berechtigungen (z. B. `RECORD_AUDIO`, `READ_MEDIA_*`) im Manifest landen – wird in Phase 3 per Manifest-Prüfung im CI verifiziert.

## Bildverarbeitung

- EXIF-Orientierung wird angewendet, **EXIF/GPS-Metadaten werden verworfen** (Neu-Encoding via Image Manipulator).
- Interne Dateinamen sind UUIDs; Originaldateinamen werden nicht gespeichert.
- **Logging-Regel:** Keine Bildinhalte, Pfade mit Nutzerbezug, EXIF-Daten oder Dateinamen in Logs. Logger-Wrapper erlaubt nur IDs und Fehlercodes.

## Löschen

Einzelnes Puzzle (inkl. ungenutztem Bild) · alle Puzzles · „Alle lokalen Daten löschen“ im Elternbereich. App-Deinstallation entfernt alle Daten.

## Backup-Verhalten

- iOS: App-Daten sind standardmäßig Teil des iCloud-Gerätebackups des Elterngeräts. Entscheidung Phase 7: Bilder mit `isExcludedFromBackup` markieren **oder** bewusst im Gerätebackup lassen – wird im Elternbereich transparent erklärt.
- Android: `allowBackup` wird in Phase 7 bewusst konfiguriert (Standard-Vorschlag: `false` bzw. `dataExtractionRules` ohne Bildordner).
- Optionales Cloud-Backup (Post-MVP): nur über Elternbereich, ausdrückliche Einwilligung, Ende-zu-Ende-Konzept vor Implementierung.

## Eltern-Schranke

Zufällige Rechenaufgabe in Worten bzw. „Halte die Taste 3 Sekunden gedrückt und tippe auf die Zahl …“, ohne visuelle Hinweise für Leseanfänger. **Die Schranke ersetzt keine rechtlich erforderliche Einwilligung.**

## SDK-Liste

Wird in Phase 1 mit dem tatsächlichen `package.json` gefüllt (nur Expo-Module + Skia/Reanimated/Gesture Handler/Zustand; keine Netzwerk-SDKs).
