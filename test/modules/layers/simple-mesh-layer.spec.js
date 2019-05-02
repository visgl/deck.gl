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

import {SimpleMeshLayer} from 'deck.gl';
import {CylinderGeometry} from '@luma.gl/core';

import * as FIXTURES from 'deck.gl-test/data';

test('SimpleMeshLayer#tests', t => {
  const testCases = generateLayerTests({
    Layer: SimpleMeshLayer,
    sampleProps: {
      data: FIXTURES.points,
      getPosition: d => d.COORDINATES,
      mesh: new CylinderGeometry({
        radius: 1,
        topRadius: 1,
        bottomRadius: 1,
        topCap: true,
        bottomCap: true,
        height: 5,
        nradial: 20,
        nvertical: 1
      })
    },
    assert: t.ok,
    onBeforeUpdate: ({testCase}) => t.comment(testCase.title),
    onAfterUpdate: ({layer, subLayers}) => {
      if (layer.props.mesh) {
        t.ok(layer.getModels().length > 0, 'Layer should have models');
      }
    },
    runDefaultAsserts: false
  });

  testLayer({Layer: SimpleMeshLayer, testCases, onError: t.notOk});

  t.end();
});
