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
export const PROP_SYMBOLS = {
  COMPONENT: Symbol('component'),
  ASYNC_DEFAULTS: Symbol('asyncPropDefaults'),
  ASYNC_ORIGINAL: Symbol('asyncPropOriginal'),
  ASYNC_RESOLVED: Symbol('asyncPropResolved')
};
