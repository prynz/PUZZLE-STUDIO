# PUZZLE STUDIO – Project Brief

## Vision

Eine liebevoll gestaltete, hochwertige Puzzle-App für Kinder und Familien. Kinder machen aus eigenen Fotos, Zeichnungen oder Beispielbildern Puzzles, spielen, sammeln und entdecken sie wieder.

**CREATE · PLAY · COLLECT · DISCOVER** – fördert Kreativität, Konzentration, visuelle Wahrnehmung und Problemlösen. Ohne Druck, ohne Werbung, ohne Datensammlung.

## Zielgruppe

Kinder 2–10+ (Empfehlungen: 2–4 J. 4–9 Teile · 4–7 J. 9–36 · 6–10 J. 36–100 · Fortgeschrittene 100–256) und ihre Eltern. Schwierigkeit und Teilezahl sind frei einstellbar. Details: [docs/product/product-concept.md](docs/product/product-concept.md).

## Features & MVP

MVP: Onboarding, Home, Fotoauswahl, Kamera, Zuschnitt, Puzzle-Konfiguration (4–256 Teile, Reihen × Spalten, Form), klassisches Puzzle, Drag & Drop, Einrasten, Vorlage, Speichern/Fortsetzen, Sammlung, Abschlussanimation, Basis-Achievements, Einstellungen, Elternbereich, offline, lokale Speicherung.
→ [docs/product/mvp.md](docs/product/mvp.md)

Nicht im MVP: Multiplayer, Chat, Community, Sharing, Zeicheneditor, Puzzle Room, Pflicht-Cloud, physische Produkte, Werbung.

## Roadmap

Phase 0 Analyse & Konzept ✅ → 1 Foundation → 2 Design & Navigation → 3 Image Workflow → 4 Puzzle Engine → 5 Gameplay → 6 Sammlung & Progression → 7 Elternbereich → 8 QA → 9 Release.
→ [docs/product/roadmap.md](docs/product/roadmap.md)

## Designrichtung

Verbindliche Referenz: [docs/design/reference/visual-style-reference.png](docs/design/reference/visual-style-reference.png)
Soft Pastel Cartoon · Whimsical Illustration · Premium Kids App · Gentle Playful UI. Warm Cream als Basis, Lavendel/Lila als Marke, Gelb für positive Aktionen, Mint/Sky als Ergänzung, Nunito, große Rundungen, weiche Schatten, eigenes Maskottchen **Pino** (gelbes Puzzleteil).
→ [Referenzanalyse](docs/design/reference-analysis.md) · [Design System](docs/design/design-system.md) · [Komponenten](docs/design/component-library.md) · [Maskottchen](docs/design/mascot-guidelines.md) · [Konzept-Mockups](docs/design/concept/)

## Technische Anforderungen

Expo SDK 58 / React Native · TypeScript strict · Expo Router · React Native Skia · Gesture Handler · Reanimated · expo-sqlite · Expo Image Picker/Manipulator/File System · Zustand (sparsam) · EAS Build · pnpm Workspaces. Local-First, Offline-First, Engine unabhängig von React Native, deterministische seed-basierte Geometrie, 256 Teile flüssig.
→ [docs/architecture/overview.md](docs/architecture/overview.md) · [Datenmodell](docs/architecture/data-model.md) · [Engine-Geometrie](docs/puzzle-engine/geometry.md) · [Datenschutz](docs/security/privacy.md)
