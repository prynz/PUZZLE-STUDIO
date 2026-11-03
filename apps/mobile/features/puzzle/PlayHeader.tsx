import { Icon, IconButton, ProgressBar, Text, spacing } from '@puzzle-studio/ui';
import { StyleSheet, View } from 'react-native';

import { t } from '@/i18n';

import type { Game } from './game/useGame';

export interface PlayHeaderProps {
  game: Game;
  total: number;
  onBack: () => void;
  onRestart: () => void;
}

/** One calm row: back, progress, reference toggle, restart and the Pino hint (most prominent, right). */
export function PlayHeader({ game, total, onBack, onRestart }: PlayHeaderProps) {
  return (
    <View style={styles.row}>
      <IconButton testID="play-back" accessibilityLabel={t('play.back')} icon={<Icon name="back" />} onPress={onBack} />
      <View style={styles.progress}>
        {game.bites ? (
          <ProgressBar
            value={game.placed / total}
            accessibilityLabel={t('play.progress', { placed: game.placed, total })}
          />
        ) : (
          <Text
            variant="title3"
            numberOfLines={1}
            testID="play-progress"
            accessibilityLabel={t('play.progress', { placed: game.placed, total })}
          >
            {t('play.progressShort', { placed: game.placed, total })}
          </Text>
        )}
      </View>
      <IconButton
        testID="play-reference"
        accessibilityLabel={t('play.reference')}
        icon={<Icon name="eye" />}
        onPress={game.toggleReference}
      />
      <IconButton
        testID="play-restart"
        accessibilityLabel={t('play.restart')}
        icon={<Icon name="rotate" />}
        onPress={onRestart}
      />
      <IconButton
        testID="play-hint"
        size={60}
        accessibilityLabel={t('play.hint')}
        icon={<Icon name="hint" size={30} />}
        onPress={game.showHint}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
  },
  progress: { flex: 1, flexShrink: 1, minWidth: 0 },
});
