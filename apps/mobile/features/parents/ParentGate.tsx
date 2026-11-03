import {
  Appear,
  Icon,
  IconButton,
  Mascot,
  NumberPad,
  ProgressDots,
  Screen,
  SpeechBubble,
  Surface,
  Text,
  layout,
  spacing,
} from '@puzzle-studio/ui';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { t } from '@/i18n';

import { GATE_LENGTH, createGateTask, enterDigit } from './gate';

/**
 * Parent gate: three numbers written as words, typed on a keypad. A wrong digit gives a new
 * task straight away (no counter, no lock-out) – children simply cannot read it yet.
 */
export function ParentGate({ onOpen, onCancel }: { onOpen: () => void; onCancel: () => void }) {
  const [task, setTask] = useState(() => ({ ...createGateTask(), round: 0 }));
  const [entered, setEntered] = useState<number[]>([]);
  const [wrong, setWrong] = useState(false);

  const tap = (digit: number) => {
    const step = enterDigit(task, entered, digit);
    if (step.status === 'open') return onOpen();
    if (step.status === 'wrong') {
      setTask({ ...createGateTask(), round: task.round + 1 });
      setEntered([]);
      setWrong(true);
      return;
    }
    setEntered(step.entered);
  };

  return (
    <Screen scroll background="warm" contentStyle={styles.content}>
      <View style={styles.header}>
        <IconButton
          testID="gate-cancel"
          accessibilityLabel={t('gate.cancel')}
          icon={<Icon name="back" />}
          onPress={onCancel}
        />
        <Text variant="title1" accessibilityRole="header">
          {t('gate.title')}
        </Text>
      </View>
      <View style={styles.pino}>
        <Mascot emotion="thinking" size={80} accessibilityLabel={null} />
        <SpeechBubble>
          <Text variant="body" accessibilityLiveRegion="polite">
            {wrong ? t('gate.wrong') : t('gate.intro')}
          </Text>
        </SpeechBubble>
      </View>
      <Appear key={task.round} variant="pop">
        <Surface tone="lavender" style={styles.task}>
          <Text variant="caption" tone="secondary">
            {t('gate.ask')}
          </Text>
          <Text variant="title2" align="center" testID="gate-task">
            {task.words.join(' · ')}
          </Text>
        </Surface>
      </Appear>
      <ProgressDots
        count={GATE_LENGTH}
        active={Math.min(entered.length, GATE_LENGTH - 1)}
        accessibilityLabel={t('gate.progress', { n: entered.length, total: GATE_LENGTH })}
      />
      <View style={styles.pad}>
        <NumberPad onDigit={tap} testIDPrefix="gate-digit" />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: layout.sectionGap },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  pino: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  task: { alignItems: 'center', gap: spacing.xxs },
  pad: { alignItems: 'center', alignSelf: 'stretch' },
});
