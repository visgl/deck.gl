/* global window */
import makeTooltip from './widget-tooltip';

import mapboxgl from './ssr-safe-mapbox';

import {CSVLoader} from '@loaders.gl/csv';
import {Tiles3DLoader, CesiumIonLoader} from '@loaders.gl/3d-tiles';
import {registerLoaders} from '@loaders.gl/core';

import * as deck from './deck-bundle';

import {loadScript} from './script-utils';

import GL from '@luma.gl/constants';

function extractClasses(library) {
  // Extracts exported class constructors as a dictionary from a library
  const classesDict = {};
  const classes = Object.keys(library).filter(x => x.charAt(0) === x.charAt(0).toUpperCase());
  for (const cls of classes) {
    classesDict[cls] = library[cls];
  }
  return classesDict;
}

// Handle JSONConverter and loaders configuration
const jsonConverterConfiguration = {
  classes: extractClasses(deck),
  // Will be resolved as `<enum-name>.<enum-value>`
  enumerations: {
    COORDINATE_SYSTEM: deck.COORDINATE_SYSTEM,
    GL
  },

  // Constants that should be resolved with the provided values by JSON converter
  constants: {
    Tiles3DLoader,
    CesiumIonLoader
  }
};

registerLoaders([CSVLoader, Tiles3DLoader]);

const jsonConverter = new deck.JSONConverter({
  configuration: jsonConverterConfiguration
});

function loadExternalLibrary({libraryName, resourceUri, onComplete}, loadResource = loadScript) {
  // NOTE loadResource is for testing only
  loadResource(resourceUri).then(res => {
    const module = window[libraryName];
    const newConfiguration = {
      classes: extractClasses(module)
    };
    jsonConverter.mergeConfiguration(newConfiguration);
    if (onComplete) onComplete();
  });
}

function addCustomLibraries(customLibraries) {
  if (!customLibraries) {
    return;
  }
  for (const {libraryName, resourceUri} of customLibraries) {
    loadExternalLibrary({libraryName, resourceUri});
  }
}

function updateDeck(inputJson, deckgl) {
  const results = jsonConverter.convert(inputJson);
  deckgl.setProps(results);
}

function createDeck({
  mapboxApiKey,
  container,
  jsonInput,
  tooltip,
  handleClick,
  handleWarning,
  customLibraries
}) {
  let deckgl;
  try {
    const props = jsonConverter.convert(jsonInput);

    addCustomLibraries(customLibraries);
    const getTooltip = makeTooltip(tooltip);

    deckgl = new deck.DeckGL({
      ...props,
      map: mapboxgl,
      mapboxApiAccessToken: mapboxApiKey,
      onClick: handleClick,
      getTooltip,
      container
    });

    // TODO overrride console.warn instead
    // Right now this isn't doable (in a Notebook at least)
    // because the widget loads in deck.gl (and its logger) before @deck.gl/jupyter-widget
    if (handleWarning) {
      const warn = deck.log.warn;
      deck.log.warn = injectFunction(warn, handleWarning);
    }
  } catch (err) {
    // This will fail in node tests
    // eslint-disable-next-line
    console.error(err);
  }
  return deckgl;
}

function injectFunction(warnFunction, messageHandler) {
  return (...args) => {
    messageHandler(...args);
    return warnFunction(...args);
  };
}

export {jsonConverter, createDeck, updateDeck, loadExternalLibrary};
