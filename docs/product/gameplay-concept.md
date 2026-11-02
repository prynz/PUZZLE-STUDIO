# Spieltisch-Konzept: Ablage, Sortieren, Tipps, Einrasten

Status: **Konzept freigegeben**; Engine-Modell in Phase 4 umgesetzt (`packages/puzzle-engine`), Gameplay-UI folgt in Phase 5.
Mockups (**Konzept-Mockups**, keine App): [Spieltisch Kind/Profi](../design/concept/concept-mockup-gameplay-tray.png) · [Häppchen-Modus Kleinkind](../design/concept/concept-mockup-gameplay-toddler.png)

## Ausgangslage (PO-Feedback)

1. Im 256-Teile-Test liegen alle Teile kreuz und quer und überlappend – störend und irritierend. Gewünscht: bessere Lösung für große Puzzles, Sortiermöglichkeiten, Hervorhebung einzelner Teile, grafisch ansprechende Behälter.
2. Ein korrekt gelegtes Teil soll fest einrasten und danach nicht mehr bewegt werden können.

Hinweis: Der 256-Teile-Test ist ein **Leistungstest** (bewusst „Worst Case“: alle Teile gleichzeitig sichtbar). Er ist nicht das spätere Spielerlebnis. Das Feedback betrifft aber genau das, was das echte Gameplay lösen muss – daher dieses Konzept.

## Leitidee

**Nichts liegt wild herum.** Das Brett ist ruhig und zeigt nur, was schon geschafft ist. Lose Teile wohnen in einer **Ablage** mit festen Plätzen und lassen sich in **Schalen** sortieren. Pino hilft auf Wunsch. Was richtig liegt, rastet ein und bleibt.

## 1. Spieltisch-Aufbau

| Bereich             | Inhalt                                                                                                                                                                         |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Brett** (oben)    | Rahmen mit sehr blasser Vorlage (Hilfe-Stufe abhängig) und gestrichelten Zielplätzen. Eingerastete Teile in voller Farbe, nahtlos. Zoom (Pinch, Doppeltipp, −/+) ab 64 Teilen. |
| **Schalen** (Mitte) | Illustrierte Sortier-Behälter mit Zähler – horizontal scrollbar.                                                                                                               |
| **Ablage** (unten)  | Raster mit festen Plätzen (min. 56 dp), **keine Überlappung**, horizontal blätterbar. Zeigt die Teile der gewählten Schale in Brett-Größe (bzw. größer bei Zoom-out).          |
| **Pino-Tipp**       | Runder Tipp-Knopf an der Ablage.                                                                                                                                               |

## 2. Spielhilfe-Profile – unabhängig von der Teilezahl (PO-Vorgabe)

Wie viel Sortieren, Lesen und Benennen ein Kind bewältigt, hängt vom **Kind** ab, nicht von der Puzzle-Größe. Ein Dreijähriger soll auch ein 100- oder 256-Teile-Puzzle machen können – ohne selbst sortieren oder benennen zu müssen. Deshalb gibt es drei **Spielhilfe-Profile**, die die gesamte Bedienlogik steuern; die Teilezahl bestimmt nur noch, _wie viel_ Bild es gibt.

|                       | **Kleinkind** (ca. 3–5)                                    | **Kind** (ca. 5–9)                                 | **Profi** (ca. 9+, Eltern)                                       |
| --------------------- | ---------------------------------------------------------- | -------------------------------------------------- | ---------------------------------------------------------------- |
| Große Puzzles         | **Häppchen-Modus** (s. u.)                                 | Ablage + Schalen                                   | Ablage + Schalen + Zoom                                          |
| Schalen               | keine sichtbaren Schalen – die App sortiert unsichtbar     | automatische Schalen mit Namensvorschlag           | automatisch + umbenennen + umsortieren + bis zu 3 eigene Schalen |
| Text                  | **keiner** nötig (Bilder, Farben, Pino, Töne)              | kurze Wörter                                       | normal                                                           |
| Falsch gelegt         | immer sanft zurück in die Ablage                           | Standard „liegen lassen + ausweichen“, umschaltbar | Standard „liegen lassen + ausweichen“, umschaltbar               |
| Einrast-Toleranz      | sehr groß                                                  | groß                                               | normal                                                           |
| Tipps                 | Pino bietet von selbst an (nach ~20 s) + großer Pino-Knopf | Tipp-Knopf, Angebot nach ~45 s                     | nur auf Knopfdruck                                               |
| Ablage-Teile          | wenige (3–4), sehr groß (≥ 96 dp)                          | 2 Reihen                                           | 2 Reihen, blätterbar                                             |
| Langdruck/Umsortieren | deaktiviert (verhindert Fehlbedienung)                     | einfach                                            | voll                                                             |

