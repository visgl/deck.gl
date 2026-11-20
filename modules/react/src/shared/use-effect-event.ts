// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {useInsertionEffect, useRef} from 'react';

/**
 * Returns a stable function that invokes the latest committed callback.
 *
 * This compatibility implementation intentionally has a stable identity, unlike
 * React's native `useEffectEvent`, which callers rely on (for example as an effect dependency).
 * Keep it internal so it can't be confused with the native hook.
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
