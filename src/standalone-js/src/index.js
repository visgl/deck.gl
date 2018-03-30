/* global window */
import * as lumaGL from 'luma.gl';
import * as deckGLCore from 'deck.gl/core';
import * as deckGLLayers from 'deck.gl/core-layers';

import Deck from './deck';

if (typeof window !== 'undefined') {
  window.deck = Object.assign({}, window.deck, deckGLCore, deckGLLayers, {Deck});
  window.luma = Object.assign({}, window.luma, lumaGL);
}

export default Deck;
