# Produktkonzept

**PUZZLE STUDIO** – Kinder machen aus eigenen Fotos und Bildern Puzzles, spielen sie, sammeln sie und entdecken sie wieder.
Leitidee: **CREATE · PLAY · COLLECT · DISCOVER**

## Zielgruppen

| Alter | Schwierigkeit | Empfohlene Teile | Standard-Form |
|---|---|---|---|
| 2–4 | Sehr einfach | 4–9 | Quadrate, großes Einrasten |
| 4–7 | Einfach–mittel | 9–36 | Klassisch |
| 6–10 | Mittel–anspruchsvoll | 36–100 | Klassisch |
| Ältere / Profis | Anspruchsvoll | 100–256 | Klassisch |

Empfehlungen, keine Sperren. Eltern legen im Elternbereich eine Standard-Schwierigkeit fest; Kinder können im Creator jederzeit wechseln.

Sekundäre Zielgruppe: **Eltern** – entscheiden über Installation; überzeugt durch Ruhe, Qualität, keine Werbung, keine Datensammlung.

## Kernflows

1. **Onboarding** (3 Screens, überspringbar): Willkommen → Versprechen → „Wie möchtest du puzzeln?“ (Schwierigkeitskarten).
2. **Erstellen:** Bildquelle (Kamera · Galerie · Beispielbilder) → Zuschnitt (Zoom, Verschieben, 90°-Drehen, Format) → Teile & Form → Vorschau → Erstellen.
3. **Spielen:** Drag & Drop, Einrasten mit Feedback, Vorlage ein/aus, Fortschritt, Pause, automatisches Speichern, Abschlussfeier.
4. **Sammeln:** Galerie aller Puzzles mit Status, Fortschritt, Datum; sortieren, filtern, erneut spielen, löschen.
5. **Entdecken:** mitgelieferte Beispielpuzzles (eigene Illustrationen, offline).
6. **Erfolge:** wenige, freundliche Meilensteine mit Sternen, Rahmen, Stickern, Hintergründen.
7. **Elternbereich:** hinter Eltern-Schranke.

## Informationsarchitektur

```text
Onboarding (einmalig)
Tabs: Start · Erstellen · Sammlung · Erfolge
  Start → Weiter spielen · Puzzle erstellen · Sammlung-Vorschau · Entdecken
  Erstellen → Quelle → Zuschnitt → Teile/Form → Vorschau → Puzzeln
  Sammlung → Puzzle-Detail (Spielen / Neu mischen / Löschen)
  Erfolge → Belohnungen anwenden (Rahmen, Hintergründe)
Elternbereich (Schloss-Symbol auf Start, Eltern-Schranke)
Puzzeln (Vollbild, ohne Tab-Leiste)
```

## Tonalität

Du-Form, kurze Sätze, positiv, nie drängend. Keine Zeitlimits, keine Countdowns, keine Verlust-Mechaniken, keine Streak-Bestrafung, keine Lootboxen, keine Käufe im Kinderbereich.

## Sprache

MVP: Deutsch. Texte von Anfang an über ein i18n-Modul (Schlüssel statt Literale), Englisch als zweite Sprache vorbereitet.
