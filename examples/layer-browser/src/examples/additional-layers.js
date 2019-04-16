import {SimpleMeshLayer, ScenegraphLayer} from '@deck.gl/mesh-layers';

import {
  GreatCircleLayer,
  S2Layer,
  H3ClusterLayer,
  H3HexagonLayer,
  TripsLayer
  // KMLLayer
} from '@deck.gl/geo-layers';

import {_GPUGridLayer as GPUGridLayer} from '@deck.gl/aggregation-layers';
import * as h3 from 'h3-js';

import {registerLoaders} from '@loaders.gl/core';
import {PLYLoader} from '@loaders.gl/ply';
import {GLTFScenegraphLoader} from '@luma.gl/addons';

import * as dataSamples from '../data-samples';

registerLoaders([GLTFScenegraphLoader, PLYLoader]);

const SimpleMeshLayerExample = {
  layer: SimpleMeshLayer,
  props: {
    id: 'mesh-layer',
    data: dataSamples.points,
    mesh:
      'https://raw.githubusercontent.com/uber-web/loaders.gl/e8e7f724cc1fc1d5882125b13e672e44e5ada14e/modules/ply/test/data/cube_att.ply',
    sizeScale: 40,
    getPosition: d => d.COORDINATES,
    getColor: d => [Math.random() * 255, Math.random() * 255, Math.random() * 255],
    getTransformMatrix: d => [
      Math.random() * 4 - 2,
      Math.random() * 4 - 2,
      Math.random() * 4 - 2,
      0,
      Math.random() * 4 - 2,
      Math.random() * 4 - 2,
      Math.random() * 4 - 2,
      0,
      Math.random() * 4 - 2,
      Math.random() * 4 - 2,
      Math.random() * 4 - 2,
      0,
      0,
      0,
      Math.random() * 10000,
      1
    ]
  }
};

const ScenegraphLayerExample = {
  layer: ScenegraphLayer,
  props: {
    id: 'scenegraph-layer',
    data: dataSamples.points,
    pickable: true,
    sizeScale: 1,
    scenegraph:
      'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Duck/glTF-Binary/Duck.glb',
    getPosition: d => d.COORDINATES,
    getOrientation: d => [Math.random() * 360, Math.random() * 360, Math.random() * 360],
    getTranslation: d => [0, 0, Math.random() * 10000],
    getScale: [1, 1, 1]
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
    getPosition: d => d.COORDINATES
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
    getPosition: d => d
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
    widthMinPixels: 5,
    pickable: true
  }
};

const S2LayerExample = {
  layer: S2Layer,
  props: {
    data: dataSamples.s2cells,
    // data: ['14','1c','24','2c','34','3c'],
    opacity: 0.6,
    getS2Token: f => f.token,
    getFillColor: f => [f.value * 255, (1 - f.value) * 255, (1 - f.value) * 128, 128],
    getElevation: f => Math.random() * 1000,
    pickable: true
  }
};

const H3ClusterLayerExample = {
  layer: H3ClusterLayer,
  props: {
    data: ['882830829bfffff'],
    getHexagons: d => h3.kRing(d, 6),
    getLineWidth: 100,
    stroked: true,
    filled: false
  }
};

const H3HexagonLayerExample = {
  layer: H3HexagonLayer,
  props: {
    // data: h3.kRing('891c0000003ffff', 4), // Pentagon sample, [-143.478, 50.103]
    data: h3.kRing('882830829bfffff', 4), // SF
    getHexagon: d => d,
    getColor: (d, {index}) => [255, index * 5, 0],
    getElevation: d => Math.random() * 1000
  }
};

const TripsLayerExample = {
  layer: TripsLayer,
  propTypes: {
    currentTime: {
      type: 'range',
      step: 12,
      min: 0,
      max: 1200
    },
    trailLength: {
      type: 'range',
      step: 12,
      min: 0,
      max: 1200
    }
  },
  props: {
    id: 'trips-layer',
    data: dataSamples.SFTrips,
    getPath: d =>
      d.waypoints.map(p => [p.coordinates[0], p.coordinates[1], p.timestamp - 1554772579000]),
    getColor: [253, 128, 93],
    opacity: 0.8,
    widthMinPixels: 5,
    rounded: true,
    trailLength: 600,
    currentTime: 500
  }
};

/* eslint-disable quote-props */
export default {
  'Mesh Layers': {
    SimpleMeshLayer: SimpleMeshLayerExample,
    ScenegraphLayer: ScenegraphLayerExample
  },
  'Geo Layers': {
    S2Layer: S2LayerExample,
    H3ClusterLayer: H3ClusterLayerExample,
    H3HexagonLayer: H3HexagonLayerExample,
    GreatCircleLayer: GreatCircleLayerExample,
    TripsLayer: TripsLayerExample
  },
  'Experimental Core Layers': {
    GPUGridLayer: GPUGridLayerExample,
    'GPUGridLayer (1M)': GPUGridLayerPerfExample('1M', dataSamples.getPoints1M),
    'GPUGridLayer (5M)': GPUGridLayerPerfExample('5M', dataSamples.getPoints5M)
  }
};
