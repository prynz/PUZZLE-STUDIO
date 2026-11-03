import { ConfirmDialog, PrimaryButton, SecondaryButton, Sheet, dialogStyles } from '@puzzle-studio/ui';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { t } from '@/i18n';
import { usePuzzles } from '@/store/puzzles';

import type { CollectionItem } from './collectionView';

/** What to do with a puzzle from the collection: continue / play again, or delete. */
export function PuzzleSheet({ item, onClose }: { item: CollectionItem | null; onClose: () => void }) {
  const router = useRouter();
  const { reset, remove } = usePuzzles();
  const [confirm, setConfirm] = useState(false);
  const open = async () => {
    if (!item) return;
    if (item.done) await reset(item.puzzle.id);
    onClose();
    router.push({ pathname: '/puzzle/[id]', params: { id: item.puzzle.id } });
  };
  return (
    <>
      <Sheet
        visible={item !== null && !confirm}
        title={item ? t('collection.card', { n: item.pieces }) : ''}
        onRequestClose={onClose}
        emotion={item?.done ? 'success' : 'happy'}
      >
        <View style={dialogStyles.actions}>
          <PrimaryButton
            testID="sheet-play"
            label={item?.done ? t('collection.again') : t('collection.continue')}
            onPress={open}
          />
          <SecondaryButton testID="sheet-delete" label={t('collection.delete')} onPress={() => setConfirm(true)} />
          <SecondaryButton testID="sheet-close" label={t('collection.close')} onPress={onClose} />
        </View>
      </Sheet>
      <ConfirmDialog
        visible={confirm}
        title={t('collection.deleteTitle')}
        message={t('collection.deleteBody')}
        confirmLabel={t('collection.deleteYes')}
        cancelLabel={t('collection.deleteNo')}
        onCancel={() => setConfirm(false)}
        onConfirm={async () => {
          setConfirm(false);
          if (item) await remove(item.puzzle.id);
          onClose();
        }}
      />
    </>
  );
}
