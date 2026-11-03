import { useEffect, useState } from 'react';

/**
 * Pino offers help after `seconds` without progress (profile rule, parents can switch it off).
 * Any snapped piece or a requested hint resets the timer. Returns whether the offer is shown.
 */
export function useHintOffer(progressKey: number, seconds: number | null, enabled: boolean, busy: boolean) {
  const [offeredFor, setOfferedFor] = useState<number | null>(null);
  useEffect(() => {
    if (!enabled || seconds === null || busy) return;
    const timer = setTimeout(() => setOfferedFor(progressKey), seconds * 1000);
    return () => clearTimeout(timer);
  }, [progressKey, seconds, enabled, busy]);
  const offered = enabled && !busy && offeredFor === progressKey;
  return { offered, dismiss: () => setOfferedFor(null) };
}
