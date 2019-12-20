// Copyright (c) 2015 - 2019 Uber Technologies, Inc.
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
import GridAggregationLayer from '@deck.gl/aggregation-layers/grid-aggregation-layer';
import GPUGridAggregator from '@deck.gl/aggregation-layers/utils/gpu-grid-aggregation/gpu-grid-aggregator';
import {
  AGGREGATION_OPERATION,
  getValueFunc
} from '@deck.gl/aggregation-layers/utils/aggregation-operation-utils';
import GL from '@luma.gl/constants';
import {Layer} from 'deck.gl';
import {testLayer, gl} from '@deck.gl/test-utils';
import {GridAggregationData} from 'deck.gl-test/data';
import {equals} from 'math.gl';
import {Buffer} from '@luma.gl/core';

const BASE_LAYER_ID = 'composite-layer-id';
const PROPS = {
  cellSize: 10,
  prop1: 5
};

class TestLayer extends Layer {
  initializeState() {}
}

TestLayer.layerName = 'TestLayer';

const DIMENSIONS = {
  data: {
    props: ['cellSize']
  },
  weights: {
    props: ['aggregation'],
    accessors: ['getWeight']
  }
};

// Sample layer to test GridAggregationLayer, performs screen space aggregation
class TestGridAggregationLayer extends GridAggregationLayer {
  initializeState() {
    super.initializeState({
      dimensions: DIMENSIONS
    });
    this.setState({
      weights: {
        count: {
          needMax: true,
          size: 1,
          maxBuffer: new Buffer(gl, {
            byteLength: 4 * 4,
            accessor: {size: 4, type: GL.FLOAT, divisor: 1}
          })
        }
      },
      positionAttributeName: 'positions',
      projectPoints: true,
      posOffset: [0, 0],
      translation: [1, -1]
    });
    const attributeManager = this.getAttributeManager();
    attributeManager.add({
      positions: {
        size: 3,
        accessor: 'getPosition',
        type: GL.DOUBLE,
        fp64: this.use64bitPositions()
      },
      count: {size: 3, accessor: 'getWeight'}
    });
  }

  renderLayers() {
    return [
      new TestLayer(this.getSubLayerProps(), {
        scale: this.state.scale
      })
    ];
  }

  updateState(opts) {
    super.updateState(opts);
  }

  finalizeState() {
    super.finalizeState();

    const {gpuGridAggregator} = this.state;
    const {aggregationBuffer, maxBuffer} = this.state.weights.count;
    gpuGridAggregator.delete();
    if (aggregationBuffer) {
      aggregationBuffer.delete();
    }
    if (maxBuffer) {
      maxBuffer.delete();
    }
  }

  // Aggregation Overrides

  updateResults({aggregationData, maxData}) {
    const {count} = this.state.weights;
    count.aggregationData = aggregationData;
    count.maxData = maxData;
    this.setState({cpuResults: {aggregationData, maxData}});
  }

  /* eslint-disable complexity, max-statements */
  updateAggregationState(opts) {
    const cellSize = opts.props.cellSize;
    const cellSizeChanged = opts.oldProps.cellSize !== cellSize;

    let gpuAggregation = opts.props.gpuAggregation;
    if (this.state.gpuAggregation !== opts.props.gpuAggregation) {
      if (gpuAggregation && !GPUGridAggregator.isSupported(this.context.gl)) {
        gpuAggregation = false;
      }
    }
    const gpuAggregationChanged = gpuAggregation !== this.state.gpuAggregation;
    this.setState({
      gpuAggregation
    });

    const {dimensions} = this.state;
    const {data, weights} = dimensions;
    const aggregationDataDirty =
      this.isAttributeChanged('positions') ||
      gpuAggregationChanged ||
      this.isAggregationDirty(opts, {
        compareAll: gpuAggregation, // check for all (including extentions props) when using gpu aggregation
        dimension: data
      });
    const aggregationWeightsDirty = this.isAggregationDirty(opts, {dimension: weights});

    this.setState({
      aggregationDataDirty,
      aggregationWeightsDirty
    });

    const {viewport} = this.context;

    if (cellSizeChanged) {
      const {width, height} = viewport;
      const numCol = Math.ceil(width / cellSize);
      const numRow = Math.ceil(height / cellSize);
      this.allocateResources(numRow, numCol);
      this.setState({
        // transformation from clipspace to screen(pixel) space
        scaling: [width / 2, -height / 2, 1],

        gridOffset: {xOffset: cellSize, yOffset: cellSize},
        width,
        height,
        numCol,
        numRow
      });
    }

    if (aggregationWeightsDirty) {
      this._updateAccessors(opts);
    }
    if (aggregationDataDirty || aggregationWeightsDirty) {
      this._resetResults();
    }
  }
  /* eslint-enable complexity, max-statements */

