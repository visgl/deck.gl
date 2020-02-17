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

import test from 'tape-catch';
import {testLayer, generateLayerTests} from '@deck.gl/test-utils';
import {GridLayer, _GPUGridAggregator as GPUGridAggregator} from '@deck.gl/aggregation-layers';
import * as FIXTURES from 'deck.gl-test/data';
import {gl} from '@deck.gl/test-utils';

const SAMPLE_PROPS = {
  data: FIXTURES.points.slice(0, 3),
  getPosition: d => d.COORDINATES
  // gpuAggregation: false
};

test('GridLayer', t => {
  const testCases = generateLayerTests({
    Layer: GridLayer,
    sampleProps: SAMPLE_PROPS,
    assert: t.ok,
    onBeforeUpdate: ({testCase}) => t.comment(testCase.title),
    onAfterUpdate({layer}) {
      t.ok(layer.state.useGPUAggregation !== undefined, 'should update state.useGPUAggregation');
    }
  });

  testLayer({Layer: GridLayer, testCases, onError: t.notOk});

  t.end();
});

test('GridLayer#updates', t => {
  if (!GPUGridAggregator.isSupported(gl)) {
    t.comment('GPUGridLayer not supported, skipping');
    t.end();
    return;
  }
  testLayer({
    Layer: GridLayer,
    onError: t.notOk,
    testCases: [
      {
        props: SAMPLE_PROPS,
        onAfterUpdate({layer}) {
          t.ok(layer.state.useGPUAggregation === false, 'By default should use CPU Aggregation');
        }
      },
      {
        updateProps: {
          gpuAggregation: true
        },
        onAfterUpdate({layer}) {
          t.ok(
            layer.state.useGPUAggregation === true,
            'Should use GPU Aggregation (gpuAggregation: true)'
          );
        }
      },
      {
        updateProps: {
          upperPercentile: 90
        },
        onAfterUpdate({layer, subLayers, spies}) {
          t.ok(
            layer.state.useGPUAggregation === false,
            'Should use CPU Aggregation (upperPercentile: 90)'
          );
        }
      },
      {
        updateProps: {
          upperPercentile: 100
        },
        onAfterUpdate({layer, subLayers, spies}) {
          t.ok(
            layer.state.useGPUAggregation === true,
            'Should use GPU Aggregation (upperPercentile: 100)'
          );
        }
      },
      {
        updateProps: {
          gpuAggregation: false
        },
        onAfterUpdate({layer, subLayers, spies}) {
          t.ok(
            layer.state.useGPUAggregation === false,
            'Should use CPU Aggregation (gpuAggregation: false)'
          );
        }
      },
      {
        updateProps: {
          gpuAggregation: true
        },
        onAfterUpdate({layer, subLayers, spies}) {
          t.ok(
            layer.state.useGPUAggregation === true,
            'Should use GPU Aggregation (gpuAggregation: true)'
          );
        }
      },
      {
        updateProps: {
          colorAggregation: 'MEAN'
        },
        onAfterUpdate({layer, subLayers, spies}) {
          t.ok(
            layer.state.useGPUAggregation === true,
            'Should use GPU Aggregation (gpuAggregation: true)'
          );
        }
      },
      {
        updateProps: {
          getElevationValue: points => points.length,
          updateTriggers: {
            getElevationValue: 1
          }
        },
        onAfterUpdate({layer, subLayers, spies}) {
          t.ok(
            layer.state.useGPUAggregation === false,
            'Should use CPU Aggregation (getElevationValue)'
          );
        }
      },
      {
        updateProps: {
          colorScaleType: 'quantile'
        },
        onAfterUpdate({layer, subLayers, spies}) {
          t.ok(
            layer.state.useGPUAggregation === false,
            "Should use CPU Aggregation (colorScaleType: 'quantile')"
          );
        }
      },
      {
        updateProps: {
          colorScaleType: 'ordinal'
        },
        onAfterUpdate({layer, subLayers, spies}) {
          t.ok(
            layer.state.useGPUAggregation === false,
            "Should use CPU Aggregation (colorScaleType: 'ordinal')"
          );
        }
      }
    ]
  });
  t.end();
});
