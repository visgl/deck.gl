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
import GL from '@luma.gl/constants';
import {Layer} from 'deck.gl';
import {testLayer} from '@deck.gl/test-utils';
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

const AGGREGATION_PROPS = ['cellSize'];

class TestGridAggregationLayer extends GridAggregationLayer {
  initializeState() {
    const {gl} = this.context;
    super.initializeState({aggregationProps: AGGREGATION_PROPS});
    this.setState({
      weights: {
        count: {
          needMin: true,
          needMax: true,
          size: 1,
          minBuffer: new Buffer(gl, {
            byteLength: 4 * 4,
            accessor: {size: 4, type: GL.FLOAT, divisor: 1}
          }),
          maxBuffer: new Buffer(gl, {
            byteLength: 4 * 4,
            accessor: {size: 4, type: GL.FLOAT, divisor: 1}
          })
        }
      }
    });
    const attributeManager = this.getAttributeManager();
    attributeManager.add({
      positions: {size: 3, accessor: 'getPosition', type: GL.DOUBLE, fp64: false},
      // this attribute is used in gpu aggregation path only
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
    const {minBuffer, maxBuffer} = this.state.weights.count;
    minBuffer.delete();
    maxBuffer.delete();
  }

  _getGridOffset(opts) {
    const {cellSize, screenSpaceAggregation} = this.state;
    if (!screenSpaceAggregation) {
      return super._getGridOffset(opts);
    }
    return {xOffset: cellSize, yOffset: cellSize};
  }

  updateAggregationFlags(opts) {
    const cellSizeChanged = opts.oldProps.cellSize !== opts.props.cellSize;
    const gpuAggregation = opts.props.gpuAggregation;
    const gpuAggregationChanged = gpuAggregation !== this.state.gpuAggregation;
    // Consider switching between CPU and GPU aggregation as data changed as it requires
    // re aggregation.
    const dataChanged = this.state.dataChanged || gpuAggregationChanged;
    this.setState({
      dataChanged,
      cellSizeChanged,
      cellSize: opts.props.cellSize,
      needsReProjection: dataChanged || cellSizeChanged,
      gpuAggregation
    });
  }

  // capture results
  updateResults(results) {
    this.setState({cpuResults: results});
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
    const {aggregationBuffer, minBuffer, maxBuffer} = layer.state.weights.count;
    gpuResults = {
      aggregationData: aggregationBuffer.getData(),
      minData: minBuffer.getData(),
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
    equals(filterEmptyChannels(cpuResults.minData), filterEmptyChannels(gpuResults.minData)),
    'minData should match'
  );
  t.ok(
    equals(filterEmptyChannels(cpuResults.maxData), filterEmptyChannels(gpuResults.maxData)),
    'maxData should match'
  );

  // DEBUG
  // logNonZero('cpu : aggregation', cpuResults.aggregationData);
  // logNonZero('gpu : aggregation', gpuResults.aggregationData);
  // logNonZero('cpu : min', cpuResults.minData);
  // logNonZero('gpu : min', gpuResults.minData);
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

test('GridAggregationLayer#CPUvsGPUAggregation', t => {
  let testCases = [
    {
      props: {
        data: fixture.data,
        getWeight: x => x.weight1[0],
        aggregation: 'SUM',
        cellSize: 500,
        gpuAggregation: false
      },
      onAfterUpdate({layer}) {
        verifyAggregationResults(t, {layer, gpu: false});
      }
    },
    {
      updateProps: {
        gpuAggregation: true
      },
      onAfterUpdate({layer}) {
        verifyAggregationResults(t, {layer, gpu: true});
        compareAggregationResults(t, layer);
      }
    }
  ];

  testCases = [
    ...testCases,
    ...getTestCases(t, {cellSize: 600, aggregation: 'MAX'})
    // Takes too long on CI
    // ...getTestCases(t, {aggregation: 'MAX'}),
    // ...getTestCases(t, {aggregation: 'MIN'}),
    // ...getTestCases(t, {aggregation: 'MEAN'})
  ];

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
