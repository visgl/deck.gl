import {
  ContourLayer,
  CPUGridLayer,
  HexagonLayer,
  ScreenGridLayer,
  GPUGridLayer,
  GridLayer,
  HeatmapLayer
} from '@deck.gl/aggregation-layers';

import makeLayerDemo from './layer-demo';
import {DATA_URI} from '../constants/defaults';

export const ContourLayerDemo = makeLayerDemo({
  getTooltip: ({object}) => `threshold: ${object.threshold}`,
  layer: new ContourLayer({
    data: `${DATA_URI}/sf-bike-parking.json`,
    pickable: true,
    cellSize: 200,
    getPosition: d => d.COORDINATES,
    contours: [
      {threshold: 1, color: [255, 0, 0], strokeWidth: 2, zIndex: 1},
      {threshold: [3, 10], color: [55, 0, 55], zIndex: 0},
      {threshold: 5, color: [0, 255, 0], strokeWidth: 6, zIndex: 2},
      {threshold: 15, color: [0, 0, 255], strokeWidth: 4, zIndex: 3}
    ]
  })
});

const GRID_LAYER_INFO = {
  getTooltip: ({object}) => `${object.position.join(', ')}\nCount: ${object.count}`,
  props: {
    data: `${DATA_URI}/sf-bike-parking.json`,
    pickable: true,
    extruded: true,
    cellSize: 200,
    elevationScale: 4,
    getPosition: d => d.COORDINATES
  }
};

export const GPUGridLayerDemo = makeLayerDemo({
  getTooltip: GRID_LAYER_INFO.getTooltip,
  layer: new GPUGridLayer(GRID_LAYER_INFO.props)
});

export const GridLayerDemo = makeLayerDemo({
  getTooltip: GRID_LAYER_INFO.getTooltip,
  layer: new GridLayer(GRID_LAYER_INFO.props)
});

export const CPUGridLayerDemo = makeLayerDemo({
  getTooltip: GRID_LAYER_INFO.getTooltip,
  layer: new CPUGridLayer(GRID_LAYER_INFO.props)
});

export const HexagonLayerDemo = makeLayerDemo({
  getTooltip: ({object}) => `${object.position.join(', ')}\nCount: ${object.count}`,
  layer: new HexagonLayer({
    data: `${DATA_URI}/sf-bike-parking.json`,
    extruded: true,
    radius: 200,
    elevationScale: 4,
    getPosition: d => d.COORDINATES
  })
});

export const ScreenGridLayerDemo = makeLayerDemo({
  getTooltip: _ => 'aggregated cell',
  layer: new ScreenGridLayer({
    data: `${DATA_URI}/sf-bike-parking.json`,
    pickable: false,
    opacity: 0.8,
    cellSizePixels: 50,
    colorRange: [
      [0, 25, 0, 25],
      [0, 85, 0, 85],
      [0, 127, 0, 127],
      [0, 170, 0, 170],
      [0, 190, 0, 190],
      [0, 255, 0, 255]
    ],
    getPosition: d => d.COORDINATES,
    getWeight: d => d.SPACES
  })
});

export const HeatmapLayerDemo = makeLayerDemo({
  getTooltip: _ => 'heatmap',
  layer: new HeatmapLayer({
    data: `${DATA_URI}/sf-bike-parking.json`,
    pickable: false,
    getPosition: d => d.COORDINATES,
    radiusPixels: 25
  })
});
