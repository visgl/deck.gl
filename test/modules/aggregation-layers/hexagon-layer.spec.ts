// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import test from 'tape-promise/tape';
import {testLayer, generateLayerTests} from '@deck.gl/test-utils';
import {HexagonLayer, WebGLAggregator, CPUAggregator} from '@deck.gl/aggregation-layers';
import * as FIXTURES from 'deck.gl-test/data';
import {device} from '@deck.gl/test-utils';

const SAMPLE_PROPS = {
  data: FIXTURES.points.slice(0, 3),
  getPosition: d => d.COORDINATES
  // gpuAggregation: false
};

test('HexagonLayer', t => {
  const testCases = generateLayerTests({
    Layer: HexagonLayer,
    sampleProps: SAMPLE_PROPS,
    assert: t.ok,
    onBeforeUpdate: ({testCase}) => t.comment(testCase.title),
    onAfterUpdate({layer}) {
      t.ok(layer.state.aggregator, 'should have aggregator');
    }
  });

  testLayer({Layer: HexagonLayer, testCases, onError: t.notOk});

  t.end();
});

test('HexagonLayer#getAggregatorType', t => {
  if (!WebGLAggregator.isSupported(device)) {
    t.comment('GPU aggregation not supported, skipping');
    t.end();
    return;
  }
  testLayer({
    Layer: HexagonLayer,
    onError: t.notOk,
    testCases: [
      {
        title: 'Default',
        props: SAMPLE_PROPS,
        onAfterUpdate({layer}) {
          t.ok(
            layer.state.aggregator instanceof WebGLAggregator,
            'By default should use GPU Aggregation'
          );
        }
      },
      {
        title: 'Disable gpuAggregation',
        updateProps: {
          gpuAggregation: false
        },
        onAfterUpdate({layer}) {
          t.ok(
            layer.state.aggregator instanceof CPUAggregator,
            'Should use CPU Aggregation (gpuAggregation: false)'
          );
        }
      },
      {
        title: 'Enable gpuAggregation',
        updateProps: {
          gpuAggregation: true
        },
        onAfterUpdate({layer}) {
          t.ok(
            layer.state.aggregator instanceof WebGLAggregator,
            'Should use GPU Aggregation (gpuAggregation: true)'
          );
        }
      },
      {
        title: 'fallback to CPU aggregation',
        updateProps: {
          getColorValue: points => points.length
        },
        onAfterUpdate({layer, subLayers, spies}) {
          t.ok(
            layer.state.aggregator instanceof CPUAggregator,
            'Should use CPU Aggregation (getColorValue)'
          );
        }
      },
      {
        title: 'fallback to CPU aggregation',
        updateProps: {
          getElevationValue: points => points.length
        },
        onAfterUpdate({layer, subLayers, spies}) {
          t.ok(
            layer.state.aggregator instanceof CPUAggregator,
            'Should use CPU Aggregation (getElevationValue)'
          );
        }
      }
    ]
  });
  t.end();
});

test('HexagonLayer#non-iterable data', t => {
  const dataNonIterable = {
    length: 3,
    positions: FIXTURES.points.slice(0, 3).flatMap(d => d.COORDINATES),
    weights: FIXTURES.points.slice(0, 3).map(d => d.SPACES)
  } as const;

  testLayer({
    Layer: HexagonLayer,
    onError: t.notOk,
    testCases: [
      {
        title: 'Non-iterable data with constant weights',
        props: {
          data: dataNonIterable,
          cellSize: 400,
          getPosition: (_, {index}) => [
            dataNonIterable.positions[index * 2],
            dataNonIterable.positions[index * 2 + 1]
          ],
          getColorWeight: 1,
          getElevationWeight: 1
        },
        onAfterUpdate: ({subLayer}) => {
          t.pass('Layer updated with constant get*Weight accessors');
        }
      },
      {
        title: 'Non-iterable data with accessors',
        updateProps: {
          getColorWeight: (_, {index, data}) => {
            t.ok(Number.isFinite(index) && data, 'point index and context are populated');
            return (data as any).weights[index * 2];
          },
          getElevationWeight: (_, {index, data}) => {
            t.ok(Number.isFinite(index) && data, 'point index and context are populated');
            return (data as any).weights[index * 2];
          },
          updateTriggers: {
            getColorWeight: 1,
            getElevationWeight: 1
          }
        },
        onAfterUpdate: ({subLayer}) => {
          t.pass('Layer updated with get*Weight accessors and non-iterable data');
        }
      },
      {
        title: 'Non-iterable data with custom aggregation',
        updateProps: {
          getColorValue: (points, {indices, data: {weights}}) => {
            t.ok(indices && weights, 'context is populated');
            return points.length;
          },
          getElevationValue: (points, {indices, data: {weights}}) => {
            t.ok(indices && weights, 'context is populated');
            return points.length;
          },
          updateTriggers: {
            getColorValue: 1,
            getElevationValue: 1
          }
        },
        onAfterUpdate: ({subLayer}) => {
          t.pass('Layer updated with get*Value accessors and non-iterable data');
        }
      }
    ]
  });

  t.end();
});
