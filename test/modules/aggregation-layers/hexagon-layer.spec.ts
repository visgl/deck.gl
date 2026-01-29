// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {testLayer, generateLayerTests} from '@deck.gl/test-utils';
import {HexagonLayer, WebGLAggregator, CPUAggregator} from '@deck.gl/aggregation-layers';
import * as FIXTURES from 'deck.gl-test/data';
import {device} from '@deck.gl/test-utils';

const SAMPLE_PROPS = {
  data: FIXTURES.points.slice(0, 3),
  getPosition: d => d.COORDINATES
  // gpuAggregation: false
};

test('HexagonLayer', () => {
  const testCases = generateLayerTests({
    Layer: HexagonLayer,
    sampleProps: SAMPLE_PROPS,
    assert: (cond, msg) => expect(cond).toBeTruthy(),
    onBeforeUpdate: ({testCase}) => console.log(testCase.title),
    onAfterUpdate({layer}) {
      expect(layer.state.aggregator, 'should have aggregator').toBeTruthy();
    }
  });

  testLayer({Layer: HexagonLayer, testCases, onError: err => expect(err).toBeFalsy()});
});

test('HexagonLayer#getAggregatorType', () => {
  if (!WebGLAggregator.isSupported(device)) {
    console.log('GPU aggregation not supported, skipping');
    return;
  }
  testLayer({
    Layer: HexagonLayer,
    onError: err => expect(err).toBeFalsy(),
    testCases: [
      {
        title: 'Default',
        props: SAMPLE_PROPS,
        onAfterUpdate({layer}) {
          expect(
            layer.state.aggregator instanceof WebGLAggregator,
            'By default should use GPU Aggregation'
          ).toBeTruthy();
        }
      },
      {
        title: 'Disable gpuAggregation',
        updateProps: {
          gpuAggregation: false
        },
        onAfterUpdate({layer}) {
          expect(
            layer.state.aggregator instanceof CPUAggregator,
            'Should use CPU Aggregation (gpuAggregation: false)'
          ).toBeTruthy();
        }
      },
      {
        title: 'Enable gpuAggregation',
        updateProps: {
          gpuAggregation: true
        },
        onAfterUpdate({layer}) {
          expect(
            layer.state.aggregator instanceof WebGLAggregator,
            'Should use GPU Aggregation (gpuAggregation: true)'
          ).toBeTruthy();
        }
      },
      {
        title: 'fallback to CPU aggregation',
        updateProps: {
          getColorValue: points => points.length
        },
        onAfterUpdate({layer, subLayers, spies}) {
          expect(
            layer.state.aggregator instanceof CPUAggregator,
            'Should use CPU Aggregation (getColorValue)'
          ).toBeTruthy();
        }
      },
      {
        title: 'fallback to CPU aggregation',
        updateProps: {
          getElevationValue: points => points.length
        },
        onAfterUpdate({layer, subLayers, spies}) {
          expect(
            layer.state.aggregator instanceof CPUAggregator,
            'Should use CPU Aggregation (getElevationValue)'
          ).toBeTruthy();
        }
      }
    ]
  });
});

test('HexagonLayer#non-iterable data', () => {
  const dataNonIterable = {
    length: 3,
    positions: FIXTURES.points.slice(0, 3).flatMap(d => d.COORDINATES),
    weights: FIXTURES.points.slice(0, 3).map(d => d.SPACES)
  } as const;

  testLayer({
    Layer: HexagonLayer,
    onError: err => expect(err).toBeFalsy(),
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
        onAfterUpdate: ({subLayer}) => {}
      },
      {
        title: 'Non-iterable data with accessors',
        updateProps: {
          getColorWeight: (_, {index, data}) => {
            expect(
              Number.isFinite(index) && data,
              'point index and context are populated'
            ).toBeTruthy();
            return (data as any).weights[index * 2];
          },
          getElevationWeight: (_, {index, data}) => {
            expect(
              Number.isFinite(index) && data,
              'point index and context are populated'
            ).toBeTruthy();
            return (data as any).weights[index * 2];
          },
          updateTriggers: {
            getColorWeight: 1,
            getElevationWeight: 1
          }
        },
        onAfterUpdate: ({subLayer}) => {}
      },
      {
        title: 'Non-iterable data with custom aggregation',
        updateProps: {
          getColorValue: (points, {indices, data: {weights}}) => {
            expect(indices && weights, 'context is populated').toBeTruthy();
            return points.length;
          },
          getElevationValue: (points, {indices, data: {weights}}) => {
            expect(indices && weights, 'context is populated').toBeTruthy();
            return points.length;
          },
          updateTriggers: {
            getColorValue: 1,
            getElevationValue: 1
          }
        },
        onAfterUpdate: ({subLayer}) => {}
      }
    ]
  });
});
