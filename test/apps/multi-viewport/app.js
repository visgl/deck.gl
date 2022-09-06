/* global document */
import React, {Component} from 'react';
import {render} from 'react-dom';
import {StaticMap} from 'react-map-gl';
import TurfCircle from '@turf/circle';

import {Deck, FirstPersonView, MapView, GeoJsonLayer, BitmapLayer, TileLayer} from 'deck.gl';

import {MaskExtension} from '@deck.gl/extensions';

const GEOMETRIES = JSON.parse(
  '{"type":"FeatureCollection","features":[{"type":"Feature","properties":{},"geometry":{"type":"Polygon","coordinates":[[[-74.00551557540894,40.72392515042114],[-74.00969982147217,40.72026611026408],[-74.00206089019774,40.71393956189477],[-73.99783372879028,40.71886749066927],[-73.99916410446167,40.72294942604715],[-74.00148153305054,40.723811316647875],[-74.00551557540894,40.72392515042114]]]}},{"type":"Feature","properties":{},"geometry":{"type":"Polygon","coordinates":[[[-73.99600982666016,40.718704858576665],[-73.99661064147949,40.71636291238809],[-73.9918041229248,40.71629785715124],[-73.98849964141846,40.71922527987441],[-73.98794174194336,40.72316083420869],[-73.99600982666016,40.72338850378556],[-73.99600982666016,40.718704858576665]]]}},{"type":"Feature","properties":{},"geometry":{"type":"Polygon","coordinates":[[[-73.99789810180664,40.728494602539605],[-73.99789810180664,40.728494602539605],[-73.99789810180664,40.728494602539605],[-73.99789810180664,40.728494602539605]]]}},{"type":"Feature","properties":{},"geometry":{"type":"Polygon","coordinates":[[[-73.99703979492188,40.72410403167144],[-73.99073123931885,40.72410403167144],[-73.99073123931885,40.72781164387366],[-73.99703979492188,40.72781164387366],[-73.99703979492188,40.72410403167144]]]}},{"type":"Feature","properties":{},"geometry":{"type":"LineString","coordinates":[[-74.00206089019774,40.72657579608992],[-73.99708271026611,40.719192753662504],[-74.00158882141113,40.71291489723403]]}}]}'
);

const INITIAL_VIEW_STATE = {
  latitude: 40.72185171902871,
  longitude: -73.99830043315887,
  bearing: 90,
  pitch: 0,
  maxPitch: 90,
  minPitch: 0
};

const INITIAL_VIEW_STATE_FPV = {
  ...INITIAL_VIEW_STATE,
  position: [0, 0, 100]
};

const INITIAL_VIEW_STATE_MAP = {
  ...INITIAL_VIEW_STATE,
  zoom: 15
};

const GEOFENCE_IN_KM = 0.5;

const deckgl = new Deck({
  // views: new FirstPersonView({controller: {scrollZoom: true}}),
  // initialViewState: INITIAL_VIEW_STATE_FPV,

  views: new MapView({controller: {scrollZoom: true}}),
  initialViewState: INITIAL_VIEW_STATE_MAP,

  onHover: ({coordinate}) => {
    redraw(
      coordinate ? [TurfCircle(coordinate, GEOFENCE_IN_KM, {steps: 20, units: 'kilometers'})] : []
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
      filled: false
    }),
    new GeoJsonLayer({
      id: 'geometries',
      data: GEOMETRIES,
      // filled: false,
      maskId: 'geofence',
      extensions: [new MaskExtension()]
    })
  ];
  deckgl.setProps({layers});
}
redraw([]);
