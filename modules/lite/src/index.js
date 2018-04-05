/* global window */
import * as lumaGL from 'luma.gl';
import * as deckGLCore from '@deck.gl/core';
// import * as deckGLLayers from '@deck.gl/core-layers';

import DeckGL from './deckgl';

if (typeof window !== 'undefined') {
  window.deck = Object.assign({}, window.deck, deckGLCore, {DeckGL});
  window.luma = Object.assign({}, window.luma, lumaGL);
}

export default DeckGL;
export {default as Mapbox} from './mapbox';
