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
import {makeSpy} from 'probe.gl/test';

import * as data from 'deck.gl/test/data';
import {
  testInitializeLayer,
  testLayerUpdates,
  testSubLayerUpdateTriggers
} from '@deck.gl/test-utils';

import {HexagonLayer, HexagonCellLayer} from 'deck.gl';

const getColorValue = points => points.length;
const getElevationValue = points => points.length;
const getPosition = d => d.COORDINATES;

const TEST_CASES = {
  // props to initialize layer with
  INITIAL_PROPS: {
    data: data.points,
    radius: 400,
    getPosition
  },
  // list of update props to call and asserts on the resulting layer
  UPDATES: [
    {
      updateProps: {
        radius: 800
      },
      assert: (layer, oldState, t) => {
        t.ok(oldState.hexagons !== layer.state.hexagons, 'should update layer data');

        t.ok(
          oldState.sortedColorBins !== layer.state.sortedColorBins,
          'should update sortedColorBins'
        );

        t.ok(
          oldState.colorValueDomain !== layer.state.colorValueDomain,
          'should update valueDomain'
        );

        t.ok(
          oldState.colorScaleFunc !== layer.state.colorScaleFunc,
          'should update colorScaleFunc'
        );

        t.ok(
          oldState.sortedElevationBins !== layer.state.sortedElevationBins,
          'should update sortedElevationBins'
        );

        t.ok(
          oldState.elevationValueDomain !== layer.state.elevationValueDomain,
          'should update elevationValueDomain'
        );

        t.ok(
          oldState.elevationScaleFunc !== layer.state.elevationScaleFunc,
          'should update elevationScaleFunc'
        );
      }
    },
    {
      updateProps: {
        getColorValue
      },
      assert: (layer, oldState, t) => {
        t.ok(oldState.hexagons === layer.state.hexagons, 'should not update layer data');

        t.ok(
          oldState.sortedColorBins !== layer.state.sortedColorBins,
          'should not update sortedColorBins'
        );

        t.ok(
          oldState.sortedElevationBins === layer.state.sortedElevationBins,
          'should update sortedElevationBins'
        );

        t.ok(
          oldState.colorValueDomain !== layer.state.colorValueDomain,
          'should re calculate colorValueDomain'
        );

        t.ok(
          oldState.elevationValueDomain === layer.state.elevationValueDomain,
          'should not update elevationValueDomain'
        );

        t.ok(
          oldState.colorScaleFunc !== layer.state.colorScaleFunc,
          'should update colorScaleFunc'
        );

        t.ok(
          oldState.elevationScaleFunc === layer.state.elevationScaleFunc,
          'should not update colorScaleFunc'
        );
      }
    },
    {
      updateProps: {
        upperPercentile: 90
      },
      assert: (layer, oldState, t) => {
        t.ok(oldState.hexagons === layer.state.hexagons, 'should not update layer data');

        t.ok(
          oldState.sortedColorBins === layer.state.sortedColorBins,
          'should not update sortedColorBins'
        );

        t.ok(
          oldState.colorValueDomain !== layer.state.colorValueDomain,
          'should re calculate colorValueDomain'
        );

        t.ok(
          oldState.colorScaleFunc !== layer.state.colorScaleFunc,
          'should update colorScaleFunc'
        );

        t.ok(
          oldState.sortedElevationBins === layer.state.sortedElevationBins,
          'should not update sortedElevationBins'
        );

        t.ok(
          oldState.elevationValueDomain === layer.state.elevationValueDomain,
          'should not update elevationValueDomain'
        );

        t.ok(
          oldState.elevationScaleFunc === layer.state.elevationScaleFunc,
          'should not update elevationScaleFunc'
        );
      }
    },
    {
      updateProps: {
        colorDomain: [0, 10]
      },
      assert: (layer, oldState, t) => {
        t.ok(oldState.hexagons === layer.state.hexagons, 'should not update layer data');

        t.ok(
          oldState.sortedColorBins === layer.state.sortedColorBins,
          'should not update sortedColorBins'
        );

        t.ok(
          oldState.colorValueDomain === layer.state.colorValueDomain,
          'should not re calculate colorValueDomain'
        );

        t.ok(
          oldState.colorScaleFunc !== layer.state.colorScaleFunc,
          'should update colorScaleFunc'
        );

        t.ok(
          oldState.sortedElevationBins === layer.state.sortedElevationBins,
          'should not update sortedElevationBins'
        );

        t.ok(
          oldState.elevationValueDomain === layer.state.elevationValueDomain,
          'should not update elevationValueDomain'
        );

        t.ok(
          oldState.elevationScaleFunc === layer.state.elevationScaleFunc,
          'should not update elevationScaleFunc'
        );
      }
    },
    {
      updateProps: {
        getElevationValue
      },
      assert: (layer, oldState, t) => {
        t.ok(oldState.hexagons === layer.state.hexagons, 'should not update layer data');

        t.ok(
          oldState.sortedElevationBins !== layer.state.sortedElevationBins,
          'should update sortedElevationBins'
        );

        t.ok(
          oldState.elevationValueDomain !== layer.state.elevationValueDomain,
          'should re calculate elevationValueDomain'
        );

        t.ok(
          oldState.elevationScaleFunc !== layer.state.elevationScaleFunc,
          'should update elevationScaleFunc'
        );

        t.ok(
          oldState.sortedColorBins === layer.state.sortedColorBins,
          'should not update sortedColorBins'
        );

        t.ok(
          oldState.colorValueDomain === layer.state.colorValueDomain,
          'should not re calculate colorValueDomain'
        );

        t.ok(
          oldState.colorScaleFunc === layer.state.colorScaleFunc,
          'should not update colorScaleFunc'
        );
      }
    },
    {
      updateProps: {
        elevationLowerPercentile: 1
      },
      assert: (layer, oldState, t) => {
        t.ok(oldState.hexagons === layer.state.hexagons, 'should not update layer data');

        t.ok(
          oldState.sortedElevationBins === layer.state.sortedElevationBins,
          'should not update sortedElevationBins'
        );

        t.ok(
          oldState.elevationValueDomain !== layer.state.elevationValueDomain,
          'should re calculate elevationValueDomain'
        );

        t.ok(
          oldState.elevationScaleFunc !== layer.state.elevationScaleFunc,
          'should update elevationScaleFunc'
        );

        t.ok(
          oldState.sortedColorBins === layer.state.sortedColorBins,
          'should not update sortedColorBins'
        );

        t.ok(
          oldState.colorValueDomain === layer.state.colorValueDomain,
          'should not re calculate colorValueDomain'
        );

        t.ok(
          oldState.colorScaleFunc === layer.state.colorScaleFunc,
          'should not update colorScaleFunc'
        );
      }
    },
    {
      updateProps: {
        elevationRange: [1, 10]
      },
      assert: (layer, oldState, t) => {
        t.ok(oldState.hexagons === layer.state.hexagons, 'should not update layer data');

        t.ok(
          oldState.sortedElevationBins === layer.state.sortedElevationBins,
          'should not update sortedElevationBins'
        );

        t.ok(
          oldState.elevationValueDomain === layer.state.elevationValueDomain,
          'should not re calculate elevationValueDomain'
        );

        t.ok(
          oldState.elevationScaleFunc !== layer.state.elevationScaleFunc,
          'should update elevationScaleFunc'
        );

        t.ok(
          oldState.sortedColorBins === layer.state.sortedColorBins,
          'should not update sortedColorBins'
        );

        t.ok(
          oldState.colorValueDomain === layer.state.colorValueDomain,
          'should not re calculate colorValueDomain'
        );

        t.ok(
          oldState.colorScaleFunc === layer.state.colorScaleFunc,
          'should not update colorScaleFunc'
        );
      }
    }
  ]
};

