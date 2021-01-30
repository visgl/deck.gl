import {
  COORDINATE_SYSTEM,
  MapView,
  _GlobeView,
  OrbitView,
  OrthographicView,
  FirstPersonView
} from '@deck.gl/core';
import {BitmapLayer, ScatterplotLayer, TextLayer, PointCloudLayer} from '@deck.gl/layers';
import {SimpleMeshLayer} from '@deck.gl/mesh-layers';
import {TileLayer} from '@deck.gl/geo-layers';
import {PLYLoader} from '@loaders.gl/ply';

import {hierarchy, pack} from 'd3-hierarchy';
import {scaleLog} from 'd3-scale';

import {makeViewDemo} from './demo-base';
import {DATA_URI} from '../constants/defaults';

export const MapViewDemo = makeViewDemo({
  imports: {MapView, ScatterplotLayer},
  view: `new MapView({
    repeat: true,
    // nearZMultiplier: 0.1,
    // farZMultiplier: 1.01,
    // orthographic: false,
  })`,
  initialViewState: {
    longitude: 0,
    latitude: 10,
    zoom: 1,
    pitch: 0,
    bearing: 0,
    minZoom: 0,
    maxZoom: 20,
    minPitch: 0,
    maxPitch: 60
  },
  mapStyle: true,
  layers: `[
    new ScatterplotLayer({
      data: '${DATA_URI}/airports.json',
      getPosition: d => d.coordinates,
      getRadius: 100,
      getColor: [155, 40, 0],
      radiusMinPixels: 2
    })
  ]`
});

export const GlobeViewDemo = makeViewDemo({
  imports: {_GlobeView, TileLayer, BitmapLayer, COORDINATE_SYSTEM},
  view: `new _GlobeView({
    resolution: 10
  })`,
  initialViewState: {
    longitude: 2.27,
    latitude: 48.86,
    zoom: 1,
    minZoom: 0,
    maxZoom: 20
  },
  layers: `[
    new TileLayer({
      data: 'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png',
      minZoom: 0,
      maxZoom: 19,
      tileSize: 256,

      renderSubLayers: props => {
        const {
          bbox: {west, south, east, north}
        } = props.tile;

        return new BitmapLayer(props, {
          data: null,
          image: props.data,
          _imageCoordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
          bounds: [west, south, east, north]
        });
      }
    })
  ]`
});

export const OrbitViewDemo = makeViewDemo({
  imports: {OrbitView, SimpleMeshLayer, PLYLoader},
  dependencies: ['https://unpkg.com/@loaders.gl/ply@latest/dist/dist.min.js'],
  view: `new OrbitView({
    orbitAxis: 'Y',
    // fovy: 50,
    // near: 0.1,
    // far: 1000,
    // orthographic: false
  })`,
  initialViewState: {
    target: [0, 175, 0],
    zoom: -0.5,
    rotationOrbit: 145,
    rotationX: 65,
    minRotationX: -90,
    maxRotationX: 90,
    minZoom: -10,
    maxZoom: 10,
  },
  layers: `[
    new SimpleMeshLayer({
      data: [0],
      mesh: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/point-cloud-ply/lucy100k.ply',
      getPosition: [0, 0, 0],
      getColor: [200, 200, 200],
      loaders: [PLYLoader]
    })
  ]`
});

export const OrthographicViewDemo = makeViewDemo({
  imports: {OrthographicView, ScatterplotLayer, TextLayer, d3: {hierarchy, pack, scaleLog}},
  dependencies: ['https://d3js.org/d3.v6.min.js'],
  prepend: {
    code: `
const nodes = (async function() {
  const resp = await fetch('${DATA_URI}/world-countries.json');
  const data = await resp.json();
  const tree = d3.hierarchy(data).sum(d => d.population);
  const pack = d3.pack().size([1000, 1000]).padding(3);
  return pack(tree).leaves();
})();

const colorScale = d3.scaleLog()
  .domain([0.02, 20, 20000])
  .range([[145, 207, 96], [255, 255, 191], [215, 25, 28]]);
`,
    out: ['nodes', 'colorScale']
  },
  view: `new OrthographicView({
    flipY: false,
    // near: 0.1,
    // far: 1000,
  })`,
  initialViewState: {
    target: [500, 500, 0],
    zoom: 0,
    minZoom: -2,
    maxZoom: 40,
    maxPitch: 89,
    minPitch: -89
  },
  layers: `[
    new ScatterplotLayer({
      id: 'circles',
      data: nodes,
      getPosition: d => [d.x, d.y],
      getRadius: d => d.r,
      getFillColor: d => colorScale(d.data.population / d.data.area),
      getLineWidth: 1,
      lineWidthUnits: 'pixels',
      stroked: true
    }),
    new TextLayer({
      id: 'labels',
      data: nodes,
      getText: d => d.data.name,
      getPosition: d => [d.x, d.y],
      getSize: d => (d.r * 2 / d.data.name.length),
      getColor: [0, 0, 0],
      sizeUnits: 'meters',
      sizeMaxPixels: 64
    })
  ]`
});

export const FirstPersonViewDemo = makeViewDemo({
  imports: {FirstPersonView, PointCloudLayer, COORDINATE_SYSTEM, PLYLoader},
  dependencies: ['https://unpkg.com/@loaders.gl/ply@latest/dist/dist.min.js'],
  view: `new FirstPersonView({
    focalDistance: 100,
    fovy: 80,
    // near: 0.1,
    // far: 1000,
  })`,
  initialViewState: {
    longitude: 0,
    latitude: 0,
    position: [0, 0, 43.5],
    bearing: 0,
    pitch: 0
  },
  layers: `[
    new PointCloudLayer({
      // Data source: Dorit Borrmann, and Hassan Afzal from Jacobs University Bremen
      data: '${DATA_URI}/thermoscan.ply',
      modelMatrix: [1, 0, 0, 0, 0, 0, 1, 0, 0, -1, 0, 0, 0, 0, 0, 1],
      coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
      pointSize: 4,
      loaders: [PLYLoader]
    })
  ]`
});
