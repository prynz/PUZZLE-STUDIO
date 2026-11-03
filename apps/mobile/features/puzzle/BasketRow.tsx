import type { Puzzle } from '@puzzle-studio/puzzle-engine';
import {
  Chip,
  PrimaryButton,
  SecondaryButton,
  Sheet,
  SortBasket,
  Text,
  TextField,
  dialogStyles,
  spacing,
} from '@puzzle-studio/ui';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { t } from '@/i18n';

import { basketViews, type BasketView } from './game/baskets';
import type { Game } from './game/useGame';

/** Sorting baskets (profile kid / pro). Long press: rename and reorder (PO decision). */
export function BasketRow({ puzzle, game }: { puzzle: Puzzle; game: Game }) {
  const views = useMemo(
    () =>
      basketViews(puzzle, game.state, game.rules, game.groups, {
        all: t('basket.all'),
        edges: t('basket.edges'),
        corners: t('basket.corners'),
        custom: (n) => t('basket.mine', { n }),
      }),
    [puzzle, game.state, game.rules, game.groups],
  );
  const [editing, setEditing] = useState<BasketView | null>(null);
  const [name, setName] = useState('');
  if (views.length === 0) return null;

  const ids = views.map((v) => v.id);
  const canAdd = game.rules.maxCustomBaskets > views.filter((v) => v.kind === 'custom').length;
  const hasCustom = views.some((v) => v.kind === 'custom');
  const open = (v: BasketView) => {
    setEditing(v);
    setName(v.label);
  };

  return (
    <View style={styles.wrap}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {views.map((v) => (
          <SortBasket
            key={v.id}
            testID={`basket-${v.id}`}
            label={v.label}
            count={v.count}
            {...(v.swatch ? { swatch: v.swatch } : {})}
            selected={game.basketId === v.id}
            onPress={() => game.chooseBasket(v.id)}
            {...(game.rules.editBaskets ? { onLongPress: () => open(v) } : {})}
            accessibilityLabel={t('basket.label', { name: v.label, count: v.count })}
          />
        ))}
        {canAdd ? (
          <Chip
            testID="basket-add"
            label={t('basket.add')}
            selected={false}
            onPress={() => {
              const id = game.addBasket();
              if (id) game.chooseBasket(id);
            }}
          />
        ) : null}
      </ScrollView>
      {hasCustom ? <Text variant="caption">{t('basket.mineHint')}</Text> : null}
      <Sheet visible={editing !== null} title={t('basket.editTitle')} onRequestClose={() => setEditing(null)}>
        <TextField label={t('basket.name')} value={name} onChangeText={setName} maxLength={24} testID="basket-name" />
        <View style={styles.move}>
          <SecondaryButton
            size="compact"
            label={t('basket.left')}
            onPress={() => editing && game.move(ids, editing.id, -1)}
          />
          <SecondaryButton
            size="compact"
            label={t('basket.right')}
            onPress={() => editing && game.move(ids, editing.id, 1)}
          />
        </View>
        <View style={dialogStyles.actions}>
          <PrimaryButton
            testID="basket-save"
            label={t('basket.done')}
            showChevron={false}
            onPress={() => {
              if (editing) game.rename(ids, editing.id, name);
              setEditing(null);
            }}
          />
        </View>
      </Sheet>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.xs },
  row: { gap: spacing.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  move: { flexDirection: 'row', gap: spacing.sm },
});
