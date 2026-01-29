// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';

import * as FIXTURES from 'deck.gl-test/data';

import {testLayer, testLayerAsync, generateLayerTests} from '@deck.gl/test-utils';

import {PathLayer, SolidPolygonLayer} from '@deck.gl/layers';
import {ContourLayer, ContourLayerProps} from '@deck.gl/aggregation-layers';

const getPosition = d => d.COORDINATES;
const CONTOURS: ContourLayerProps['contours'] = [
  {threshold: 1, color: [255, 0, 0]}, // => Isoline for threshold 1
  {threshold: 5, color: [0, 255, 0]}, // => Isoline for threshold 5
  {threshold: [6, 10], color: [0, 0, 255]} // => Isoband for threshold range [6, 10)
];

test('ContourLayer', () => {
  const testCases = generateLayerTests({
    Layer: ContourLayer,
    sampleProps: {
      data: FIXTURES.points.slice(0, 3),
      getPosition
    },
    assert: (cond, msg) => expect(cond).toBeTruthy(),
    onBeforeUpdate: ({testCase}) => console.log(testCase.title),
    onAfterUpdate({layer}) {
      expect(layer.state.aggregator, 'should create aggregator').toBeTruthy();
    }
  });

  testLayer({Layer: ContourLayer, testCases, onError: err => expect(err).toBeFalsy()});
});

test('ContourLayer#updates', async () => {
  let prevState: ContourLayer['state'];
  await testLayerAsync({
    Layer: ContourLayer,
    testCases: [
      {
        title: 'Render sublayers for both iso-lines and iso-bands',
        props: {
          data: FIXTURES.points,
          gpuAggregation: true,
          contours: CONTOURS,
          cellSize: 200,
          getPosition
        },
        onBeforeUpdate: ({testCase}) => console.log(testCase.title),
        onAfterUpdate: ({layer, subLayers}) => {
          expect(subLayers[0] instanceof PathLayer, 'Sublayer Line layer rendered').toBeTruthy();
          expect(
            subLayers[1] instanceof SolidPolygonLayer,
            'Sublayer SolidPolygon layer rendered'
          ).toBeTruthy();
          prevState = {...layer.state};
        }
      },
      {
        title: 'Update zOffset',
        updateProps: {
          zOffset: 0.1
        },
        onBeforeUpdate: ({testCase}) => console.log(testCase.title),
        onAfterUpdate: ({layer}) => {
          expect(prevState.aggregatedValueReader, 'aggregation not updated').toBe(
            (layer as ContourLayer).state.aggregatedValueReader
          );
          expect(prevState.contourData, 'contour data not updated').toBe(
            (layer as ContourLayer).state.contourData
          );
        }
      },
      {
        title: 'Update cellSize',
        updateProps: {
          cellSize: 300
        },
        onBeforeUpdate: ({testCase}) => console.log(testCase.title),
        onAfterUpdate: ({layer}) => {
          expect(prevState.aggregatedValueReader, 'aggregation is updated').not.toBe(
            (layer as ContourLayer).state.aggregatedValueReader
          );
          expect(prevState.contourData, 'contour data is recalculated').not.toBe(
            (layer as ContourLayer).state.contourData
          );
          prevState = {...layer.state};
        }
      },
      {
        title: 'Render sublayer for iso-lines',
        updateProps: {
          contours: CONTOURS.slice(0, 1)
        },
        onBeforeUpdate: ({testCase}) => console.log(testCase.title),
        onAfterUpdate: ({layer, subLayers}) => {
          expect(prevState.aggregatedValueReader, 'aggregation not updated').toBe(
            (layer as ContourLayer).state.aggregatedValueReader
          );
          expect(prevState.contourData, 'contour data is recalculated').not.toBe(
            (layer as ContourLayer).state.contourData
          );
          expect(subLayers[0] instanceof PathLayer, 'Sublayer Line layer rendered').toBeTruthy();
          expect(subLayers.length, 'Sublayer SolidPolygon layer not rendered').toBe(1);
          prevState = {...layer.state};
        }
      },
      {
        title: 'Render sublayer for iso-bands',
        updateProps: {
          contours: CONTOURS.slice(2, 3)
        },
        onBeforeUpdate: ({testCase}) => console.log(testCase.title),
        onAfterUpdate: ({layer, subLayers}) => {
          expect(prevState.aggregatedValueReader, 'aggregation not updated').toBe(
            (layer as ContourLayer).state.aggregatedValueReader
          );
          expect(prevState.contourData, 'contour data is recalculated').not.toBe(
            (layer as ContourLayer).state.contourData
          );
          expect(subLayers.length, 'Sublayer Line layer not rendered').toBe(1);
          expect(
            subLayers[0] instanceof SolidPolygonLayer,
            'Sublayer SolidPolygon layer rendered'
          ).toBeTruthy();
          prevState = {...layer.state};
        }
      },
      {
        title: 'Use CPU aggregation',
        updateProps: {
          gpuAggregation: false
        },
        onBeforeUpdate: ({testCase}) => console.log(testCase.title),
        onAfterUpdate: ({layer}) => {
          expect(prevState.aggregator, 'aggregator changed').not.toBe(
            (layer as ContourLayer).state.aggregator
          );
          expect(prevState.aggregatedValueReader, 'aggregation is updated').not.toBe(
            (layer as ContourLayer).state.aggregatedValueReader
          );
          expect(prevState.contourData, 'contour data is recalculated').not.toBe(
            (layer as ContourLayer).state.contourData
          );
          prevState = {...layer.state};
        }
      }
    ],
    onError: err => expect(err).toBeFalsy()
  });
});
