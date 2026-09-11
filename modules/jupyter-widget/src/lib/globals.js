// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* global globalThis */
import * as deckExports from '../deck-bundle';
import * as lumaExports from '@deck.gl/core/scripting/lumagl';
import * as loadersExports from '@deck.gl/core/scripting/loadersgl';

/**
 * Expose deck.gl, luma.gl and loaders.gl on the global scope so that custom libraries loaded via
 * pydeck's `settings.custom_libraries` can resolve their externals against the same instance.
 */
export function exposeGlobals() {
  if (!globalThis.deck) {
    globalThis.deck = deckExports;
  }
  if (!globalThis.luma) {
    globalThis.luma = lumaExports;
  }
  if (!globalThis.loaders) {
    globalThis.loaders = loadersExports;
  }
}
