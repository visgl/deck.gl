// @ts-nocheck
// Luma and deck core must be imported before `global`
/* eslint-disable import/no-extraneous-dependencies */
import * as LumaGL from '@deck.gl/core/scripting/lumagl';
import * as LoadersGL from '@deck.gl/core/scripting/loadersgl';

globalThis.luma = globalThis.luma || {};
globalThis.loaders = globalThis.loaders || {};

Object.assign(globalThis.luma, LumaGL);
Object.assign(globalThis.loaders, LoadersGL);

// Import from package name instead of relative path
// This will be resolved to src or dist by esbuild depending on bundle settings
// dist has TS transformers applied
export * from '@deck.gl/core';
export {register as _registerLoggers} from '@deck.gl/core/debug';

export {default as DeckGL} from '@deck.gl/core/scripting/deckgl';
