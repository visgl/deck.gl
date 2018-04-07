/* global window, global */
import * as lumaGL from 'luma.gl';
import * as deckGLCore from '@deck.gl/core';

import DeckGL from './deckgl';

const _global = typeof window === 'undefined' ? global : window;

_global.deck = Object.assign({}, _global.deck, deckGLCore, {DeckGL});
_global.luma = Object.assign({}, _global.luma, lumaGL);

export default _global.deck;
