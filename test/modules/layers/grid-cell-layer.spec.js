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

import {GridCellLayer} from 'deck.gl';

const GRID = [{position: [37, 122]}, {position: [37.1, 122.8]}];

test('GridCellLayer#updates', t => {
  testLayer({
    Layer: GridCellLayer,
    onError: t.notOk,
    testCases: [
      {props: []},
      {props: null, pickable: true},
      {
        props: {
          data: GRID
        },
        onAfterUpdate({layer}) {
          t.equal(layer.props.cellSize, 1000, 'Use default radius if not specified');
          t.equal(layer.props.coverage, 1, 'Use default angel if not specified');
        }
      },
      {
        updateProps: {
          coverage: 0.8
        },
        onAfterUpdate({layer, oldState}) {
          t.ok(layer.state, 'should update layer');
        }
      },
      {
        updateProps: {
          fp64: true
        },
        onAfterUpdate({layer, oldState}) {
          t.ok(layer.state, 'should update layer');
          t.ok(
            layer.getAttributeManager().attributes.instancePositions64xyLow,
            'should add instancePositions64xyLow'
          );
        }
      }
    ]
  });

  t.end();
});
