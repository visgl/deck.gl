// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
// Copyright (c) Deckgl Fiber Renderer contributors

export {createRoot, unmountAtNode, roots} from './renderer';
export type {ReconcilerRoot} from './types';

/** @internal The DOM roots render it; the renderer recognizes errors it caught by its class. */
export {RootErrorBoundary as _RootErrorBoundary} from './error-boundary';
