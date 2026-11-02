import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { gradient, spacing } from '../tokens.ts';

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
}

/**
 * Screen scaffold: token gradient background, safe areas, standard gutter.
 * Decorative illustration presets (clouds, stars…) arrive in Phase 2.
 */
export function Screen({ children, background = 'warm', scroll = false, contentStyle, footer }: ScreenProps) {
  const insets = useSafeAreaInsets();
  const padding = {
    paddingTop: insets.top + spacing.md,
    paddingLeft: insets.left + spacing.xl,
    paddingRight: insets.right + spacing.xl,
  };
  return (
    <LinearGradient colors={backgrounds[background].colors} style={styles.root}>
      {scroll ? (
        // Safe-area top stays outside the ScrollView so content never scrolls under the status bar.
        <View style={[styles.root, { paddingTop: insets.top }]}>
          <ScrollView
            contentContainerStyle={[
              {
                paddingTop: spacing.md,
                paddingLeft: padding.paddingLeft,
                paddingRight: padding.paddingRight,
                paddingBottom: spacing.xxl,
              },
              contentStyle,
            ]}
          >
            {children}
          </ScrollView>
        </View>
      ) : (
        <View style={[styles.root, padding, contentStyle]}>{children}</View>
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
