/* global window, document */

// See https://github.com/jupyter-widgets/widget-ts-cookiecutter/blob/master/%7B%7Bcookiecutter.github_project_name%7D%7D/src/extension.ts
// Entry point for the Jupyter Notebook bundle containing custom Backbone model and view definitions.

// Some static assets may be required by the custom widget javascript. The base
// url for the notebook is not known at build time and is therefore computed dynamically.
const dataBaseUrl = document.body && document.body.getAttribute('data-base-url');
if (dataBaseUrl) {
  window.__webpack_public_path__ = `${dataBaseUrl}nbextensions/pydeck/nb_extension`;
}

const {createDeck, updateDeck, loadExternalClasses} = require('./lib/create-deck');
const {MODULE_VERSION, MODULE_NAME} = require('./version');

// Initialize the

// TODO - rename these exports to DeckWidgetModel and DeckWidgetView...
let TransportWidgetModel = null;
let TransportWidgetView = null;
try {
  TransportWidgetModel = require('./transports/jupyter/transport-widget-model');
  TransportWidgetView = require('./transports/jupyter/transport-widget-view');
} catch (err) {
  // TODO - when does this happen? Not even a console warning?
}

module.exports = {
  TransportWidgetModel,
  TransportWidgetView,
  MODULE_VERSION,
  MODULE_NAME,

  // DEPRECATED: Backwards compatibility
  DeckGLView: TransportWidgetView,
  DeckGLModel: TransportWidgetModel,

  // FOR TESTING ONLY?
  createDeck,
  updateDeck,
  loadExternalClasses // TODO - unused
};
