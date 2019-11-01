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

import {GeoJsonLayer} from 'deck.gl';

import * as FIXTURES from 'deck.gl-test/data';

test('GeoJsonLayer#tests', t => {
  const testCases = generateLayerTests({
    Layer: GeoJsonLayer,
    sampleProps: {
      data: FIXTURES.geojson
    },
    assert: t.ok,
    onBeforeUpdate: ({testCase}) => t.comment(testCase.title),
    onAfterUpdate: ({layer, subLayers}) => {
      t.ok(layer.state.features, 'should update features');
      const hasData = layer.props && layer.props.data && Object.keys(layer.props.data).length;
      t.is(
        subLayers.length,
        !hasData ? 0 : layer.props.stroked && !layer.props.extruded ? 4 : 3,
        'correct number of sublayers'
      );
    }
  });

  // Add partial update test case
  testCases.push({
    title: 'GeoJsonLayer#',
    onBeforeUpdate: ({testCase}) => t.comment(testCase.title),
    onAfterUpdate: ({layer, subLayers}) => {
      const {featuresDiff} = layer.state;
      t.deepEquals(
        featuresDiff,
        {
          polygonFeatures: [{startRow: 0, endRow: 3}],
          polygonOutlineFeatures: [{startRow: 0, endRow: 3}],
          lineFeatures: [{startRow: 0, endRow: 0}],
          pointFeatures: [{startRow: 0, endRow: 0}]
        },
        'created diff for subLayers'
      );
      t.ok(subLayers.every(l => l.props._dataDiff), "sublayers' dataDiff prop is populated");
    },
    updateProps: {
      data: Object.assign({}, FIXTURES.choropleths),
      _dataDiff: () => [{startRow: 0, endRow: 3}]
    }
  });

  testLayer({Layer: GeoJsonLayer, testCases, onError: t.notOk});

  t.end();
});
