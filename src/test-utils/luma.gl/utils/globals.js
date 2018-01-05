// Purpose: include this in your module to avoids adding dependencies on
// micro modules like 'global' and 'is-browser';

/* global process, window, global, document */
const isBrowser =
  typeof process !== 'object' || String(process) !== '[object process]' || process.browser;

module.exports = {
  window: typeof window !== 'undefined' ? window : global,
  global: typeof global !== 'undefined' ? global : window,
  document: typeof document !== 'undefined' ? document : {},
  isBrowser
};
