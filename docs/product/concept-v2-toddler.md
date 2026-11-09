# Konzept 2 – Pino für die Kleinsten (Entwurf)

Status: **Entwurf – wartet auf Entscheidungen des PO** (2026-11-09). Ersetzt nach Freigabe Teile von [product-concept.md](product-concept.md) und [gameplay-concept.md](gameplay-concept.md); bis dahin gelten diese weiter.

Anlass (PO): Aufmachung und Design gefallen, aber es fehlt eine **logische Abfolge**, die daraus eine beliebte Kinder-App macht. Nur noch **kleine Kinder mit kleinen Puzzles**, Puzzleteile mit **dynamischer Bewegung beim Ziehen**, dazu **Minispiele rund ums Puzzeln** mit Abwechslung und Lerneffekt. Pino und Farbkonzept bleiben.

## 1. Kern in einem Satz

**Pino reist durch kleine Welten – das Kind hilft ihm, indem es Bilder zusammenpuzzelt und kleine Puzzle-Spiele löst; jedes geschaffte Bild wird lebendig und kommt als Sticker ins Album.**

## 2. Zielgruppe

| Bisher                                                            | Neu                                                                                                             |
| ----------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| 2–10+ Jahre, 4–256 Teile, drei Profile (Kleinkind / Kind / Profi) | **ca. 2–5 Jahre**, **2–12 Teile**, ein durchgehendes Spielgefühl – die Schwierigkeit wächst mit dem Fortschritt |

- Kinder dieses Alters lesen nicht → **alles ohne Text bedienbar**: Bilder, Pino, Töne, Gesten. Text nur für Eltern.
- Kurze Spielrunden (2–4 Minuten), viele kleine Erfolgserlebnisse, nie Druck, nie „falsch“.

## 3. Die logische Abfolge

```text
App-Start (Preloader)
  → Start: Pino begrüßt, die nächste Station leuchtet
    → großer Spielen-Knopf = immer „das Nächste“ auf Pinos Reise
      → Station spielen (Puzzle ODER Minispiel, ca. 2 Min.)
        → Feier: Bild wird lebendig, Pino jubelt, Sticker fliegt ins Album
          → zurück zur Karte: Pino hüpft eine Station weiter
```

**Pinos Reise** (die schon gebaute Pfad-Idee, jetzt als Herzstück):

- **Welten** mit eigenem Thema und Hintergrund: z. B. _Wiese_ (Tiere vom Bauernhof), _Meer_ (Boot, Fisch, Wal), _Wald_, _Nacht & Sterne_, _Stadt & Fahrzeuge_.
- Jede Welt hat **6–8 Stationen** im festen Wechsel, z. B. Puzzle → Puzzle → Minispiel → Puzzle → Minispiel → **Abschluss-Puzzle** (großes Weltbild).
- Die **Teilezahl wächst langsam** über die Reise: Welt 1 mit 2–4 Teilen, Welt 2 mit 4–6, Welt 3 mit 6–9, ab Welt 4 bis 12. Kein Kind muss einstellen; Eltern können „höchstens n Teile“ festlegen.
- **Nichts wird gesperrt, was schon geschafft ist** – alle erreichten Stationen bleiben nochmal spielbar.
- Eine Welt ist ein abgeschlossenes Kapitel mit Abschluss-Moment (Pino bekommt ein Andenken, z. B. Muschel aus der Meer-Welt).

**Eigene Fotos** bleiben als freier Bereich **„Mein Atelier“** (Elternhilfe: Foto wählen/zuschneiden) – mit derselben kleinen Teilezahl (2–12).

## 4. Das Puzzle-Gefühl (Hauptspiel)

Bildaufbau für kleine Hände:

- **Brett mit Umriss-Plätzen:** Das Bild ist als blasser Schatten zu sehen, jeder Platz hat einen sichtbaren Umriss. Wenige, **sehr große Teile** (bei 4 Teilen etwa ein Viertel des Bretts).
- **Teile liegen verstreut um das Brett** (nicht in einer Ablage-Leiste) – leicht schräg, nie überlappend, gut greifbar.
- Teilformen: bei 2–4 Teilen **weiche, große Formen** (Halbe, Viertel, Wellen), ab 6 Teilen klassische, aber dicke Puzzle-Nasen.

**Dynamische Bewegung beim Ziehen** (gewünscht):

| Moment         | Bewegung                                                                                                                 |
| -------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Anfassen       | Teil hebt sich an (wird ~10 % größer, Schatten wird weich und tiefer), kurzer „Plopp“-Ton, leichte Haptik                |
| Ziehen         | Teil **neigt sich in Zugrichtung** (Kippen nach Tempo), federt leicht nach („wackelt wie Gummi“), folgt dem Finger sanft |
| In der Nähe    | Zielplatz leuchtet auf, Teil wird **magnetisch angezogen** (große Toleranz)                                              |
| Einrasten      | Teil gleitet mit Federung hinein, drückt sich kurz „platt“ und springt zurück, Glitzer + Klick + Haptik                  |
| Falscher Platz | Teil schwebt freundlich zurück an seinen Platz, kurzes Kopfschütteln von Pino – kein Fehlerton                           |
| Fertig         | Bild wird **lebendig** (das Boot schaukelt, die Kuh muht), Pino jubelt, Sticker fliegt ins Album                         |

Hilfe ohne Text: Nach einer Weile ohne Fortschritt **zeigt Pino mit einer Hand-Animation**, welches Teil wohin gehört (wie bisher der Tipp, aber automatisch und sanft).

## 5. Minispiele rund ums Puzzeln

Alle Minispiele nutzen **dieselbe Zieh-Mechanik** wie das Puzzle (ein Lerneffekt für die Hand, eine Technik im Code). Jede Runde 3–5 Aufgaben, dann Feier.

