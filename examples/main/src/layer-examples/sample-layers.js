/* eslint-disable max-len */
import * as mainDataSamples from '../data-samples';
import * as extraDataSamples from '../../../sample-layers/data';
const dataSamples = Object.assign({}, mainDataSamples, extraDataSamples);

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

import TripsLayer from '../../../sample-layers/trips-layer/trips-layer';

const TripsLayerExample = {
  layer: TripsLayer,
  props: {
    id: 'trips-layer  ',
    data: dataSamples.trips,
    getPath: trip => trip.map(d => [
      d.begin_shape[0],
      d.begin_shape[1],
      // cast time range to [0, 1]
      d.begin_time / 2000
    ]),
    getColor: f => [0, 80, 200],
    trailLength: 0.25,
    currentTime: 0.4
  }
};

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

/* eslint-disable quote-props */
export default {
  'Sample Layers': {
    'EnhancedChoroplethLayer': EnhancedChoroplethLayerExample,
    'TripsLayer': TripsLayerExample,
    'S2Layer': S2LayerExample
  }
};