- **Wer wählt das Profil?** Im Onboarding („Wer puzzelt?“ – drei Bildkarten mit Pino klein/mittel/groß, keine Altersangabe nötig) und jederzeit im Elternbereich. Eltern können es pro Puzzle überschreiben.
- Profil und Teilezahl sind frei kombinierbar: Kleinkind + 256 Teile ist erlaubt und spielbar.

### Häppchen-Modus (Kleinkind-Profil, ab 25 Teilen)

1. Die App teilt das Bild in **Häppchen** – kleine zusammenhängende Bildbereiche mit je 4–9 Teilen (aus Geometrie + Farbgruppen, z. B. „das Segelboot“, „die Sonne“). Reihenfolge: erst Rahmen-Häppchen, dann zum Inneren hin.
2. Das Brett **zoomt automatisch** auf das aktive Häppchen; eine Mini-Karte oben rechts zeigt, wo man im Gesamtbild ist.
3. Die Ablage zeigt **nur 3–4 große Teile** dieses Häppchens – nie mehr. Keine Schalen, nichts zu sortieren.
4. Ist das Häppchen fertig: kleine Feier (Sterne, Pino jubelt), sanfter Kamera-Schwenk zum nächsten Häppchen.
5. Fortschritt ohne Zahlen: Punkte-Leiste (fertig = Mint, aktiv = Gelb, offen = Lavendel).
6. Am Ende zoomt das Brett heraus und zeigt das ganze Bild – großer Abschluss-Moment.

Technisch: `planChunks(puzzle)` in der Engine (deterministisch, testbar); die Ablage fragt nur Teile des aktiven Häppchens ab → auch 256 Teile bleiben für Kleinkinder überschaubar und für das Gerät leicht zu zeichnen.

## 3. Je nach Puzzle-Größe (Profil Kind/Profi)

| Teile   | Ablage                                                         | Schalen                                     | Brett                          |
| ------- | -------------------------------------------------------------- | ------------------------------------------- | ------------------------------ |
| 4–16    | keine – Teile liegen **ohne Überlappung** im Rand um das Brett | keine                                       | ganzes Bild, große Teile       |
| 25–49   | Ablage mit 1 Reihe                                             | „Alle“, „Ränder“                            | ganzes Bild                    |
| 64–100  | Ablage mit 2 Reihen                                            | „Alle“, „Ränder“, „Ecken“, 3–5 Farbschalen  | Zoom optional                  |
| 144–256 | Ablage mit 2 Reihen, blätterbar                                | wie oben + „Meine Schale“ (selbst befüllen) | Zoom empfohlen, Mini-Übersicht |

## 4. Sortieren (Schalen – Profil Kind/Profi)

- **Alle** – alle losen Teile.
- **Ränder / Ecken** – aus der Geometrie (Teil hat gerade Kante / zwei gerade Kanten). Kinder lernen „erst den Rahmen“.
- **Farbschalen** – automatisch: Durchschnittsfarbe jedes Teils aus der Arbeitsversion des Bildes, gruppiert in 3–5 Farbgruppen (deterministisches Clustering). Schalen tragen **Farbe + Symbol + Text** (farbenblind-tauglich).
- **Benennung (PO-Entscheidung):** Bei eindeutigen Motiven schlägt die App sprechende Namen vor („Himmel“, „Wiese“), sonst Farbnamen („Blau“, „Grün“). Jede Schale kann **umbenannt** werden (Stift-Symbol, kurze Eingabe, Vorlesen-freundlich).
- **Eigene Reihenfolge (PO-Entscheidung):** Schalen lassen sich per Langdruck + Ziehen **umsortieren**, damit jedes Kind sein eigenes Sortier-Erlebnis gestaltet. Namen und Reihenfolge werden pro Puzzle im Spielstand gespeichert.
- **Meine Schale** (PO-Entscheidung: MVP, ab 144 Teilen, nur Profil Kind/Profi, bis zu 3 eigene Schalen) – das Kind zieht Teile selbst hinein und kann die Schale benennen.
- Ablage-Reihenfolge innerhalb einer Schale: gemischt (Spielspaß), optional „nach Farbe sortiert“ (Hilfe-Stufe).

## 5. Hervorheben & Tipps

- **Tipp** (Pino): hebt **ein** passendes Teil in der Ablage hervor (gelber Glow) **und** seinen Zielplatz auf dem Brett (pulsierender Umriss); bevorzugt Teile, die an bereits gelegte angrenzen. Pino sagt kurz, wo es hingehört.
- **Tippen auf ein Teil** in der Ablage: Teil wird groß angezeigt; in den leichten Hilfe-Stufen schimmert zusätzlich die Zielregion.
- **Nach längerer Pause** (z. B. 45 s ohne Fortschritt) bietet Pino freundlich einen Tipp an – ohne Druck, abschaltbar.
- Kein Zeitlimit, keine Strafpunkte für Tipps.

