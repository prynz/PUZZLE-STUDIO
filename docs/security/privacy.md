# Datenschutz & Kindersicherheit

Status: **Stand Phase 7** (Berechtigungen, Löschen, Backup-Verhalten, Eltern-Schranke und SDK-Liste sind umgesetzt bzw. aktuell) – wird mit jeder Phase fortgeschrieben. Dies ist keine Rechtsberatung; vor Veröffentlichung sind DSGVO (inkl. Art. 8), Apple App Store Kids Category (Guideline 1.3, 5.1.4) und Google Play Families Policy fachlich/rechtlich zu prüfen.

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
- **Farbschalen (Phase 5):** Die Durchschnittsfarbe je Puzzleteil wird lokal aus einer winzigen Kopie der Arbeitsversion berechnet (Skia, im Speicher) und nur als Spielhilfe verwendet – nicht gespeichert, nicht übertragen. Der Spielstand in SQLite enthält nur Positionen, Zustände und Schalen-Namen.

## Löschen

- Einzelnes Bild im Atelier (mit allen Dateien und den Puzzles daraus), einzelnes Puzzle in der Sammlung.
- **„Alle lokalen Daten löschen“** im Elternbereich (Reiter „Daten“, nur nach Rückfrage): löscht alle Puzzles, alle Bilder samt Bildordner (`images/` im App-Dokumentenordner – Originale, Arbeitsversionen, Vorschaubilder), Sterne, Meilensteine und alle Einstellungen; danach startet die App mit der Begrüßung wie neu. Umgesetzt in `features/parents/ParentsData.tsx` über die `clear()`-Methoden der Stores.
- App-Deinstallation entfernt alle Daten.

## Backup-Verhalten (Entscheidung Phase 7)

- **Android: `allowBackup: false`** (`apps/mobile/app.config.ts`). Die automatische Google-Drive-Sicherung würde Kinderfotos ohne aktives Zutun hochladen – das widerspricht „kein automatischer Upload“. Folge: Beim Gerätewechsel ziehen Bilder und Spielstände nicht automatisch mit um; das wird im Elternbereich offen gesagt.
- **iOS:** Die Daten liegen im App-Dokumentenordner und sind damit Teil der **Geräte-Sicherung** (iCloud-Backup oder Computer), die Eltern in den iPhone-Einstellungen selbst steuern; die Sicherung ist an das Apple-Konto der Eltern gebunden und Teil des Systems, nicht der App. Ein Ausschluss per `isExcludedFromBackup` wäre nur mit eigenem nativen Code möglich (expo-file-system bietet ihn nicht) – bewusst nicht umgesetzt, **zur Entscheidung durch den PO** (siehe Report 07).
- Der Elternbereich erklärt beides (Reiter „Info“ → „Sicherung“).
- Eine eigene Export-/Import-Funktion bzw. ein optionales Cloud-Backup gibt es nicht. Falls gewünscht (Post-MVP): nur über den Elternbereich, ausdrückliche Einwilligung, Konzept vor Implementierung.

## Eltern-Schranke (umgesetzt Phase 7)

Drei verschiedene Zahlen von 1 bis 9 werden **als Wörter** gezeigt („sieben · zwei · fünf“) und auf einem großen Ziffernfeld eingetippt. Leseanfänger können die Wörter nicht lesen; es gibt keine Farb-, Bild- oder Positionshinweise. Eine falsche Ziffer erzeugt sofort eine neue Aufgabe (keine Sperre, kein Zähler). Der Bereich bleibt nur geöffnet, solange er angezeigt wird – jedes neue Öffnen fragt erneut. Logik: `features/parents/gate.ts` (getestet). **Die Schranke ersetzt keine rechtlich erforderliche Einwilligung.**

## SDK-Liste (Stand Phase 7, `apps/mobile/package.json` – Phasen 4–7 ohne neue App-Abhängigkeiten)

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
