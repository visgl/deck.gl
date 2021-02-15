import {HexagonLayer} from '@deck.gl/aggregation-layers';
import * as dataSamples from 'deck.gl-test/data';

import {getMean, getMax} from './grid-layer';

const VIEW_STATE = {
  latitude: 37.751537058389985,
  longitude: -122.42694203247012,
  zoom: 11.5,
  pitch: 20,
  bearing: 0
};

const PROPS = {
  data: dataSamples.points,
  extruded: true,
  radius: 1000,
  elevationScale: 1,
  elevationRange: [0, 3000],
  coverage: 1,
  getPosition: d => d.COORDINATES
};

const GOLDEN_IMAGE = './test/render/golden-images/hexagon-lnglat.png';

export default [
  {
    name: 'hexagon-lnglat:value-accessors',
    viewState: VIEW_STATE,
    layers: [
      new HexagonLayer(
        Object.assign({}, PROPS, {
          id: 'hexagon-lnglat:value-accessors',
          getColorValue: points => getMean(points, 'SPACES'),
          getElevationValue: points => getMax(points, 'SPACES')
        })
      )
    ],
    goldenImage: GOLDEN_IMAGE
  },
  {
    name: 'hexagon:weight-accessors and operation',
    viewState: VIEW_STATE,
    layers: [
      new HexagonLayer(
        Object.assign({}, PROPS, {
          id: 'hexagon-lnglat:weight-accessors and operation',
          getColorWeight: x => x.SPACES,
          colorAggregation: 'MEAN',
          getElevationWeight: x => x.SPACES,
          elevationAggregation: 'MAX'
        })
      )
    ],
    goldenImage: GOLDEN_IMAGE
  }
];
