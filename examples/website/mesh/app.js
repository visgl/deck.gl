/* eslint-disable max-statements */
/* global window */
import React, {PureComponent} from 'react';
import {render} from 'react-dom';
import DeckGL from '@deck.gl/react';
import {StaticMap} from 'react-map-gl';
import { registerLoaders, load } from "@loaders.gl/core";
import Martini from '@mapbox/martini'
import { ImageLoader, getImageData, getImageSize } from "@loaders.gl/images";

import {
  COORDINATE_SYSTEM,
  OrbitView,
  DirectionalLight,
  LightingEffect,
  AmbientLight,
  WebMercatorViewport
} from '@deck.gl/core';
import {SolidPolygonLayer} from '@deck.gl/layers';
import {SimpleMeshLayer} from '@deck.gl/mesh-layers';

import {Matrix4} from 'math.gl';
// import {OBJLoader} from '@loaders.gl/obj';

// Add the loaders that handle your mesh format here
// registerLoaders([OBJLoader]);
registerLoaders(ImageLoader)

// Set your mapbox token here
const MAPBOX_TOKEN = process.env.MapboxAccessToken; // eslint-disable-line
console.log(MAPBOX_TOKEN)
const MESH_URL =
  'https://raw.githubusercontent.com/uber-common/deck.gl-data/master/examples/mesh/minicooper.obj';

const INITIAL_VIEW_STATE = {
  longitude: 103.851959,
  latitude: 1.290270,
  zoom: 12,
  pitch: 0,
  bearing: 0
};

const SAMPLE_DATA = (([xCount, yCount], spacing) => {
  const data = [];
  for (let x = 0; x < xCount; x++) {
    for (let y = 0; y < yCount; y++) {
      data.push({
        position: [(x - (xCount - 1) / 2) * spacing, (y - (yCount - 1) / 2) * spacing],
        color: [(x / (xCount - 1)) * 255, 128, (y / (yCount - 1)) * 255],
        orientation: [(x / (xCount - 1)) * 60 - 30, 0, -90]
      });
    }
  }
  return data;
})([10, 10], 120);

const ambientLight = new AmbientLight({
  color: [255, 255, 255],
  intensity: 5.0
});

// const dirLight = new DirectionalLight({
//   color: [255, 255, 255],
//   intensity: 1.0,
//   direction: [-3, -9, -1],
//   // _shadow: true
// });

const lightingEffect = new LightingEffect({ambientLight});

