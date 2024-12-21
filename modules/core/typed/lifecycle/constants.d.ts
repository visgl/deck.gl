export declare const LIFECYCLE: {
  readonly NO_STATE: 'Awaiting state';
  readonly MATCHED: 'Matched. State transferred from previous layer';
  readonly INITIALIZED: 'Initialized';
  readonly AWAITING_GC: 'Discarded. Awaiting garbage collection';
  readonly AWAITING_FINALIZATION: 'No longer matched. Awaiting garbage collection';
  readonly FINALIZED: 'Finalized! Awaiting garbage collection';
};
export declare type Lifecycle = (typeof LIFECYCLE)[keyof typeof LIFECYCLE];
export declare const COMPONENT_SYMBOL: unique symbol;
export declare const ASYNC_DEFAULTS_SYMBOL: unique symbol;
export declare const ASYNC_ORIGINAL_SYMBOL: unique symbol;
export declare const ASYNC_RESOLVED_SYMBOL: unique symbol;
// # sourceMappingURL=constants.d.ts.map
