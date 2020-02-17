import test from 'tape-catch';
import {gl} from '@deck.gl/test-utils';
import GPUGridAggregator from '@deck.gl/aggregation-layers/utils/gpu-grid-aggregation/gpu-grid-aggregator';
import {
  AGGREGATION_OPERATION,
  getValueFunc
} from '@deck.gl/aggregation-layers/utils/aggregation-operation-utils';
import {pointToDensityGridDataCPU} from '@deck.gl/aggregation-layers/cpu-grid-layer/grid-aggregator';
import BinSorter from '@deck.gl/aggregation-layers/utils/bin-sorter';
import {
  getBoundingBox,
  getGridParams
} from '@deck.gl/aggregation-layers/utils/grid-aggregation-utils';
import {COORDINATE_SYSTEM} from '@deck.gl/core';
import {GridAggregationData} from 'deck.gl-test/data';
import {equals, config} from 'math.gl';

const {fixture, buildAttributes, generateRandomGridPoints} = GridAggregationData;

function verifyResults({t, cpuResults, gpuResults, testName, skipTotalCount = false}) {
  for (const name in cpuResults) {
    if (
      equals(cpuResults[name][0], gpuResults[name][0]) &&
      (skipTotalCount || equals(cpuResults[name][3], gpuResults[name][3]))
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

function cpuAggregator(props, aggregationParms) {
  const layerData = pointToDensityGridDataCPU(props, aggregationParms);
  // const {getWeight} = opts.weights.weight1;
  const {aggregation} = aggregationParms;
  const getValue = getValueFunc(aggregation, x => x.weight1[0]);
  const {minValue, maxValue, totalCount} = new BinSorter(layerData.data, {getValue});
  const maxMinData = new Float32Array([maxValue, 0, 0, minValue]);
  const maxData = new Float32Array([maxValue, 0, 0, totalCount]);
  const minData = new Float32Array([minValue, 0, 0, totalCount]);
  return {minData, maxData, maxMinData};
}

function testAggregationOperations(opts) {
  const {t, op, aggregation, params, skipTotalCount = false} = opts;
  const oldEpsilon = config.EPSILON;
  if (op === AGGREGATION_OPERATION.MEAN) {
    // cpu: 4.692307472229004 VS gpu: 4.692307949066162
    // cpu: 4.21212100982666 VS gpu: 4.212121486663818
    config.EPSILON = 1e-6;
  }

  const gpuAggregator = new GPUGridAggregator(gl);

  const weight1 = Object.assign({}, params.weights.weight1, {operation: op});
  const maxMinweight = Object.assign({}, weight1, {combineMaxMin: true});
  const aggregationOpts = Object.assign({}, params, {weights: {weight1}});

  // const props = Object.assign({}, fixture, pointsData);
  const cpuResults = cpuAggregator(
    {
      data: params.data
    },
    {
      aggregation,
      viewport: fixture.moduleSettings.viewport,
      gridOffset: params.gridOffset || {xOffset: params.cellSize[0], yOffset: params.cellSize[1]},
      projectPoints: params.projectPoints,
      attributes: params.attributes,
      posOffset: params.posOffset,
      numInstances: params.vertexCount
    }
  );
  let results = gpuAggregator.run(aggregationOpts);

  const gpuResults = {
    minData: results.weight1.minBuffer.getData(),
    maxData: results.weight1.maxBuffer.getData()
  };
  results = gpuAggregator.run(Object.assign(aggregationOpts, {weights: {weight1: maxMinweight}}));
  gpuResults.maxMinData = results.weight1.maxMinBuffer.getData();

  // Compare aggregation details for each grid-cell, total count and max count.
  verifyResults({t, cpuResults, gpuResults, testName: aggregation, skipTotalCount});
  config.EPSILON = oldEpsilon;
}

test('Aggregation#ScreenSpace', t => {
  const data = generateRandomGridPoints(5000);
  const {weights} = fixture;
  const params = Object.assign({posOffset: [0, 0]}, fixture, buildAttributes({data, weights}), {
    data
  });

  for (const aggregation in AGGREGATION_OPERATION) {
    testAggregationOperations({t, aggregation, op: AGGREGATION_OPERATION[aggregation], params});
  }
  t.end();
});

test('Aggregation#WorldSpace', t => {
  const cellSize = 800; // meters
  const coordinateSystem = COORDINATE_SYSTEM.LNGLAT;
  const data = generateRandomGridPoints(5000);
  const {weights, moduleSettings} = fixture;
  const {viewport} = moduleSettings;
  const {attributes, vertexCount} = buildAttributes({data, weights});
  const boundingBox = getBoundingBox(attributes, vertexCount);
  const {gridOffset, translation, numCol, numRow} = getGridParams(
    boundingBox,
    cellSize,
    viewport,
    coordinateSystem
  );

  for (const aggregation in AGGREGATION_OPERATION) {
    testAggregationOperations({
      t,
      aggregation,
      op: AGGREGATION_OPERATION[aggregation],
      // TODO - This is failing in headless browser test. Might be related to
      // https://github.com/uber/deck.gl/issues/3156
      skipTotalCount: true,
      params: {
        data,
        cellSize: [gridOffset.xOffset, gridOffset.yOffset],
        weights,
        gridOffset,
        projectPoints: false,
        attributes,
        viewport,
        translation,
        posOffset: translation.slice(),
        numCol,
        numRow,
        scaling: [0, 0, 0],
        vertexCount,
        moduleSettings,
        boundingBox
      }
    });
  }
  t.end();
});
