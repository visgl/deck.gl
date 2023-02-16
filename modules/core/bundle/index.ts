// We use `require` here because luma and deck core must be imported before `global`
import * as LumaGL from '../src/scripting/lumagl';
import * as LoadersGL from '../src/scripting/loadersgl';

globalThis.luma = globalThis.luma || {};
globalThis.loaders = globalThis.loaders || {};

Object.assign(globalThis.luma, LumaGL);
Object.assign(globalThis.loaders, LoadersGL);

export * from '../src';
export {register as _registerLoggers} from '../src/debug';

export {default as DeckGL} from '../src/scripting/deckgl';
