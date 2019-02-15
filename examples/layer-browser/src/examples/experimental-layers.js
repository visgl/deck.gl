/* global window */

import {
  MeshLayer,
  ScenegraphLayer,
  PathOutlineLayer,
  PathMarkerLayer,
  AdvancedTextLayer,
  GPUGridLayer,
  GreatCircleLayer
  // KMLLayer
} from '@deck.gl/experimental-layers';

import {COORDINATE_SYSTEM} from 'deck.gl';
import GL from '@luma.gl/constants';
import {CylinderGeometry} from 'luma.gl';
import {GLTFParser} from '@loaders.gl/gltf';
import * as dataSamples from '../data-samples';

const LIGHT_SETTINGS = {
  lightsPosition: [-122.45, 37.66, 8000, -122.0, 38.0, 8000],
  ambientRatio: 0.3,
  diffuseRatio: 0.6,
  specularRatio: 0.4,
  lightsStrength: [1, 0.0, 0.8, 0.0],
  numberOfLights: 2
};

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
    getYaw: d => Math.random() * 360,
    getColor: d => [0, d.RACKS * 50, d.SPACES * 20],
    getScale: d => [Math.random() * 3 + 0.1, Math.random() * 3 + 0.1, Math.random() * 3 + 0.1]

    // Random shear matrix. Overrides the above.
    // getMatrix: d => [1, Math.random() * 4, 0, 0, 0, 1, 0, 0, 0, Math.random() * 4, 1, 0, 0, 0, 0, 1]
  }
};

const ScenegraphLayerExample = {
  layer: ScenegraphLayer,
  initialize: () => {
    const url =
      'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Duck/glTF-Binary/Duck.glb';
    window
      .fetch(url)
      .then(res => res.arrayBuffer())
      .then(data => {
        const gltfParser = new GLTFParser();
        ScenegraphLayerExample.props.gltf = gltfParser.parse(data);
      });
  },
  props: {
    id: 'scenegraph-layer',
    data: dataSamples.points,
    sizeScale: 1,
    pickable: true,
    getPosition: d => [d.COORDINATES[0], d.COORDINATES[1], Math.random() * 10000]
  }
};

const PathOutlineExample = {
  layer: PathOutlineLayer,
  // getData: () => dataSamples.zigzag,
  getData: () => dataSamples.routes,
  props: {
    id: 'path-outline-example',
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
    id: 'path-marker-example',
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
    id: 'path-marker-example-lnglat',
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
    id: 'path-marker-example-meter',
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

const GPUGridLayerExample = {
  layer: GPUGridLayer,
  getData: () => dataSamples.points,
  props: {
    id: 'gpu-grid-layer',
    cellSize: 200,
    opacity: 1,
    extruded: true,
    pickable: false,
    getPosition: d => d.COORDINATES,
    lightSettings: LIGHT_SETTINGS
  }
};

const GPUGridLayerPerfExample = (id, getData) => ({
  layer: GPUGridLayer,
  getData,
  props: {
    id: `gpuGridLayerPerf-${id}`,
    cellSize: 200,
    opacity: 1,
    extruded: true,
    pickable: false,
    getPosition: d => d,
    lightSettings: LIGHT_SETTINGS
  }
});

const GreatCircleLayerExample = {
  layer: GreatCircleLayer,
  getData: () => dataSamples.greatCircles,
  props: {
    id: 'greatCircleLayer',
    getSourcePosition: d => d.source,
    getTargetPosition: d => d.target,
    getSourceColor: [64, 255, 0],
    getTargetColor: [0, 128, 200],
    getStrokeWidth: 5,
    pickable: true
  }
};

/* eslint-disable quote-props */
export default {
  'Experimental 3D Layers': {
    MeshLayer: MeshLayerExample,
    ScenegraphLayer: ScenegraphLayerExample
  },
  'Experimental Trips Layers': {
    PathOutlineLayer: PathOutlineExample,
    PathMarkerLayer: PathMarkerExample,
    'PathMarkerLayer (LngLat Offset)': PathMarkerExampleLngLatOffset,
    'PathMarkerLayer (Meter)': PathMarkerExampleMeter
  },
  'Experimental Core Layers': {
    AdvancedTextLayer: AdvancedTextLayerExample,
    GPUGridLayer: GPUGridLayerExample,
    'GPUGridLayer (1M)': GPUGridLayerPerfExample('1M', dataSamples.getPoints1M),
    'GPUGridLayer (5M)': GPUGridLayerPerfExample('5M', dataSamples.getPoints5M),
    GreatCircleLayer: GreatCircleLayerExample
  }
};
