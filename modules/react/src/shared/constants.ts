/**
 * Reference to the global scope object (window in browsers, self in workers)
 *
 * Provides cross-environment access to the global object using the same
 * pattern as React's internal implementation. Prioritizes `self` over
 * `window` to support Web Workers.
 *
 * NOTE: vendored from React
 */
export const globalScope =
  (typeof self !== 'undefined' && self) || (typeof window !== 'undefined' && window);

// Replaced at build time where the bundler defines it, as in deck.gl and graph-layers.
declare const __VERSION__: string | undefined;

/** The package name React DevTools shows for this renderer. */
export const RENDERER_PACKAGE_NAME = '@deck.gl-community/react-fiber';

/** The renderer version React DevTools shows, or a placeholder when running from source. */
export const RENDERER_VERSION =
  typeof __VERSION__ !== 'undefined' ? __VERSION__ : 'untranspiled source';
