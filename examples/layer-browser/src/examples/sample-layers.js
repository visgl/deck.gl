/* eslint-disable max-len */
import * as dataSamples from '../data-samples';

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
    EnhancedChoroplethLayer: EnhancedChoroplethLayerExample,
    LabelLayer: LabelLayerExample
  }
};
