/* eslint-disable max-statements */
import React, {PureComponent} from 'react';
import {render} from 'react-dom';
import DeckGL from '@deck.gl/react';
import {StaticMap} from 'react-map-gl';
import {load} from '@loaders.gl/core';
import {TileLayer} from '@deck.gl/geo-layers';
import TerrainLayer from './terrain-layer/terrain-layer';

// Set your mapbox token here
const MAPBOX_TOKEN = process.env.MapboxAccessToken; // eslint-disable-line

const INITIAL_VIEW_STATE = {
  longitude: 0,
  // longitude: 86.922623,
  latitude: 27.986065,
  zoom: 3,
  pitch: 0,
  bearing: 0
};

// Constants
// const STREET = 'https://c.tile.openstreetmap.org';
// const SECTIONAL = 'https://wms.chartbundle.com/tms/1.0.0/sec';
const TERRAIN_RGB = 'https://api.mapbox.com/v4/mapbox.terrain-rgb';
const SATELLITE = 'https://api.mapbox.com/v4/mapbox.satellite';



const getTileData = ({x, y, z}) => {
  const terrainTile = `${TERRAIN_RGB}/${z}/${x}/${y}.pngraw?access_token=${MAPBOX_TOKEN}`;
  return load(terrainTile);
};

const tile = {
  x: 6,
  y: 2,
  z: 3,
  bbox: {
    west: 90,
    north: 66.513260,
    east: 135,
    south: 40.979898,
  }
}

// const tile = {
//   x: 4,
//   y: 3,
//   z: 3,
//   bbox: {
//     west: 0,
//     north: 40.979898,
//     east: 45,
//     south: 0
//   }
// }

export default class App extends PureComponent {
  render() {
    // const {bbox, x, y, z} = tile;
    // const mapTile = `${SATELLITE}/${z}/${x}/${y}@2x.png?access_token=${MAPBOX_TOKEN}`;

    const layers = [
      // new TerrainLayer({
      //   id: 'terrain',
      //   surfaceImage: load(mapTile),
      //   terrainImage: getTileData({x, y, z}),
      //   bbox,
      //   z,
      // })
      new TileLayer({
        id: 'loader',
        pickable: false,
        // https://wiki.openstreetmap.org/wiki/Zoom_levels
        minZoom: 0,
        maxZoom: 23,
        maxCacheSize: 500,
        getTileData,
        renderSubLayers: props => {
          const {bbox, x, y, z} = props.tile;
          console.log(props.tile)
          const mapTile = `${SATELLITE}/${z}/${x}/${y}@2x.png?access_token=${MAPBOX_TOKEN}`;
          // const mapTile = `${SECTIONAL}/${z}/${x}/${y}.png?origin=nw`;
          return new TerrainLayer({
            id: props.id,
            surfaceImage: load(mapTile),
            terrainImage: props.data,
            bbox,
            z,
            // getScale: getTileScale(bbox.west, bbox.south, z)
          });
        }
      })
    ];

    return (
      <DeckGL initialViewState={INITIAL_VIEW_STATE} controller={true} layers={layers}>
        <StaticMap
          reuseMaps
          mapStyle="mapbox://styles/mapbox/dark-v9"
          mapboxApiAccessToken={MAPBOX_TOKEN}
        />
      </DeckGL>
    );
  }
}

export function renderToDOM(container) {
  render(<App />, container);
}

// function tile2lngLat(x, y, z) {
//   const lng = (x / Math.pow(2, z)) * 360 - 180;
//   const n = Math.PI - (2 * Math.PI * y) / Math.pow(2, z);
//   const lat = (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
//   return [lng, lat];
// }