| #   | Minispiel             | So geht’s                                                                   | Lerneffekt                      | Vorschlag    |
| --- | --------------------- | --------------------------------------------------------------------------- | ------------------------------- | ------------ |
| 1   | **Formen-Steckspiel** | Kreis, Dreieck, Stern … in die passenden Löcher ziehen                      | Formen erkennen, Feinmotorik    | erste Runde  |
| 2   | **Schatten finden**   | Tier/Gegenstand auf seinen Schatten ziehen                                  | visuelle Wahrnehmung            | erste Runde  |
| 3   | **Farben sortieren**  | Puzzleteile in den Korb mit derselben Farbe legen                           | Farben benennen und zuordnen    | erste Runde  |
| 4   | **Halbe Sachen**      | Zwei Hälften zusammenschieben (Apfel, Auto, Katze) – das Ding wird lebendig | Teil–Ganzes, Wortschatz (Ton)   | zweite Runde |
| 5   | **Zählen mit Pino**   | So viele Teile in Pinos Kiste legen, wie Punkte/Finger gezeigt werden (1–5) | Mengen 1–5                      | zweite Runde |
| 6   | **Groß und klein**    | Drei Teile nach Größe in eine Reihe legen                                   | Größen vergleichen, Reihenfolge | zweite Runde |
| 7   | **Puzzle-Memory**     | Zwei gleiche Puzzleteile aufdecken (4–8 Karten)                             | Merkfähigkeit                   | später       |
| 8   | **Was fehlt?**        | Ein Teil fehlt im Bild – aus zwei/drei Teilen das richtige wählen           | Detailwahrnehmung               | später       |

## 6. Was bleibt, was ändert sich, was entfällt

| Bleibt                                                                                                                        | Ändert sich                                                                                                                                                                                                                                                             | Entfällt (Code wird entfernt, nicht nur versteckt)                                                                                               |
| ----------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Pino, Farben, Schrift, Tab-Leiste, Startbildschirm-Stil, Preloader, Elternbereich, Datenschutz, Offline, eigene Puzzle-Engine | Startseite: Reise wird Hauptweg, Karten zeigen „Weiterspielen“, „Mein Atelier“, „Album“ · Erfolge → **Sticker-Album** (Sticker pro Bild/Welt) · Onboarding ohne Profilwahl (stattdessen Eltern-Hinweis) · Teile: 2–12 · Eltern: „höchstens n Teile“, Töne/Stimme an/aus | Puzzles über 12 Teile, Schalen/Sortieren, Häppchen-Modus, Zoom, Profile Kind/Profi, 256-Teile-Test im Elternbereich (bleibt als Entwickler-Test) |

## 7. Ton und Stimme

Ohne Lesen braucht es **Pinos Stimme** für Aufgaben („Wo gehört das Boot hin?“, „Welche Form passt?“) und Lob. Möglichkeiten:

1. **Aufgenommene Stimme** (am kindgerechtesten, braucht Sprecher/in und Aufnahmen, ca. 60–100 kurze Sätze).
2. **Sprachausgabe des Geräts** (offline, keine Daten verlassen das Gerät; klingt aber technischer).
3. **Nur Töne und Bilder** (am einfachsten; Aufgaben müssen dann rein visuell verständlich sein).

Empfehlung: zuerst **3** (alles visuell verständlich bauen), Stimme später als Schicht darüber – bevorzugt **1**.

## 8. Inhalte (Bilder)

Pro Welt ca. 8–10 Bilder im Pino-Stil (gleiches Format, klare Motive, 1 Hauptfigur), dazu Formen/Gegenstände für die Minispiele. Bis die Bilder vom PO kommen, baue ich mit **einfachen eigenen Platzhalter-Illustrationen** (klar als Platzhalter gekennzeichnet) die Mechanik.

## 9. Umsetzung in Schritten (Vorschlag)

| Schritt | Inhalt                                                                                                          | Ergebnis zum Anschauen               |
| ------- | --------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| K1      | **Neues Puzzle-Brett** für 2–12 Teile mit dynamischem Ziehen (Anheben, Neigen, Magnet, Federn, lebendiges Ende) | Probespiel im Browser + Geräte-Fotos |
| K2      | **Reise als Herzstück**: Welten + Stationen, „Spielen“ = nächste Station, Sticker-Album                         | Durchspielbare erste Welt            |
| K3      | **Minispiele 1–3** (Formen, Schatten, Farben) in die Reise eingebaut                                            | Abwechslung in Welt 1                |
| K4      | Aufräumen: große Puzzles, Schalen, Häppchen, Profile entfernen; Eltern „höchstens n Teile“                      | schlanke App, Doku aktualisiert      |
| K5      | Töne/Haptik, danach Stimme                                                                                      | Spielgefühl komplett                 |
| K6      | Minispiele 4–6, weitere Welten (mit Bildern des PO)                                                             | mehr Inhalt                          |

## 10. Offene Entscheidungen

1. Altersgruppe 2–5 Jahre und **höchstens 12 Teile** – passt das?
2. Reise mit **festen Welten und Stationen** als Hauptweg (statt freier Auswahl) – einverstanden?
3. Welche **Minispiele zuerst** (Vorschlag: Formen, Schatten, Farben)?
4. Stimme: erst nur Töne/Bilder, Stimme später – oder gleich mitplanen?
5. Bleiben **eigene Fotos** („Mein Atelier“) erhalten?
6. Das Pinterest-Beispiel war von hier aus nicht erreichbar – bitte als Bildschirmfoto oder kurzes Video schicken, damit die Zieh-Bewegung genau getroffen wird.
