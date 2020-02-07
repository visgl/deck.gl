/* global window, document */

// See https://github.com/jupyter-widgets/widget-ts-cookiecutter/blob/master/%7B%7Bcookiecutter.github_project_name%7D%7D/src/extension.ts
// Entry point for the Jupyter Notebook bundle containing custom Backbone model and view definitions.

// Some static assets may be required by the custom widget javascript. The base
// url for the notebook is not known at build time and is therefore computed
// dynamically.
const dataBaseUrl = document.body && document.body.getAttribute('data-base-url');
if (dataBaseUrl) {
  window.__webpack_public_path__ = `${dataBaseUrl}nbextensions/pydeck/nb_extension`;
}

let DeckGLModel;
let DeckGLView;
const {createDeck, updateDeck} = require('./create-deck');
const {MODULE_VERSION, MODULE_NAME} = require('./version');

try {
  const widgetClasses = require('./widget');
  DeckGLView = widgetClasses.DeckGLView;
  DeckGLModel = widgetClasses.DeckGLModel;
} catch (err) {
  DeckGLModel = null;
  DeckGLView = null;
}

module.exports = {
  DeckGLView,
  DeckGLModel,
  MODULE_VERSION,
  MODULE_NAME,
  createDeck,
  updateDeck
};