  // Private

  _updateAccessors(opts) {
    const {getWeight, aggregation} = opts.props;
    const {count} = this.state.weights;
    if (count) {
      count.getWeight = getWeight;
      count.operation = AGGREGATION_OPERATION[aggregation];
    }
    this.setState({getValue: getValueFunc(aggregation, getWeight)});
  }

  _resetResults() {
    const {count} = this.state.weights;
    if (count) {
      count.aggregationData = null;
      count.maxData = null;
    }
  }
}

TestGridAggregationLayer.defaultProps = {
  cellSize: {type: 'number', min: 1, max: 1000, value: 1000},
  getPosition: {type: 'accessor', value: x => x.position},
  getWeight: {type: 'accessor', value: x => 1},
  gpuAggregation: true,
  aggregation: 'SUM'
};
TestGridAggregationLayer.layerName = 'TestGridAggregationLayer';

const {fixture} = GridAggregationData;

test('GridAggregationLayer#constructor', t => {
  const layer = new TestGridAggregationLayer(Object.assign({id: BASE_LAYER_ID}, PROPS));
  t.ok(layer, 'AggregationLayer created');
  t.end();
});

function verifyAggregationResults(t, {layer, gpu}) {
  const {cpuResults} = layer.state;
  let gpuResults;
  if (gpu) {
    const {aggregationBuffer, maxBuffer} = layer.state.weights.count;
    gpuResults = {
      aggregationData: aggregationBuffer.getData(),
      maxData: maxBuffer.getData()
    };
    layer.setState({gpuResults});
  }
  t.ok(
    gpu ? gpuResults.aggregationData : cpuResults.aggregationData,
    'should calculate aggregationData'
  );
}

function compareAggregationResults(t, layer) {
  const {cpuResults, gpuResults} = layer.state;
  t.ok(
    equals(
      filterEmptyChannels(cpuResults.aggregationData),
      filterEmptyChannels(gpuResults.aggregationData),
      1e-6
    ),
    'aggregationData should match'
  );
  t.ok(
    equals(filterEmptyChannels(cpuResults.maxData), filterEmptyChannels(gpuResults.maxData)),
    'maxData should match'
  );

  // DEBUG
  // logNonZero('cpu : aggregation', cpuResults.aggregationData);
  // logNonZero('gpu : aggregation', gpuResults.aggregationData);
  // logNonZero('cpu : max', cpuResults.maxData);
  // logNonZero('gpu : max', gpuResults.maxData);

  // clear cpuResults
  layer.setState({cpuResults: null, gpuResults: null});
}

function getTestCases(t, updateProps) {
  return [
    {
      updateProps: Object.assign({}, updateProps, {gpuAggregation: false}),
      onAfterUpdate({layer}) {
        verifyAggregationResults(t, {layer, gpu: false});
      }
    },
    {
      updateProps: Object.assign({gpuAggregation: true}),
      onAfterUpdate({layer}) {
        verifyAggregationResults(t, {layer, gpu: true});
        compareAggregationResults(t, layer);
      }
    }
  ];
}

