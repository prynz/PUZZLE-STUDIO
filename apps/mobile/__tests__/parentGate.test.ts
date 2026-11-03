import { NUMBER_WORDS, createGateTask, enterDigit } from '@/features/parents/gate';

const seq = (values: number[]) => {
  let i = 0;
  return () => values[i++ % values.length] ?? 0;
};

describe('parent gate', () => {
  it('asks for three different digits written as words', () => {
    for (let n = 0; n < 50; n++) {
      const t = createGateTask();
      expect(t.answer).toHaveLength(3);
      expect(new Set(t.answer).size).toBe(3);
      t.answer.forEach((d, i) => {
        expect(d).toBeGreaterThanOrEqual(1);
        expect(d).toBeLessThanOrEqual(9);
        expect(t.words[i]).toBe(NUMBER_WORDS[d - 1]);
      });
    }
    expect(createGateTask(seq([0.99, 0, 0.5])).words).toEqual(['neun', 'eins', 'fünf']);
  });

  it('opens only for the right digits in the right order', () => {
    const t = { answer: [7, 2, 5], words: ['sieben', 'zwei', 'fünf'] };
    let s = enterDigit(t, [], 7);
    expect(s).toEqual({ status: 'typing', entered: [7] });
    s = enterDigit(t, [7], 2);
    expect(s).toEqual({ status: 'typing', entered: [7, 2] });
    expect(enterDigit(t, [7, 2], 5)).toEqual({ status: 'open' });
    expect(enterDigit(t, [7], 5)).toEqual({ status: 'wrong' });
    expect(enterDigit(t, [], 2)).toEqual({ status: 'wrong' });
  });
});
