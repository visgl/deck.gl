import {BitmapLayer} from '@deck.gl/layers';

import {
  GreatCircleLayer,
  S2Layer,
  TileLayer,
  TripsLayer,
  TerrainLayer,
  MVTLayer,
  H3HexagonLayer,
  H3ClusterLayer
} from '@deck.gl/geo-layers';

import makeLayerDemo from './layer-demo';
import {DATA_URI} from '../constants/defaults';

const MAPBOX_TOKEN = process.env.MapboxAccessToken; // eslint-disable-line

export const GreatCircleLayerDemo = makeLayerDemo({
  getTooltip: ({object}) => `${object.from.name} to ${object.to.name}`,
  layer: new GreatCircleLayer({
    data: `${DATA_URI}/flights.json`,
    getSourcePosition: d => d.from.coordinates,
    getTargetPosition: d => d.to.coordinates,
    getSourceColor: [64, 255, 0],
    getTargetColor: [0, 128, 200],
    widthMinPixels: 5,
    pickable: true
  })
});

export const S2LayerDemo = makeLayerDemo({
  getTooltip: ({object}) => `${object.token} value: ${object.value}`,
  layer: new S2Layer({
    data: `${DATA_URI}/sf.s2cells.json`,
    pickable: true,
    wireframe: false,
    filled: true,
    extruded: true,
    elevationScale: 1000,
    getS2Token: d => d.token,
    getFillColor: d => [d.value * 255, (1 - d.value) * 255, (1 - d.value) * 128],
    getElevation: d => d.value
  })
});

export const H3HexagonLayerDemo = makeLayerDemo({
  getTooltip: ({object}) => `${object.hex} count: ${object.count}`,
  layer: new H3HexagonLayer({
    data: `${DATA_URI}/sf.h3cells.json`,
    pickable: true,
    wireframe: false,
    filled: true,
    extruded: true,
    elevationScale: 20,
    getHexagon: d => d.hex,
    getFillColor: d => [255, (1 - d.count / 500) * 255, 0],
    getElevation: d => d.count
  })
});

export const H3ClusterLayerDemo = makeLayerDemo({
  getTooltip: ({object}) => `density: ${object.mean}`,
  layer: new H3ClusterLayer({
    data: `${DATA_URI}/sf.h3clusters.json`,
    pickable: true,
    stroked: true,
    filled: true,
    extruded: false,
    getHexagons: d => d.hexIds,
    getFillColor: d => [255, (1 - d.mean / 500) * 255, 0],
    getLineColor: [255, 255, 255],
    lineWidthMinPixels: 2
  })
});

export const TileLayerDemo = makeLayerDemo({
  getTooltip: ({tile}) => `x:${tile.x}, y:${tile.y}, z:${tile.z}`,
  mapStyle: null,
  layer: new TileLayer({
    data: 'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png',
    pickable: true,
    minZoom: 0,
    maxZoom: 19,

    renderSubLayers: props => {
      const {
        bbox: {west, south, east, north}
      } = props.tile;

      return new BitmapLayer(props, {
        data: null,
        image: props.data,
        bounds: [west, south, east, north]
      });
    }
  })
});

export const TripsLayerDemo = makeLayerDemo({
  parameters: {
    currentTime: {
      displayName: 'currentTime',
      type: 'range',
      value: 500,
      step: 12,
      min: 0,
      max: 1200
    },
    trailLength: {
      displayName: 'trailLength',
      type: 'range',
      value: 600,
      step: 12,
      min: 0,
      max: 1200
    }
  },
  layer: new TripsLayer({
    data: `${DATA_URI}/sf.trips.json`,
    getPath: d => d.waypoints.map(p => p.coordinates),
    getTimestamps: d => d.waypoints.map(p => p.timestamp - 1554772579000),
    getColor: [253, 128, 93],
    opacity: 0.8,
    widthMinPixels: 8,
    rounded: true,
    trailLength: 600,
    currentTime: 500
  })
});

export const TerrainLayerDemo = makeLayerDemo({
  parameters: {
    meshMaxError: {
      displayName: 'meshMaxError',
      type: 'range',
      value: 4.0,
      step: 1,
      min: 1,
      max: 100
    }
  },
  layer: new TerrainLayer({
    elevationDecoder: {
      rScaler: 2,
      gScaler: 0,
      bScaler: 0,
      offset: 0
    },
    elevationData: `${DATA_URI}/terrain.png`,
    texture: `${DATA_URI}/terrain-mask.png`,
    bounds: [-122.5233, 37.6493, -122.3566, 37.8159],
    material: {
      diffuse: 1
    }
  })
});

export const MVTLayerDemo = makeLayerDemo({
  mapStyle: null,
  layer: new MVTLayer({
    data: [
      `https://a.tiles.mapbox.com/v4/mapbox.mapbox-streets-v7/{z}/{x}/{y}.vector.pbf?access_token=${MAPBOX_TOKEN}`
    ],

    minZoom: 0,
    maxZoom: 23,
    getLineColor: [192, 192, 192],
    getFillColor: [140, 170, 180],

    getLineWidth: f => {
      switch (f.properties.class) {
        case 'street':
          return 6;
        case 'motorway':
          return 10;
        default:
          return 1;
      }
    },
    lineWidthMinPixels: 1
  })
})