const SUBLAYER_TEST_CASES = {
  // props to initialize layer with
  INITIAL_PROPS: {
    data: data.points,
    radius: 400,
    getPosition
  },
  // list of update props to call and asserts on the resulting layer
  UPDATES: [
    {
      updateProps: {
        radius: 800
      },
      assert: (subLayer, spies, t) => {
        t.ok(spies._onGetSublayerColor.called, 'update radius should call _onGetSublayerColor');
        t.ok(
          spies._onGetSublayerElevation.called,
          'update radius should call _onGetSublayerElevation'
        );
      }
    },
    {
      updateProps: {
        opacity: 0.1
      },
      assert: (subLayer, spies, t) => {
        t.ok(
          !spies._onGetSublayerColor.called,
          'update opacity should not call _onGetSublayerColor'
        );
        t.ok(
          !spies._onGetSublayerElevation.called,
          'update opacity  should not call _onGetSublayerElevation'
        );
      }
    },
    {
      updateProps: {
        getColorValue
      },
      assert: (subLayer, spies, t) => {
        t.ok(
          spies._onGetSublayerColor.called,
          'update getColorValue should call _onGetSublayerColor'
        );
        t.ok(
          !spies._onGetSublayerElevation.called,
          'update getColorValue should not call _onGetSublayerElevation'
        );
      }
    },
    {
      updateProps: {
        upperPercentile: 90
      },
      assert: (subLayer, spies, t) => {
        t.ok(
          spies._onGetSublayerColor.called,
          'update upperPercentile should call _onGetSublayerColor'
        );
        t.ok(
          !spies._onGetSublayerElevation.called,
          'update upperPercentile should not call _onGetSublayerElevation'
        );
      }
    },
    {
      updateProps: {
        getElevationValue
      },
      assert: (subLayer, spies, t) => {
        t.ok(
          !spies._onGetSublayerColor.called,
          'update getElevationValue should not call _onGetSublayerColor'
        );
        t.ok(
          spies._onGetSublayerElevation.called,
          'update getElevationValue should call _onGetSublayerElevation'
        );
      }
    },
    {
      updateProps: {
        elevationUpperPercentile: 99
      },
      assert: (subLayer, spies, t) => {
        t.ok(
          !spies._onGetSublayerColor.called,
          'update elevationUpperPercentile should not call _onGetSublayerColor'
        );
        t.ok(
          spies._onGetSublayerElevation.called,
          'update elevationUpperPercentile should call _onGetSublayerElevation'
        );
      }
    },
    {
      updateProps: {
        elevationRange: [0, 100]
      },
      assert: (subLayer, spies, t) => {
        t.ok(
          !spies._onGetSublayerColor.called,
          'update elevationRange should not call _onGetSublayerColor'
        );
        t.ok(
          spies._onGetSublayerElevation.called,
          'update elevationRange should call _onGetSublayerElevation'
        );
      }
    }
  ]
};

