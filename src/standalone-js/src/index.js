/* global window */
import * as LumaGL from 'luma.gl';
import * as deckglCore from 'deck.gl/core';
import * as deckglLayers from 'deck.gl/core-layers';

import DeckGL from './deckgl';

Object.assign(DeckGL, deckglCore, deckglLayers);

if (typeof window !== 'undefined') {
  window.DeckGL = DeckGL;
  window.LumaGL = LumaGL;
}

export default DeckGL;
