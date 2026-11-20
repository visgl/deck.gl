// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
// Copyright (c) Deckgl Fiber Renderer contributors

export {createDeckGL, DeckGL} from './components';
/**
 * Re-export public types from the package root.
 *
 * This supports:
 * ```ts
 * import {type DeckGLProps} from '@deck.gl/react';
 * ```
 */
export type {DeckGLRootProps, DeckGLProps, OnDeckChange} from '../types/index';
export {DeckCanvas as _DeckCanvas} from './deck-canvas';
export {
  createEffectComponent,
  createLayerComponent,
  createViewComponent,
  createWidgetComponent
} from '../wrappers/factories';
export type {DeckCanvasProps} from './deck-canvas';
