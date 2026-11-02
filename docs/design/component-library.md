# Component Library (Plan)

Status: **Phase 2 umgesetzt**: `Text`, `PrimaryButton`, `SecondaryButton`, `IconButton`, `Surface`, `Screen` (mit `decor`), `StatusPill`, `Mascot`, `Icon`, `DecorativeBackground` (Presets meadow/sky/dream/table/calm), `ProgressDots`, `SelectionCard`, `FeatureCard`, `SpeechBubble`, `BottomNavigation`, `EmptyState`, **Phase 3:** `Chip`, `ActionTile`, `ImageTile`, `ConfirmDialog`, `LoadingState`, `Appear` sowie Helfer `shadowStyle`, `textStyle`, `withAlpha`. Offen (mit ihren Features): `PuzzleCard`, `ImageCard`, `DifficultySelector`, `PuzzleSizeSelector`, `ParentGate`, `AchievementCard`, `PieceTray`, `SortBasket`, `HintButton`, `ZoomControls`. Alle Komponenten liegen in `packages/ui` und verwenden ausschließlich Tokens.

| Komponente             | Zweck                                                          | Wichtige Props                                                                     | Mockup-Vorbild                   |
| ---------------------- | -------------------------------------------------------------- | ---------------------------------------------------------------------------------- | -------------------------------- |
| `PrimaryButton`        | Hauptaktion (Lila oder Gelb)                                   | `variant: 'primary' \| 'accent'`, `label`, `onPress`, `trailingIcon?`, `disabled?` | „Los geht's“, „Puzzle erstellen“ |
| `SecondaryButton`      | Nebenaktion (weiß, Pille)                                      | `label`, `onPress`                                                                 | „Überspringen“                   |
| `IconButton`           | Runde 52-dp-Buttons                                            | `icon`, `accessibilityLabel` (Pflicht), `tone`                                     | Zurück, Pause, Vorlage           |
| `PuzzleCard`           | Sammlungseintrag                                               | `puzzle`, `onPress`, `onLongPress`                                                 | Sammlung                         |
| `ImageCard`            | Bild mit Rahmen/Badge                                          | `source`, `badge?`                                                                 | Home-Thumbnails                  |
| `SelectionCard`        | Auswahlkarte mit Illustration                                  | `selected`, `illustration`, `label`                                                | Onboarding 3, Teileform          |
| `ProgressIndicator`    | Balken / Punkte / Ring                                         | `variant: 'bar' \| 'dots' \| 'steps'`, `value`, `max`                              | Gameplay, Onboarding             |
| `DifficultySelector`   | Sterne + altersgerechte Beschreibung                           | `value`, `onChange`                                                                | Creator                          |
| `PuzzleSizeSelector`   | Teile-Chips 4…256 + „Eigene“ (Reihen × Spalten)                | `value`, `aspectRatio`, `onChange`                                                 | Creator                          |
| `BottomNavigation`     | 4 Tabs, schwebend                                              | `active`, `onNavigate`                                                             | Home, Sammlung                   |
| `Modal`                | Dialog/Sheet mit Illustration                                  | `title`, `illustration?`, `primary`, `secondary?`                                  | Pause, Löschen                   |
| `ParentGate`           | Elternschranke                                                 | `onPassed`, `onCancel`                                                             | Elternbereich                    |
| `Mascot`               | Pino in 8 Zuständen                                            | `emotion`, `size`, `animated?`                                                     | alle                             |
| `DecorativeBackground` | Hintergrund-Preset                                             | `preset: 'meadow' \| 'sky' \| 'dream' \| 'table' \| 'calm'`                        | alle                             |
| `CloudIllustration`    | Wolke                                                          | `width`, `opacity`                                                                 | alle                             |
| `StarDecoration`       | Stern / Funkeln                                                | `kind`, `size`, `color`                                                            | alle                             |
| `AchievementCard`      | Erfolg (gesperrt/frei)                                         | `achievement`, `unlocked`                                                          | Erfolge                          |
| `EmptyState`           | Leerer Zustand mit Pino + CTA                                  | `title`, `message`, `action?`                                                      | Sammlung leer                    |
| `LoadingState`         | Ruhiges Laden (Pino `thinking`)                                | `message?`                                                                         | Puzzle generieren                |
| `PieceTray`            | Ablage mit festen Plätzen, virtualisiert, blätterbar           | `pieces`, `highlightedId?`, `onDragStart`                                          | Spieltisch-Mockup                |
| `SortBasket`           | Illustrierte Sortier-Schale mit Zähler (Farbe + Symbol + Text) | `kind`, `label`, `count`, `selected`                                               | Spieltisch-Mockup                |
| `HintButton`           | Pino-Tipp-Knopf                                                | `onPress`, `disabled?`                                                             | Spieltisch-Mockup                |
| `ZoomControls`         | −/+ und „Ganzes Bild“ für das Brett                            | `zoom`, `onZoom`                                                                   | Spieltisch-Mockup                |
| `Text`                 | Typografie-Varianten                                           | `variant: keyof typography`                                                        | alle                             |
| `Surface` / `Card`     | Basis-Kartenfläche                                             | `tone`, `elevation`                                                                | alle                             |

## Verhaltensregeln

- **Press-Feedback:** Reanimated-Scale auf `pressScale` (0,96) mit `spring.press` + optional leichtes Haptik-Feedback (`expo-haptics`, im Elternbereich abschaltbar).
- **Barrierefreiheit:** jede interaktive Komponente setzt `accessibilityRole`, `accessibilityLabel`, `accessibilityState`; Hit-Slop sorgt für ≥ 56 dp.
- **Keine toten Buttons:** Komponenten ohne `onPress` werden nicht als Button gerendert.
- **Storybook:** bewusst nicht im MVP (zusätzliche Abhängigkeit). Stattdessen eine interne Route `/_dev/components` im Dev-Build (nur `__DEV__`) als lebende Komponentenübersicht für Screenshots.
