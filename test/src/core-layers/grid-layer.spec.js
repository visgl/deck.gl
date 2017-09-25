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
import spy from 'deck.gl/test/test-utils/spy';

import * as FIXTURES from 'deck.gl/test/data';

import {
  testCreateEmptyLayer,
  testCreateLayer,
  testInitializeLayer,
  testLayerUpdates,
  testNullLayer,
  testSubLayerUpdateTriggers
} from 'deck.gl/test/test-utils';

import {GridLayer, GridCellLayer} from 'deck.gl';

const getColorValue = points => points.length;
const getPosition = d => d.COORDINATES;

const TEST_CASES = {
  // props to initialize layer with
  INITIAL_PROPS: {
    data: FIXTURES.points,
    cellSize: 400,
    getPosition,
    pickable: true
  },
  // list of update props to call and asserts on the resulting layer
  UPDATES: [{
    updateProps: {
      cellSize: 800
    },
    assert: (layer, oldState, t) => {
      t.ok(oldState.layerData !== layer.state.layerData,
        'should update layer data');

      t.ok(oldState.sortedBins !== layer.state.sortedBins,
        'should update sortedBins');

      t.ok(oldState.valueDomain !== layer.state.valueDomain,
        'should update valueDomain');
    }
  }, {
    updateProps: {
      getColorValue
    },
    assert: (layer, oldState, t) => {
      t.ok(oldState.layerData === layer.state.layerData,
        'should not update layer data');

      t.ok(oldState.sortedBins !== layer.state.sortedBins,
        'should update sortedBins');

      t.ok(oldState.valueDomain !== layer.state.valueDomain,
        'should re calculate valueDomain');
    }
  }, {
    updateProps: {
      upperPercentile: 90
    },
    assert: (layer, oldState, t) => {
      t.ok(oldState.layerData === layer.state.layerData,
        'should not update layer data');

      t.ok(oldState.sortedBins === layer.state.sortedBins,
        'should not update sortedBins');

      t.ok(oldState.valueDomain !== layer.state.valueDomain,
        'should re calculate valueDomain');
    }
  }]
};

const SUBLAYER_TEST_CASES = {
  // props to initialize layer with
  INITIAL_PROPS: {
    data: FIXTURES.points,
    cellSize: 400,
    getPosition
  },
  // list of update props to call and asserts on the resulting layer
  UPDATES: [{
    updateProps: {
      cellSize: 800
    },
    assert: (subLayer, spies, t) => {
      t.ok(spies._onGetSublayerColor.called,
        'update radius should call _onGetSublayerColor');
      t.ok(spies._onGetSublayerElevation.called,
        'update radius should call _onGetSublayerElevation');
    }
  }, {
    updateProps: {
      opacity: 0.1
    },
    assert: (subLayer, spies, t) => {
      t.ok(!spies._onGetSublayerColor.called,
        'update opacity should not call _onGetSublayerColor');
      t.ok(!spies._onGetSublayerElevation.called,
        'update opacity  should not call _onGetSublayerElevation');
    }
  }, {
    updateProps: {
      getColorValue
    },
    assert: (subLayer, spies, t) => {
      t.ok(spies._onGetSublayerColor.called,
        'update getColorValue should call _onGetSublayerColor');
      t.ok(!spies._onGetSublayerElevation.called,
        'update getColorValue  should not call _onGetSublayerElevation');
    }
  }, {
    updateProps: {
      upperPercentile: 90
    },
    assert: (subLayer, spies, t) => {
      t.ok(spies._onGetSublayerColor.called,
        'update upperPercentile should call _onGetSublayerColor');
      t.ok(!spies._onGetSublayerElevation.called,
        'update upperPercentile should not call _onGetSublayerElevation');
    }
  }, {
    updateProps: {
      elevationRange: [0, 100]
    },
    assert: (subLayer, spies, t) => {
      t.ok(!spies._onGetSublayerColor.called,
        'update elevationRange should not call _onGetSublayerColor');
      t.ok(spies._onGetSublayerElevation.called,
        'update elevationRange should call _onGetSublayerElevation');
    }
  }]
};

test('GridLayer#constructor', t => {
  const LayerComponent = GridLayer;
  const props = TEST_CASES.INITIAL_PROPS;

  testCreateEmptyLayer(t, LayerComponent);
  testNullLayer(t, LayerComponent);
  const layer = testCreateLayer(t, LayerComponent, props);

  testInitializeLayer({layer});

  const {layerData, sortedBins, valueDomain} = layer.state;

  t.ok(layerData.length > 0, 'GridLayer.state.layerDate calculated');
  t.ok(sortedBins, 'GridLayer.state.sortedBins calculated');
  t.ok(Array.isArray(valueDomain), 'GridLayer.state.valueDomain calculated');

  t.ok(Array.isArray(sortedBins.sortedBins), 'GridLayer.state.sortedBins.sortedBins calculated');
  t.ok(Number.isFinite(sortedBins.maxCount), 'GridLayer.state.sortedBins.maxCount calculated');

  const firstSortedBin = sortedBins.sortedBins[0];
  const binTocell = layerData.find(d => d.index === firstSortedBin.i);

  t.ok(sortedBins.binMap[binTocell.index] === firstSortedBin,
    'Correct GridLayer.state.sortedBins.binMap created');

  const subLayer = layer.renderLayers();
  t.ok(subLayer instanceof GridCellLayer, 'GridCellLayer rendered');

  t.end();
});

test('GridLayer#renderSubLayer', t => {
  spy(GridLayer.prototype, '_onGetSublayerColor');
  spy(GridLayer.prototype, '_onGetSublayerElevation');

  const layer = new GridLayer({
    data: FIXTURES.points,
    cellSize: 500,
    getPosition,
    pickable: true
  });

  testInitializeLayer({layer});

  // render sublayer
  const subLayer = layer.renderLayers();
  testInitializeLayer({layer: subLayer});

  t.ok(subLayer instanceof GridCellLayer, 'GridCellLayer rendered');

  // should call attribute updater twice
  // because test util calls both initialize and update layer
  t.ok(GridLayer.prototype._onGetSublayerColor.called,
    'should call _onGetSublayerColor');
  t.ok(GridLayer.prototype._onGetSublayerElevation.called,
    'should call _onGetSublayerElevation');
  GridLayer.prototype._onGetSublayerColor.restore();
  GridLayer.prototype._onGetSublayerElevation.restore();

  t.end();
});

test('GridLayer#updateLayer', t => {
  testLayerUpdates(t, {LayerComponent: GridLayer, testCases: TEST_CASES});
  t.end();
});

test('GridLayer#updateTriggers', t => {
  // setup spies
  const FunctionsToSpy = [
    '_onGetSublayerColor',
    '_onGetSublayerElevation'
  ];

  testSubLayerUpdateTriggers(t, {
    FunctionsToSpy,
    LayerComponent: GridLayer,
    testCases: SUBLAYER_TEST_CASES
  });

  t.end();
});
