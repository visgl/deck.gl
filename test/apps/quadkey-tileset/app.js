/* global document */
/* eslint-disable no-console */
import React, {useState} from 'react';
import {render} from 'react-dom';
import {StaticMap} from 'react-map-gl';
import {BASEMAP} from '@deck.gl/carto';
import DeckGL from '@deck.gl/react';
import {BitmapLayer} from '@deck.gl/layers';
import {QuadkeyLayer, TileLayer, _Tileset2D as Tileset2D} from '@deck.gl/geo-layers';

const INITIAL_VIEW_STATE = {longitude: -73.95643, latitude: 40.8039, zoom: 4};

function tileToQuadkey(tile) {
  let index = '';
  for (let z = tile.z; z > 0; z--) {
    let b = 0;
    const mask = 1 << (z - 1);
    if ((tile.x & mask) !== 0) b++;
    if ((tile.y & mask) !== 0) b += 2;
    index += b.toString();
  }
  return index;
}

class QuadkeyTileset2D extends Tileset2D {
  getTileIndices(opts) {
    return super.getTileIndices(opts).map(tileToQuadkey);
  }

  getTileMetadata(index) {
    return {};
  }

  getTileCacheKey(index) {
    return index;
  }

  getParentIndex(index) {
    return index.slice(0, -1);
  }
}

function Root() {
  const quadkeyLayer = new QuadkeyLayer({
    id: 'carto',
    data: 'data/0231.json',
    getQuadkey: d => d.spatial_index,

    // Styling
    getFillColor: d => [(d.value - 12) * 25, d.value * 8, 79],
    getElevation: d => d.value - 12,
    extruded: true,

    elevationScale: 10000
  });

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
