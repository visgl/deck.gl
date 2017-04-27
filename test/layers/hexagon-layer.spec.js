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
import sinon from 'sinon';

import * as data from '../data';
import {testInitializeLayer, testUpdateLayer} from '../test-utils';

import {HexagonLayer, CompositeLayer, HexagonCellLayer} from 'deck.gl';

const getColorValue = points => points.length;

const TEST_CASES = {
  // props to initialize layer with
  initialProps: {
    data: data.points,
    radius: 400,
    getPosition: d => d.COORDINATES
  },
  // list of update props to call and asserts on the resulting layer
  updates: [{
    newProps: {
      data: data.points,
      // change radius
      radius: 800,
      getPosition: d => d.COORDINATES
    },
    assert: (layer, oldState, t) => {
      t.ok(oldState.hexagons !== layer.state.hexagons,
        'should update layer data');

      t.ok(oldState.sortedBins !== layer.state.sortedBins,
        'should update sortedBins');

      t.ok(oldState.valueDomain !== layer.state.valueDomain,
        'should update valueDomain');
    }
  }, {
    newProps: {
      data: data.points,
      radius: 800,
      // change getColorValue
      getColorValue,
      getPosition: d => d.COORDINATES
    },
    assert: (layer, oldState, t) => {
      t.ok(oldState.hexagons === layer.state.hexagons,
        'should not update layer data');

      t.ok(oldState.sortedBins !== layer.state.sortedBins,
        'should update sortedBins');

      t.ok(oldState.valueDomain !== layer.state.valueDomain,
        'should re calculate valueDomain');
    }
  }, {
    newProps: {
      data: data.points,
      radius: 800,
      // change getColorValue
      getColorValue,
      upperPercentile: 90,
      getPosition: d => d.COORDINATES
    },
    assert: (layer, oldState, t) => {
      t.ok(oldState.hexagons === layer.state.hexagons,
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
  initialProps: {
    data: data.points,
    radius: 400,
    getPosition: d => d.COORDINATES
  },
  // list of update props to call and asserts on the resulting layer
  updates: [{
    newProps: {
      data: data.points,
      // change radius
      radius: 800,
      getPosition: d => d.COORDINATES
    },
    assert: (subLayer, spies, t) => {
      t.ok(spies._onGetSublayerColor.called,
        'update radius should call _onGetSublayerColor');
      t.ok(spies._onGetSublayerElevation.called,
        'update radius should call _onGetSublayerElevation');
    }
  }, {
    newProps: {
      data: data.points,
      radius: 800,
      // change opacity
      opacity: 0.1,
      getPosition: d => d.COORDINATES
    },
    assert: (subLayer, spies, t) => {
      t.ok(spies._onGetSublayerColor.notCalled,
        'update opacity should not call _onGetSublayerColor');
      t.ok(spies._onGetSublayerElevation.notCalled,
        'update opacity  should not call _onGetSublayerElevation');
    }
  }, {
    newProps: {
      data: data.points,
      radius: 800,
      // change getColorValue
      getColorValue,
      getPosition: d => d.COORDINATES
    },
    assert: (subLayer, spies, t) => {
      t.ok(spies._onGetSublayerColor.called,
        'update getColorValue should call _onGetSublayerColor');
      t.ok(spies._onGetSublayerElevation.notCalled,
        'update getColorValue  should not call _onGetSublayerElevation');
    }
  }, {
    newProps: {
      data: data.points,
      radius: 800,
      getColorValue,
      // change upperPercentile
      upperPercentile: 90,
      getPosition: d => d.COORDINATES
    },
    assert: (subLayer, spies, t) => {
      t.ok(spies._onGetSublayerColor.called,
        'update upperPercentile should call _onGetSublayerColor');
      t.ok(spies._onGetSublayerElevation.notCalled,
        'update upperPercentile should not call _onGetSublayerElevation');
    }
  }, {
    newProps: {
      data: data.points,
      radius: 800,
      getColorValue,
      upperPercentile: 90,
      // change elevationRange
      elevationRange: [0, 100],
      getPosition: d => d.COORDINATES
    },
    assert: (subLayer, spies, t) => {
      t.ok(spies._onGetSublayerColor.notCalled,
        'update elevationRange should not call _onGetSublayerColor');
      t.ok(spies._onGetSublayerElevation.called,
        'update elevationRange should call _onGetSublayerElevation');
    }
  }]
};

test('HexagonLayer#constructor', t => {
  let layer = new HexagonLayer({
    id: 'emptyGeoJsonLayer',
    data: [],
    pickable: true
  });
  t.ok(layer instanceof HexagonLayer, 'Empty HexagonLayer created');
  t.ok(layer instanceof CompositeLayer, 'HexagonLayer is a CompositeLayer');

  layer = new HexagonLayer({
    data: data.points,
    pickable: true
  });

  t.ok(layer instanceof HexagonLayer, 'HexagonLayer created');
  t.ok(layer.props.radius === HexagonLayer.defaultProps.radius, 'default radius assigned');

  layer = new HexagonLayer({
    data: data.points,
    radius: 500,
    getPosition: d => d.COORDINATES,
    pickable: true
  });
  t.ok(layer instanceof HexagonLayer, 'HexagonLayer created');

  testInitializeLayer({layer});

  const {hexagons, sortedBins, valueDomain} = layer.state;

  t.ok(hexagons.length > 0, 'HexagonLayer.state.layerDate calculated');
  t.ok(sortedBins, 'HexagonLayer.state.sortedBins calculated');
  t.ok(Array.isArray(valueDomain), 'HexagonLayer.state.valueDomain calculated');

  t.ok(Array.isArray(sortedBins.sortedBins),
    'HexagonLayer.state.sortedBins.sortedBins calculated');
  t.ok(Number.isFinite(sortedBins.maxCount),
    'HexagonLayerHexagonLayer.state.sortedBins.maxCount calculated');

  const firstSortedBin = sortedBins.sortedBins[0];
  const binTocell = hexagons.find(d => d.index === firstSortedBin.i);

  t.ok(sortedBins.binMap[binTocell.index] === firstSortedBin,
    'Correct HexagonLayer.state.sortedBins.binMap created');

  t.doesNotThrow(
    () => new HexagonLayer({
      id: 'nullHexagonLayer',
      data: null,
      pickable: true
    }),
    'Null HexagonLayer did not throw exception'
  );

  t.end();
});

test('HexagonLayer#renderSubLayer', t => {

  sinon.spy(HexagonLayer.prototype, '_onGetSublayerColor');
  sinon.spy(HexagonLayer.prototype, '_onGetSublayerElevation');

  const layer = new HexagonLayer({
    data: data.points,
    radius: 500,
    getPosition: d => d.COORDINATES,
    pickable: true
  });

  testInitializeLayer({layer});

  // render sublayer
  const subLayer = layer.renderLayers();
  testInitializeLayer({layer: subLayer});

  t.ok(subLayer instanceof HexagonCellLayer, 'HexagonCellLayer rendered');

  // should call attribute updater twice
  // because test util calls both initialize and update layer
  t.ok(HexagonLayer.prototype._onGetSublayerColor.called,
    'should call _onGetSublayerColor number of hexagons times 2');
  t.ok(HexagonLayer.prototype._onGetSublayerElevation.called,
    'should call _onGetSublayerElevation number of hexagons times 2');
  HexagonLayer.prototype._onGetSublayerColor.restore();
  HexagonLayer.prototype._onGetSublayerElevation.restore();

  t.end();
});

test('HexagonLayer#updateLayer', t => {
  const layer = new HexagonLayer(TEST_CASES.initialProps);
  testInitializeLayer({layer});

  TEST_CASES.updates.forEach(({newProps, assert}) => {
    // copy over old state
    const oldState = Object.assign({}, layer.state);

    // call update layer with new props
    testUpdateLayer({layer, newProps});

    // assert on updated layer
    assert(layer, oldState, t);
  });

  t.end();
});

test('HexagonLayer#updateTriggers', t => {
  // deck.log.priority = 3;
  // setup spies
  const FunctionsToSpy = [
    '_onGetSublayerColor',
    '_onGetSublayerElevation'
  ];
  const spies = FunctionsToSpy.reduce((accu, curr) => Object.assign(accu, {
    [curr]: sinon.spy(HexagonLayer.prototype, curr)
  }), {});

  // initialize parent layer
  const layer = new HexagonLayer(SUBLAYER_TEST_CASES.initialProps);
  testInitializeLayer({layer});

  // initialize subLayer
  const subLayer = layer.renderLayers();

  testInitializeLayer({layer: subLayer});

  SUBLAYER_TEST_CASES.updates.forEach(({newProps, assert}) => {

    // call update layer with new props
    testUpdateLayer({layer, newProps});

    // layer manager should handle match subLayer and tranfer state and props
    // here we assume subLayer matches copy over the new props
    // from a new subLayer
    const newSubLayer = layer.renderLayers();

    testUpdateLayer({layer: subLayer, newProps: newSubLayer.props});

    // assert on updated subLayer
    assert(subLayer, spies, t);

    // reset spies
    Object.keys(spies).forEach(k => spies[k].reset());
  });

  // restore spies
  Object.keys(spies).forEach(k => spies[k].restore());

  t.end();
});
