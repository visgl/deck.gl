/* global window */
if (window.require) {
  window.require.config({
    map: {
      '*': {
        pydeck: 'nbextensions/pydeck/index'
      }
    }
  });
}

module.exports = {
  load_ipython_extension() {}

};
//# sourceMappingURL=extension.js.map