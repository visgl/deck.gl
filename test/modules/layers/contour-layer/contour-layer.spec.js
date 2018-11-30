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
import {makeSpy} from 'probe.gl/test-utils';

import * as FIXTURES from 'deck.gl/test/data';

import {testLayer, testInitializeLayer} from '@deck.gl/test-utils';

import {ContourLayer, LineLayer, _SolidPolygonLayer as SolidPolygonLayer} from '@deck.gl/layers';

const getPosition = d => d.COORDINATES;

test('ContourLayer#renderSubLayer', t => {
  makeSpy(ContourLayer.prototype, '_onGetSublayerColor');
  makeSpy(ContourLayer.prototype, '_onGetSublayerStrokeWidth');

  const layer = new ContourLayer({
    id: 'contourLayer',
    data: FIXTURES.points,
    contours: [
      {threshold: 1, color: [255, 0, 0], strokeWidth: 1}, // => Isoline for threshold 1
      {threshold: 5, color: [0, 255, 0], strokeWidth: 2}, // => Isoline for threshold 5
      {threshold: [6, 10], color: [0, 0, 255]} // => Isoband for threshold range [6, 10)
    ],
    cellSize: 200,
    getPosition
  });

  testInitializeLayer({layer});

  // render sublayer
  const subLayers = layer.renderLayers();
  testInitializeLayer({layer: subLayers[0]});
  testInitializeLayer({layer: subLayers[1]});

  t.ok(subLayers[0] instanceof LineLayer, 'Sublayer Line layer rendered');
  t.ok(subLayers[1] instanceof SolidPolygonLayer, 'Sublayer SolidPolygon layer rendered');

  t.ok(ContourLayer.prototype._onGetSublayerColor.called, 'should call _onGetSublayerColor');
  t.ok(
    ContourLayer.prototype._onGetSublayerStrokeWidth.called,
    'should call _onGetSublayerElevation'
  );
  ContourLayer.prototype._onGetSublayerColor.restore();
  ContourLayer.prototype._onGetSublayerStrokeWidth.restore();

  t.end();
});

test('ContourLayer#updates', t => {
  testLayer({
    Layer: ContourLayer,
    testCases: [
      {
        props: {
          data: FIXTURES.points,
          cellSize: 400,
          contours: [
            {threshold: 1, color: [255, 0, 0], strokeWidth: 1}, // => Isoline for threshold 1
            {threshold: 5, color: [0, 255, 0], strokeWidth: 2}, // => Isoline for threshold 5
            {threshold: [6, 10], color: [0, 0, 255]} // => Isoband for threshold range [6, 10)
          ],
          getPosition,
          pickable: true
        },
        assert({layer}) {
          const {countsData, contourData, thresholdData} = layer.state;

          t.ok(countsData.length > 0, 'ContourLayer data is aggregated');
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
          cellSize: 500 // changed from 400 to 500
        },
        spies: [
          '_onGetSublayerColor',
          '_onGetSublayerStrokeWidth',
          '_aggregateData',
          '_generateContours'
        ],
        assert({layer, subLayers, spies}) {
          t.ok(subLayers.length === 2, 'Sublayers rendered');

          t.ok(spies._aggregateData.called, 'should re-aggregate data on cellSize change');
          t.ok(spies._generateContours.called, 'should re-generate contours on cellSize change');
          t.ok(
            spies._onGetSublayerColor.called,
            'should call _onGetSublayerColor on cellSize change'
          );
          t.ok(
            spies._onGetSublayerStrokeWidth.called,
            'should call _onGetSublayerElevation on cellSize change'
          );
          spies._aggregateData.restore();
          spies._generateContours.restore();
          spies._onGetSublayerColor.restore();
          spies._onGetSublayerStrokeWidth.restore();
        }
      },
      {
        updateProps: {
          contours: [
            // contours count changed
            {threshold: 5, color: [0, 255, 0], strokeWidth: 2},
            {threshold: [6, 10], color: [0, 0, 255]}
          ]
        },
        spies: ['_updateThresholdData', '_generateContours', '_aggregateData'],
        assert({subLayers, spies}) {
          t.ok(subLayers.length === 2, 'Sublayers rendered');

          t.ok(
            spies._updateThresholdData.called,
            'should update threshold data on countours count change'
          );
          t.ok(
            spies._generateContours.called,
            'should re-generate contours  on countours count change'
          );
          t.ok(
            !spies._aggregateData.called,
            'should NOT re-aggregate data  on countours count change'
          );
          spies._updateThresholdData.restore();
          spies._generateContours.restore();
          spies._aggregateData.restore();
        }
      },
      {
        updateProps: {
          contours: [
            // threshold value changed
            {threshold: 5, color: [0, 255, 0], strokeWidth: 2},
            {threshold: [6, 50], color: [0, 0, 255]} // changed [6, 10] to [6, 50]
          ]
        },
        spies: ['_updateThresholdData', '_generateContours'],
        assert({subLayers, spies}) {
          t.ok(subLayers.length === 2, 'Sublayers rendered');

          t.ok(
            spies._updateThresholdData.called,
            'should update threshold data on threshold value change'
          );
          t.ok(
            spies._generateContours.called,
            'should re-generate contours  on threshold value change'
          );
          spies._updateThresholdData.restore();
          spies._generateContours.restore();
        }
      },
      {
        updateProps: {
          contours: [
            // threshold color changed
            {threshold: 5, color: [255, 0, 0], strokeWidth: 2}, // color changed from Green to Red
            {threshold: [6, 50], color: [0, 0, 255]}
          ]
        },
        spies: ['_onGetSublayerColor', '_generateContours', '_aggregateData'],
        assert({subLayers, spies}) {
          t.ok(subLayers.length === 2, 'Sublayers rendered');

          t.ok(spies._onGetSublayerColor.called, 'should update color on threshold color change');
          t.ok(
            !spies._generateContours.called,
            'should NOT generate contours on threshold color change'
          );
          t.ok(!spies._aggregateData.called, 'should NOT aggregate data on threshold color change');
          spies._onGetSublayerColor.restore();
          spies._generateContours.restore();
          spies._aggregateData.restore();
        }
      },
      {
        updateProps: {
          contours: [
            // threshold strokeWidth changed
            {threshold: 5, color: [255, 0, 0], strokeWidth: 10}, // strokeWidth changed from 2 to 10
            {threshold: [6, 50], color: [0, 0, 255]}
          ]
        },
        spies: ['_onGetSublayerStrokeWidth', '_generateContours', '_aggregateData'],
        assert({subLayers, spies}) {
          t.ok(subLayers.length === 2, 'Sublayers rendered');

          t.ok(
            spies._onGetSublayerStrokeWidth.called,
            'should update stroke width on threshold stroke width change'
          );
          t.ok(
            !spies._generateContours.called,
            'should NOT generate contours on threshold color change'
          );
          t.ok(!spies._aggregateData.called, 'should NOT aggregate data on threshold color change');
          spies._onGetSublayerStrokeWidth.restore();
          spies._generateContours.restore();
          spies._aggregateData.restore();
        }
      }
    ]
  });

  t.end();
});
