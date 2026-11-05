# App-Start (Preloader)

Status: **umgesetzt (2026-11-05, Wunsch des PO)** – `apps/mobile/features/startup/StartupGate.tsx`, Zeitlogik `startupProgress.ts`, Vorlade-Aufgaben `services/preload.ts`, Darstellung `<LoadingScreen>` in `packages/ui`.

## Ablauf

1. **Natives Startbild** (Pino auf Grau-Grün), bis die Schrift geladen ist – nur Sekundenbruchteile.
2. **Startscreen** „Wird geladen … – Deine Puzzles bereiten sich vor.“: Pino mit Puzzleteil im Arm schwebt sanft auf und ab (ohne Ring), Puzzleteile ziehen langsam durch den Hintergrund, Balken mit Prozentzahl.
3. Im Hintergrund wird **alles vorgeladen**: Einstellungen, Bilder, Puzzles, Sterne/Erfolge (Datenbank), Pino-Bilder, Grafik-Engine für den Spieltisch (Web: CanvasKit).
4. Der Startscreen bleibt **mindestens 4,5 Sekunden** (`STARTUP_MIN_MS`) – damit die Animationen ruhig wirken und nichts nur kurz aufblitzt – und **länger, falls das Laden länger dauert**.
5. Danach erscheint der erste Screen (Begrüßung bzw. Start), der Startscreen **blendet weich darüber aus**.

## Prozentzahl

Die Zahl zeigt **nie mehr, als wirklich fertig ist** (Anteil erledigter Aufgaben). Damit sie bei schnellem Laden nicht sofort auf 100 % springt, füllt sie sich gleichmäßig über die Mindestdauer: angezeigt wird `min(echter Anteil, verstrichene Zeit / 4,5 s)`.

## Fehler und Barrierefreiheit

- Schlägt eine Vorlade-Aufgabe fehl (z. B. ein Bild), startet die App trotzdem; der betroffene Screen lädt es dann selbst. Ins Log kommt nur der Aufgabenname, nie ein Pfad.
- Datenbank-Fehler behandeln die Stores wie bisher (freundliche Meldung im jeweiligen Screen).
- Screenreader: „beschäftigt“, Titel + Satz werden angesagt, Fortschritt als Wert 0–100.
- „Bewegung reduzieren“: alles steht still, kein Ausblenden – die Mindestdauer bleibt.

## Zwischen den Abläufen

Beim Öffnen eines Puzzles und beim Speichern eines Bilds erscheint **nicht** der Startscreen, sondern die ruhige kleine Anzeige `<LoadingState>` (Pino + kurzer Satz).
