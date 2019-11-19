import {DeckGLModel, DeckGLView} from './widget';
import createDeckFromDependencies from './initializer';

import * as mapboxgl from 'mapbox-gl';

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

function createDeckWithImport(args) {
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

  const deck = {
    log,
    AggregationLayers,
    Deck,
    FirstPersonView,
    COORDINATE_SYSTEM,
    GeoLayers,
    JSONConverter,
    Layers,
    MapView,
    MeshLayers,
    OrbitView,
    OrthographicView
  };
  const dependencies = {deck, mapboxgl};
  loaders.registerLoaders([CSVLoader, Tile3DLoader, LASWorkerLoader]);
  createDeckFromDependencies({dependencies, jsonConverterConfiguration, ...args});
}

DeckGLView.deckInitFunction = createDeckWithImport;
export {DeckGLView, DeckGLModel};
