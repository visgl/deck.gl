/* global __VERSION__ */
/**
 * The _model_module_version/_view_module_version this package implements.
 *
 * The html widget manager assumes that this is the same as the npm package
 * version number.
 */
let version;

// JupyterLab path
if (typeof __VERSION__ === 'undefined') {
  const deck = require('../dist/index');
  version = deck.version;
} else {
  // Standard build
  version = __VERSION__;
}

export const MODULE_VERSION = version;
export const MODULE_NAME = '@deck.gl/jupyter-widget';
