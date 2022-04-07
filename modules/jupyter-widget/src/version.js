/**
 * The _model_module_version/_view_module_version this package implements.
 *
 * The html widget manager assumes that this is the same as the npm package
 * version number.
 */

export const MODULE_VERSION =
  typeof __VERSION__ === 'undefined' ? 'untranspiled source' : __VERSION__;
export const MODULE_NAME = '@deck.gl/jupyter-widget';
