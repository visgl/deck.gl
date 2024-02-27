import {useEffect, useLayoutEffect} from 'react';
import {isDefined, isFn} from './utils';

/**
 * An SSR-friendly useLayoutEffect.
 *
 * React currently throws a warning when using useLayoutEffect on the server.
 * To get around it, we can conditionally useEffect on the server (no-op) and
 * useLayoutEffect elsewhere.
 *
 * @see https://github.com/facebook/react/issues/14927
 */
export const useIsomorphicLayoutEffect =
  // eslint-disable-next-line
  isDefined(window) && isFn(window.document?.createElement) ? useLayoutEffect : useEffect;
