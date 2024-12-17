// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* global document */
import TurfCircle from '@turf/circle';
import {Deck, FirstPersonView, MapView, GeoJsonLayer, BitmapLayer, TileLayer} from 'deck.gl';
import {MaskExtension} from '@deck.gl/extensions';

const GEOMETRIES = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-74.00551557540894, 40.72392515042114],
            [-74.00969982147217, 40.72026611026408],
            [-73.99916410446167, 40.72294942604715],
            [-74.00148153305054, 40.723811316647875],
            [-74.00551557540894, 40.72392515042114]
          ]
        ]
      }
    },
    {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-73.99600982666016, 40.718704858576665],
            [-73.99661064147949, 40.71636291238809],
            [-73.9918041229248, 40.71629785715124],
            [-73.99600982666016, 40.72338850378556],
            [-73.99600982666016, 40.718704858576665]
          ]
        ]
      }
    },
    {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-73.99703979492188, 40.72410403167144],
            [-73.99073123931885, 40.72410403167144],
            [-73.99073123931885, 40.72781164387366],
            [-73.99703979492188, 40.72781164387366],
            [-73.99703979492188, 40.72410403167144]
          ]
        ]
      }
    }
  ]
};

const INITIAL_VIEW_STATE = {
  latitude: 40.7118,
  longitude: -73.998,
  bearing: 0,
  pitch: 30,
  maxPitch: 70,
  minPitch: 20,
  position: [0, 0, 1000]
};

const GEOFENCE_IN_KM = 0.3;

const deckgl = new Deck({
  views: new FirstPersonView({controller: {scrollZoom: true}, far: 5000}),
  initialViewState: INITIAL_VIEW_STATE,
  onHover: ({coordinate}) => {
    redraw(
      coordinate ? [TurfCircle(coordinate, GEOFENCE_IN_KM, {steps: 64, units: 'kilometers'})] : []
    );
  }
});

function redraw(geofence) {
  const layers = [
    new TileLayer({
      data: 'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png',
      minZoom: 0,
      maxZoom: 19,
      tileSize: 256,
      renderSubLayers: props => {
        const {
          bbox: {west, south, east, north}
        } = props.tile;

        return new BitmapLayer(props, {
          data: null,
          image: props.data,
          bounds: [west, south, east, north]
        });
      }
    }),
    new GeoJsonLayer({
      id: 'geofence',
      data: geofence,
      operation: 'mask'
    }),
    new GeoJsonLayer({
      id: 'geofence-geojson',
      data: geofence,
      filled: true,
      stroked: true,
      getFillColor: [0, 222, 255, 50],
      getLineColor: [0, 222, 255],
      lineWidthMinPixels: 3
    }),
    new GeoJsonLayer({
      id: 'geometries',
      data: GEOMETRIES,
      maskId: 'geofence',
      extensions: [new MaskExtension()],
      extruded: true,
      getElevation: 100,
      getFillColor: [255, 41, 66, 180]
    }),
    new GeoJsonLayer({
      id: 'geometries-faded',
      data: GEOMETRIES,
      opacity: 0.01
    })
  ];
  deckgl.setProps({layers});
}
redraw([]);
