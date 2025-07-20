// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* global document */
/* eslint-disable no-console */
import React, {useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Map} from 'react-map-gl/maplibre';
import {BASEMAP} from '@deck.gl/carto';
import DeckGL from '@deck.gl/react';
import {BitmapLayer} from '@deck.gl/layers';
import {H3HexagonLayer, QuadkeyLayer, TileLayer} from '@deck.gl/geo-layers';
import H3Tileset2D from './h3-tileset-2d';
import QuadkeyTileset2D from './quadkey-tileset-2d';

const INITIAL_VIEW_STATE = {longitude: -73.95643, latitude: 40.8039, zoom: 4};

// TODO: reference master
const DATA_URI =
  'https://raw.githubusercontent.com/visgl/deck.gl-data/90664726007d455bfe04ccfd5eb723e3b7c237c2/test-data/';

function Root() {
  const h3TileLayer = new TileLayer({
    id: 'h3-tile-layer',

    // Overrides to work with h3
    TilesetClass: H3Tileset2D,
    data: `${DATA_URI}/h3/{h3}.json`,

    minZoom: 4,
    maxZoom: 6,

    renderSubLayers: props => {
      const {data} = props;
      const {index} = props.tile;
      if (!data || !data.length) return null;

      return new H3HexagonLayer(props, {
        centerHexagon: index,
        highPrecision: true,

        getHexagon: d => d.spatial_index,
        getFillColor: d => [(d.temp - 14) * 28, 90 - d.temp * 3, (25 - d.temp) * 16],
        getElevation: d => d.temp - 14,
        extruded: true,
        elevationScale: 50000
      });
    }
  });

  const quadkeyTileLayer = new TileLayer({
    id: 'quadkey-tile-layer',

    // Overrides to work with quadkeys
    TilesetClass: QuadkeyTileset2D,
    data: `${DATA_URI}/quadkey/{q}.json`,

    // Limit to available test data
    minZoom: 4,
    maxZoom: 5,
    extent: [-112.5, 21.943045533438177, -90, 40.97989806962013],

    renderSubLayers: props => {
      return new QuadkeyLayer(props, {
        getQuadkey: d => d.spatial_index,
        getFillColor: d => [(d.value - 12) * 25, d.value * 8, 79],
        getElevation: d => d.value - 12,
        extruded: true,
        elevationScale: 10000
      });
    }
  });

  return (
    <>
      <DeckGL
        initialViewState={INITIAL_VIEW_STATE}
        controller={true}
        layers={[h3TileLayer, quadkeyTileLayer]}
      >
        <Map mapStyle={BASEMAP.VOYAGER} />
      </DeckGL>
    </>
  );
}

const container = document.body.appendChild(document.createElement('div'));
createRoot(container).render(<Root />);
