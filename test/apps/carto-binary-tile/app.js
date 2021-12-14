/* global document */
/* eslint-disable no-console */
import React, {useState} from 'react';
import {render} from 'react-dom';
import Protobuf from 'pbf';
import DeckGL from '@deck.gl/react';
import {ClipExtension} from '@deck.gl/extensions';
import {MVTLayer} from '@deck.gl/geo-layers';
import {CartoLayer, FORMATS, MAP_TYPES} from '@deck.gl/carto';
import {GeoJsonLayer} from '@deck.gl/layers';
import {geojsonToBinary} from '@loaders.gl/gis';

const INITIAL_VIEW_STATE = {longitude: -73.95643, latitude: 40.8039, zoom: 9};
const COUNTRIES =
  'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_admin_0_scale_rank.geojson';

const apiBaseUrl = 'https://direct-gcp-us-east1.api.carto.com';
const connection = 'alasarr';
const table = 'cartodb-gcp-backend-data-team.dynamic_tiling.polygons_3k_usacounty_viz';

const token =
  'eyJhbGciOiJIUzI1NiJ9.eyJhIjoiYWNfN3hoZnd5bWwiLCJqdGkiOiIyNjkxNTAzOCJ9.v-XDXqLX3oJ_xcbs7pf6_TjM0-u5nuLYFnfBUNWVr_E';

const showBasemap = true;
const showCarto = true;

function Root() {
  return (
    <>
      <DeckGL
        initialViewState={INITIAL_VIEW_STATE}
        controller={true}
        layers={[showBasemap && createBasemap(), showCarto && createCarto()]}
      />
    </>
  );
}

function createBasemap() {
  return new GeoJsonLayer({
    id: 'base-map',
    data: COUNTRIES,
    // Styles
    stroked: true,
    filled: true,
    lineWidthMinPixels: 2,
    opacity: 0.4,
    getLineColor: [60, 60, 60],
    getFillColor: [200, 200, 200]
  });
}

function createCarto() {
  return new CartoLayer({
    id: 'carto',
    connection,
    data: table,
    credentials: {
      accessToken: token
    },

    // Dynamic tiling. Request TILEJSON format with TABLE
    type: MAP_TYPES.TABLE,
    format: FORMATS.TILEJSON,

    // Styling
    getFillColor: [233, 71, 251],
    getElevation: 1000,
    // extruded: true,
    stroked: true,
    filled: true,
    pointType: 'circle',
    pointRadiusUnits: 'pixels',
    lineWidthMinPixels: 0.5,
    getPointRadius: 1.5,
    getLineColor: [0, 0, 200]
  });
}

render(<Root />, document.body.appendChild(document.createElement('div')));