test('HexagonLayer#constructor', t => {
  let layer = new HexagonLayer({
    id: 'emptyGeoJsonLayer',
    data: [],
    radius: 1,
    pickable: true
  });
  t.ok(layer instanceof HexagonLayer, 'Empty HexagonLayer created');

  layer = new HexagonLayer({
    data: data.points,
    pickable: true
  });
  t.ok(layer instanceof HexagonLayer, 'HexagonLayer created');
  t.equal(layer.props.radius, 1000, 'set to default radius if not specified');

  layer = new HexagonLayer({
    data: data.points,
    radius: 500,
    getPosition,
    pickable: true
  });
  t.ok(layer instanceof HexagonLayer, 'HexagonLayer created');

  testInitializeLayer({layer});

  t.doesNotThrow(
    () =>
      new HexagonLayer({
        id: 'nullHexagonLayer',
        data: null,
        pickable: true
      }),
    'Null HexagonLayer did not throw exception'
  );

  t.end();
});

test('HexagonLayer#renderSubLayer', t => {
  makeSpy(HexagonLayer.prototype, '_onGetSublayerColor');
  makeSpy(HexagonLayer.prototype, '_onGetSublayerElevation');

  const layer = new HexagonLayer({
    data: data.points,
    radius: 500,
    getPosition,
    pickable: true
  });

  testInitializeLayer({layer});

  // render sublayer
  const subLayer = layer.renderLayers();
  testInitializeLayer({layer: subLayer});

  t.ok(subLayer instanceof HexagonCellLayer, 'HexagonCellLayer rendered');

  // should call attribute updater twice
  // because test util calls both initialize and update layer
  t.ok(
    HexagonLayer.prototype._onGetSublayerColor.called,
    'should call _onGetSublayerColor number of hexagons times 2'
  );
  t.ok(
    HexagonLayer.prototype._onGetSublayerElevation.called,
    'should call _onGetSublayerElevation number of hexagons times 2'
  );
  HexagonLayer.prototype._onGetSublayerColor.restore();
  HexagonLayer.prototype._onGetSublayerElevation.restore();

  t.end();
});

test('HexagonLayer#updateLayer', t => {
  testLayerUpdates(t, {LayerComponent: HexagonLayer, testCases: TEST_CASES});
  t.end();
});

test('HexagonLayer#updateTriggers', t => {
  const FunctionsToSpy = ['_onGetSublayerColor', '_onGetSublayerElevation'];

  testSubLayerUpdateTriggers(t, {
    FunctionsToSpy,
    LayerComponent: HexagonLayer,
    testCases: SUBLAYER_TEST_CASES
  });

  t.end();
});
