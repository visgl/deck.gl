/* eslint-disable max-statements */
import React, {PureComponent} from 'react';
import {render} from 'react-dom';
import DeckGL from '@deck.gl/react';
import {StaticMap} from 'react-map-gl';
import {load} from '@loaders.gl/core';
import {TileLayer, TerrainLayer} from '@deck.gl/geo-layers';
import {WebMercatorViewport} from '@deck.gl/core';

// Set your mapbox token here
const MAPBOX_TOKEN = process.env.MapboxAccessToken; // eslint-disable-line

const INITIAL_VIEW_STATE = {
  longitude: 86.922623,
  latitude: 27.986065,
  zoom: 11.5,
  pitch: 60,
  bearing: 240
};

// Constants
// const STREET = 'https://c.tile.openstreetmap.org';
// const SECTIONAL = 'https://wms.chartbundle.com/tms/1.0.0/sec';
const TERRAIN_RGB = 'https://api.mapbox.com/v4/mapbox.terrain-rgb';
const SATELLITE = 'https://api.mapbox.com/v4/mapbox.satellite';

function getTileScale(westLng, northLat, z) {
  // const [lng, lat] = tile2lngLat(x, y, z); // this can be removed if we provide north, west point.
  const bboxVp = new WebMercatorViewport({
    longitude: westLng,
    latitude: northLat,
    zoom: z
  });
  const metersPerPixel = bboxVp.metersPerPixel;

  return [metersPerPixel, -metersPerPixel, 1];
}

const getTileData = async ({x, y, z}) => {
  const mapTile = `${SATELLITE}/${z}/${x}/${y}@2x.png?access_token=${MAPBOX_TOKEN}`;
  // const mapTile = `${SECTIONAL}/${z}/${x}/${y}.png?origin=nw`;
  const terrainTile = `${TERRAIN_RGB}/${z}/${x}/${y}.pngraw?access_token=${MAPBOX_TOKEN}`;

  return {
    terrain: await load(terrainTile),
    surface: await load(mapTile)
  };
};

export default class App extends PureComponent {
  render() {
    const layers = [
      new TileLayer({
        id: 'loader',
        pickable: false,
        opacity: 1,
        // https://wiki.openstreetmap.org/wiki/Zoom_levels
        minZoom: 0,
        maxZoom: 23,
        maxCacheSize: 500,
        getTileData,
        renderSubLayers: props => {
          const {bbox, z} = props.tile;

          // const surfaceImage = null;
          // const terrainImage = null;

          return new TerrainLayer({
            id: props.id,
            images: props.data,
            // surfaceImage,
            // terrainImage,
            bbox,
            getScale: getTileScale(bbox.west, bbox.north, z)
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
