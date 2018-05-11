// We use `module.exports` instead of `export default` in this file so that using
// require() to access the bundle will return one object instead of {default: ...}.
// `export` must be paired with `import` and `module.exports` must be paired with `require`
// https://github.com/webpack/webpack/issues/4039

/* global window, global */
const lumaGL = require('luma.gl');
const deckGLCore = require('@deck.gl/core');
const deckGLCoreLayers = require('@deck.gl/core-layers');

const DeckGL = require('./deckgl').default;

const _global = typeof window === 'undefined' ? global : window;

_global.deck = Object.assign({}, _global.deck, deckGLCore, deckGLCoreLayers, {DeckGL});
_global.luma = Object.assign({}, _global.luma, lumaGL);

module.exports = _global.deck;
