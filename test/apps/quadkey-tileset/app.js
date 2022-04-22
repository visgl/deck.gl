/* global document */
/* eslint-disable no-console */
import React, {useState} from 'react';
import {render} from 'react-dom';
import {StaticMap} from 'react-map-gl';
import {BASEMAP} from '@deck.gl/carto';
import DeckGL from '@deck.gl/react';
import {BitmapLayer} from '@deck.gl/layers';
import {QuadkeyLayer, TileLayer} from '@deck.gl/geo-layers';
import QuadkeyTileset2D from './quadkey-tileset-2d';

const INITIAL_VIEW_STATE = {longitude: -73.95643, latitude: 40.8039, zoom: 4};

function Root() {
  const tileLayer = new TileLayer({
    id: 'quadkey-tile-layer',

    // Overrides to work with quadkeys
    TilesetClass: QuadkeyTileset2D,
    data: 'data/{i}.json',
    getURLFromTemplate(template, index) {
      return template.replace(/\{i\}/g, index);
    },

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
      <DeckGL initialViewState={INITIAL_VIEW_STATE} controller={true} layers={[tileLayer]}>
        <StaticMap mapStyle={BASEMAP.VOYAGER} />
      </DeckGL>
    </>
  );
}

render(<Root />, document.body.appendChild(document.createElement('div')));
