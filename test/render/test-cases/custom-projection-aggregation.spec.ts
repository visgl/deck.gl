// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {describe, expect} from 'vitest';
import {_CustomProjectionView as CustomProjectionView} from '@deck.gl/core';
import {ContourLayer, HeatmapLayer, HexagonLayer} from '@deck.gl/aggregation-layers';
import {PathLayer} from '@deck.gl/layers';
import {Proj4Projection} from '@math.gl/proj4';
import {
  projectionGrid,
  projectionGridBounds,
  type ProjectionGridPoint
} from 'deck.gl-test/data/projection-grid';
import {runRenderTestSuite} from '../render-test-suite';
import type {TestCase} from '../deck-test-utils';

// Albers equal-area conic, with standard parallels bracketing the test grid.
const converter = new Proj4Projection({
  from: 'EPSG:4326',
  to: '+proj=aea +lat_0=30 +lon_0=-90 +lat_1=35 +lat_2=65 +x_0=0 +y_0=0 +datum=WGS84 +units=m +no_defs'
});
const view = new CustomProjectionView({
  projection: {forward: converter.project, inverse: converter.unproject},
  outputBounds: [-4500000, -500000, 4500000, 5500000],
  inputUnits: 'degrees',
  resolution: 1
});
const colorRange: [number, number, number][] = [
  [255, 255, 178],
  [254, 217, 118],
  [254, 178, 76],
  [253, 141, 60],
  [240, 59, 32],
  [189, 0, 38]
];
const commonProps = {
  data: projectionGrid,
  getPosition: (point: ProjectionGridPoint) => point.position
};
const getWeight = (point: ProjectionGridPoint) => point.value;

function outline() {
  const [west, south, east, north] = projectionGridBounds;
  return new PathLayer({
    id: 'grid-boundary',
    data: [
      [
        [west, south],
        [east, south],
        [east, north],
        [west, north],
        [west, south]
      ]
    ],
    getPath: path => path,
    getColor: [30, 40, 50],
    getWidth: 1,
    widthUnits: 'pixels'
  });
}

const testCases: TestCase[] = [];
for (const gpuAggregation of [false, true]) {
  const backend = gpuAggregation ? 'gpu' : 'cpu';
  testCases.push(
    {
      name: `custom-projection-contour-${backend}`,
      views: view,
      viewState: {target: [256, 256, 0], zoom: 0.1},
      layers: [
        new ContourLayer({
          ...commonProps,
          id: 'conic-contour',
          gpuAggregation,
          cellSize: 200000,
          aggregation: 'MEAN',
          getWeight,
          contours: [
            {threshold: [1, 3], color: colorRange[0]},
            {threshold: [3, 5], color: colorRange[2]},
            {threshold: [5, 10], color: colorRange[4]},
            {threshold: 3, color: [80, 30, 20], strokeWidth: 2},
            {threshold: 5, color: [80, 30, 20], strokeWidth: 2}
          ]
        }),
        outline()
      ],
      goldenImage: './test/render/golden-images/custom-projection-contour.png'
    },
    {
      name: `custom-projection-hexagon-${backend}`,
      views: view,
      viewState: {target: [256, 256, 0], zoom: 0.1, pitch: 30, bearing: 15},
      layers: [
        new HexagonLayer({
          ...commonProps,
          id: 'conic-hexagon',
          gpuAggregation,
          radius: 150000,
          coverage: 0.9,
          colorAggregation: 'MEAN',
          getColorWeight: getWeight,
          colorDomain: [1, 9],
          colorRange,
          extruded: true,
          getElevationWeight: getWeight,
          elevationAggregation: 'MEAN',
          elevationDomain: [1, 9],
          elevationRange: [0, 300000]
        }),
        outline()
      ],
      goldenImage: './test/render/golden-images/custom-projection-hexagon.png'
    }
  );
}
testCases.push({
  name: 'custom-projection-heatmap',
  views: view,
  viewState: {target: [256, 256, 0], zoom: 0.1},
  layers: [
    new HeatmapLayer({
      ...commonProps,
      id: 'conic-heatmap',
      getWeight,
      aggregation: 'MEAN',
      colorDomain: [0, 9],
      colorRange,
      radiusPixels: 20,
      weightsTextureSize: 512
    }),
    outline()
  ],
  goldenImage: './test/render/golden-images/custom-projection-heatmap.png'
});

describe.each(['webgl', 'webgpu'] as const)('Custom projection / aggregation / %s', deviceType => {
  runRenderTestSuite(testCases, deviceType, {
    beforeAll: () => {
      expect(projectionGrid).toHaveLength(91 * 46);
      expect(projectionGrid[0].position).toEqual([-135, 30]);
      expect(projectionGrid.at(-1)!.position).toEqual([-45, 75]);
      expect(projectionGrid.every(point => Number.isFinite(point.value) && point.value >= 1)).toBe(
        true
      );
    }
  });
});