test('GridAggregationLayer#state updates', t => {
  let testCases = [
    {
      props: {
        data: fixture.data,
        getWeight: x => x.weight1[0],
        aggregation: 'SUM',
        cellSize: 50,
        gpuAggregation: false
      },
      onAfterUpdate({layer, spies}) {
        verifyAggregationResults(t, {layer, gpu: false});
      }
    },
    {
      updateProps: {
        gpuAggregation: true
      },
      spies: [
        'updateAggregationState',
        '_updateAggregation',
        '_updateWeightBins',
        '_uploadAggregationResults'
      ],
      onAfterUpdate({layer, spies}) {
        t.ok(spies.updateAggregationState.called, 'should call updateAggregationState');
        if (GPUGridAggregator.isSupported(layer.context.gl)) {
          t.comment('GPU Aggregation is supported');
          t.ok(spies._updateAggregation.called, 'should call _updateAggregation');
          t.notOk(
            spies._updateWeightBins.called,
            'should not call _updateWeightBins for GPU aggregation'
          );
          t.ok(layer.state.gpuAggregation, 'should set gpuAggregation');

          verifyAggregationResults(t, {layer, gpu: true});
          compareAggregationResults(t, layer);
        } else {
          t.notOk(layer.state.gpuAggregation, 'gpuAggregation should be false when not supported');
        }
      }
    },
    {
      updateProps: {
        // switch to CPU Aggregation
        gpuAggregation: false
      },
      spies: ['_updateAggregation', '_updateWeightBins', '_uploadAggregationResults'],
      onAfterUpdate({layer, spies}) {
        // applicable only when switching from GPU to CPU
        if (GPUGridAggregator.isSupported(layer.context.gl)) {
          t.ok(spies._updateAggregation.called, 'should call _updateAggregation');
          t.ok(spies._updateWeightBins.called, 'should call _updateWeightBins');
          t.ok(spies._uploadAggregationResults.called, 'should call _uploadAggregationResults');
          t.notOk(layer.state.gpuAggregation, 'gpuAggregation should be set to false');
        }
      }
    },
    {
      updateProps: {
        updateTriggers: {
          all: 1
        }
      },
      spies: ['_updateAggregation', '_updateWeightBins', '_uploadAggregationResults'],
      onAfterUpdate({layer, spies}) {
        // Should re do the aggregation.
        t.ok(spies._updateAggregation.called, 'should call _updateAggregation');
        t.ok(spies._updateWeightBins.called, 'should call _updateWeightBins');
        t.ok(spies._uploadAggregationResults.called, 'should call _uploadAggregationResults');
        t.notOk(layer.state.gpuAggregation, 'gpuAggregation should be set to false');
      }
    },
    {
      updateProps: {
        // only chnage weight accessor
        updateTriggers: {
          getWeight: 1
        }
      },
      spies: ['_updateAggregation', '_updateWeightBins'],
      onAfterUpdate({layer, spies}) {
        t.notOk(spies._updateAggregation.called, 'should not call _updateAggregation');
        t.ok(spies._updateWeightBins.called, 'should call _updateWeightBins');
        t.notOk(layer.state.gpuAggregation, 'gpuAggregation should be set to false');
      }
    },
    {
      updateProps: {
        // while in CPU aggregation change weight prop
        aggregation: 'MAX'
      },
      spies: ['_updateAggregation', '_updateWeightBins', '_uploadAggregationResults'],
      onAfterUpdate({layer, spies}) {
        t.notOk(
          spies._updateAggregation.called,
          'should not call _updateAggregation when only weight changed'
        );
        t.ok(spies._updateWeightBins.called, 'should call _updateWeightBins');
        t.ok(spies._uploadAggregationResults.called, 'should call _uploadAggregationResults');
      }
    },
    {
      updateProps: {
        // switch to GPU aggregation
        gpuAggregation: true
      }
    },
    {
      updateProps: {
        // while in GPU aggregation change weight prop
        aggregation: 'MEAN'
      },
      spies: ['_updateAggregation', '_updateWeightBins', '_uploadAggregationResults'],
      onAfterUpdate({layer, spies}) {
        if (GPUGridAggregator.isSupported(layer.context.gl)) {
          t.ok(spies._updateAggregation.called, 'should not call _updateAggregation');
          t.notOk(spies._updateWeightBins.called, 'should not call _updateWeightBins');
        } else {
          // weight dimenstion changed while in CPU aggregation
          t.notOk(spies._updateAggregation.called, 'should not call _updateAggregation');
          t.ok(spies._updateWeightBins.called, 'should not call _updateWeightBins');
          t.notOk(layer.state.gpuAggregation, 'gpuAggregation should be false when not supported');
        }
      }
    }
  ];

  if (GPUGridAggregator.isSupported(gl)) {
    testCases = testCases.concat([
      ...getTestCases(t, {cellSize: 60, aggregation: 'SUM'}),
      ...getTestCases(t, {aggregation: 'MAX'}),
      ...getTestCases(t, {aggregation: 'MIN'}),
      ...getTestCases(t, {aggregation: 'MEAN'})
    ]);
  }

  testLayer({
    Layer: TestGridAggregationLayer,
    onError: t.notOk,
    viewport: fixture.moduleSettings.viewport,
    testCases
  });

  t.end();
});

function filterEmptyChannels(inArray) {
  const outArray = [];
  for (let i = 0; i < inArray.length; i += 4) {
    if (inArray[i + 3] > 0) {
      // something is being rendered to this pixel
      outArray.push(inArray[i], inArray[i + 3]);
    }
  }
  return outArray;
}

// DEBUG ONLY
/* eslint-disable no-console, no-undef */
// function logNonZero(name, array) {
//   console.log(`${name}: length: ${array.length}`);
//   for (let i = 0; i < array.length; i += 4) {
//     // if (i*4 === 4143988) {
//     //   console.log(`==> ${i}: ${array[i*4]} ${array[i*4 + 1]} ${array[i*4 + 2]} ${array[i*4 + 3]}`);
//     // }
//     if (array[i + 3] > 0) {
//       console.log(`${i}: ${array[i]} ${array[i + 1]} ${array[i + 2]} ${array[i + 3]}`);
//     }
//   }
// }
/* eslint-enable no-console, no-undef */
