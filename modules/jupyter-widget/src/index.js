// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/**
 * Standalone entry point, bundled as UMD with an empty global name so that `createDeck` and
 * `updateDeck` become window globals. Used by pydeck's `Deck.to_html()` template and the CDN build.
 * The Jupyter widget uses the anywidget entry point in ./widget.js instead.
 */
import {exposeGlobals} from './lib/globals';
import {createDeck, updateDeck} from './playground/create-deck';

exposeGlobals();

export {createDeck, updateDeck};
