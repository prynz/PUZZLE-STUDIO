# Component Library (Plan)

Status: **geplant für Phase 2**. Alle Komponenten liegen in `packages/ui` (plattformneutral, nur React Native + `react-native-svg`/Skia) und verwenden ausschließlich Tokens aus `packages/ui/src/tokens.ts`. In den Konzept-Mockups (`docs/design/concept/`) sind sie bereits als CSS-Klassen vorgeformt.

| Komponente             | Zweck                                           | Wichtige Props                                                                     | Mockup-Vorbild                   |
| ---------------------- | ----------------------------------------------- | ---------------------------------------------------------------------------------- | -------------------------------- |
| `PrimaryButton`        | Hauptaktion (Lila oder Gelb)                    | `variant: 'primary' \| 'accent'`, `label`, `onPress`, `trailingIcon?`, `disabled?` | „Los geht's“, „Puzzle erstellen“ |
| `SecondaryButton`      | Nebenaktion (weiß, Pille)                       | `label`, `onPress`                                                                 | „Überspringen“                   |
| `IconButton`           | Runde 52-dp-Buttons                             | `icon`, `accessibilityLabel` (Pflicht), `tone`                                     | Zurück, Pause, Vorlage           |
| `PuzzleCard`           | Sammlungseintrag                                | `puzzle`, `onPress`, `onLongPress`                                                 | Sammlung                         |
| `ImageCard`            | Bild mit Rahmen/Badge                           | `source`, `badge?`                                                                 | Home-Thumbnails                  |
| `SelectionCard`        | Auswahlkarte mit Illustration                   | `selected`, `illustration`, `label`                                                | Onboarding 3, Teileform          |
| `ProgressIndicator`    | Balken / Punkte / Ring                          | `variant: 'bar' \| 'dots' \| 'steps'`, `value`, `max`                              | Gameplay, Onboarding             |
| `DifficultySelector`   | Sterne + altersgerechte Beschreibung            | `value`, `onChange`                                                                | Creator                          |
| `PuzzleSizeSelector`   | Teile-Chips 4…256 + „Eigene“ (Reihen × Spalten) | `value`, `aspectRatio`, `onChange`                                                 | Creator                          |
| `BottomNavigation`     | 4 Tabs, schwebend                               | `active`, `onNavigate`                                                             | Home, Sammlung                   |
| `Modal`                | Dialog/Sheet mit Illustration                   | `title`, `illustration?`, `primary`, `secondary?`                                  | Pause, Löschen                   |
| `ParentGate`           | Elternschranke                                  | `onPassed`, `onCancel`                                                             | Elternbereich                    |
| `Mascot`               | Pino in 8 Zuständen                             | `emotion`, `size`, `animated?`                                                     | alle                             |
| `DecorativeBackground` | Hintergrund-Preset                              | `preset: 'meadow' \| 'sky' \| 'dream' \| 'table' \| 'calm'`                        | alle                             |
| `CloudIllustration`    | Wolke                                           | `width`, `opacity`                                                                 | alle                             |
| `StarDecoration`       | Stern / Funkeln                                 | `kind`, `size`, `color`                                                            | alle                             |
| `AchievementCard`      | Erfolg (gesperrt/frei)                          | `achievement`, `unlocked`                                                          | Erfolge                          |
| `EmptyState`           | Leerer Zustand mit Pino + CTA                   | `title`, `message`, `action?`                                                      | Sammlung leer                    |
| `LoadingState`         | Ruhiges Laden (Pino `thinking`)                 | `message?`                                                                         | Puzzle generieren                |
| `Text`                 | Typografie-Varianten                            | `variant: keyof typography`                                                        | alle                             |
| `Surface` / `Card`     | Basis-Kartenfläche                              | `tone`, `elevation`                                                                | alle                             |

## Verhaltensregeln

- **Press-Feedback:** Reanimated-Scale auf `pressScale` (0,96) mit `spring.press` + optional leichtes Haptik-Feedback (`expo-haptics`, im Elternbereich abschaltbar).
- **Barrierefreiheit:** jede interaktive Komponente setzt `accessibilityRole`, `accessibilityLabel`, `accessibilityState`; Hit-Slop sorgt für ≥ 56 dp.
- **Keine toten Buttons:** Komponenten ohne `onPress` werden nicht als Button gerendert.
- **Storybook:** bewusst nicht im MVP (zusätzliche Abhängigkeit). Stattdessen eine interne Route `/_dev/components` im Dev-Build (nur `__DEV__`) als lebende Komponentenübersicht für Screenshots.
