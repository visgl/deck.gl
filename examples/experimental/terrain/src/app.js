/* eslint-disable max-statements */
import React, {PureComponent} from 'react';
import {render} from 'react-dom';
import DeckGL from '@deck.gl/react';
import {WebMercatorViewport, COORDINATE_SYSTEM} from '@deck.gl/core';
import {load} from '@loaders.gl/core';
import {TileLayer} from '@deck.gl/geo-layers';

import TerrainLayer from './terrain-layer/terrain-layer';

// Set your mapbox token here
const MAPBOX_TOKEN = process.env.MapboxAccessToken; // eslint-disable-line

const INITIAL_VIEW_STATE = {
  latitude: 46.24,
  longitude: -122.18,
  zoom: 11.5,
  bearing: 140,
  pitch: 60
};

// Constants
// const STREET = 'https://c.tile.openstreetmap.org';
// const SECTIONAL = 'https://wms.chartbundle.com/tms/1.0.0/sec';
const TERRAIN_RGB = 'https://api.mapbox.com/v4/mapbox.terrain-rgb';
const SATELLITE = 'https://api.mapbox.com/v4/mapbox.satellite';

const getTerrainData = ({x, y, z}) => {
  const terrainTile = `${TERRAIN_RGB}/${z}/${x}/${y}.pngraw?access_token=${MAPBOX_TOKEN}`;
  // Some tiles over the ocean may not exist
  // eslint-disable-next-line handle-callback-err
  return load(terrainTile).catch(err => null);
};

const getSurfaceImage = ({x, y, z}) => {
  return `${SATELLITE}/${z}/${x}/${y}@2x.png?access_token=${MAPBOX_TOKEN}`;
};

export default class App extends PureComponent {
  render() {
    const layer = new TileLayer({
      id: 'loader',
      minZoom: 0,
      maxZoom: 23,
      maxCacheSize: 100,
      getTileData: getTerrainData,
      renderSubLayers: props => {
        const {bbox, z} = props.tile;

        const viewport = new WebMercatorViewport({
          longitude: (bbox.west + bbox.east) / 2,
          latitude: (bbox.north + bbox.south) / 2,
          zoom: z
        });
        const bottomLeft = viewport.projectFlat([bbox.west, bbox.south]);
        const topRight = viewport.projectFlat([bbox.east, bbox.north]);

        return new TerrainLayer({
          id: props.id,
          coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
          bounds: [bottomLeft[0], bottomLeft[1], topRight[0], topRight[1]],
          surfaceImage: getSurfaceImage(props.tile),
          terrainImage: props.data,
          // https://docs.mapbox.com/help/troubleshooting/access-elevation-data/#mapbox-terrain-rgb
          // Note - the elevation rendered by this example is greatly exagerated!
          getElevation: (r, g, b) => (r * 65536 + g * 256 + b) / 10 - 10000
        });
      }
    });

    return <DeckGL initialViewState={INITIAL_VIEW_STATE} controller={true} layers={[layer]} />;
  }
}

export function renderToDOM(container) {
  render(<App />, container);
}
