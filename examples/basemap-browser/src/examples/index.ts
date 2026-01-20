// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {ExampleCategories} from '../types';
import {
  getAirportLayers,
  getAirportLayersWithGlobe,
  getMultiViewLayers,
  getMultiViewViews,
  getMultiViewInitialViewState,
  getMultiViewLayerFilter
} from '../layers';
import {MAPBOX_STYLE, MAPLIBRE_STYLE} from '../constants';

// Configuration matching get-started examples
const EXAMPLES: ExampleCategories = {
  'Google Maps': {
    'Google Maps Pure JS': {
      name: 'Google Maps Pure JS',
      mapType: 'google-maps',
      framework: 'pure-js',
      initialViewState: {
        latitude: 51.47,
        longitude: 0.45,
        zoom: 4,
        bearing: 0,
        pitch: 30
      },
      getLayers: interleaved => getAirportLayers(interleaved, 'google-maps')
    },
    'Google Maps React': {
      name: 'Google Maps React',
      mapType: 'google-maps',
      framework: 'react',
      initialViewState: {
        latitude: 51.47,
        longitude: 0.45,
        zoom: 4,
        bearing: 0,
        pitch: 30
      },
      getLayers: interleaved => getAirportLayers(interleaved, 'google-maps')
    }
  },
  Mapbox: {
    'Mapbox Pure JS': {
      name: 'Mapbox Pure JS',
      mapType: 'mapbox',
      framework: 'pure-js',
      mapStyle: MAPBOX_STYLE,
      initialViewState: {
        latitude: 51.47,
        longitude: 0.45,
        zoom: 4,
        bearing: 0,
        pitch: 30
      },
      getLayers: interleaved => getAirportLayers(interleaved, 'mapbox')
    },
    'Mapbox React': {
      name: 'Mapbox React',
      mapType: 'mapbox',
      framework: 'react',
      mapStyle: MAPBOX_STYLE,
      initialViewState: {
        latitude: 51.47,
        longitude: 0.45,
        zoom: 4,
        bearing: 0,
        pitch: 30
      },
      getLayers: interleaved => getAirportLayers(interleaved, 'mapbox')
    },
    'Mapbox Multi-View React': {
      name: 'Mapbox Multi-View React',
      mapType: 'mapbox',
      framework: 'react',
      mapStyle: MAPBOX_STYLE,
      multiView: true,
      initialViewState: getMultiViewInitialViewState(),
      getLayers: interleaved =>
        getMultiViewLayers(interleaved, 'Mapbox Multi-View React', 'mapbox'),
      views: getMultiViewViews(),
      layerFilter: getMultiViewLayerFilter
    }
  },
  MapLibre: {
    'MapLibre Pure JS': {
      name: 'MapLibre Pure JS',
      mapType: 'maplibre',
      framework: 'pure-js',
      mapStyle: MAPLIBRE_STYLE,
      initialViewState: {
        latitude: 51.47,
        longitude: 0.45,
        zoom: 4,
        bearing: 0,
        pitch: 30
      },
      getLayers: interleaved => getAirportLayers(interleaved, 'maplibre')
    },
    'MapLibre React': {
      name: 'MapLibre React',
      mapType: 'maplibre',
      framework: 'react',
      mapStyle: MAPLIBRE_STYLE,
      initialViewState: {
        latitude: 51.47,
        longitude: 0.45,
        zoom: 4,
        bearing: 0,
        pitch: 30
      },
      getLayers: interleaved => getAirportLayers(interleaved, 'maplibre')
    },
    'MapLibre Globe Pure JS': {
      name: 'MapLibre Globe Pure JS',
      mapType: 'maplibre',
      framework: 'pure-js',
      mapStyle: MAPLIBRE_STYLE,
      globe: true,
      initialViewState: {
        latitude: 51.47,
        longitude: 0.45,
        zoom: 0,
        bearing: 0,
        pitch: 0
      },
      getLayers: interleaved => getAirportLayersWithGlobe(interleaved, 'maplibre')
    },
    'MapLibre Globe React': {
      name: 'MapLibre Globe React',
      mapType: 'maplibre',
      framework: 'react',
      mapStyle: MAPLIBRE_STYLE,
      globe: true,
      initialViewState: {
        latitude: 51.47,
        longitude: 0.45,
        zoom: 0,
        bearing: 0,
        pitch: 0
      },
      getLayers: interleaved => getAirportLayersWithGlobe(interleaved, 'maplibre')
    },
    'MapLibre Multi-View React': {
      name: 'MapLibre Multi-View React',
      mapType: 'maplibre',
      framework: 'react',
      mapStyle: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
      multiView: true,
      initialViewState: getMultiViewInitialViewState(),
      getLayers: interleaved =>
        getMultiViewLayers(interleaved, 'MapLibre Multi-View React', 'maplibre'),
      views: getMultiViewViews(),
      layerFilter: getMultiViewLayerFilter
    }
  }
};

export default EXAMPLES;
