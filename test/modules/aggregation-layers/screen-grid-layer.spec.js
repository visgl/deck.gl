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
import * as FIXTURES from 'deck.gl-test/data';
import {testLayer, generateLayerTests} from '@deck.gl/test-utils';
import {ScreenGridLayer} from '@deck.gl/aggregation-layers';

const getPosition = d => d.COORDINATES;

test('ScreenGridLayer', t => {
  let testCases = generateLayerTests({
    Layer: ScreenGridLayer,
    sampleProps: {
      data: FIXTURES.points.slice(0, 3),
      getPosition
    },
    assert: t.ok,
    onBeforeUpdate: ({testCase}) => t.comment(testCase.title),
    onAfterUpdate({layer}) {
      t.ok(layer.state.aggregationResults !== null, 'should update state.aggregationResults');
    }
  });

  testCases = testCases.concat([
    {
      updateProps: {
        gpuAggregation: true
      }
    },
    {
      updateProps: {
        gpuAggregation: false
      },
      onAfterUpdate({layer, oldState}) {
        if (oldState.gpuAggregation) {
          // Under WebGL1 gpuAggregation is always false, this change is a nop
          const {aggregationDataDirty} = layer.state;
          t.ok(
            aggregationDataDirty,
            'should set aggregationDataDirty when gpuAggregation prop changes'
          );
        }
      }
    }
  ]);

  testLayer({Layer: ScreenGridLayer, testCases, onError: t.notOk});

  t.end();
});
