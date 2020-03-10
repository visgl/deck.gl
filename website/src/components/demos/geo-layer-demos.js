/* global fetch */
import createLayerDemoClass from './layer-demo-base';
import {DATA_URI} from '../../constants/defaults';

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

const MAPBOX_TOKEN = process.env.MapboxAccessToken; // eslint-disable-line

export const GreatCircleLayerDemo = createLayerDemoClass({
  Layer: GreatCircleLayer,
  dataUrl: `${DATA_URI}/flights.json`,
  formatTooltip: d => `${d.from.name} to ${d.to.name}`,
  props: {
    getSourcePosition: d => d.from.coordinates,
    getTargetPosition: d => d.to.coordinates,
    getSourceColor: [64, 255, 0],
    getTargetColor: [0, 128, 200],
    widthMinPixels: 5,
    pickable: true
  }
});

export const S2LayerDemo = createLayerDemoClass({
  Layer: S2Layer,
  dataUrl: `${DATA_URI}/sf.s2cells.json`,
  formatTooltip: d => `${d.token} value: ${d.value}`,
  props: {
    pickable: true,
    wireframe: false,
    filled: true,
    extruded: true,
    elevationScale: 1000,
    getS2Token: d => d.token,
    getFillColor: d => [d.value * 255, (1 - d.value) * 255, (1 - d.value) * 128],
    getElevation: d => d.value
  }
});

export const H3HexagonLayerDemo = createLayerDemoClass({
  Layer: H3HexagonLayer,
  dataUrl: `${DATA_URI}/sf.h3cells.json`,
  formatTooltip: d => `${d.hex} count: ${d.count}`,
  props: {
    pickable: true,
    wireframe: false,
    filled: true,
    extruded: true,
    elevationScale: 20,
    getHexagon: d => d.hex,
    getFillColor: d => [255, (1 - d.count / 500) * 255, 0],
    getElevation: d => d.count
  }
});

export const H3ClusterLayerDemo = createLayerDemoClass({
  Layer: H3ClusterLayer,
  dataUrl: `${DATA_URI}/sf.h3clusters.json`,
  formatTooltip: d => `density: ${d.mean}`,
  props: {
    pickable: true,
    stroked: true,
    filled: true,
    extruded: false,
    getHexagons: d => d.hexIds,
    getFillColor: d => [255, (1 - d.mean / 500) * 255, 0],
    getLineColor: [255, 255, 255],
    lineWidthMinPixels: 2
  }
});

export const TileLayerDemo = createLayerDemoClass({
  Layer: TileLayer,
  formatTooltip: ({tile}) => `x:${tile.x}, y:${tile.y}, z:${tile.z}`,
  basemap: false,
  props: {
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
  }
});

export const TripsLayerDemo = createLayerDemoClass({
  Layer: TripsLayer,
  dataUrl: `${DATA_URI}/sf.trips.json`,
  propParameters: {
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
  props: {
    getPath: d => d.waypoints.map(p => p.coordinates),
    getTimestamps: d => d.waypoints.map(p => p.timestamp - 1554772579000),
    getColor: [253, 128, 93],
    opacity: 0.8,
    widthMinPixels: 8,
    rounded: true,
    trailLength: 600,
    currentTime: 500
  }
});

export const TerrainLayerDemo = createLayerDemoClass({
  Layer: TerrainLayer,
  propParameters: {
    meshMaxError: {
      displayName: 'meshMaxError',
      type: 'range',
      value: 4.0,
      step: 1,
      min: 1,
      max: 100
    }
  },
  props: {
    minZoom: 0,
    maxZoom: 23,
    strategy: 'no-overlap',
    elevationDecoder: {
      rScaler: 256,
      gScaler: 1,
      bScaler: 1 / 256,
      offset: -32768
    },
    terrainImage: 'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png',
    surfaceImage: 'https://wms.chartbundle.com/tms/1.0.0/sec/{z}/{x}/{y}.png?origin=nw'
  }
})

export const MVTLayerDemo = createLayerDemoClass({
  Layer: MVTLayer,
  basemap: false,
  props: {
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
  }
})
