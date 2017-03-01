import {
  EnhancedChoroplethLayer,
  TripsLayer
} from '../../../sample-layers';

import * as dataSamples from '../data-samples';

const EnhancedChoroplethLayerExample = {
  layer: EnhancedChoroplethLayer,
  props: {
    id: 'enhanced-choropleth-layer',
    data: dataSamples.choropleths,
    getColor: f => [200, 0, 80],
    strokeWidth: 5
  }
};

const TripsLayerExample = {
  layer: TripsLayer,
  props: {
    id: 'trips-layer',
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

/* eslint-disable quote-props */
export default {
  'Sample Layers': {
    'EnhancedChoroplethLayer': EnhancedChoroplethLayerExample,
    'TripsLayer': TripsLayerExample
  }
};
