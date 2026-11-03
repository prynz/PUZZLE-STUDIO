import { Appear, Icon, IconButton, Screen, SegmentedControl, Text, layout, spacing } from '@puzzle-studio/ui';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { t, type MessageKey } from '@/i18n';

import { ParentGate } from './ParentGate';
import { ParentsData } from './ParentsData';
import { ParentsInfo } from './ParentsInfo';
import { ParentsPlay } from './ParentsPlay';

type Area = 'play' | 'data' | 'info';
const AREAS: Area[] = ['play', 'data', 'info'];

/**
 * Parents' area behind the parent gate (docs/product/parents-area.md). Opening it again always
 * asks again – nothing stays unlocked in the background. Three areas instead of one long page.
 */
export function ParentsScreen() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [area, setArea] = useState<Area>('play');
  if (!open) return <ParentGate onOpen={() => setOpen(true)} onCancel={() => router.back()} />;

  const segments = AREAS.map((key) => ({ key, label: t(`parents.area.${key}` as MessageKey) }));
  return (
    <Screen scroll background="warm" contentStyle={styles.content}>
      <View style={styles.header}>
        <IconButton
          testID="parents-back"
          accessibilityLabel={t('parents.back')}
          icon={<Icon name="back" />}
          onPress={() => router.back()}
        />
        <Text variant="title1" accessibilityRole="header" testID="parents-title">
          {t('parents.title')}
        </Text>
      </View>
      <SegmentedControl segments={segments} value={area} onChange={setArea} testIDPrefix="parents" />
      <Appear key={area} variant="rise" style={styles.content}>
        {area === 'play' ? <ParentsPlay /> : area === 'data' ? <ParentsData /> : <ParentsInfo />}
      </Appear>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: layout.sectionGap },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
});
