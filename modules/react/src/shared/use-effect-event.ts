import {useInsertionEffect, useRef} from 'react';

/**
 * Returns a stable function that invokes the latest committed callback.
 *
 * This compatibility implementation intentionally has a stable identity, unlike
 * React's native `useEffectEvent`. Keep it internal so callers cannot depend on
 * that difference while React 19.0 and 19.1 remain supported.
 */
export function useEffectEvent<Args extends unknown[], Return>(
  callback: (...args: Args) => Return
): (...args: Args) => Return {
  const callbackRef = useRef(callback);
  const eventRef = useRef<(...args: Args) => Return>(undefined!);

  useInsertionEffect(() => {
    callbackRef.current = callback;
  });

  if (!eventRef.current) {
    eventRef.current = (...args) => callbackRef.current(...args);
  }

  return eventRef.current;
}
