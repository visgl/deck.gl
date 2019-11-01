import {MODULE_VERSION, MODULE_NAME} from './version';
import {createDeck} from './utils';
import {fetchDependencies} from './fetch-dependencies';

const deckglwidget = {
  MODULE_VERSION,
  MODULE_NAME,
  createDeck,
  fetchDependencies
};

/* global window, global */
const _global = typeof window === 'undefined' ? global : window;
_global.deckglwidget = {};

Object.assign(_global.deckglwidget, deckglwidget);

module.exports = _global.deck;
