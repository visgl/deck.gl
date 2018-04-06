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
import {testLayer} from '@deck.gl/test-utils';

import {PolygonLayer} from 'deck.gl';

import * as FIXTURES from 'deck.gl/test/data';
const data = FIXTURES.polygons;

test('PolygonLayer#constructor', t => {
  testLayer({
    Layer: PolygonLayer,
    testCases: [
      {props: []},
      {props: null},
      {
        props: {
          data,
          getPolygon: f => f
        }
      },
      {
        updateProps: {
          filled: false
        },
        assert({layer, subLayers, oldState}) {
          t.ok(layer.state, 'should update layer state');
          t.ok(subLayers.length, 'subLayers rendered');
        }
      },
      {
        updateProps: {
          data: data.slice(0, 10)
        },
        assert({layer, oldState}) {
          t.ok(layer.state.paths.length !== oldState.paths.length, 'should update state.paths');
        }
      }
    ]
  });

  t.end();
});
