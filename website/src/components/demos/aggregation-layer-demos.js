/* eslint-disable import/namespace, import/default, import/no-extraneous-dependencies */
import createLayerDemoClass from './layer-demo-base';
import {DATA_URI} from '../../constants/defaults';

import {
  ContourLayer,
  GridLayer,
  GridCellLayer,
  HexagonLayer,
  ScreenGridLayer,
  _GPUGridLayer as GPUGridLayer,
  _NewGridLayer as NewGridLayer
} from '@deck.gl/aggregation-layers';

export const ContourLayerDemo = createLayerDemoClass({
  Layer: ContourLayer,
  dataUrl: `${DATA_URI}/sf-bike-parking.json`,
  formatTooltip: d => `threshold: ${d.threshold}`,
  props: {
    pickable: true,
    cellSize: 200,
    elevationScale: 4,
    getPosition: d => d.COORDINATES,
    contours: [
      {threshold: 1, color: [255, 0, 0], strokeWidth: 2, zIndex: 1},
      {threshold: [3, 10], color: [55, 0, 55], zIndex: 0},
      {threshold: 5, color: [0, 255, 0], strokeWidth: 6, zIndex: 2},
      {threshold: 15, color: [0, 0, 255], strokeWidth: 4, zIndex: 3}
    ]
  }
});

export const GridCellLayerDemo = createLayerDemoClass({
  Layer: GridCellLayer,
  dataUrl: `${DATA_URI}/hexagons.json`,
  formatTooltip: d => `height: ${d.value * 5000}m`,
  props: {
    pickable: true,
    extruded: true,
    cellSize: 200,
    elevationScale: 5000,
    getPosition: d => d.centroid,
    getColor: d => [48, 128, d.value * 255, 255],
    getElevation: d => d.value
  }
});

const GRID_LAYER_INFO = {
  dataUrl: `${DATA_URI}/sf-bike-parking.json`,
  formatTooltip: d => `${d.position.join(', ')}\nCount: ${d.count}`,
  props: {
    pickable: true,
    extruded: true,
    cellSize: 200,
    elevationScale: 4,
    getPosition: d => d.COORDINATES
  }
};

export const GPUGridLayerDemo = createLayerDemoClass({
  Layer: GPUGridLayer,
  ...GRID_LAYER_INFO
});

export const NewGridLayerDemo = createLayerDemoClass({
  Layer: NewGridLayer,
  ...GRID_LAYER_INFO
});

export const GridLayerDemo = createLayerDemoClass({
  Layer: GridLayer,
  ...GRID_LAYER_INFO
});

export const HexagonLayerDemo = createLayerDemoClass({
  Layer: HexagonLayer,
  dataUrl: `${DATA_URI}/sf-bike-parking.json`,
  formatTooltip: d => `${d.position.join(', ')}\nCount: ${d.count}`,
  props: {
    extruded: true,
    radius: 200,
    elevationScale: 4,
    getPosition: d => d.COORDINATES
  }
});

export const ScreenGridLayerDemo = createLayerDemoClass({
  Layer: ScreenGridLayer,
  dataUrl: `${DATA_URI}/sf-bike-parking.json`,
  formatTooltip: d => 'aggregated cell',
  props: {
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
  }
});
