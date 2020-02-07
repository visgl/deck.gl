import {GPUGridLayer, GridLayer, CPUGridLayer} from '@deck.gl/aggregation-layers';
import * as dataSamples from 'deck.gl-test/data';

const VIEW_STATE = {
  latitude: 37.751537058389985,
  longitude: -122.42694203247012,
  zoom: 11.5,
  pitch: 0,
  bearing: 0
};

const VIEW_STATE_SIDE = {
  latitude: 37.751537058389985,
  longitude: -122.42694203247012,
  zoom: 11.5,
  pitch: 80,
  bearing: 0
};

const PROPS = {
  data: dataSamples.points,
  cellSize: 200,
  extruded: true,
  getPosition: d => d.COORDINATES
};

const GOLDEN_IMAGE = './test/render/golden-images/grid-lnglat.png';
const GOLDEN_IMAGE_SIDE = './test/render/golden-images/grid-lnglat-side.png';

export function getMean(pts, key) {
  const filtered = pts.filter(pt => Number.isFinite(pt[key]));

  return filtered.length
    ? filtered.reduce((accu, curr) => accu + curr[key], 0) / filtered.length
    : null;
}

export function getMax(pts, key) {
  const filtered = pts.filter(pt => Number.isFinite(pt[key]));

  return filtered.length
    ? filtered.reduce((accu, curr) => (curr[key] > accu ? curr[key] : accu), -Infinity)
    : null;
}

export default [
  {
    name: 'cpu-grid-layer:quantile',
    viewState: VIEW_STATE,
    layers: [
      new CPUGridLayer(
        Object.assign({}, PROPS, {
          id: 'cpu-grid-layer:quantile',
          getColorValue: points => getMean(points, 'SPACES'),
          getElevationValue: points => getMax(points, 'SPACES'),
          colorScaleType: 'quantile'
        })
      )
    ],
    goldenImage: './test/render/golden-images/cpu-layer-quantile.png'
  },
  {
    name: 'cpu-grid-layer:ordinal',
    viewState: VIEW_STATE,
    layers: [
      new CPUGridLayer(
        Object.assign({}, PROPS, {
          id: 'cpu-grid-layer:ordinal',
          getColorValue: points => getMean(points, 'SPACES'),
          getElevationValue: points => getMax(points, 'SPACES'),
          colorScaleType: 'ordinal'
        })
      )
    ],
    goldenImage: './test/render/golden-images/cpu-layer-ordinal.png'
  },
  {
    name: 'cpu-grid-layer:value-accessors',
    viewState: VIEW_STATE,
    layers: [
      new CPUGridLayer(
        Object.assign({}, PROPS, {
          id: 'cpu-grid-layer:value-accessors',
          getColorValue: points => getMean(points, 'SPACES'),
          getElevationValue: points => getMax(points, 'SPACES')
        })
      )
    ],
    goldenImage: GOLDEN_IMAGE
  },
  {
    name: 'cpu-grid-layer:weight-accessors and operation',
    viewState: VIEW_STATE,
    layers: [
      new CPUGridLayer(
        Object.assign({}, PROPS, {
          id: 'cpu-grid-layer:weight-accessors and operation',
          getColorWeight: x => x.SPACES,
          colorAggregation: 'MEAN',
          getElevationWeight: x => x.SPACES,
          elevationAggregation: 'MAX'
        })
      )
    ],
    goldenImage: GOLDEN_IMAGE
  },
  {
    name: 'grid-layer:cpu',
    viewState: VIEW_STATE,
    layers: [
      new GridLayer(
        Object.assign({}, PROPS, {
          id: 'grid-layer:cpu',
          getColorWeight: x => x.SPACES,
          colorAggregation: 'MEAN',
          getElevationWeight: x => x.SPACES,
          elevationAggregation: 'MAX',
          gpuAggregation: false
        })
      )
    ],
    goldenImage: GOLDEN_IMAGE
  },
  {
    name: 'grid-layer:gpu',
    viewState: VIEW_STATE,
    layers: [
      new GridLayer(
        Object.assign({}, PROPS, {
          id: 'grid-layer:gpu',
          getColorWeight: x => x.SPACES,
          colorAggregation: 'MEAN',
          getElevationWeight: x => x.SPACES,
          elevationAggregation: 'MAX',
          gpuAggregation: true
        })
      )
    ],
    goldenImage: GOLDEN_IMAGE
  },
  {
    name: 'grid-layer:cpu-side',
    viewState: VIEW_STATE_SIDE,
    layers: [
      new GridLayer(
        Object.assign({}, PROPS, {
          id: 'grid-layer:cpu-side',
          getColorWeight: x => x.SPACES,
          colorAggregation: 'MEAN',
          getElevationWeight: x => x.SPACES,
          elevationAggregation: 'MAX',
          gpuAggregation: false,
          elevationScale: 5
        })
      )
    ],
    goldenImage: GOLDEN_IMAGE_SIDE
  },
  {
    name: 'grid-layer:gpu-side',
    viewState: VIEW_STATE_SIDE,
    layers: [
      new GridLayer(
        Object.assign({}, PROPS, {
          id: 'grid-layer:gpu-side',
          getColorWeight: x => x.SPACES,
          colorAggregation: 'MEAN',
          getElevationWeight: x => x.SPACES,
          elevationAggregation: 'MAX',
          gpuAggregation: true,
          elevationScale: 5
        })
      )
    ],
    goldenImage: GOLDEN_IMAGE_SIDE
  },
  {
    name: 'gpu-grid-lnglat',
    viewState: VIEW_STATE,
    layers: [
      new GPUGridLayer(
        Object.assign({}, PROPS, {
          id: 'gpu-grid-lnglat',
          gpuAggregation: true
        })
      )
    ],
    goldenImage: './test/render/golden-images/gpu-grid-lnglat.png'
  }
];
