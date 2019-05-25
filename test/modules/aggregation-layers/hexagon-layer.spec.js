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
import {makeSpy} from '@probe.gl/test-utils';

import * as data from 'deck.gl-test/data';
import {testLayer, testInitializeLayer, generateLayerTests} from '@deck.gl/test-utils';

import {ColumnLayer} from '@deck.gl/layers';
import {HexagonLayer} from '@deck.gl/aggregation-layers';

const getColorValue = points => points.length;
const getElevationValue = points => points.length;
const getPosition = d => d.COORDINATES;

test('HexagonLayer', t => {
  const testCases = generateLayerTests({
    Layer: HexagonLayer,
    sampleProps: {
      data: data.points.slice(0, 3),
      getPosition
    },
    assert: t.ok,
    onBeforeUpdate: ({testCase}) => t.comment(testCase.title),
    onAfterUpdate({layer}) {
      if (layer.props.data && layer.props.data.length) {
        t.ok(layer.state.hexagons.length > 0, 'should update state.hexagons');
      }
    }
  });

  testLayer({Layer: HexagonLayer, testCases, onError: t.notOk});

  t.end();
});

// props to initialize layer with
// update props
// asserts on the resulting layer
test('HexagonLayer#updateLayer', t => {
  function onAfterUpdateElevation({layer, oldState}) {
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

    // color porps didn't change
    t.ok(
      layer.state.getColorValue === oldState.getColorValue,
      'getColorValue should not get re-calculated'
    );

    // elevation porps changed
    t.ok(
      layer.state.getElevationValue !== oldState.getElevationValue,
      'getElevationValue should get re-calculated'
    );
  }
  function onAfterUpdateColor({layer, oldState}) {
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

    t.ok(oldState.colorScaleFunc !== layer.state.colorScaleFunc, 'should update colorScaleFunc');

    t.ok(
      oldState.elevationScaleFunc === layer.state.elevationScaleFunc,
      'should not update colorScaleFunc'
    );

    // color porps changed
    t.ok(
      layer.state.getColorValue !== oldState.getColorValue,
      'getColorValue should get re-calculated'
    );

    // elevation porps didn't change
    t.ok(
      layer.state.getElevationValue === oldState.getElevationValue,
      'getElevationValue should not get re-calculated'
    );
  }

  testLayer({
    Layer: HexagonLayer,
    onError: t.notOk,
    testCases: [
      {
        title: 'Initialize',
        props: {
          data: data.points,
          radius: 400,
          getPosition
        },
        onAfterUpdate({layer}) {
          t.ok(
            typeof layer.state.getColorValue === 'function',
            'GridLayer.state.getColorValue calculated'
          );
          t.ok(
            typeof layer.state.getElevationValue === 'function',
            'GridLayer.state.getElevationValue calculated'
          );
        }
      },
      {
        title: 'Update radius',
        updateProps: {
          radius: 800
        },
        onAfterUpdate({layer, oldState}) {
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
        title: 'Update colorAggregation',
        updateProps: {
          colorAggregation: 'MAX'
        },
        onAfterUpdate: onAfterUpdateColor
      },
      {
        title: 'Update getColorValue accessor',
        updateProps: {
          getColorValue,
          updateTriggers: {
            getColorValue: 1
          }
        },
        onAfterUpdate: onAfterUpdateColor
      },
      {
        title: 'Update upperPercentile',
        updateProps: {
          upperPercentile: 90
        },
        onAfterUpdate({layer, oldState}) {
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
        title: 'Update colorDomain',
        updateProps: {
          colorDomain: [0, 10]
        },
        onAfterUpdate({layer, oldState}) {
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
        title: 'Update getElevationWeight accessor',
        updateProps: {
          getElevationWeight: x => 2,
          updateTriggers: {
            getElevationWeight: 1
          }
        },
        onAfterUpdate: onAfterUpdateElevation
      },
      {
        title: 'Update getElevationWeight accessor',
        updateProps: {
          getElevationValue,
          updateTriggers: {
            getElevationValue: 1
          }
        },
        onAfterUpdate: onAfterUpdateElevation
      },
      {
        title: 'Update elevation lower percentile',
        updateProps: {
          elevationLowerPercentile: 1
        },
        onAfterUpdate({layer, oldState}) {
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
        title: 'Update elevationRange accessor',
        updateProps: {
          elevationRange: [1, 10]
        },
        onAfterUpdate({layer, oldState}) {
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
  });

  t.end();
});

test('HexagonLayer#updateTriggers', t => {
  const SPIES = ['_onGetSublayerColor', '_onGetSublayerElevation'];

  testLayer({
    Layer: HexagonLayer,
    onError: t.notOk,
    spies: SPIES,
    testCases: [
      {
        // props to initialize layer with
        props: {
          data: data.points,
          radius: 400,
          getPosition
        }
      },
      {
        title: 'Update radius prop',
        updateProps: {
          radius: 800
        },
        onAfterUpdate({subLayer, spies}) {
          t.ok(spies._onGetSublayerColor.called, 'update radius should call _onGetSublayerColor');
          t.ok(
            spies._onGetSublayerElevation.called,
            'update radius should call _onGetSublayerElevation'
          );
        }
      },
      {
        title: 'Update opacity prop',
        updateProps: {
          opacity: 0.1
        },
        onAfterUpdate({subLayer, spies}) {
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
        title: 'Update getColorValue prop',
        updateProps: {
          getColorValue,
          updateTriggers: {
            getColorValue: 1
          }
        },
        onAfterUpdate({subLayer, spies}) {
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
        title: 'Update upperPercentile prop',
        updateProps: {
          upperPercentile: 90
        },
        onAfterUpdate({subLayer, spies}) {
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
        title: 'Update getElevationValue prop',
        updateProps: {
          getElevationValue,
          updateTriggers: {
            getElevationValue: 1
          }
        },
        onAfterUpdate({subLayer, spies}) {
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
        title: 'Update elevationUpperPercentile prop',
        updateProps: {
          elevationUpperPercentile: 99
        },
        onAfterUpdate({subLayer, spies}) {
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
        title: 'Update elevationRange prop',
        updateProps: {
          elevationRange: [0, 100]
        },
        onAfterUpdate({subLayer, spies}) {
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
  });
  t.end();
});

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

  testInitializeLayer({layer, onError: t.notOk});

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

  testInitializeLayer({layer, onError: t.notOk});

  // render sublayer
  const subLayer = layer.renderLayers();
  testInitializeLayer({layer: subLayer, onError: t.notOk});

  t.ok(subLayer instanceof ColumnLayer, 'ColumnLayer rendered');

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
