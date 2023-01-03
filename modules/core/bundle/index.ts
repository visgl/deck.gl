// We use `require` here because luma and deck core must be imported before `global`
import * as LumaGL from './lumagl';
import {registerLoaders, load, parse, fetchFile} from '@loaders.gl/core';

globalThis.luma = globalThis.luma || {};
globalThis.loaders = globalThis.loaders || {};

Object.assign(globalThis.luma, LumaGL);
Object.assign(globalThis.loaders, {registerLoaders, load, parse, fetchFile});

export * from '../src';
export {register as _registerLoggers} from '../src/debug';

export {default as DeckGL} from './deckgl';
