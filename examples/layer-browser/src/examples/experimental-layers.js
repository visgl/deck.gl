import {
  MeshLayer,
  PathOutlineLayer,
  PathMarkerLayer,
  TextLayer,
  AdvancedTextLayer
} from 'deck.gl-layers';

// TODO: remove hard path once deck.gl-layers published with GPUScreenGridLayer
import GPUScreenGridLayer from '../../../../src/experimental-layers/src/gpu-screen-grid-layer/gpu-screen-grid-layer';

import {COORDINATE_SYSTEM} from 'deck.gl';
import {GL, CylinderGeometry} from 'luma.gl';
import dataSamples from '../immutable-data-samples';

const MeshLayerExample = {
  layer: MeshLayer,
  props: {
    id: 'mesh-layer',
    data: dataSamples.points,
    texture: 'data/texture.png',
    mesh: new CylinderGeometry({
      radius: 1,
      topRadius: 1,
      bottomRadius: 1,
      topCap: true,
      bottomCap: true,
      height: 5,
      nradial: 20,
      nvertical: 1
    }),
    sizeScale: 10,
    getPosition: d => d.COORDINATES,
    getAngleDegreesCW: d => Math.random() * 360,
    getColor: d => [0, d.RACKS * 50, d.SPACES * 20]
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

const coordDiff = ([lng, lat]) => [
  lng - dataSamples.positionOrigin[0],
  lat - dataSamples.positionOrigin[1]
];
const PathMarkerExampleLngLatOffset = {
  layer: PathMarkerLayer,
  getData: () => dataSamples.routes,
  props: {
    id: 'path-outline-layer',
    opacity: 0.6,
    getPath: f => [coordDiff(f.START), coordDiff(f.END)],
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
    coordinateSystem: COORDINATE_SYSTEM.LNGLAT_OFFSETS,
    coordinateOrigin: dataSamples.positionOrigin
  }
};

const PathMarkerExampleMeterData = new Array(10).fill(true).map(f => ({
  path: [
    [Math.random() * 9000, Math.random() * 9000],
    [Math.random() * 9000, Math.random() * 9000]
  ],
  direction: {forward: Math.random() >= 0.5, backward: Math.random() >= 0.5}
}));
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
    getMarkerPercentages: () => [0.25, 0.5, 0.75],
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

const AdvancedTextLayerExample = {
  layer: AdvancedTextLayer,
  getData: () => dataSamples.points.slice(0, 50),
  props: {
    id: 'text-layer',
    getText: x => 'Ab:c-12,3Tj',
    getPosition: x => x.COORDINATES,
    getColor: x => [153, 0, 0],
    getSize: x => 1,
    getAngle: x => 0,
    sizeScale: 1,
    getTextAnchor: x => 'start',
    getAlignmentBaseline: x => 'center',
    fontTexture: 'http://localhost:8000/font.png',
    fontInfo: 'http://localhost:8000/font.json',
    fontSmoothing: 0.2
  }
};

const TextLayer100KExample = {
  layer: TextLayer,
  getData: dataSamples.getPoints100K,
  props: {
    id: 'text-layer-100k',
    getText: x => 'X',
    getPosition: x => x,
    getColor: x => [0, 0, 200],
    sizeScale: 1
  }
};

const GPUScreenGridLayerExample = {
  layer: GPUScreenGridLayer,
  getData: () => dataSamples.points,
  props: {
    id: 'screenGridLayer',
    getPosition: d => d.COORDINATES,
    cellSizePixels: 40,
    minColor: [0, 0, 80, 0],
    maxColor: [100, 255, 0, 128],
    pickable: false
  }
};

/* eslint-disable quote-props */
export default {
  'Experimental Layers': {
    MeshLayer: MeshLayerExample,
    PathOutlineLayer: PathOutlineExample,
    PathMarkerLayer: PathMarkerExample,
    'PathMarkerLayer (LngLat Offset)': PathMarkerExampleLngLatOffset,
    'PathMarkerLayer (Meter)': PathMarkerExampleMeter,
    TextLayer: TextLayerExample,
    AdvancedTextLayer: AdvancedTextLayerExample,
    'TextLayer (100K)': TextLayer100KExample,
    GPUScreenGridLayer: GPUScreenGridLayerExample
  }
};
