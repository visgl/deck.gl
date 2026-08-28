// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
export const LIFECYCLE = {
    NO_STATE: 'Awaiting state',
    MATCHED: 'Matched. State transferred from previous layer',
    INITIALIZED: 'Initialized',
    AWAITING_GC: 'Discarded. Awaiting garbage collection',
    AWAITING_FINALIZATION: 'No longer matched. Awaiting garbage collection',
    FINALIZED: 'Finalized! Awaiting garbage collection'
};
/* Secret props keys */
// Symbols are non-enumerable by default, does not show in for...in or Object.keys
// but are copied with Object.assign ¯\_(ツ)_/¯
// Supported everywhere except IE11, can be polyfilled with core-js
export const COMPONENT_SYMBOL = Symbol.for('component');
export const PROP_TYPES_SYMBOL = Symbol.for('propTypes');
export const DEPRECATED_PROPS_SYMBOL = Symbol.for('deprecatedProps');
export const ASYNC_DEFAULTS_SYMBOL = Symbol.for('asyncPropDefaults');
export const ASYNC_ORIGINAL_SYMBOL = Symbol.for('asyncPropOriginal');
export const ASYNC_RESOLVED_SYMBOL = Symbol.for('asyncPropResolved');
//# sourceMappingURL=constants.js.map