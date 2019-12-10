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

import * as FIXTURES from 'deck.gl-test/data';

import {testLayer, testInitializeLayer, generateLayerTests} from '@deck.gl/test-utils';

import {LineLayer, SolidPolygonLayer} from '@deck.gl/layers';
import {ContourLayer} from '@deck.gl/aggregation-layers';

const getPosition = d => d.COORDINATES;
const CONTOURS1 = [
  {threshold: 1, color: [255, 0, 0]}, // => Isoline for threshold 1
  {threshold: 5, color: [0, 255, 0]}, // => Isoline for threshold 5
  {threshold: [6, 10], color: [0, 0, 255]} // => Isoband for threshold range [6, 10)
];
const CONTOURS2 = [
  // contours count changed
  {threshold: 5, color: [0, 255, 0]},
  {threshold: [6, 10], color: [0, 0, 255]}
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
      if (layer.getNumInstances() > 0) {
        const {aggregationData} = layer.state.weights.count;
        t.ok(aggregationData, 'should create aggregationData');
      }
    }
  });

  testLayer({Layer: ContourLayer, testCases, onError: t.notOk});

  t.end();
});

test('ContourLayer#renderSubLayer', t => {
  const layer = new ContourLayer({
    id: 'contourLayer',
    data: FIXTURES.points,
    contours: CONTOURS1,
    cellSize: 200,
    getPosition
  });

  testInitializeLayer({layer, onError: t.notOk});

  // render sublayer
  const subLayers = layer.renderLayers();
  testInitializeLayer({layer: subLayers[0], onError: t.notOk});
  testInitializeLayer({layer: subLayers[1], onError: t.notOk});

  t.ok(subLayers[0] instanceof LineLayer, 'Sublayer Line layer rendered');
  t.ok(subLayers[1] instanceof SolidPolygonLayer, 'Sublayer SolidPolygon layer rendered');

  t.end();
});

test('ContourLayer#updates', t => {
  testLayer({
    Layer: ContourLayer,
    onError: t.notOk,
    testCases: [
      {
        props: {
          data: FIXTURES.points,
          cellSize: 400,
          contours: CONTOURS1,
          getPosition,
          pickable: true
        },
        onAfterUpdate({layer}) {
          const {aggregationData} = layer.state.weights.count;
          const {contourData, thresholdData} = layer.state;

          t.ok(aggregationData.length > 0, 'ContourLayer data is aggregated');
          t.ok(
            Array.isArray(contourData.contourSegments) && contourData.contourSegments.length > 1,
            'ContourLayer iso-lines calculated'
          );
          t.ok(
            Array.isArray(contourData.contourPolygons) && contourData.contourPolygons.length > 1,
            'ContourLayer iso-bands calculated'
          );
          // contours array prop has 3 elements
          t.ok(
            Array.isArray(thresholdData) && thresholdData.length === 3,
            'ContourLayer threshold data is calculated'
          );
        }
      },
      {
        updateProps: {
          gpuAggregation: false // default value is true
        },
        spies: ['_updateAggregation'],
        onAfterUpdate({spies, layer, oldState}) {
          if (oldState.gpuAggregation) {
            // Under WebGL1, gpuAggregation will be false
            t.ok(
              spies._updateAggregation.called,
              'should re-aggregate data on gpuAggregation change'
            );
          }
        }
      },
      {
        updateProps: {
          cellSize: 500 // changed from 400 to 500
        },
        spies: ['_updateAggregation', '_generateContours'],
        onAfterUpdate({layer, subLayers, spies}) {
          t.ok(subLayers.length === 2, 'Sublayers rendered');

          t.ok(spies._updateAggregation.called, 'should re-aggregate data on cellSize change');
          t.ok(spies._generateContours.called, 'should re-generate contours on cellSize change');
          spies._updateAggregation.restore();
          spies._generateContours.restore();
        }
      },
      {
        updateProps: {
          contours: CONTOURS2
        },
        spies: ['_updateThresholdData', '_generateContours', '_updateAggregation'],
        onAfterUpdate({subLayers, spies}) {
          t.ok(subLayers.length === 2, 'Sublayers rendered');

          t.ok(
            spies._updateThresholdData.called,
            'should update threshold data on countours change'
          );
          t.ok(spies._generateContours.called, 'should re-generate contours  on countours  change');
          t.ok(
            !spies._updateAggregation.called,
            'should NOT re-aggregate data  on countours count change'
          );

          spies._updateThresholdData.restore();
          spies._generateContours.restore();
          spies._updateAggregation.restore();
        }
      }
    ]
  });

  t.end();
});
