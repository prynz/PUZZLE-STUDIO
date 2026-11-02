import {
  ActionTile,
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

/** Puzzle-Atelier: choose a source, see and manage "Meine Bilder". */
export function CreateScreen() {
  const router = useRouter();
  const { images, setPending, remove } = useImages();
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
      <Text variant="body">{t('creator.intro')}</Text>

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
          tone="lavender"
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

      <Text variant="title3" accessibilityRole="header" style={styles.section}>
        {t('creator.myImages')} {images.length > 0 ? `· ${images.length}` : ''}
      </Text>
      {images.length === 0 ? (
        <Surface tone="pink">
          <Text variant="body">{t('creator.empty')}</Text>
        </Surface>
      ) : (
        <View style={styles.grid} testID="my-images">
          {images.map((img) => (
            <View key={img.id} style={styles.cell}>
              <ImageTile
                testID="my-image"
                source={{ uri: img.thumbUri }}
                aspect={img.work.width / img.work.height}
                accessibilityLabel={t('creator.imageLabel')}
                action={
                  <IconButton
                    size={48}
                    accessibilityLabel={t('creator.delete')}
                    icon={<Icon name="trash" />}
                    onPress={() => setToDelete(img.id)}
                  />
                }
              />
            </View>
          ))}
        </View>
      )}
      <Text variant="caption">{t('creator.next')}</Text>
      {Platform.OS === 'web' ? <Text variant="caption">{t('creator.webNote')}</Text> : null}

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
          if (id) await remove(id);
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.md },
  sources: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs },
  section: { marginTop: spacing.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  cell: { width: '48%' },
});
