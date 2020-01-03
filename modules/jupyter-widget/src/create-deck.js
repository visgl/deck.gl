import makeTooltip from './widget-tooltip';

import mapboxgl from './ssr-safe-mapbox';

import {CSVLoader} from '@loaders.gl/csv';
import {Tile3DLoader} from '@loaders.gl/3d-tiles';
import {registerLoaders} from '@loaders.gl/core';

import * as deck from './deck-bundle';

import GL from '@luma.gl/constants';

function extractClasses() {
  // Get classes for registration from standalone deck.gl
  const classesDict = {};
  const classes = Object.keys(deck).filter(x => x.charAt(0) === x.charAt(0).toUpperCase());
  for (const cls of classes) {
    classesDict[cls] = deck[cls];
  }
  return classesDict;
}

// Handle JSONConverter and loaders configuration
const jsonConverterConfiguration = {
  classes: extractClasses(),
  // Will be resolved as `<enum-name>.<enum-value>`
  enumerations: {
    COORDINATE_SYSTEM: deck.COORDINATE_SYSTEM,
    GL
  },

  // Constants that should be resolved with the provided values by JSON converter
  constants: {
    Tile3DLoader
  }
};

registerLoaders([CSVLoader, Tile3DLoader]);

const jsonConverter = new deck.JSONConverter({
  configuration: jsonConverterConfiguration
});

export function updateDeck(inputJSON, deckgl) {
  const results = jsonConverter.convert(inputJSON);
  deckgl.setProps(results);
}

export function createDeck({
  mapboxApiKey,
  container,
  jsonInput,
  tooltip,
  handleClick,
  handleWarning
}) {
  let deckgl;
  try {
    const props = jsonConverter.convert(jsonInput);

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
