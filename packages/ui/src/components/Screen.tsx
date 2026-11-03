import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { gradient, spacing } from '../tokens.ts';
import { DecorativeBackground, type BackgroundPreset } from './DecorativeBackground.tsx';

export type ScreenBackground = 'warm' | 'dream' | 'table';

const backgrounds = {
  warm: gradient.screenWarm,
  dream: gradient.screenDream,
  table: gradient.playTable,
} as const;

export interface ScreenProps {
  children: ReactNode;
  background?: ScreenBackground;
  scroll?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  /** Content pinned to the bottom (e.g. primary CTA), respects the safe area. */
  footer?: ReactNode;
  /** Illustration preset behind the content (clouds, stars, meadow …). */
  decor?: BackgroundPreset;
  /** Extra bottom padding for content, e.g. above a floating tab bar. */
  bottomInset?: number;
  /** Side gutter (default on). Off for edge-to-edge play surfaces – safe-area insets stay. */
  gutter?: boolean;
}

/**
 * Screen scaffold: token gradient background, safe areas, standard gutter.
 * Optional `decor` adds the shared illustration layer (DecorativeBackground).
 */
export function Screen({
  children,
  background = 'warm',
  scroll = false,
  contentStyle,
  footer,
  decor,
  bottomInset = 0,
  gutter = true,
}: ScreenProps) {
  const insets = useSafeAreaInsets();
  const padding = {
    paddingTop: insets.top + spacing.md,
    paddingLeft: insets.left + (gutter ? spacing.xl : 0),
    paddingRight: insets.right + (gutter ? spacing.xl : 0),
  };
  return (
    <LinearGradient colors={backgrounds[background].colors} style={styles.root}>
      {decor ? <DecorativeBackground preset={decor} /> : null}
      {scroll ? (
        // Safe-area top stays outside the ScrollView so content never scrolls under the status bar.
        <View style={[styles.root, { paddingTop: insets.top }]}>
          <ScrollView
            contentContainerStyle={[
              {
                paddingTop: spacing.md,
                paddingLeft: padding.paddingLeft,
                paddingRight: padding.paddingRight,
                paddingBottom: spacing.xxl + bottomInset,
              },
              contentStyle,
            ]}
          >
            {children}
          </ScrollView>
        </View>
      ) : (
        <View style={[styles.root, padding, { paddingBottom: bottomInset }, contentStyle]}>{children}</View>
      )}
      {footer ? (
        <View
          style={{ paddingHorizontal: spacing.xl, paddingBottom: insets.bottom + spacing.lg, paddingTop: spacing.sm }}
        >
          {footer}
        </View>
      ) : null}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({ root: { flex: 1 } });
