export const LIFECYCLE = {
  NO_STATE: 'Awaiting state',
  MATCHED: 'Matched. State transferred from previous layer',
  INITIALIZED: 'Initialized',
  AWAITING_GC: 'Discarded. Awaiting garbage collection',
  AWAITING_FINALIZATION: 'No longer matched. Awaiting garbage collection',
  FINALIZED: 'Finalized! Awaiting garbage collection'
} as const;

export type Lifecycle = typeof LIFECYCLE[keyof typeof LIFECYCLE];

/* Secret props keys */
// Symbols are non-enumerable by default, does not show in for...in or Object.keys
// but are copied with Object.assign ¯\_(ツ)_/¯
// Supported everywhere except IE11, can be polyfilled with core-js
export const COMPONENT: unique symbol = Symbol.for('component');
export const ASYNC_DEFAULTS: unique symbol = Symbol.for('asyncPropDefaults');
export const ASYNC_ORIGINAL: unique symbol = Symbol.for('asyncPropOriginal');
export const ASYNC_RESOLVED: unique symbol = Symbol.for('ASYNC_RESOLVED');
