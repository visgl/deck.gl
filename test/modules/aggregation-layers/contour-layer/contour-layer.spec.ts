// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import test from 'tape-promise/tape';

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

test('ContourLayer', t => {
  const testCases = generateLayerTests({
    Layer: ContourLayer,
    sampleProps: {
      data: FIXTURES.points.slice(0, 3),
      getPosition
    },
    assert: t.ok,
    onBeforeUpdate: ({testCase}) => t.comment(testCase.title),
    onAfterUpdate({layer}) {
      t.ok(layer.state.aggregator, 'should create aggregator');
    }
  });

  testLayer({Layer: ContourLayer, testCases, onError: t.notOk});

  t.end();
});

test('ContourLayer#updates', async t => {
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
        onBeforeUpdate: ({testCase}) => t.comment(testCase.title),
        onAfterUpdate: ({layer, subLayers}) => {
          t.ok(subLayers[0] instanceof PathLayer, 'Sublayer Line layer rendered');
          t.ok(subLayers[1] instanceof SolidPolygonLayer, 'Sublayer SolidPolygon layer rendered');
          prevState = {...layer.state};
        }
      },
      {
        title: 'Update zOffset',
        updateProps: {
          zOffset: 0.1
        },
        onBeforeUpdate: ({testCase}) => t.comment(testCase.title),
        onAfterUpdate: ({layer}) => {
          t.is(
            prevState.aggregatedValueReader,
            (layer as ContourLayer).state.aggregatedValueReader,
            'aggregation not updated'
          );
          t.is(
            prevState.contourData,
            (layer as ContourLayer).state.contourData,
            'contour data not updated'
          );
        }
      },
      {
        title: 'Update cellSize',
        updateProps: {
          cellSize: 300
        },
        onBeforeUpdate: ({testCase}) => t.comment(testCase.title),
        onAfterUpdate: ({layer}) => {
          t.not(
            prevState.aggregatedValueReader,
            (layer as ContourLayer).state.aggregatedValueReader,
            'aggregation is updated'
          );
          t.not(
            prevState.contourData,
            (layer as ContourLayer).state.contourData,
            'contour data is recalculated'
          );
          prevState = {...layer.state};
        }
      },
      {
        title: 'Render sublayer for iso-lines',
        updateProps: {
          contours: CONTOURS.slice(0, 1)
        },
        onBeforeUpdate: ({testCase}) => t.comment(testCase.title),
        onAfterUpdate: ({layer, subLayers}) => {
          t.is(
            prevState.aggregatedValueReader,
            (layer as ContourLayer).state.aggregatedValueReader,
            'aggregation not updated'
          );
          t.not(
            prevState.contourData,
            (layer as ContourLayer).state.contourData,
            'contour data is recalculated'
          );
          t.ok(subLayers[0] instanceof PathLayer, 'Sublayer Line layer rendered');
          t.is(subLayers.length, 1, 'Sublayer SolidPolygon layer not rendered');
          prevState = {...layer.state};
        }
      },
      {
        title: 'Render sublayer for iso-bands',
        updateProps: {
          contours: CONTOURS.slice(2, 3)
        },
        onBeforeUpdate: ({testCase}) => t.comment(testCase.title),
        onAfterUpdate: ({layer, subLayers}) => {
          t.is(
            prevState.aggregatedValueReader,
            (layer as ContourLayer).state.aggregatedValueReader,
            'aggregation not updated'
          );
          t.not(
            prevState.contourData,
            (layer as ContourLayer).state.contourData,
            'contour data is recalculated'
          );
          t.is(subLayers.length, 1, 'Sublayer Line layer not rendered');
          t.ok(subLayers[0] instanceof SolidPolygonLayer, 'Sublayer SolidPolygon layer rendered');
          prevState = {...layer.state};
        }
      },
      {
        title: 'Use CPU aggregation',
        updateProps: {
          gpuAggregation: false
        },
        onBeforeUpdate: ({testCase}) => t.comment(testCase.title),
        onAfterUpdate: ({layer}) => {
          t.not(
            prevState.aggregator,
            (layer as ContourLayer).state.aggregator,
            'aggregator changed'
          );
          t.not(
            prevState.aggregatedValueReader,
            (layer as ContourLayer).state.aggregatedValueReader,
            'aggregation is updated'
          );
          t.not(
            prevState.contourData,
            (layer as ContourLayer).state.contourData,
            'contour data is recalculated'
          );
          prevState = {...layer.state};
        }
      }
    ],
    onError: t.notOk
  });

  t.end();
});
