import {
  GridLayer,
  GPUGridLayer,
  CPUGridLayer,
  HexagonLayer,
  ContourLayer,
  ScreenGridLayer,
  HeatmapLayer
} from '@deck.gl/aggregation-layers';

// Demonstrate immutable support
import * as dataSamples from '../data-samples';

const ScreenGridLayerExample = {
  layer: ScreenGridLayer,
  getData: () => dataSamples.points,
  props: {
    id: 'screenGridLayer',
    getPosition: d => d.COORDINATES,
    cellSizePixels: 40,
    pickable: false
  }
};

const ContourLayerExample = {
  layer: ContourLayer,
  getData: () => dataSamples.points,
  props: {
    id: 'contourLayer',
    cellSize: 200,
    getPosition: d => d.COORDINATES,
    gpuAggregation: true,
    contours: [
      {threshold: 1, color: [255, 0, 0], strokeWidth: 4},
      {threshold: 5, color: [0, 255, 0], strokeWidth: 2},
      {threshold: 15, color: [0, 0, 255]}
    ]
  }
};

const ContourLayerBandsExample = {
  layer: ContourLayer,
  getData: () => dataSamples.points,
  props: {
    id: 'contourLayer',
    cellSize: 200,
    getPosition: d => d.COORDINATES,
    gpuAggregation: true,
    contours: [
      {threshold: [1, 5], color: [255, 0, 0]},
      {threshold: [5, 15], color: [0, 255, 0]},
      {threshold: [15, 1000], color: [0, 0, 255]}
    ]
  }
};

function getMean(pts, key) {
  const filtered = pts.filter(pt => Number.isFinite(pt[key]));

  return filtered.length
    ? filtered.reduce((accu, curr) => accu + curr[key], 0) / filtered.length
    : null;
}

function getMax(pts, key) {
  const filtered = pts.filter(pt => Number.isFinite(pt[key]));

  return filtered.length
    ? filtered.reduce((accu, curr) => (curr[key] > accu ? curr[key] : accu), -Infinity)
    : null;
}

const CPUGridLayerExample = {
  layer: CPUGridLayer,
  props: {
    id: 'gridLayer',
    data: dataSamples.points,
    cellSize: 200,
    opacity: 1,
    extruded: true,
    pickable: true,
    colorScaleType: 'quantize',
    getPosition: d => d.COORDINATES,
    getColorValue: points => getMean(points, 'SPACES'),
    getElevationValue: points => getMax(points, 'SPACES')
  }
};

const HexagonLayerExample = {
  layer: HexagonLayer,
  props: {
    id: 'HexagonLayer',
    data: dataSamples.points,
    extruded: true,
    pickable: true,
    radius: 1000,
    opacity: 1,
    elevationScale: 1,
    elevationRange: [0, 3000],
    coverage: 1,
    colorScaleType: 'quantile',
    getPosition: d => d.COORDINATES,
    getColorValue: points => getMean(points, 'SPACES'),
    getElevationValue: points => getMax(points, 'SPACES')
  }
};

const GRID_LAYER_PROPS_OBJECT = {
  id: 'grid-layer',
  cellSize: 200,
  opacity: 1,
  extruded: true,
  pickable: false,
  getPosition: d => d.COORDINATES
};

const GPU_GRID_LAYER_PROPS_OBJECT = Object.assign({}, GRID_LAYER_PROPS_OBJECT, {
  id: 'gpu-grid-layer'
});

const GRID_LAYER_PROPS = {
  getData: () => dataSamples.points,
  props: GRID_LAYER_PROPS_OBJECT
};

const GPU_GRID_LAYER_PROPS = {
  getData: () => dataSamples.points,
  props: GPU_GRID_LAYER_PROPS_OBJECT
};

const HEAT_LAYER_PROPS = {
  getData: () => dataSamples.points,
  props: {
    id: 'heatmp-layer',
    opacity: 1,
    pickable: false,
    getPosition: d => d.COORDINATES
  }
};

const GPUGridLayerExample = Object.assign({}, {layer: GPUGridLayer}, GPU_GRID_LAYER_PROPS);
const GridLayerExample = Object.assign({}, {layer: GridLayer}, GRID_LAYER_PROPS);
const HeatmapLayerExample = Object.assign({}, {layer: HeatmapLayer}, HEAT_LAYER_PROPS);

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

/* eslint-disable quote-props */
export default {
  'Aggregation Layers': {
    CPUGridLayer: CPUGridLayerExample,
    ScreenGridLayer: ScreenGridLayerExample,
    HexagonLayer: HexagonLayerExample,
    ContourLayer: ContourLayerExample,
    'ContourLayer (Bands)': ContourLayerBandsExample,
    GPUGridLayer: GPUGridLayerExample,
    GridLayer: GridLayerExample,
    HeatmapLayer: HeatmapLayerExample,
    'GPUGridLayer (1M)': GPUGridLayerPerfExample('1M', dataSamples.getPoints1M),
    'GPUGridLayer (5M)': GPUGridLayerPerfExample('5M', dataSamples.getPoints5M)
  }
};
