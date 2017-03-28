/* eslint-disable max-len */
import * as mainDataSamples from '../data-samples';
import * as extraDataSamples from '../../../sample-layers/data';
const dataSamples = Object.assign({}, mainDataSamples, extraDataSamples);

import S2Layer from '../../../sample-layers/s2-layer/s2-layer';

const S2LayerExample = {
  layer: S2Layer,
  props: {
    data: dataSamples.s2cells,
    opacity: 0.6,
    getS2Token: f => f.token,
    getPath: f => f.path,
    getFillColor: f => [f.value * 256, (1 - f.value) * 256, (1 - f.value) * 128],
    getStrokeWidth: f => 10,
    pickable: true
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
    'EnhancedChoroplethLayer': EnhancedChoroplethLayerExample,
    // 'BitmapLayer': BitmapLayerExample,
    // 'MeshLayer': MeshLayerExample,
    'LabelLayer': LabelLayerExample
  }
};
