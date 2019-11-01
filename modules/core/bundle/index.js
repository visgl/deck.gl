// We use `require` here because luma and deck core must be imported before `global`
const LumaGL = require('./lumagl');
const deckGLCore = require('../src');

const DeckGL = require('./deckgl').default;
const {registerLoaders, load, parse} = require('@loaders.gl/core');

/* global window, global */
const _global = typeof window === 'undefined' ? global : window;
_global.deck = _global.deck || {};
_global.luma = _global.luma || {};
_global.loaders = _global.loaders || {};

Object.assign(_global.deck, deckGLCore, {DeckGL});
Object.assign(_global.luma, LumaGL);
Object.assign(_global.loaders, {registerLoaders, load, parse});

module.exports = _global.deck;
