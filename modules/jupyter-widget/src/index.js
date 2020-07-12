/* global window, document */

// See https://github.com/jupyter-widgets/widget-ts-cookiecutter/blob/master/%7B%7Bcookiecutter.github_project_name%7D%7D/src/extension.ts
// Entry point for the Jupyter Notebook bundle containing custom Backbone model and view definitions.

// Some static assets may be required by the custom widget javascript. The base
// url for the notebook is not known at build time and is therefore computed dynamically.
const dataBaseUrl = document.body && document.body.getAttribute('data-base-url');
if (dataBaseUrl) {
  window.__webpack_public_path__ = `${dataBaseUrl}nbextensions/pydeck/nb_extension`;
}

// Initialize the transport
const {jupyterTransport} = require('./lib/jupyter-transport').default;

let JupyterTransportModel = null;
let JupyterTransportView = null;
try {
  JupyterTransportModel = require('./lib/jupyter-transport-model').default;
  JupyterTransportView = require('./lib/jupyter-transport-view').default;
} catch (err) {
  // Note: Happens in the to_html() case
}

const {MODULE_VERSION, MODULE_NAME} = require('./version');

// TODO - this should be placed in a separate module `@deck.gl/playground`
const {createDeck, updateDeck} = require('./playground/create-deck');
const {initPlayground} = require('./playground');
initPlayground();

module.exports = {
  // Transports
  jupyterTransport,

  // Jupyter Hooks
  MODULE_VERSION,
  MODULE_NAME,
  JupyterTransportModel,
  JupyterTransportView,

  // For to_html()...
  initPlayground,
  // TODO - use playground?
  createDeck,
  updateDeck
};
