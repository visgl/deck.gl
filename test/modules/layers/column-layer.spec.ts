// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';

import {ColumnLayer} from '@deck.gl/layers';
import {testLayer} from '@deck.gl/test-utils/vitest';

// Regression test for #9463 / #10021: with binary data the fill model must
// never acquire the wireframe index buffer, even after a buffer-layout rebuild
// (which happens on binary-data transitions and HMR).
test('ColumnLayer - fill model never acquires wireframe indices', () => {
  testLayer({
    Layer: ColumnLayer,
    testCases: [
      {
        title: 'binary data',
        props: {
          data: {
            length: 3,
            attributes: {
              getPosition: {value: new Float64Array([37, 122, 37.1, 122, 37, 122.8]), size: 2},
              getFillColor: {
                value: new Uint8Array([255, 0, 0, 255, 0, 255, 0, 255, 0, 0, 255, 255]),
                size: 4
              },
              getElevation: {value: new Float32Array([100, 200, 300]), size: 1}
            }
          },
          radius: 10,
          extruded: true
        },
        onAfterUpdate: ({layer}) => {
          const fillModel = layer.state.fillModel!;
          const wireframeModel = layer.state.wireframeModel!;

          expect(
            wireframeModel.vertexArray.indexBuffer,
            'wireframe model keeps geometry indices'
          ).toBeTruthy();
          expect(
            fillModel.vertexArray.indexBuffer,
            'fill model has no wireframe indices after initial update'
          ).toBeFalsy();

          // Simulate the vertex-array rebuild that caused the original leak
          // (Layer._setModelAttributes -> Model.setBufferLayout when attribute
          // buffer layouts change, e.g. binary-data transitions / HMR).
          fillModel.setBufferLayout(fillModel.bufferLayout);

          expect(
            fillModel.vertexArray.indexBuffer,
            'fill model still has no wireframe indices after buffer-layout rebuild'
          ).toBeFalsy();
        }
      }
    ],
    onError: err => expect(err).toBeFalsy()
  });
});
