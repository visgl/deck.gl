// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
// Copyright (c) Deckgl Fiber Renderer contributors

import {useLayoutEffect} from 'react';
import {isBrowserEnvironment, noop} from './utils';

/**
 * `useLayoutEffect` when a DOM is available, and a no-op during server rendering.
 *
 * Avoids React's server-rendering warning for layout effects. Roots and canvases only
 * touch the DOM from effects, so skipping them on the server is safe.
 */
export const useIsomorphicLayoutEffect: typeof useLayoutEffect = isBrowserEnvironment
  ? useLayoutEffect
  : noop;
