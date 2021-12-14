/* global document */
/* eslint-disable no-console */
import React, {useState} from 'react';
import {render} from 'react-dom';
import {Tile} from './carto-tile';
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

// Guess based on table name
let geomType;
if (table.includes('points')) geomType = 'points';
else if (table.includes('lines')) geomType = 'lines';
else if (table.includes('polygons')) geomType = 'polygons';

const token =

function buildUrl({formatTiles}) {
  return `${apiBaseUrl}/v3/maps/${connection}/table/{z}/{x}/{y}?name=${table}&cache=&access_token=${token}&formatTiles=${formatTiles}&geomType=${geomType}`;
}

const geojson = false;
const wip = true;
const showBasemap = true;
const showCBT = false;
const showCarto = true;

function Root() {
  return (
    <>
      <DeckGL
        initialViewState={INITIAL_VIEW_STATE}
        controller={true}
        layers={[
          showBasemap && createBasemap(),
          showCBT && createCBT(),
          showCarto && createCarto()
        ]}
      />
    </>
  );
}

function tileToBinary(tile) {
  // Convert to typed arrays
  tile.points.positions.value = new Float32Array(tile.points.positions.value);

  tile.lines.positions.value = new Float32Array(tile.lines.positions.value);
  tile.lines.pathIndices.value = new Uint16Array(tile.lines.pathIndices.value);
  tile.lines.globalFeatureIds = tile.lines.featureIds; // HACK to fix missing data from API

  tile.polygons.positions.value = new Float32Array(tile.polygons.positions.value);
  tile.polygons.polygonIndices.value = new Uint16Array(tile.polygons.polygonIndices.value);
  tile.polygons.primitivePolygonIndices.value = new Uint16Array(
    tile.polygons.primitivePolygonIndices.value
  );
  tile.polygons.globalFeatureIds = tile.polygons.featureIds; // HACK to fix missing data from API

  return {
    points: {type: 'Point', numericProps: {}, properties: [], ...tile.points},
    lines: {type: 'LineString', numericProps: {}, properties: [], ...tile.lines},
    polygons: {type: 'Polygon', numericProps: {}, properties: [], ...tile.polygons}
  };
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

const parseJSON = arrayBuffer => {
  return JSON.parse(new TextDecoder().decode(arrayBuffer));
};

const parseCBT = (arrayBuffer, options) => {
  if (!arrayBuffer) return null;
  if (geojson) return geojsonToBinary(parseJSON(arrayBuffer).features);
  const tile = wip ? parseJSON(arrayBuffer) : parsePbf(arrayBuffer);
  const binary = tileToBinary(tile);
  return binary;
};

const CBTLoader = {
  name: 'CARTO Binary Tile',
  id: 'cbt',
  module: 'carto',
  version: 'dev',
  extensions: ['pbf'],
  mimeTypes: ['application/x-protobuf'],
  category: 'geometry',
  worker: false,
  parse: async (arrayBuffer, options) => parseCBT(arrayBuffer, options),
  parseSync: parseCBT
};

class CBTLayer extends MVTLayer {
  renderSubLayers(props) {
    if (props.data === null ) {
      return null;
    }

    props.autoHighlight = false;

    const {
      bbox: {west, south, east, north}
    } = props.tile;
    props.extensions = [new ClipExtension()];
    props.clipBounds = [west, south, east, north];

    const subLayer = new GeoJsonLayer({
      ...props
    });
    return subLayer;
  }
}

CBTLayer.layerName = 'CBTLayer';
CBTLayer.defaultProps = {...MVTLayer.defaultProps, loaders: [CBTLoader]};

function createCBT() {
  const formatTiles = geojson ? 'geojson' : wip ? 'wip' : 'binary';

  return new CBTLayer({
    id: 'cbt',
    data: buildUrl({formatTiles}),

    // Styling (same props as MVTLayer)
    getFillColor: [33, 171, 251],
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


function createCarto() {
  return new CartoLayer({
    id: 'carto',
    connection,
    type: MAP_TYPES.TABLE,
    data: table,
    credentials: {
      accessToken: token
    },
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

function parsePbf(buffer) {
  const pbf = new Protobuf(buffer);
  const tile = Tile.read(pbf);
  return tile;
}

render(<Root />, document.body.appendChild(document.createElement('div')));
