// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import test from 'tape-promise/tape';

import {ColumnLayer} from '@deck.gl/layers';
import {testLayer} from '@deck.gl/test-utils';

test('ColumnLayer - binary fill model clears wireframe indices', t => {
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

          t.ok(wireframeModel.vertexArray.indexBuffer, 'wireframe model keeps geometry indices');

          fillModel.setIndexBuffer(wireframeModel.vertexArray.indexBuffer);
          t.ok(fillModel.vertexArray.indexBuffer, 'sanity check: fill model has leaked indices');

          layer.draw({uniforms: {}} as any);

          t.notOk(
            fillModel.vertexArray.indexBuffer,
            'fill model disables wireframe indices before drawing fill geometry'
          );
        }
      }
    ],
    onError: t.notOk
  });

  t.end();
});
