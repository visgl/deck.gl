/* global window, document */

// See https://github.com/jupyter-widgets/widget-ts-cookiecutter/blob/master/%7B%7Bcookiecutter.github_project_name%7D%7D/src/extension.ts
// Entry point for the Jupyter Notebook bundle containing custom Backbone model and view definitions.

import {MODULE_VERSION, MODULE_NAME} from './version';
// TODO - this should be placed in a separate module `@deck.gl/playground`
import {createDeck, updateDeck} from './playground/create-deck';
import {initPlayground} from './playground';
import jupyterTransport from './lib/jupyter-transport';
import JupyterTransportModel from './lib/jupyter-transport-model';
import JupyterTransportView from './lib/jupyter-transport-view';

// eslint-disable-next-line import/namespace
import * as deckExports from './deck-bundle';
import * as lumaExports from '@deck.gl/core/scripting/lumagl';
import * as loadersExports from '@deck.gl/core/scripting/loadersgl';

// Some static assets may be required by the custom widget javascript. The base
// url for the notebook is not known at build time and is therefore computed dynamically.
const dataBaseUrl = document.body && document.body.getAttribute('data-base-url');
if (dataBaseUrl) {
  // @ts-expect-error undefined global property
  window.__webpack_public_path__ = `${dataBaseUrl}nbextensions/pydeck/nb_extension`;
}

// Initialize the transport

initPlayground();

// Expose deck
globalThis.deck = globalThis.deck || {};
Object.assign(globalThis.deck, deckExports);

// Expose luma
globalThis.luma = globalThis.luma || {};
Object.assign(globalThis.luma, lumaExports);

// Expose loaders
globalThis.loaders = globalThis.loaders || {};
Object.assign(globalThis.loaders, loadersExports);

export {
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
