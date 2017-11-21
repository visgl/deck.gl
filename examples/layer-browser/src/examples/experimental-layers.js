import {
  MeshLayer,
  PathOutlineLayer,
  PathMarkerLayer,
  Arrow2DGeometry,
  TextLayer
} from 'deck.gl-layers';

import {COORDINATE_SYSTEM} from 'deck.gl';
import {GL} from 'luma.gl';
import dataSamples from '../immutable-data-samples';

const arrowDataLngLat = [
  {position: [-122.4111557006836, 37.774879455566406], angle: 0},
  {position: [-122.41878509521484, 37.75032043457031], angle: 70},
  {position: [-122.43194580078125, 37.75153732299805], angle: 212}
];

const MeshLayerExample = {
  layer: MeshLayer,
  props: {
    data: arrowDataLngLat,
    mesh: new Arrow2DGeometry(),
    sizeScale: 200
  }
};

const PathOutlineExample = {
  layer: PathOutlineLayer,
  // getData: () => dataSamples.zigzag,
  getData: () => dataSamples.routes,
  props: {
    id: 'path-outline-layer',
    opacity: 0.6,
    getPath: f => [f.START, f.END],
    getColor: f => [128, 0, 0],
    getZLevel: f => Math.random() * 255,
    getWidth: f => 10,
    widthMinPixels: 1,
    pickable: true,
    strokeWidth: 5,
    widthScale: 10,
    autoHighlight: true,
    highlightColor: [255, 255, 255, 255],
    parameters: {
      blendEquation: GL.MAX
    }
  }
};

const PathMarkerExample = {
  layer: PathMarkerLayer,
  getData: () => dataSamples.routes,
  props: {
    id: 'path-outline-layer',
    opacity: 0.6,
    getPath: f => [f.START, f.END],
    getColor: f => [230, 230, 230],
    getZLevel: f => Math.random() * 255,
    getWidth: f => 10,
    widthMinPixels: 1,
    pickable: true,
    strokeWidth: 5,
    widthScale: 10,
    autoHighlight: true,
    highlightColor: [255, 255, 255, 255],
    parameters: {
      blendEquation: GL.MAX
    },
    sizeScale: 200
  }
};

const PathMarkerExampleMeterData = new Array(10).fill(true).map(
  f => ({
    path: [
      [Math.random() * 9000, Math.random() * 9000],
      [Math.random() * 9000, Math.random() * 9000]
    ],
    direction: {forward: Math.random() >= 0.5, backward: Math.random() >= 0.5}
  })
);
const PathMarkerExampleMeter = {
  layer: PathMarkerLayer,
  getData: () => PathMarkerExampleMeterData,
  props: {
    id: 'path-outline-layer-meter',
    opacity: 0.8,
    getColor: f => [230, 230, 230],
    getZLevel: f => Math.random() * 255,
    getWidth: f => 10,
    widthMinPixels: 1,
    pickable: true,
    strokeWidth: 5,
    widthScale: 10,
    autoHighlight: true,
    highlightColor: [255, 255, 255, 255],
    parameters: {
      blendEquation: GL.MAX
    },
    sizeScale: 200,
    getMarkerPercentages: () => [0.5],
    coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
    coordinateOrigin: dataSamples.positionOrigin
  }
};

const TextLayerExample = {
  layer: TextLayer,
  getData: () => dataSamples.points.slice(0, 50),
  props: {
    id: 'text-layer',
    getText: x => `${x.PLACEMENT}-${x.YR_INSTALLED}`,
    getPosition: x => x.COORDINATES,
    getColor: x => [153, 0, 0],
    getSize: x => 32,
    getAngle: x => 0,
    sizeScale: 1,
    getTextAnchor: x => 'start',
    getAlignmentBaseline: x => 'center',
    getPixelOffset: x => [10, 0]
  }
};

/* eslint-disable quote-props */
export default {
  'Experimental Layers': {
    'MeshLayer': MeshLayerExample,
    'PathOutlineLayer': PathOutlineExample,
    'PathMarkerLayer': PathMarkerExample,
    'PathMarkerLayer (Meter)': PathMarkerExampleMeter,
    'TextLayer': TextLayerExample
  }
};
