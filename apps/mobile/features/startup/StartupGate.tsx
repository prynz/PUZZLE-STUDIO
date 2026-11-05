import { LoadingScreen, duration, useReduceMotion } from '@puzzle-studio/ui';
import { useEffect, useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { t } from '@/i18n';
import { PRELOAD_TASKS } from '@/services/preload';
import { useImages } from '@/store/images';
import { useProgress } from '@/store/progress';
import { usePuzzles } from '@/store/puzzles';
import { useSettings } from '@/store/settings';
import { describeError } from '@/utils/errors';

import { STARTUP_MIN_MS, shownProgress, startupFinished } from './startupProgress';

const TICK_MS = 100;
const FADE_MS = duration.slow;

/**
 * Preloader at app start: shows the start screen while settings, pictures, puzzles, stars and
 * assets load in the background – at least STARTUP_MIN_MS, longer if needed – then fades the
 * first app screen in. A failing asset task never blocks the start (the screen then loads it itself).
 */
export function StartupGate({ children }: { children: ReactNode }) {
  const stores = [useSettings().ready, useImages().ready, usePuzzles().ready, useProgress().ready];
  const [tasksDone, setTasksDone] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    let alive = true;
    for (const task of PRELOAD_TASKS) {
      task
        .run()
        .catch((e: unknown) => console.warn(`[startup] ${task.key} failed: ${describeError(e)}`))
        .finally(() => alive && setTasksDone((n) => n + 1));
    }
    const started = Date.now();
    const timer = setInterval(() => setElapsed(Date.now() - started), TICK_MS);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, []);

  const total = stores.length + PRELOAD_TASKS.length;
  const done = (stores.filter(Boolean).length + tasksDone) / total;
  const finished = startupFinished(done, elapsed, STARTUP_MIN_MS);

  // when finished: the first screen is already there, the start screen fades out on top of it
  const reduceMotion = useReduceMotion();
  const [gone, setGone] = useState(false);
  const fade = useSharedValue(1);
  useEffect(() => {
    if (!finished || reduceMotion) return;
    fade.set(withTiming(0, { duration: FADE_MS }, (ok) => ok && runOnJS(setGone)(true)));
  }, [finished, reduceMotion, fade]);
  const overlay = useAnimatedStyle(() => ({ opacity: fade.get() }));

  return (
    <View style={styles.fill}>
      {finished ? children : null}
      {gone || (finished && reduceMotion) ? null : (
        <Animated.View style={[StyleSheet.absoluteFill, overlay]} pointerEvents={finished ? 'none' : 'auto'}>
          <LoadingScreen
            testID="startup"
            title={t('loading.title')}
            message={t('loading.start')}
            progress={shownProgress(done, elapsed, STARTUP_MIN_MS)}
          />
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({ fill: { flex: 1 } });
