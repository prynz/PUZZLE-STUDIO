import { useEffect, useRef, type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, View, useWindowDimensions, type ScrollViewInstance } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { useReduceMotion } from '../motion/MotionProvider.tsx';
import { shadowStyle, withAlpha } from '../styles/helpers.ts';
import { color, palette, radius, shadow, spacing } from '../tokens.ts';
import { Icon } from './Icon.tsx';
import { Mascot } from './Mascot.tsx';
import { trailPath, trailPoints } from './storyShapes.ts';
import { Text } from './Text.tsx';

export interface JourneyStation {
  id: string;
  label: string;
  /** Spoken label incl. state, e.g. "Erstes Puzzle – geschafft". */
  accessibilityLabel: string;
  done: boolean;
  /** Shown inside a reached station (e.g. the reward). */
  badge: ReactNode;
}

export interface JourneyTrailProps {
  stations: readonly JourneyStation[];
  /** Index of the next goal – Pino waits there (stations.length when everything is done). */
  current: number;
  onPressStation: (id: string) => void;
  testID?: string;
}

const STEP = 104;
const NODE = 60;
const PINO = 76;
const HEIGHT = 226;
const MID = 130;
const AMP = 22;

/**
 * Pino's journey: a winding path through all milestones. Reached stations show their reward,
 * Pino stands at the next goal (softly glowing), later ones wait with a lock. Scrolls sideways
 * and starts at Pino.
 */
export function JourneyTrail({ stations, current, onPressStation, testID }: JourneyTrailProps) {
  const { width: screen } = useWindowDimensions();
  const scroll = useRef<ScrollViewInstance>(null);
  const start = spacing.xl + NODE / 2;
  const points = trailPoints(stations.length, STEP, start, MID, AMP);
  const width = start * 2 + STEP * Math.max(0, stations.length - 1);
  const at = Math.min(current, stations.length - 1);
  const here = points[at];
  const walked = trailPath(points.slice(0, at + 1));
  const ahead = trailPath(points.slice(at));

  useEffect(() => {
    if (!here) return;
    scroll.current?.scrollTo({ x: Math.max(0, here.x - screen / 2), animated: false });
  }, [here, screen]);

  return (
    <ScrollView
      ref={scroll}
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ marginHorizontal: -spacing.xl }}
      testID={testID}
    >
      <View style={{ width, height: HEIGHT }}>
        <Svg width={width} height={HEIGHT} style={StyleSheet.absoluteFill}>
          <Path d={ahead} stroke={palette.mist300} strokeWidth={8} strokeLinecap="round" fill="none" />
          <Path
            d={ahead}
            stroke={palette.white}
            strokeWidth={3}
            strokeDasharray="2 12"
            strokeLinecap="round"
            fill="none"
          />
          <Path d={walked} stroke={palette.leaf600} strokeWidth={8} strokeLinecap="round" fill="none" />
        </Svg>
        {stations.map((s, i) => {
          const p = points[i];
          if (!p) return null;
          return (
            <View key={s.id} style={[styles.slot, { left: p.x - STEP / 2, top: p.y - NODE / 2 }]}>
              <Station station={s} next={i === current} onPress={() => onPressStation(s.id)} />
              <Text variant="caption" align="center" numberOfLines={2} tone={s.done ? 'primary' : 'secondary'}>
                {s.label}
              </Text>
            </View>
          );
        })}
        {here ? (
          <View style={[styles.pino, { left: here.x - PINO / 2, top: here.y - NODE / 2 - PINO + 6 }]}>
            <Mascot emotion={current >= stations.length ? 'happy' : 'excited'} size={PINO} animated />
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
}

function Station({ station, next, onPress }: { station: JourneyStation; next: boolean; onPress: () => void }) {
  const reduceMotion = useReduceMotion();
  const glow = useSharedValue(0);
  useEffect(() => {
    if (!next || reduceMotion) {
      glow.set(0);
      return;
    }
    // a few soft pulses to draw the eye, then it rests (no endless animation)
    glow.set(withRepeat(withTiming(1, { duration: 900, easing: Easing.inOut(Easing.sin) }), 6, true));
    return () => cancelAnimation(glow);
  }, [next, reduceMotion, glow]);
  const halo = useAnimatedStyle(() => ({
    opacity: 0.55 - 0.35 * glow.get(),
    transform: [{ scale: 1 + 0.22 * glow.get() }],
  }));

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={station.accessibilityLabel}
      onPress={onPress}
      hitSlop={spacing.xxs}
      style={styles.nodeBox}
    >
      {next ? <Animated.View style={[styles.halo, halo]} /> : null}
      <View
        style={[
          styles.node,
          station.done ? styles.done : next ? styles.next : styles.later,
          station.done || next ? shadowStyle(shadow.card) : null,
        ]}
      >
        {station.done || next ? station.badge : <Icon name="lock" size={20} />}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  slot: { position: 'absolute', width: STEP, alignItems: 'center', gap: spacing.xxs },
  nodeBox: { width: NODE, height: NODE, alignItems: 'center', justifyContent: 'center' },
  node: {
    width: NODE,
    height: NODE,
    borderRadius: radius.pill,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  done: { backgroundColor: palette.leaf100, borderColor: palette.leaf600 },
  next: { backgroundColor: color.background.raised, borderColor: palette.neon },
  later: { backgroundColor: palette.mist200, borderColor: withAlpha(palette.white, 0.9) },
  halo: {
    position: 'absolute',
    width: NODE + 18,
    height: NODE + 18,
    borderRadius: radius.pill,
    backgroundColor: palette.neon,
  },
  pino: { position: 'absolute' },
});
