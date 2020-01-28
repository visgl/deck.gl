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

import * as FIXTURES from 'deck.gl-test/data';

import {testLayer, testInitializeLayer, generateLayerTests} from '@deck.gl/test-utils';

import {GridCellLayer} from '@deck.gl/layers';
import {CPUGridLayer} from '@deck.gl/aggregation-layers';

test('CPUGridLayer', t => {
  const testCases = generateLayerTests({
    Layer: CPUGridLayer,
    sampleProps: {
      data: FIXTURES.points.slice(0, 3),
      getPosition: d => d.COORDINATES
    },
    assert: t.ok,
    onBeforeUpdate: ({testCase}) => t.comment(testCase.title),
    onAfterUpdate({layer}) {
      if (layer.props.data && layer.props.data.length) {
        t.ok(
          layer.state.aggregatorState.layerData.data.length > 0,
          'should update state.layerData'
        );
      }
    }
  });

  testLayer({Layer: CPUGridLayer, testCases, onError: t.notOk});

  t.end();
});

test('CPUGridLayer#renderSubLayer', t => {
  makeSpy(CPUGridLayer.prototype, '_onGetSublayerColor');
  makeSpy(CPUGridLayer.prototype, '_onGetSublayerElevation');

  const layer = new CPUGridLayer({
    data: FIXTURES.points,
    cellSize: 500,
    getPosition: d => d.COORDINATES,
    pickable: true
  });

  testInitializeLayer({layer, onError: t.notOk});

  // render sublayer
  const subLayer = layer.renderLayers();
  testInitializeLayer({layer: subLayer, onError: t.notOk});

  t.ok(subLayer instanceof GridCellLayer, 'GridCellLayer rendered');

  // should call attribute updater twice
  // because test util calls both initialize and update layer
  t.ok(CPUGridLayer.prototype._onGetSublayerColor.called, 'should call _onGetSublayerColor');
  t.ok(
    CPUGridLayer.prototype._onGetSublayerElevation.called,
    'should call _onGetSublayerElevation'
  );
  CPUGridLayer.prototype._onGetSublayerColor.restore();
  CPUGridLayer.prototype._onGetSublayerElevation.restore();

  t.end();
});

