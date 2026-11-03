# Elternbereich

Status: **umgesetzt (Phase 7)** – `apps/mobile/features/parents`, Einstellungen in `apps/mobile/store/settings.tsx` (`ParentOptions`), Wirkung im Spiel über `features/puzzle/game/useGame.ts` und `features/puzzle/useHintOffer.ts`.

## 1. Zugang: Eltern-Schranke

- Das Schloss oben rechts auf der Startseite öffnet zuerst die **Eltern-Schranke** („Nur für Erwachsene“).
- Aufgabe: drei verschiedene Zahlen (1–9) als **Wörter**, z. B. „sieben · zwei · fünf“, nacheinander auf dem Ziffernfeld tippen. Drei kleine Punkte zeigen den Fortschritt.
- Falsche Ziffer → Pino sagt freundlich „Nicht ganz – hier ist eine neue Aufgabe.“, eine neue Aufgabe erscheint. Keine Sperre, kein Zähler, kein Alarm.
- Nach dem Öffnen bleibt der Bereich nur offen, solange er angezeigt wird. Wer ihn verlässt und wieder öffnet, wird erneut gefragt (nichts bleibt „im Hintergrund“ entsperrt).
- Begründung: Apple Kids Category (Guideline 1.3) und Google Play Families verlangen eine Schranke vor Einstellungen/Links für Erwachsene; Zahlwörter können Kinder im Zielalter (3–9) nicht zuverlässig lesen, Erwachsene lösen sie in Sekunden. Details: [privacy.md](../security/privacy.md#eltern-schranke-umgesetzt-phase-7).

## 2. Drei Bereiche statt einer langen Seite

| Reiter    | Inhalt                                                                                                                                                                                                                |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Spiel** | Spielhilfe-Profil (Kleine Puzzler / Puzzle-Kids / Puzzle-Profis) · „Falsch gelegte Teile“ · Hilfen: Vorlage anzeigen, Pino bietet Tipps an, Bewegung reduzieren                                                       |
| **Daten** | Auf diesem Gerät: Anzahl Bilder, Puzzles, davon fertig, Speicher für Bilder · Aufräumen: Wege ins Atelier (Bilder löschen) und in die Sammlung (Puzzles löschen) · **Alles löschen** (nur nach Rückfrage)             |
| **Info**  | Datenschutz in einfachen Worten · Sicherung (Bilder und Spielstände sind auf iOS und Android von der automatischen Geräte-Sicherung ausgeschlossen) · Werkzeuge: Systemcheck, 256-Teile-Test, Begrüßung erneut zeigen |

## 3. Einstellungen und ihre Wirkung

| Einstellung          | Werte (Standard fett)                                        | Wirkung                                                                                                                                                                          |
| -------------------- | ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Spielhilfe-Profil    | Kleinkind · **Kind** · Profi                                 | wie bisher (gameplay-concept.md §2) – gilt für neue Puzzles                                                                                                                      |
| Falsch gelegte Teile | **Wie im Profil** · Rutscht zur Seite · Zurück in die Leiste | überschreibt den Profil-Standard für **neue** Puzzles. Im Profil „Kleinkind“ nicht wählbar: dort gleiten Teile immer zurück (Frust vermeiden, Engine-Regel `misplaceChangeable`) |
| Vorlage anzeigen     | **an** · aus                                                 | ob das blasse Vorlagenbild beim Start eines **neuen** Puzzles sichtbar ist (im Spiel weiter per Auge-Knopf umschaltbar)                                                          |
| Pino bietet Tipps an | **an** · aus                                                 | nach einer Weile ohne neues Teil fragt Pino „Soll ich dir ein Teil zeigen?“ (Ja, bitte / Nein, danke). Kleinkind 20 s, Kind 45 s, Profi nie (Engine `hintOfferAfterSec`)         |
| Bewegung reduzieren  | **aus** · an                                                 | schaltet Animationen in der ganzen App ab – zusätzlich zur Systemeinstellung („Bewegung reduzieren“ in iOS/Android)                                                              |

„Falsch gelegte Teile“ und „Vorlage“ gehören zum gespeicherten Spielstand; ein angefangenes Puzzle behält deshalb seine Einstellung (steht so auch im Elternbereich).

Gespeichert wird alles lokal unter dem Schlüssel `parent.options` (JSON); unbekannte oder kaputte Werte fallen auf die Standards zurück (`parseSettings`, getestet).

## 4. Tipp-Angebot (Pino fragt von selbst)

- Nur ein **Angebot**: Pino zeigt nichts von allein, das Kind entscheidet.
- Der Zähler startet neu, sobald ein Teil einrastet; er pausiert, solange ein Tipp sichtbar ist, Pino jubelt, ein Dialog offen ist oder das Puzzle fertig ist.
- „Nein, danke“ → Pino fragt erst nach dem nächsten eingerasteten Teil wieder.

## 5. Alle lokalen Daten löschen

Reihenfolge: Puzzles → Bilder (Datenbank + Bildordner) → Sterne/Meilensteine → Einstellungen. Danach öffnet die App die Begrüßung. Schlägt ein Schritt fehl, bleibt der Elternbereich offen und zeigt „Das Löschen hat nicht geklappt. Bitte noch einmal versuchen.“ – erneutes Löschen ist gefahrlos.

## 6. Bewusst nicht enthalten

- Kein Konto, kein Login, keine Cloud-Sicherung, kein Export (siehe [privacy.md](../security/privacy.md#backup-verhalten-entscheidung-phase-7)).
- Keine Spielzeit-Begrenzung und keine Statistiken über das Kind (nicht Teil des MVP; auf Wunsch des PO später).
- Töne/Vibration: kommen erst mit den Tönen (offener Punkt seit Phase 5).
