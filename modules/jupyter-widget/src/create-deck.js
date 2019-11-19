/* global document */

import {DeckGLModel, DeckGLView} from './widget';
import makeTooltip from './widget-tooltip';

const IN_NODE = typeof process === 'object';
const mapboxgl = IN_NODE ? require('mapbox-gl') : {};

import {CSVLoader} from '@loaders.gl/csv';
import {Tile3DLoader} from '@loaders.gl/3d-tiles';
import {LASWorkerLoader} from '@loaders.gl/las';
import * as loaders from '@loaders.gl/core';

import {
  COORDINATE_SYSTEM,
  Deck,
  MapView,
  FirstPersonView,
  OrbitView,
  OrthographicView,
  log
} from '@deck.gl/core';

// import {DeckGL} from '@deck.gl/core/bundle';
import * as Layers from '@deck.gl/layers';
import * as AggregationLayers from '@deck.gl/aggregation-layers';
import * as GeoLayers from '@deck.gl/geo-layers';
import * as MeshLayers from '@deck.gl/mesh-layers';
import GL from '@luma.gl/constants';

import {JSONConverter} from '@deck.gl/json';

function createDeckWithImports(args) {
  // Handle JSONConverter and loaders configuration
  const jsonConverterConfiguration = {
    classes: Object.assign(
      {MapView, FirstPersonView, OrbitView, OrthographicView},
      Layers,
      AggregationLayers,
      GeoLayers,
      MeshLayers
    ),

    // Will be resolved as `<enum-name>.<enum-value>`
    enumerations: {
      COORDINATE_SYSTEM,
      GL
    },

    // Constants that should be resolved with the provided values by JSON converter
    constants: {
      Tile3DLoader,
      LASWorkerLoader
    }
  };

  loaders.registerLoaders([CSVLoader, Tile3DLoader, LASWorkerLoader]);
  createDeck({jsonConverterConfiguration, ...args});
}

function createDeck({
  jsonConverterConfiguration,
  mapboxApiKey,
  container,
  jsonInput,
  tooltip,
  onComplete,
  handleClick,
  handleWarning
}) {
  try {
    // Filter down to the deck.gl classes of interest

    const jsonConverter = new JSONConverter({
      configuration: jsonConverterConfiguration
    });

    const props = jsonConverter.convert(jsonInput);

    const getTooltip = makeTooltip(tooltip);

    container.appendChild(document.createElement('canvas'));
    const canvas = container.firstElementChild;

    const deckgl = new Deck({
      ...props,
      map: mapboxgl,
      mapboxApiAccessToken: mapboxApiKey,
      onClick: handleClick,
      getTooltip,
      canvas
    });

    const warn = log.warn;
    // TODO overrride console.warn instead
    // Right now this isn't doable (in a Notebook at least)
    // because the widget loads in deck.gl (and its logger) before @deck.gl/jupyter-widget
    log.warn = injectFunction(warn, handleWarning);

    if (onComplete) {
      onComplete({jsonConverter, deckgl});
    }
  } catch (err) {
    // This will fail in node tests
    // eslint-disable-next-line
    console.error(err);
  }
  return {};
}

function injectFunction(warnFunction, messageHandler) {
  return (...args) => {
    messageHandler(...args);
    return warnFunction(...args);
  };
}

DeckGLView.deckInitFunction = createDeckWithImports;
export {DeckGLView, DeckGLModel, createDeckWithImports};
