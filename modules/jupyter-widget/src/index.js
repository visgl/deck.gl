/* global window, document */
// See https://github.com/jupyter-widgets/widget-ts-cookiecutter/blob/master/%7B%7Bcookiecutter.github_project_name%7D%7D/src/extension.ts
// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

// Entry point for the notebook bundle containing custom model definitions.
//
// Setup notebook base URL
//
// Some static assets may be required by the custom widget javascript. The base
// url for the notebook is not known at build time and is therefore computed
// dynamically.
//
const dataBaseUrl = document.querySelector('body').getAttribute('data-base-url');
if (dataBaseUrl) {
  window.__webpack_public_path__ = `${dataBaseUrl}nbextensions/pydeck/nb_extension`;
}

export {MODULE_VERSION, MODULE_NAME} from './version';
export {DeckGLModel, DeckGLView} from './widget';
export {initDeck} from './utils';