function tile2latLng(x, y, z) {
  const lng = (x / Math.pow(2, z)) * 360 - 180;
  const n = Math.PI - (2 * Math.PI * y) / Math.pow(2, z);
  const lat = (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
  return [lng, lat];
}

function tileToBoundingBox(x, y, z) {
  const [west, north] = tile2latLng(x, y, z);
  const [east, south] = tile2latLng(x + 1, y + 1, z);
  return {west, north, east, south};
}

// const background = [
//   [[-1000.0, -1000.0, -40], [1000.0, -1000.0, -40], [1000.0, 1000.0, -40], [-1000.0, 1000.0, -40]]
// ];

// Load Tile Data
const enableSectional = false;
const getTileData = async ({ x, y, z }) => {
  // https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#Tile_servers
  const street = "https://c.tile.openstreetmap.org";
  const sectional = "https://wms.chartbundle.com/tms/1.0.0/sec";
  const terrainRgb = "https://api.mapbox.com/v4/mapbox.terrain-rgb";
  const satellite = "https://api.mapbox.com/v4/mapbox.satellite";

  let mapTile = `${satellite}/${z}/${x}/${y}@2x.png?access_token=${MAPBOX_TOKEN}`;
  if (enableSectional) {
    mapTile = `${sectional}/${z}/${x}/${y}.png?origin=nw`;
  }

  const terrainTile = `${terrainRgb}/${z}/${x}/${y}@2x.pngraw?access_token=${MAPBOX_TOKEN}`;

  // const data = await Promise.all([
  //   ,

  // ]);

  // console.log(data)

  return {
    surface: await load(mapTile),
    // surface: mapTile,
    terrain: await load(terrainTile).then(img => ({data: getImageData(img), size: getImageSize(img)}))
  }
}

// From Martini demo
// https://observablehq.com/@mourner/martin-real-time-rtin-terrain-mesh
const runMartini = ({ data, size }) => {
  const tileSize = size.width;
  const gridSize = tileSize + 1
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
  const mesh = tile.getMesh(1);
  // mesh.vertices: vec2
  // mesh.triangles

  const numOfVerticies = mesh.vertices.length / 2
  const positions = new Float32Array(numOfVerticies * 3);
  const texCoords = new Float32Array(numOfVerticies * 2);

  let x; let y; let pixelIdx;
  for (let i = 0; i < numOfVerticies; i ++) {
    x = mesh.vertices[i*2];
    y = mesh.vertices[i*2 + 1];
    pixelIdx = y * gridSize + x;

    positions[3 * i + 0] = x;
    positions[3 * i + 1] = y;
    positions[3 * i + 2] = terrain[pixelIdx];

    texCoords[2 * i + 0] = x / tileSize;
    texCoords[2 * i + 1] = y / tileSize;
  }

  const deckMesh = {
    indices: mesh.triangles,
    attributes: {
      positions: {
        value: positions, // Float32Array - 4 bytes, one byte for xy - every position will go from 0,0 to their tile size in pixels. They will be ints.
        size: 3
      },
      texCoords // calculated vec2. 1 to 1 relationship with position. represents the uv on the texture image. 0,0 to 1,1.
    },
    // normals: [], - optional, but creates the high poly look with lighting
  }

  return deckMesh;
}

export default class App extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      // modelMatrix: new Matrix4()
      mesh: null,
      surface: null,
      coordinateOrigin: [0,0,0],
      metersPerPixel: 1
    };
    this._frameId = null;
    // this.onDataLoad = this.onDataLoad.bind(this);
  }

  componentDidMount() {
    getTileData({x: 25837, y: 16266, z: 15}).then(tileData => {

      const bbox = tileToBoundingBox(25837, 16266, 15)
      console.log(bbox)

      const mercatorTileSize = 512; // web mercator projection constant
      const imageTileSize = 512 // TODO!
      const bboxVp = new WebMercatorViewport({
        longitude: bbox.west,
        latitude: bbox.north,
        zoom: 15,
        width: 1,
        height: 1
      });
      const metersPerPixel = bboxVp.metersPerPixel * (mercatorTileSize / imageTileSize);

      console.log(bboxVp.metersPerPixel)

      const deckMesh = runMartini(tileData.terrain)
      this.setState({
        surface: tileData.surface,
        coordinateOrigin: [bbox.west, bbox.north, 0],
        metersPerPixel,
        mesh: deckMesh
      })
    })

    // this._frameId = window.requestAnimationFrame(this._rotate);
  }

  componentWillUnmount() {
    // if (this._frameId) {
    //   window.cancelAnimationFrame(this._frameId);
    // }
  }

  // _rotate() {
  //   const matrix = new Matrix4(this.state.modelMatrix);
  //   matrix.rotateX((0.005 / 180) * Math.PI);
  //   this.setState({
  //     modelMatrix: matrix
  //   });
  //   window.requestAnimationFrame(this._rotate);
  // }

  render() {
    // const {modelMatrix} = this.state;

    const layers = [
      new SimpleMeshLayer({
        id: 'terrain',
        data: [1],
        mesh: this.state.mesh,
        texture: this.state.surface,
        coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
        coordinateOrigin: this.state.coordinateOrigin, // lng, lat, alt of top left
        getScale: [this.state.metersPerPixel, -this.state.metersPerPixel, 1], // some magic constant. dependent on lat of origin
        getPosition: [0,0,0],
        getColor: [255,255,255,255],
      }),
      // only needed when using shadows - a plane for shadows to drop on
      // new SolidPolygonLayer({
      //   id: 'background',
      //   data: background,
      //   extruded: false,
      //   modelMatrix,
      //   coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
      //   getPolygon: f => f,
      //   getFillColor: [0, 0, 0, 0]
      // })
    ]

    return (
      <DeckGL
        // views={
        //   new OrbitView({
        //     near: 0.1,
        //     far: 2
        //   })
        // }
        initialViewState={INITIAL_VIEW_STATE}
        controller={true}
        layers={layers}
        effects={[lightingEffect]}
      >
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
