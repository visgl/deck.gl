// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {expect, test} from 'vitest';
import {SolidPolygonLayer} from '@deck.gl/layers';
import {testLayer} from '@deck.gl/test-utils/vitest';

// Enough triangles that the tessellator's index buffer is allocated with spare capacity,
// which is retained when the layer is updated with a smaller data set.
const LARGE_DATA = Array.from({length: 32}, (element, index) => ({
  polygon: [
    [index, 0],
    [index + 0.8, 0],
    [index + 0.8, 0.8],
    [index, 0.8]
  ]
}));

const SMALL_DATA = [
  {
    polygon: [
      [0, 0],
      [1, 0],
      [1, 1],
      [0, 1]
    ]
  }
];

test('SolidPolygonLayer#indexed draw count tracks the active indices after a data update', () => {
  testLayer({
    Layer: SolidPolygonLayer,
    testCases: [
      {
        props: {data: LARGE_DATA},
        onAfterUpdate({layer}) {
          const {topModel, polygonTesselator} = layer.state;
          expect(topModel.indexCount, 'the first render draws the whole mesh').toBe(
            polygonTesselator.vertexCount
          );
        }
      },
      {
        updateProps: {data: SMALL_DATA},
        onAfterUpdate({layer}) {
          const {topModel, polygonTesselator} = layer.state;
          // The index buffer keeps the allocation from the previous data set, so the bound
          // buffer stays larger than the mesh that is currently tessellated.
          expect(polygonTesselator.attributes.indices.length).toBeGreaterThan(
            polygonTesselator.vertexCount
          );
          expect(
            topModel.indexCount,
            'the draw count is the active index count, not the retained buffer size'
          ).toBe(polygonTesselator.vertexCount);
        }
      }
    ]
  });
});