test('CPUGridLayer#updates', t => {
  // assert on state property updates after layer.prop change
  function assertStateUpdate(shouldUpdate, prop) {
    return function onAfterUpdate({layer, oldState: oldLayerState}) {
      function checkIfUpdated(state, oldState, shouldUpdateItem, previousKeys) {
        if (typeof shouldUpdateItem === 'object') {
          for (const key in shouldUpdateItem) {
            checkIfUpdated(
              state[key],
              oldState[key],
              shouldUpdateItem[key],
              `${previousKeys}.${key}`
            );
          }
        } else {
          t.ok(
            shouldUpdateItem ? state !== oldState : state === oldState,
            `update props.${prop} should ${!shouldUpdateItem ? 'not' : ''} update ${previousKeys}`
          );
        }
      }

      checkIfUpdated(
        layer.state.aggregatorState,
        oldLayerState.aggregatorState,
        shouldUpdate,
        'aggregatorState'
      );
    };
  }

  function getChecksForCellSizeChange() {
    const shouldUpdate = {
      layerData: true,
      dimensions: {
        fillColor: {
          sortedBins: true,
          valueDomain: true,
          getValue: false,
          scaleFunc: true
        },
        elevation: {
          sortedBins: true,
          valueDomain: true,
          getValue: false,
          scaleFunc: true
        }
      }
    };
    return assertStateUpdate(shouldUpdate, 'cellSize');
  }
  function getChecksForFilterChange(triggered) {
    const shouldUpdate = {
      layerData: false,
      dimensions: {
        fillColor: {
          sortedBins: triggered,
          valueDomain: triggered,
          getValue: triggered,
          scaleFunc: triggered
        },
        elevation: {
          sortedBins: triggered,
          valueDomain: triggered,
          getValue: triggered,
          scaleFunc: triggered
        }
      }
    };
    return assertStateUpdate(shouldUpdate, '_filterData');
  }
  function getChecksForPositionChange(triggerChange) {
    const shouldUpdate = {
      layerData: triggerChange,
      dimensions: {
        fillColor: {
          sortedBins: triggerChange,
          valueDomain: triggerChange,
          getValue: false,
          scaleFunc: triggerChange
        },
        elevation: {
          sortedBins: triggerChange,
          valueDomain: triggerChange,
          getValue: false,
          scaleFunc: triggerChange
        }
      }
    };
    return assertStateUpdate(
      shouldUpdate,
      `getPosition ${triggerChange ? 'w/' : 'w/o'} trigger change`
    );
  }
  function getCheckForNoBinChange(accessor, dimension) {
    const update = dimension;
    const noUpdate = ['fillColor', 'elevation'].find(k => k !== dimension);
    const shouldUpdate = {
      layerData: false,
      dimensions: {
        [update]: {
          sortedBins: false,
          valueDomain: false,
          getValue:
            accessor === 'getColorValue w/o trigger' ||
            accessor === 'getElevationValue w/o trigger',
          scaleFunc: false
        },
        [noUpdate]: {
          sortedBins: false,
          valueDomain: false,
          getValue: false,
          scaleFunc: false
        }
      }
    };
    return assertStateUpdate(shouldUpdate, accessor);
  }
  function getCheckForTriggeredBinUpdate(accessor, dimension) {
    const update = dimension;
    const noUpdate = ['fillColor', 'elevation'].find(k => k !== dimension);
    const shouldUpdate = {
      layerData: false,
      dimensions: {
        [update]: {
          sortedBins: true,
          valueDomain: true,
          getValue: true,
          scaleFunc: true
        },
        [noUpdate]: {
          sortedBins: false,
          valueDomain: false,
          getValue: false,
          scaleFunc: false
        }
      }
    };
    return assertStateUpdate(shouldUpdate, accessor);
  }
  function getChecksForPercentileUpdate(side, dimension) {
    const update = dimension;
    const noUpdate = ['fillColor', 'elevation'].find(k => k !== dimension);
    const shouldUpdate = {
      layerData: false,
      dimensions: {
        [update]: {
          sortedBins: false,
          valueDomain: true,
          getValue: false,
          scaleFunc: true
        },
        [noUpdate]: {
          sortedBins: false,
          valueDomain: false,
          getValue: false,
          scaleFunc: false
        }
      }
    };
    return assertStateUpdate(shouldUpdate, `${side}Percentile`);
  }
  function getChecksForDomainOrRangeUpdate(prop, dimension) {
    const update = dimension;
    const noUpdate = ['fillColor', 'elevation'].find(k => k !== dimension);
    const shouldUpdate = {
      layerData: false,
      dimensions: {
        [update]: {
          sortedBins: false,
          valueDomain: false,
          getValue: false,
          scaleFunc: true
        },
        [noUpdate]: {
          sortedBins: false,
          valueDomain: false,
          getValue: false,
          scaleFunc: false
        }
      }
    };
    return assertStateUpdate(shouldUpdate, `${dimension}${prop}`);
  }

  function getChecksForColorScaleTypeQuantize(scaleType) {
    const shouldUpdate = {
      dimensions: {
        colorScaleType: 'quantize'
      }
    };
    t.ok(
      shouldUpdate.dimensions.colorScaleType === scaleType,
      `update aggregatorState.dimension.colorScaleType to ${scaleType}`
    );
  }

  function getChecksForColorScaleTypeLinear(scaleType) {
    const shouldUpdate = {
      dimensions: {
        colorScaleType: 'linear'
      }
    };
    t.ok(
      shouldUpdate.dimensions.colorScaleType === scaleType,
      `update aggregatorState.dimension.colorScaleType to ${scaleType}`
    );
  }

  function getChecksForColorScaleTypeQuantile(scaleType) {
    const shouldUpdate = {
      dimensions: {
        colorScaleType: 'quantile'
      }
    };
    t.ok(
      shouldUpdate.dimensions.colorScaleType === scaleType,
      `update aggregatorState.dimension.colorScaleType to ${scaleType}`
    );
  }

  function getChecksForColorScaleTypeOrdinal(scaleType) {
    const shouldUpdate = {
      dimensions: {
        colorScaleType: 'ordinal'
      }
    };
    return t.ok(
      shouldUpdate.dimensions.colorScaleType === scaleType,
      `update aggregatorState.dimension.colorScaleType to ${scaleType}`
    );
  }

  testLayer({
    Layer: CPUGridLayer,
    onError: t.notOk,
    testCases: [
      {
        props: {
          data: FIXTURES.points,
          cellSize: 400,
          getPosition: d => d.COORDINATES,
          pickable: true
        },
        onAfterUpdate({layer}) {
          const {
            layerData,
            dimensions: {fillColor, elevation}
          } = layer.state.aggregatorState;

          t.ok(layerData.data.length > 0, 'aggregatorState.dimensions.layerDate calculated');
          t.ok(
            fillColor.sortedBins,
            'aggregatorState.dimensions.fillColor.sortedColorBins calculated'
          );
          t.ok(
            elevation.sortedBins,
            'aggregatorState.dimensions.elevation.sortedColorBins calculated'
          );
          t.ok(
            Array.isArray(fillColor.valueDomain),
            'aggregatorState.dimensions.fillColor.valueDomain calculated'
          );
          t.ok(
            Array.isArray(elevation.valueDomain),
            'aggregatorState.dimensions.elevation.valueDomain calculated'
          );
          t.ok(
            typeof fillColor.getValue === 'function',
            'aggregatorState.dimensions.fillColor.getValue calculated'
          );
          t.ok(
            typeof elevation.getValue === 'function',
            'aggregatorState.dimension.elevation.getValue calculated'
          );

          t.ok(
            Array.isArray(fillColor.sortedBins.aggregatedBins),
            'aggregatorState.dimension.fillColor.sortedBins.aggregatedBins calculated'
          );
          t.ok(
            Array.isArray(elevation.sortedBins.aggregatedBins),
            'aggregatorState.dimension.elevation.sortedBins.aggregatedBins calculated'
          );

          const firstSortedBin = fillColor.sortedBins.sortedBins[0];
          const binToCell = layerData.data.find(d => d.index === firstSortedBin.i);

          t.ok(
            fillColor.sortedBins.binMap[binToCell.index] === firstSortedBin,
            'Correct aggregatorState.dimension.fillColor.sortedBins.binMap created'
          );
        }
      },
      {
        updateProps: {
          _filterData: pt => pt.SPACES >= 4 && pt.SPACES <= 10
        },
        onAfterUpdate: ({layer, oldState}) => {
          getChecksForFilterChange(false)({layer, oldState});

          const {layerData} = layer.state.aggregatorState;
          const isPointFiltered = layerData.data.every(bin => bin.filteredPoints === null);

          t.ok(isPointFiltered, 'filteredPoints in bins should be reset to null');
        }
      },
      {
        updateProps: {
          _filterData: pt => pt.SPACES >= 4 && pt.SPACES <= 10,
          updateTriggers: {
            _filterData: 1
          }
        },
        onAfterUpdate: ({layer, oldState}) => {
          getChecksForFilterChange(true)({layer, oldState});

          const {
            layerData,
            dimensions: {fillColor, elevation}
          } = layer.state.aggregatorState;

          const isPointFiltered = layerData.data.every(bin =>
            bin.filteredPoints.every(pt => pt.SPACES >= 4 && pt.SPACES <= 10)
          );

          t.ok(isPointFiltered, 'filteredPoints in bins should be correct');

          t.ok(
            fillColor.sortedBins,
            'aggregatorState.dimensions.fillColor.sortedColorBins calculated'
          );
          t.ok(
            elevation.sortedBins,
            'aggregatorState.dimensions.elevation.sortedColorBins calculated'
          );
        }
      },
      {
        updateProps: {
          _filterData: null,
          updateTriggers: {
            _filterData: 0
          }
        },
        onAfterUpdate: ({layer, oldState}) => {
          getChecksForFilterChange(true)({layer, oldState});

          const {layerData} = layer.state.aggregatorState;
          const isPointFiltered = layerData.data.every(bin => bin.filteredPoints === null);

          t.ok(isPointFiltered, 'filteredPoints in bins should be reset to null');
        }
      },
      {
        updateProps: {
          cellSize: 800
        },
        onAfterUpdate: getChecksForCellSizeChange()
      },
      {
        updateProps: {
          getPosition: d => d.COORDINATES
        },
        onAfterUpdate: getChecksForPositionChange(false)
      },
      {
        updateProps: {
          getPosition: d => d.COORDINATES,
          updateTriggers: {
            getPosition: 1
          }
        },
        onAfterUpdate: getChecksForPositionChange(true)
      },
      {
        updateProps: {
          getColorWeight: x => 2
        },
        onAfterUpdate: getCheckForNoBinChange('getColorWeight w/o trigger', 'fillColor')
      },
      {
        updateProps: {
          getColorWeight: x => 2,
          updateTriggers: {
            getColorWeight: 1
          }
        },
        onAfterUpdate: getCheckForTriggeredBinUpdate('getColorWeight w/ trigger', 'fillColor')
      },
      {
        updateProps: {
          getColorValue: x => 2
        },
        onAfterUpdate: getCheckForNoBinChange('getColorValue w/o trigger', 'fillColor')
      },
      {
        updateProps: {
          getColorValue: x => 2,
          updateTriggers: {
            getColorValue: 1
          }
        },
        onAfterUpdate: getCheckForTriggeredBinUpdate('getColorValue w/ trigger', 'fillColor')
      },
      {
        updateProps: {
          colorAggregation: 'MEAN',
          getColorValue: null
        },
        onAfterUpdate: getCheckForTriggeredBinUpdate(
          'colorAggregation w/o getColorValue',
          'fillColor'
        )
      },
      {
        updateProps: {
          upperPercentile: 90
        },
        onAfterUpdate: getChecksForPercentileUpdate('upper', 'fillColor')
      },
      {
        updateProps: {
          lowerPercentile: 90
        },
        onAfterUpdate: getChecksForPercentileUpdate('lower', 'fillColor')
      },
      {
        updateProps: {
          colorDomain: [0, 10]
        },
        onAfterUpdate: getChecksForDomainOrRangeUpdate('Domain', 'fillColor')
      },
      {
        updateProps: {
          colorRange: [[1, 1, 1], [2, 2, 2], [3, 3, 3]]
        },
        onAfterUpdate: getChecksForDomainOrRangeUpdate('Range', 'fillColor')
      },
      {
        updateProps: {
          getElevationWeight: x => 2
        },
        onAfterUpdate: getCheckForNoBinChange('getElevationWeight', 'elevation')
      },
      {
        updateProps: {
          getElevationWeight: x => 2,
          updateTriggers: {
            getElevationWeight: 1
          }
        },
        onAfterUpdate: getCheckForTriggeredBinUpdate('getElevationWeight', 'elevation')
      },
      {
        updateProps: {
          getElevationValue: x => 2
        },
        onAfterUpdate: getCheckForNoBinChange('getElevationValue w/o trigger', 'elevation')
      },
      {
        updateProps: {
          getElevationValue: x => 2,
          updateTriggers: {
            getElevationValue: 1
          }
        },
        onAfterUpdate: getCheckForTriggeredBinUpdate('getElevationValue', 'elevation')
      },
      {
        updateProps: {
          elevationAggregation: 'MEAN',
          getElevationValue: null
        },
        onAfterUpdate: getCheckForTriggeredBinUpdate('elevationAggregation', 'elevation')
      },
      {
        updateProps: {
          elevationUpperPercentile: 80
        },
        onAfterUpdate: getChecksForPercentileUpdate('elevationUpper', 'elevation')
      },
      {
        updateProps: {
          elevationLowerPercentile: 10
        },
        onAfterUpdate: getChecksForPercentileUpdate('elevationLower', 'elevation')
      },
      {
        updateProps: {
          elevationRange: [1, 10]
        },
        onAfterUpdate: getChecksForDomainOrRangeUpdate('Range', 'elevation')
      },
      {
        updateProps: {
          elevationDomain: [0, 10]
        },
        onAfterUpdate: getChecksForDomainOrRangeUpdate('Domain', 'elevation')
      },
      {
        updateProps: {
          colorScaleType: 'quantize'
        },
        onAfterUpdate: getChecksForColorScaleTypeQuantize('quantize')
      },
      {
        updateProps: {
          colorScaleType: 'linear'
        },
        onAfterUpdate: getChecksForColorScaleTypeLinear('linear')
      },
      {
        updateProps: {
          colorScaleType: 'quantile'
        },
        onAfterUpdate: getChecksForColorScaleTypeQuantile('quantile')
      },
      {
        updateProps: {
          colorScaleType: 'ordinal'
        },
        onAfterUpdate: getChecksForColorScaleTypeOrdinal('ordinal')
      }
    ]
  });

  t.end();
});

