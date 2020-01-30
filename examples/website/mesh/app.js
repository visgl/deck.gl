/* eslint-disable max-statements */
/* global window */
import React, {PureComponent} from 'react';
import {render} from 'react-dom';
import DeckGL from '@deck.gl/react';
import {StaticMap} from 'react-map-gl';
import {load} from '@loaders.gl/core';
import Martini from '@mapbox/martini';
import {getImageData, getImageSize} from '@loaders.gl/images';

import {COORDINATE_SYSTEM, WebMercatorViewport} from '@deck.gl/core';
import {SimpleMeshLayer} from '@deck.gl/mesh-layers';

// Set your mapbox token here
const MAPBOX_TOKEN = process.env.MapboxAccessToken; // eslint-disable-line

const INITIAL_VIEW_STATE = {
  longitude: 103.851959,
  latitude: 1.29027,
  zoom: 12,
  pitch: 0,
  bearing: 0
};

// Constants
const STREET = 'https://c.tile.openstreetmap.org';
const SECTIONAL = 'https://wms.chartbundle.com/tms/1.0.0/sec';
const TERRAIN_RGB = 'https://api.mapbox.com/v4/mapbox.terrain-rgb';
const SATELLITE = 'https://api.mapbox.com/v4/mapbox.satellite';

const MERCATOR_TILE_SIZE = 512; // web mercator projection constant
const MESH_MAX_ERROR = 4;

// Load tile texture
function getTileTexture({x, y, z}) {
  const mapTile = `${SATELLITE}/${z}/${x}/${y}@2x.png?access_token=${MAPBOX_TOKEN}`;
  // const mapTile = `${SECTIONAL}/${z}/${x}/${y}.png?origin=nw`;
  return load(mapTile);
}

// Load tile mesh data
async function getTileMesh({x, y, z}) {
  // https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#Tile_servers
  const terrainTile = `${TERRAIN_RGB}/${z}/${x}/${y}@2x.pngraw?access_token=${MAPBOX_TOKEN}`;

  const image = await load(terrainTile);
  const data = getImageData(image);
  const size = getImageSize(image);

  // From Martini demo
  // https://observablehq.com/@mourner/martin-real-time-rtin-terrain-mesh
  const tileSize = size.width;
  const pixelScale = MERCATOR_TILE_SIZE / tileSize;
  const gridSize = tileSize + 1;
  const terrain = new Float32Array(gridSize * gridSize);

  // decode terrain values
  for (let y = 0; y < tileSize; y++) {
    for (let x = 0; x < tileSize; x++) {
      const k = (y * tileSize + x) * 4;
      const r = data[k + 0];
      const g = data[k + 1];
      const b = data[k + 2];
      terrain[y * gridSize + x] = (r * 256 * 256 + g * 256.0 + b) / 10.0 - 10000.0;
    }
  }

  // backfill right and bottom borders
  for (let x = 0; x < gridSize - 1; x++) {
    terrain[gridSize * (gridSize - 1) + x] = terrain[gridSize * (gridSize - 2) + x];
  }
  for (let y = 0; y < gridSize; y++) {
    terrain[gridSize * y + gridSize - 1] = terrain[gridSize * y + gridSize - 2];
  }

  const martini = new Martini(gridSize);
  const tile = martini.createTile(terrain);
  const {vertices, triangles} = tile.getMesh(MESH_MAX_ERROR);

  const numOfVerticies = vertices.length / 2;
  // vec3. x, y in pixels, z in meters
  const positions = new Float32Array(numOfVerticies * 3);
  // vec2. 1 to 1 relationship with position. represents the uv on the texture image. 0,0 to 1,1.
  const texCoords = new Float32Array(numOfVerticies * 2);

  for (let i = 0; i < numOfVerticies; i++) {
    const x = vertices[i * 2];
    const y = vertices[i * 2 + 1];
    const pixelIdx = y * gridSize + x;

    positions[3 * i + 0] = x * pixelScale;
    positions[3 * i + 1] = y * pixelScale;
    positions[3 * i + 2] = terrain[pixelIdx];

    texCoords[2 * i + 0] = x / tileSize;
    texCoords[2 * i + 1] = y / tileSize;
  }

  return {
    indices: triangles,
    attributes: {
      positions: {value: positions, size: 3},
      texCoords: {value: texCoords, size: 2}
      // normals: [], - optional, but creates the high poly look with lighting
    }
  };
}

function tile2lngLat(x, y, z) {
  const lng = (x / Math.pow(2, z)) * 360 - 180;
  const n = Math.PI - (2 * Math.PI * y) / Math.pow(2, z);
  const lat = (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
  return [lng, lat];
}

function getTileScale({x, y, z}) {
  const [lng, lat] = tile2lngLat(x, y, z);
  const bboxVp = new WebMercatorViewport({
    longitude: lng,
    latitude: lat,
    zoom: z
  });
  const metersPerPixel = bboxVp.metersPerPixel;

  return [metersPerPixel, -metersPerPixel, 1];
}

const tiles = [
  {x: 25836, y: 16266, z: 15},
  {x: 25836, y: 16267, z: 15},
  {x: 25837, y: 16266, z: 15},
  {x: 25837, y: 16267, z: 15}
];

export default class App extends PureComponent {
  render() {
    const layers = tiles.map(
      tile =>
        new SimpleMeshLayer({
          id: `terrain-${tile.z}-${tile.x}-${tile.y}`,
          data: [1],
          mesh: getTileMesh(tile),
          texture: getTileTexture(tile),
          coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
          coordinateOrigin: tile2lngLat(tile.x, tile.y, tile.z), // lng, lat, alt of top left
          getScale: getTileScale(tile), // some magic constant. dependent on lat of origin
          getPosition: d => [0, 0, 0],
          getColor: d => [255, 255, 255]
        })
    );

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
