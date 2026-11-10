import {
  ActionTile,
  Appear,
  Section,
  layout,
  staggerDelay,
  BOTTOM_NAV_HEIGHT,
  ConfirmDialog,
  Icon,
  IconButton,
  ImageTile,
  Screen,
  Surface,
  Text,
  spacing,
} from '@puzzle-studio/ui';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import { t, type MessageKey } from '@/i18n';
import { pickFromLibrary, takePhoto, type PickResult } from '@/services/imageSources';
import { useImages } from '@/store/images';
import { useJourney } from '@/store/journey';
import { usePuzzles } from '@/store/puzzles';

/** Puzzle-Atelier: choose a source, see and manage "Meine Bilder". */
export function CreateScreen() {
  const router = useRouter();
  const { images: all, setPending, remove } = useImages();
  // pictures of Pino's journey live in the journey, not in "Meine Bilder" (concept 2 §3)
  const { journeyImageIds } = useJourney();
  const images = all.filter((i) => !journeyImageIds.has(i.id));
  const { forgetImage } = usePuzzles();
  const [notice, setNotice] = useState<MessageKey | null>(null);
  const [toDelete, setToDelete] = useState<string | null>(null);

  const handle = async (pick: () => Promise<PickResult>) => {
    setNotice(null);
    try {
      const res = await pick();
      if (res.status === 'ok') {
        setPending(res.image);
        router.push('/creator/crop');
      } else if (res.status === 'denied') {
        setNotice('creator.denied');
      }
    } catch {
      setNotice('creator.failed');
    }
  };

  return (
    <Screen scroll decor="dream" bottomInset={BOTTOM_NAV_HEIGHT} contentStyle={styles.content}>
      <Text variant="title1" accessibilityRole="header">
        {t('creator.title')}
      </Text>

      <Appear variant="rise">
        <Section title={t('creator.intro')} tone="sky">
          <View style={styles.sources}>
            <ActionTile
              testID="src-camera"
              tone="sky"
              label={t('creator.camera')}
              illustration={<Icon name="camera" />}
              onPress={() => handle(takePhoto)}
            />
            <ActionTile
              testID="src-library"
              tone="peach"
              label={t('creator.library')}
              illustration={<Icon name="gallery" />}
              onPress={() => handle(pickFromLibrary)}
            />
            <ActionTile
              testID="src-samples"
              tone="leaf"
              label={t('creator.samples')}
              illustration={<Icon name="sample" />}
              onPress={() => router.push('/creator/samples')}
            />
          </View>
          {notice ? (
            <Surface tone="peach" accessibilityLiveRegion="polite">
              <Text variant="body">{t(notice)}</Text>
            </Surface>
          ) : null}
        </Section>
      </Appear>

      <Appear variant="rise" delay={staggerDelay(1)}>
        <Section title={`${t('creator.myImages')}${images.length > 0 ? ` · ${images.length}` : ''}`}>
          {images.length === 0 ? (
            <Text variant="body">{t('creator.empty')}</Text>
          ) : (
            <>
              <Text variant="caption">{t('creator.next')}</Text>
              <View style={styles.grid} testID="my-images">
                {images.map((img, index) => (
                  <Appear key={img.id} variant="pop" delay={staggerDelay(2 + index)} style={styles.cell}>
                    <ImageTile
                      testID="my-image"
                      source={{ uri: img.thumbUri }}
                      aspect={img.work.width / img.work.height}
                      accessibilityLabel={t('creator.imageLabel')}
                      onPress={() => router.push({ pathname: '/puzzle/new', params: { imageId: img.id } })}
                      action={
                        <IconButton
                          size={48}
                          accessibilityLabel={t('creator.delete')}
                          icon={<Icon name="trash" />}
                          onPress={() => setToDelete(img.id)}
                        />
                      }
                    />
                  </Appear>
                ))}
              </View>
            </>
          )}
          {Platform.OS === 'web' ? <Text variant="caption">{t('creator.webNote')}</Text> : null}
        </Section>
      </Appear>

      <ConfirmDialog
        visible={toDelete !== null}
        title={t('creator.deleteTitle')}
        message={t('creator.deleteBody')}
        confirmLabel={t('creator.deleteYes')}
        cancelLabel={t('creator.deleteNo')}
        onCancel={() => setToDelete(null)}
        onConfirm={async () => {
          const id = toDelete;
          setToDelete(null);
          if (!id) return;
          await remove(id);
          await forgetImage(id); // its puzzles go with it
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: layout.sectionGap },
  sources: { flexDirection: 'row', gap: spacing.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  cell: { width: '48%' },
});
