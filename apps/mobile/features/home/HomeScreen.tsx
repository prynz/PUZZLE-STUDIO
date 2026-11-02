import {
  BOTTOM_NAV_HEIGHT,
  FeatureCard,
  Icon,
  IconButton,
  Mascot,
  Screen,
  SpeechBubble,
  Surface,
  Text,
  spacing,
} from '@puzzle-studio/ui';
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { t } from '@/i18n';

/**
 * Home – Phase 2: greeting, main action and the (still empty) collection.
 * "Weiter spielen" and real collection items appear once puzzles exist (Phase 5/6).
 */
export function HomeScreen() {
  const router = useRouter();
  return (
    <Screen scroll decor="sky" bottomInset={BOTTOM_NAV_HEIGHT} contentStyle={styles.content}>
      <View style={styles.topRow}>
        <View />
        <IconButton
          testID="open-parents"
          size={48}
          accessibilityLabel={t('home.parents')}
          icon={<Icon name="lock" />}
          onPress={() => router.push('/parents')}
        />
      </View>

      <View style={styles.greeting}>
        <Mascot emotion="happy" size={112} animated />
        <SpeechBubble>
          <Text variant="title3">{t('home.hello')}</Text>
          <Text variant="body">{t('home.question')}</Text>
        </SpeechBubble>
      </View>

      <FeatureCard
        testID="home-create"
        title={t('home.create.title')}
        subtitle={t('home.create.sub')}
        illustration={<Icon name="gallery" size={96} />}
        onPress={() => router.push('/create')}
      />

      <Text variant="title3" accessibilityRole="header" style={styles.section}>
        {t('home.collection.title')}
      </Text>
      <Surface tone="pink" style={styles.empty}>
        <Mascot emotion="sleeping" size={72} accessibilityLabel={null} />
        <Text variant="body" style={styles.emptyText}>
          {t('home.collection.empty')}
        </Text>
      </Surface>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.md },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greeting: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  section: { marginTop: spacing.xs },
  empty: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  emptyText: { flex: 1 },
});
