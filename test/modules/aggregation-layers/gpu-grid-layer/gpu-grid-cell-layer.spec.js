// Copyright (c) 2015 - 2019 Uber Technologies, Inc.
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

import test from 'tape-catch';
import {Buffer} from '@luma.gl/core';
import {testLayer, testInitializeLayer} from '@deck.gl/test-utils';
import GPUGridCellLayer from '@deck.gl/aggregation-layers/gpu-grid-layer/gpu-grid-cell-layer';
import {setupSpysForWebGL1, restoreSpies} from './webgl1-spies-utils';
import {gl} from '@deck.gl/test-utils';
const SAMPLE_BUFFER = new Buffer(gl);
const SAMPLE_PROPS = {
  data: {
    attributes: {
      color: {
        aggregationBuffer: SAMPLE_BUFFER
      },
      elevation: {
        aggregationBuffer: SAMPLE_BUFFER
      }
    }
  },
  colorMaxMinBuffer: SAMPLE_BUFFER,
  elevationMaxMinBuffer: SAMPLE_BUFFER
};

test('GPUGridCellLayer#initializeState', t => {
  const webgl1Spies = setupSpysForWebGL1(gl);
  const layer = new GPUGridCellLayer(SAMPLE_PROPS);

  testInitializeLayer({layer, onError: t.notOk});

  t.ok(layer.state.model, 'should set state.model');

  restoreSpies(webgl1Spies);
  t.end();
});

test('GPUGridCellLayer#updates', t => {
  const webgl1Spies = setupSpysForWebGL1(gl);

  testLayer({
    Layer: GPUGridCellLayer,
    onError: t.notOk,
    testCases: [
      {
        props: SAMPLE_PROPS,
        onAfterUpdate({layer}) {
          t.ok(layer.state.model, 'should set state.model');
        }
      },
      {
        updateProps: {
          cellSize: 123
        },
        onAfterUpdate({layer, spies}) {
          t.equal(layer.state.model.uniforms.cellSize, 123, 'cellSize uniform should get updated');
        }
      }
    ]
  });

  restoreSpies(webgl1Spies);
  t.end();
});
