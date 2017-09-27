/* eslint-disable max-len */
import {GL} from 'luma.gl';
import * as dataSamples from '../data-samples';

import S2Layer from '../../../sample-layers/s2-layer/s2-layer';

const S2LayerExample = {
  layer: S2Layer,
  props: {
    data: dataSamples.s2cells,
    opacity: 0.6,
    getS2Token: f => f.token,
    getPath: f => f.path,
    getFillColor: f => [f.value * 255, (1 - f.value) * 255, (1 - f.value) * 128],
    getStrokeWidth: f => 10,
    pickable: true
  }
};

import SegmentLayer from '../../../sample-layers/segment-layer/segment-layer';

const SegmentLayerExample = {
  layer: SegmentLayer,
  // getData: () => dataSamples.zigzag,
  getData: () => dataSamples.routes,
  props: {
    id: 'segment-layer',
    opacity: 0.6,
    // getPath: f => f.path,
    getPath: f => [f.START, f.END],
    getColor: f => [128, 0, 0],
    getZLevel: f => Math.random() * 255,
    getWidth: f => 10,
    widthMinPixels: 1,
    pickable: true,
    strokeWidth: 5,
    widthScale: 10,
    parameters: {
      blendEquation: GL.MAX
    }
  }
};

import EnhancedChoroplethLayer from '../../../sample-layers/enhanced-choropleth-layer/enhanced-choropleth-layer';

const EnhancedChoroplethLayerExample = {
  layer: EnhancedChoroplethLayer,
  props: {
    id: 'enhanced-choropleth-layer',
    data: dataSamples.choropleths,
    getColor: f => [200, 0, 80],
    strokeWidth: 5
  }
};

// BitmapLayer and MeshLayer examples are current commented out
// They going to be added in the future.
// import BitmapLayer from '../../../sample-layers/bitmap-layer/bitmap-layer';

// const BitmapLayerExample = {
//   layer: BitmapLayer,
//   props: {
//     data: []
//   }
// };

// import MeshLayer from '../../../sample-layers/mesh-layer/mesh-layer';

// const MeshLayerExample = {
//   layer: MeshLayer,
//   props: {
//     data: []
//   }
// };

import LabelLayer from '../../../sample-layers/label-layer/label-layer';

const somePoints = dataSamples.points.slice(0, 50);

const LabelLayerExample = {
  layer: LabelLayer,
  props: {
    data: somePoints,
    getLabel: x => `${x.PLACEMENT}-${x.YR_INSTALLED}`,
    getPosition: x => x.COORDINATES,
    getColor: x => [Math.random() * 255, 0, Math.random() * 255, 255],
    getSize: x => 2
  }
};

/* eslint-disable quote-props */
export default {
  'Sample Layers': {
    'S2Layer': S2LayerExample,
    'SegmentLayer': SegmentLayerExample,
    'EnhancedChoroplethLayer': EnhancedChoroplethLayerExample,
    // BitmapLayer and MeshLayer examples are current commented out
    // They going to be added in the future.
    // 'BitmapLayer': BitmapLayerExample,
    // 'MeshLayer': MeshLayerExample,
    'LabelLayer': LabelLayerExample
  }
};
