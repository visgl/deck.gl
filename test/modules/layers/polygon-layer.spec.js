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

import {PolygonLayer} from 'deck.gl';

import * as FIXTURES from 'deck.gl-test/data';

test('PolygonLayer', t => {
  const testCases = generateLayerTests({
    Layer: PolygonLayer,
    sampleProps: {
      data: FIXTURES.polygons.slice(0, 3),
      getPolygon: f => f,
      getFillColor: (f, {index}) => [index, 0, 0]
    },
    assert: t.ok,
    onBeforeUpdate: ({testCase}) => t.comment(testCase.title),
    onAfterUpdate({layer}) {
      if (layer.props.data && layer.props.data.length) {
        t.ok(layer.state.paths.length, 'should update state.paths');
      }
      if (Object.prototype.hasOwnProperty.call(layer.props, '_dataDiff') && layer.props._dataDiff) {
        t.ok(Array.isArray(layer.state.pathsDiff), 'created diff for sub path layer');
      }
    }
  });

  testLayer({Layer: PolygonLayer, testCases, onError: t.notOk});

  t.end();
});
