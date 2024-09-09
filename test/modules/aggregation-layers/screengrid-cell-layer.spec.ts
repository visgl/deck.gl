// Copyright (c) 2015 - 2017 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
/* eslint-disable func-style, no-console, max-len */
import test from 'tape-promise/tape';
import {device, getLayerUniforms} from '@deck.gl/test-utils';
import ScreenGridCellLayer from '@deck.gl/aggregation-layers/screen-grid-layer/screen-grid-cell-layer';

import {testLayer} from '@deck.gl/test-utils';
let cellSize;

test('ScreenGridCellLayer#constructor', t => {
  const SAMPLE_BUFFER = device.createBuffer({});

  testLayer({
    Layer: ScreenGridCellLayer,
    onError: t.notOk,
    testCases: [
      {
        title: 'Constructor',
        props: {
          data: {
            attributes: {
              instanceWeights: SAMPLE_BUFFER,
              instancePositions: SAMPLE_BUFFER
            }
          },
          cellSizePixels: 100,
          cellMarginPixels: 2,
          numInstances: 1,
          colorDomain: () => [0, 1]
        }
      },
      {
        updateProps: {
          cellSizePixels: 50 // default 100
        },
        onBeforeUpdate({layer}) {
          const uniforms = getLayerUniforms(layer);
          cellSize = uniforms.cellSizeClipspace;
        },
        onAfterUpdate({layer}) {
          t.ok(layer.state, 'should update layer state');
          const uniforms = getLayerUniforms(layer);
          t.notDeepEqual(
            uniforms.cellSizeClipspace,
            cellSize,
            'should update cellSizeClipspace uniform'
          );
        }
      },
      {
        updateProps: {
          colorDomain: () => [5, 50]
        },
        onAfterUpdate({layer, oldState}) {
          const uniforms = getLayerUniforms(layer);
          t.deepEqual(uniforms.colorDomain, [5, 50], 'should update colorDomain uniform');
        }
      }
    ]
  });

  t.end();
});
