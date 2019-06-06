/**
 * The _model_module_version/_view_module_version this package implements.
 *
 * The html widget manager assumes that this is the same as the npm package
 * version number.
 */
/* global __VERSION__ */
export const MODULE_VERSION =
  typeof __VERSION__ !== 'undefined' ? __VERSION__ : 'untranspiled source';

/*
 * The current package name.
 */
export const MODULE_NAME = '@deck.gl/jupyter-widget';