## 6. Einrasten (PO-Vorgabe)

- Wird ein Teil **nahe genug an seinem Zielplatz** losgelassen (Toleranz je Stufe, z. B. 35 % der Teilbreite „leicht“, 18 % „klassisch“), gleitet es mit einer Feder-Animation exakt hinein: kurzer Glanz/Stern, leiser Klick-Ton, leichte Haptik.
- Danach ist es **fest (locked)**: nicht mehr greifbar, aus dem Hit-Test entfernt, wird in die ruhige Brett-Ebene „eingebacken“ (das spart zugleich Rechenleistung – siehe unten).
- **Falscher Platz (PO-Entscheidung):** Einstellung „Falsch gelegte Teile“ mit zwei Varianten:
  - **„Liegen lassen“ (Standard):** Das Teil bleibt lose auf dem Brett, gleitet aber sanft zum **nächsten freien Platz in der Nähe** – es überlappt weder eingerastete noch andere lose Teile. Die Suche nach dem freien Platz ist Engine-Logik (`findFreeSpot`, deterministisch, getestet).
  - **„Zurück in die Schale“:** Das Teil schwebt automatisch in seine Schale zurück (kein „Fehler“-Signal).
  - Voreinstellung je Schwierigkeit (leichte Stufen: „Zurück in die Schale“), änderbar vor dem Spiel und im Elternbereich.
- Eingerastete Teile können nur über „Puzzle neu starten“ (mit Rückfrage) gelöst werden.
- Später (Post-MVP, „Profi“): lose Teile, die untereinander passen, verbinden sich zu Gruppen.

## 7. Auswirkungen auf Architektur & Engine

| Bereich                          | Änderung                                                                                                                                                                                                                                                             |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `puzzle-engine` (Phase 4)        | Teil-Zustände `tray` · `loose` · `locked`; `classifyEdges()` (Ecke/Rand/Innen); `trySnap()` → `locked`; Hit-Test ignoriert `locked`; Tipp-Auswahl `suggestPiece()`.                                                                                                  |
| `image-processing` (Phase 3)     | `pieceColorGroups()` – Durchschnittsfarbe pro Teil, deterministisches Clustering, Gruppenfarbe/-name.                                                                                                                                                                |
| Serialisierung                   | `PuzzleStateV1` erweitert: `state`, `basket` (für „Meine Schale“), `trayOrder`. Siehe [serialization.md](../puzzle-engine/serialization.md).                                                                                                                         |
| Rendering (Phase 5)              | Ebene 1: Brett + **alle eingerasteten Teile als eine Picture** (wird nur beim Einrasten neu aufgezeichnet). Ebene 2: Ablage (virtualisiert, nur sichtbare Plätze). Ebene 3: gezogenes Teil live. → Bei 256 Teilen werden nie 256 lose Teile gleichzeitig gezeichnet. |
| Designsystem (Phase 2)           | Neue Komponenten: `PieceTray`, `SortBasket`, `HintButton`, `ZoomControls`; Schalen-Illustrationen im Pino-Stil.                                                                                                                                                      |
| Einstellungen / Eltern (Phase 7) | Hilfe-Stufe (Vorlage-Deckkraft, Tipps, Zurückschweben, Einrast-Toleranz) je Schwierigkeit voreingestellt, von Eltern änderbar.                                                                                                                                       |

## 8. Anpassung 256-Teile-Test

Der Leistungstest wird in Phase 5 auf genau diese Struktur umgestellt (Brett mit eingerasteten Teilen + Ablage + gezogenes Teil), damit wir die **echte** Spielsituation messen. Die aktuelle „alles auf einmal“-Variante bleibt als Extremtest erhalten.

## Entscheidungen

| #   | Frage                   | Entscheidung                                                                                                                                                                                                                                 |
| --- | ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Falsch gelegtes Teil    | PO: Standard „liegen lassen + zum freien Platz in der Nähe gleiten“; Option „zurück in die Schale“                                                                                                                                           |
| 2   | Namen der Schalen       | PO: Vorschlag (sprechend bei eindeutigen Motiven, sonst Farbname); umbenennbar; Reihenfolge frei sortierbar                                                                                                                                  |
| 3   | „Meine Schale“ im MVP   | PO: ja – ab 144 Teilen, nur Profil Kind/Profi, bis zu 3 eigene Schalen                                                                                                                                                                       |
| 4   | Falsch gelegt je Profil | Umsetzung Phase 4: PO-Standard „liegen lassen + ausweichen“ für Kind und Profi; Kleinkind immer „zurück in die Ablage“ (einfachste Logik, PO-Vorgabe für kleine Kinder). Die ältere Tabellenzeile „Kind: Standard zurück“ wurde angeglichen. |
