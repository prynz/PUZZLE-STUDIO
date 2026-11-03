/**
 * Parent gate (Apple Kids Category 1.3 / Google Families): before the parents area opens,
 * an adult types three numbers that are shown as WORDS ("sieben · zwei · fünf").
 * Young children cannot read them yet; adults solve it in seconds. Pure and testable.
 */

export const NUMBER_WORDS = ['eins', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun'] as const;

export interface GateTask {
  /** Words to show, e.g. ["sieben", "zwei", "fünf"]. */
  words: string[];
  /** Digits to tap in this order. */
  answer: number[];
}

export const GATE_LENGTH = 3;

/** New task with three different digits (1–9). `random` returns values in [0, 1). */
export function createGateTask(random: () => number = Math.random): GateTask {
  const pool = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  const answer: number[] = [];
  while (answer.length < GATE_LENGTH) {
    const i = Math.min(pool.length - 1, Math.floor(random() * pool.length));
    answer.push(pool.splice(i, 1)[0] as number); // i is clamped to the pool
  }
  return { answer, words: answer.map((d) => NUMBER_WORDS[d - 1] as string) };
}

export type GateStep = { status: 'typing'; entered: number[] } | { status: 'open' } | { status: 'wrong' };

/** Next state after tapping a digit: wrong as soon as one digit does not match. */
export function enterDigit(task: GateTask, entered: readonly number[], digit: number): GateStep {
  const next = [...entered, digit];
  if (task.answer[next.length - 1] !== digit) return { status: 'wrong' };
  if (next.length === task.answer.length) return { status: 'open' };
  return { status: 'typing', entered: next };
}