test('CPUGridLayer#updateTriggers', t => {
  // setup spies
  const SPIES = ['_onGetSublayerColor', '_onGetSublayerElevation'];
  function getSublayerAttributeUpdateCheck(prop, result = {}) {
    return function onAfterUpdate({subLayer, spies}) {
      t.ok(
        result.color ? spies._onGetSublayerColor.called : !spies._onGetSublayerColor.called,
        `update ${prop} should ${result.color ? '' : 'not'} call _onGetSublayerColor`
      );
      t.ok(
        result.elevation
          ? spies._onGetSublayerElevation.called
          : !spies._onGetSublayerElevation.called,
        `update ${prop} should ${result.elevation ? '' : 'not'} call _onGetSublayerElevation`
      );
    };
  }

  testLayer({
    Layer: CPUGridLayer,
    spies: SPIES,
    onError: t.notOk,
    testCases: [
      {
        props: {
          data: FIXTURES.points,
          cellSize: 400,
          getColorValue: d => 3,
          getElevationValue: d => 4,
          getPosition: d => d.COORDINATES
        }
      },
      {
        updateProps: {
          cellSize: 800
        },
        onAfterUpdate: getSublayerAttributeUpdateCheck('cellSize', {color: true, elevation: true})
      },
      {
        updateProps: {
          opacity: 0.1
        },
        onAfterUpdate: getSublayerAttributeUpdateCheck('opacity', {color: false, elevation: false})
      },
      {
        updateProps: {
          coverage: 0.1
        },
        onAfterUpdate: getSublayerAttributeUpdateCheck('coverage', {color: false, elevation: false})
      },
      {
        updateProps: {
          extruded: true
        },
        onAfterUpdate: getSublayerAttributeUpdateCheck('extruded', {color: false, elevation: false})
      },
      {
        updateProps: {
          getColorWeight: x => 2
        },
        onAfterUpdate: getSublayerAttributeUpdateCheck('getColorWeight w/o triggers', {
          color: false,
          elevation: false
        })
      },
      {
        updateProps: {
          getColorWeight: x => 2,
          updateTriggers: {
            getColorWeight: 1
          }
        },
        onAfterUpdate: getSublayerAttributeUpdateCheck('getColorWeight w triggers', {
          color: true,
          elevation: false
        })
      },
      {
        updateProps: {
          getColorWeight: x => 3
        },
        onAfterUpdate: getSublayerAttributeUpdateCheck('getColorWeight w/o triggers', {
          color: false,
          elevation: false
        })
      },
      {
        updateProps: {
          getColorValue: x => 2
        },
        onAfterUpdate: getSublayerAttributeUpdateCheck('getColorValue null to assigned ', {
          color: false,
          elevation: false
        })
      },
      // {
      //   updateProps: {
      //     getColorValue: x => 3
      //   },
      //   onAfterUpdate: getSublayerAttributeUpdateCheck('getColorValue w/o triggers', {
      //     color: false,
      //     elevation: false
      //   })
      // },
      {
        updateProps: {
          getColorValue: x => 4,
          updateTriggers: {
            getColorValue: 1
          }
        },
        onAfterUpdate: getSublayerAttributeUpdateCheck('getColorValue w triggers', {
          color: true,
          elevation: false
        })
      },
      {
        updateProps: {
          getColorValue: x => 4,
          updateTriggers: {
            getColorValue: {
              a: 1,
              b: 2
            }
          }
        },
        onAfterUpdate: getSublayerAttributeUpdateCheck('getColorValue w triggers as object', {
          color: true,
          elevation: false
        })
      },
      {
        updateProps: {
          getColorValue: x => 4,
          updateTriggers: {
            getColorValue: {
              a: 1,
              b: 2
            }
          }
        },
        onAfterUpdate: getSublayerAttributeUpdateCheck('getColorValue w triggers as object', {
          color: false,
          elevation: false
        })
      },
      {
        updateProps: {
          getColorValue: x => 4,
          updateTriggers: {
            getColorValue: {
              a: 2,
              b: 2
            }
          }
        },
        onAfterUpdate: getSublayerAttributeUpdateCheck(
          'getColorValue w triggers as changed object',
          {
            color: true,
            elevation: false
          }
        )
      },
      {
        updateProps: {
          upperPercentile: 90
        },
        onAfterUpdate: getSublayerAttributeUpdateCheck('upperPercentile', {
          color: true,
          elevation: false
        })
      },
      {
        updateProps: {
          lowerPercentile: 10
        },
        onAfterUpdate: getSublayerAttributeUpdateCheck('lowerPercentile', {
          color: true,
          elevation: false
        })
      },
      {
        updateProps: {
          colorDomain: [10, 20]
        },
        onAfterUpdate: getSublayerAttributeUpdateCheck('colorDomain', {
          color: true,
          elevation: false
        })
      },
      {
        updateProps: {
          colorRange: [[1, 2, 3], [2, 3, 4], [3, 4, 5]]
        },
        onAfterUpdate: getSublayerAttributeUpdateCheck('colorRange', {
          color: true,
          elevation: false
        })
      },
      {
        updateProps: {
          elevationAggregation: 'MEAN'
        },
        onAfterUpdate: getSublayerAttributeUpdateCheck('elevationAggregation', {
          color: false,
          elevation: true
        })
      },
      {
        updateProps: {
          getElevationWeight: x => 2
        },
        onAfterUpdate: getSublayerAttributeUpdateCheck('getElevationWeight w/o triggers', {
          color: false,
          elevation: false
        })
      },
      {
        updateProps: {
          getElevationWeight: x => 2,
          updateTriggers: {
            getElevationWeight: 1,
            // persist color updateTriggers to avoid triggering color update
            getColorValue: 1
          }
        },
        onAfterUpdate: getSublayerAttributeUpdateCheck('getElevationWeight w triggers', {
          color: true,
          elevation: true
        })
      },
      {
        updateProps: {
          getElevationWeight: x => 3
        },
        onAfterUpdate: getSublayerAttributeUpdateCheck('getElevationWeight w/o triggers', {
          color: false,
          elevation: false
        })
      },
      {
        updateProps: {
          getElevationValue: x => 2
        },
        onAfterUpdate: getSublayerAttributeUpdateCheck('getElevationValue null to assigned', {
          color: false,
          elevation: false
        })
      },
      {
        updateProps: {
          getElevationValue: x => 3
        },
        onAfterUpdate: getSublayerAttributeUpdateCheck('getElevationValue w/o triggers', {
          color: false,
          elevation: false
        })
      },
      {
        updateProps: {
          getElevationValue: x => 4,
          updateTriggers: {
            getElevationValue: 1,
            // persist getColorValue update triggers
            getColorValue: 1
          }
        },
        onAfterUpdate: getSublayerAttributeUpdateCheck('getElevationValue w triggers', {
          color: false,
          elevation: true
        })
      },
      {
        updateProps: {
          elevationUpperPercentile: 90
        },
        onAfterUpdate: getSublayerAttributeUpdateCheck('elevationUpperPercentile', {
          color: false,
          elevation: true
        })
      },
      {
        updateProps: {
          elevationLowerPercentile: 10
        },
        onAfterUpdate: getSublayerAttributeUpdateCheck('elevationLowerPercentile', {
          color: false,
          elevation: true
        })
      },
      {
        updateProps: {
          elevationDomain: [10, 20]
        },
        onAfterUpdate: getSublayerAttributeUpdateCheck('elevationDomain', {
          color: false,
          elevation: true
        })
      },
      {
        updateProps: {
          elevationRange: [2, 20]
        },
        onAfterUpdate: getSublayerAttributeUpdateCheck('elevationRange', {
          color: false,
          elevation: true
        })
      }
    ]
  });

  t.end();
});
