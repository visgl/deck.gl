// We use `require` here because luma and deck core must be imported before `global`
import * as LumaGL from './lumagl';
import * as deckGLCore from '../src';

import DeckGL from './deckgl';
import {registerLoaders, load, parse, fetchFile} from '@loaders.gl/core';

/* global window, global */
const _global: any = typeof window === 'undefined' ? global : window;
_global.deck = _global.deck || {};
_global.luma = _global.luma || {};
_global.loaders = _global.loaders || {};

Object.assign(_global.deck, deckGLCore, {DeckGL});
Object.assign(_global.luma, LumaGL);
Object.assign(_global.loaders, {registerLoaders, load, parse, fetchFile});

export default _global.deck;
