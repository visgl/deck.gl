/* eslint-disable */
// Required for local Python development
// Entry point for the notebook bundle containing custom model definitions.
define(function() {
  'use strict';

  window['requirejs'].config({
    map: {
      '*': {
        '@deck.gl/jupyter-widget': 'nbextensions/pydeck/index'
      }
    }
  });
  // Export the required load_ipython_extension function
  return {
    load_ipython_extension: function() {}
  };
});
