import test from 'tape-catch';
import GPUGridAggregator from '@deck.gl/aggregation-layers/utils/gpu-grid-aggregation/gpu-grid-aggregator';
import {
  AGGREGATION_OPERATION,
  getValueFunc
} from '@deck.gl/aggregation-layers/utils/aggregation-operation-utils';
import {pointToDensityGridDataCPU} from '@deck.gl/aggregation-layers/cpu-grid-layer/grid-aggregator';
import BinSorter from '@deck.gl/aggregation-layers/utils/bin-sorter';

import {gl} from '@deck.gl/test-utils';
import {GridAggregationData} from 'deck.gl-test/data';
import {equals, config} from 'math.gl';

const {fixture, buildAttributes} = GridAggregationData;

function verifyResults({t, cpuResults, gpuResults, testName}) {
  for (const name in cpuResults) {
    if (
      equals(cpuResults[name][0], gpuResults[name][0]) &&
      equals(cpuResults[name][3], gpuResults[name][3])
    ) {
      t.pass(`${testName}: ${name} CPU and GPU results matched`);
    } else {
      t.fail(
        `${testName}: ${name}: results didn't match cpu: ${cpuResults[name]} gpu: ${
          gpuResults[name]
        }`
      );
    }
  }
}

/* eslint-disable max-statements */
function testCounterMinMax(aggregator, t, opts) {
  const {useGPU, size = 1} = opts;
  const testName = `${useGPU ? 'GPU' : 'CPU'} size: ${size}:`;

  let weight1 = Object.assign({}, fixture.weights.weight1, {size});
  let results = aggregator.run(Object.assign({}, fixture, {weights: {weight1}, useGPU}));

  const {minData, maxData} = aggregator.getData('weight1');
  t.equal(maxData[3], 3, `${testName} needMax: total count should match`);
  t.equal(minData[3], 3, `${testName} needMin: total count should match`);
  t.equal(maxData[0], 4, `${testName} needMax: max weight should match`);
  t.equal(minData[0], 2, `${testName} needMin: min weight should match`);
  if (size > 1) {
    t.equal(maxData[1], 53, `${testName} needMax: max weight should match for weight#2`);
    t.equal(minData[1], 11, `${testName} needMin: min weight should match for weight#2`);
    if (size > 2) {
      t.equal(maxData[2], 704, `${testName} needMax: max weight should match for weight#3`);
      t.equal(minData[2], 101, `${testName} needMin: min weight should match for weight#3`);
    }
  }

  weight1 = Object.assign({}, weight1, {combineMaxMin: true});
  results = aggregator.run(Object.assign({}, fixture, {weights: {weight1}, useGPU}));

  const maxMinData = results.weight1.maxMinBuffer.getData();
  t.equal(maxMinData[0], 4, `${testName} combineMaxMin: max weight should match`);
  if (size > 1) {
    t.equal(maxMinData[1], 53, `${testName} combineMaxMin: max weight should match for weight#2`);
    if (size > 2) {
      t.equal(
        maxMinData[2],
        704,
        `${testName} combineMaxMin: max weight should match for weight#3`
      );
    }
  }
  t.equal(maxMinData[3], 2, `${testName} combineMaxMin: min weight should match`);
}
/* eslint-enable max-statements */

test('GPUGridAggregator#GPU', t => {
  const sa = new GPUGridAggregator(gl);
  testCounterMinMax(sa, t, {useGPU: true});
  testCounterMinMax(sa, t, {useGPU: true, size: 2});
  testCounterMinMax(sa, t, {useGPU: true, size: 3});
  t.end();
});

const {generateRandomGridPoints} = GridAggregationData;

function cpuAggregator(props, aggregationParms) {
  const layerData = pointToDensityGridDataCPU(props, aggregationParms);
  // const {getWeight} = opts.weights.weight1;
  const {aggregation} = aggregationParms;
  const getValue = getValueFunc(aggregation, x => x.weight1[0]);
  const {minValue, maxValue, totalCount} = new BinSorter(layerData.data, getValue, false);
  const maxMinData = new Float32Array([maxValue, 0, 0, minValue]);
  const maxData = new Float32Array([maxValue, 0, 0, totalCount]);
  const minData = new Float32Array([minValue, 0, 0, totalCount]);
  return {minData, maxData, maxMinData};
}

function testAggregationOperations(opts) {
  const {t, op, aggregation, pointsData} = opts;
  const oldEpsilon = config.EPSILON;
  if (op === AGGREGATION_OPERATION.MEAN) {
    // cpu: 4.692307472229004 VS gpu: 4.692307949066162
    // cpu: 4.21212100982666 VS gpu: 4.212121486663818
    config.EPSILON = 1e-6;
  }

  const gpuAggregator = new GPUGridAggregator(gl);

  const weight = Object.assign({}, pointsData.weights.weight1, {operation: op});
  const maxMinweight = Object.assign({}, weight, {combineMaxMin: true});
  const aggregationOpts = Object.assign(
    {
      aggregation,
      viewport: fixture.moduleSettings.viewport,
      gridOffset: {xOffset: fixture.cellSize[0], yOffset: fixture.cellSize[1]},
      cellOffset: [0, 0]
    },
    fixture,
    pointsData,
    {
      weights: {weight1: weight}
    }
  );
  // const props = Object.assign({}, fixture, pointsData);
  const cpuResults = cpuAggregator({
    data: pointsData.data,
    cellSize: fixture.cellSize
  }, {
    aggregation,
    viewport: fixture.moduleSettings.viewport,
    gridOffset: {xOffset: fixture.cellSize[0], yOffset: fixture.cellSize[1]},
    cellOffset: [0, 0],
    attributes: pointsData.attributes,
    projectPoints: fixture.projectPoints,
    numInstances: pointsData.vertexCount
  });
  let results = gpuAggregator.run(aggregationOpts);

  const gpuResults = {
    minData: results.weight1.minBuffer.getData(),
    maxData: results.weight1.maxBuffer.getData()
  };
  results = gpuAggregator.run(Object.assign(aggregationOpts, {weights: {weight1: maxMinweight}}));
  gpuResults.maxMinData = results.weight1.maxMinBuffer.getData();

  // Compare aggregation details for each grid-cell, total count and max count.
  verifyResults({t, cpuResults, gpuResults, testName: aggregation});
  config.EPSILON = oldEpsilon;
}

test('GPUGridAggregator#CompareCPUandGPU', t => {
  const randomData = generateRandomGridPoints(5000);
  const {attributes, vertexCount, data} = buildAttributes(randomData);
  const pointsData = {
    data,
    weights: randomData.weights,
    attributes,
    vertexCount
  };
  for (const aggregation in AGGREGATION_OPERATION) {
    testAggregationOperations({t, aggregation, op: AGGREGATION_OPERATION[aggregation], pointsData});
  }
  t.end();
});
