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
import {testInitializeLayer, testLayerUpdates} from '@deck.gl/test-utils';

import {GridCellLayer} from 'deck.gl';

const GRID = [{position: [37, 122]}, {position: [37.1, 122.8]}];

const TEST_CASES = {
  // props to initialize layer with
  INITIAL_PROPS: {
    data: GRID
  },
  // list of update props to call and asserts on the resulting layer
  UPDATES: [
    {
      updateProps: {
        coverage: 0.8
      },
      assert: (layer, oldState, t) => {
        t.ok(layer.state, 'should update layer');
      }
    },
    {
      updateProps: {
        fp64: true
      },
      assert: (layer, oldState, t) => {
        t.ok(layer.state, 'should update layer');
        t.ok(
          layer.getAttributeManager().attributes.instancePositions64xyLow,
          'should add instancePositions64xyLow'
        );
      }
    }
  ]
};

test('GridCellLayer#constructor', t => {
  let layer = new GridCellLayer({
    id: 'emptyGridCellLayer',
    data: [],
    pickable: true
  });
  t.ok(layer instanceof GridCellLayer, 'Empty GridCellLayer created');

  layer = new GridCellLayer({
    data: GRID,
    pickable: true
  });
  t.ok(layer instanceof GridCellLayer, 'GridCellLayer created');

  testInitializeLayer({layer});
  t.ok(layer.state.model, 'GridCellLayer has state');

  t.doesNotThrow(
    () =>
      new GridCellLayer({
        id: 'nullGridCellLayer',
        data: null,
        pickable: true
      }),
    'Null GridCellLayer did not throw exception'
  );

  layer = new GridCellLayer({
    data: [],
    pickable: true
  });

  t.equal(layer.props.cellSize, 1000, 'Use default radius if not specified');
  t.equal(layer.props.coverage, 1, 'Use default angel if not specified');

  t.end();
});

test('HexagonCellLayer#layerUpdate', t => {
  testLayerUpdates({LayerComponent: GridCellLayer, testCases: TEST_CASES, t});

  t.end();
});
