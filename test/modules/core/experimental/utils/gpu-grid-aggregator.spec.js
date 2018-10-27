import test from 'tape-catch';
import {_GPUGridAggregator as GPUGridAggregator} from '@deck.gl/core';
import {gl} from '@deck.gl/test-utils';
import {GridAggregationData} from 'deck.gl/test/data';

const {fixture, fixtureUpdated, fixtureWorldSpace} = GridAggregationData;

function getCPUResults({aggregationData, minData, maxData}) {
  return {aggregationData, minData, maxData};
}

function getGPUResults({aggregationBuffer, minBuffer, maxBuffer}) {
  return {
    aggregationData: aggregationBuffer.getData(),
    minData: minBuffer.getData(),
    maxData: maxBuffer.getData()
  };
}

/* eslint-disable max-statements */
function testCounterMinMax(aggregator, t, opts) {
  const {useGPU, size = 1} = opts;
  const testName = `${useGPU ? 'GPU' : 'CPU'} size: ${size}:`;

  let weight1 = Object.assign({}, fixture.weights.weight1, {size});
  let results = aggregator.run(Object.assign({}, fixture, {weights: {weight1}, useGPU}));
  // GPUGridAggregator.logData(results.weight1);

  const minData = results.weight1.minBuffer.getData();
  const maxData = results.weight1.maxBuffer.getData();
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
test('GPUGridAggregator#CPU', t => {
  const sa = new GPUGridAggregator(gl);
  testCounterMinMax(sa, t, {useGPU: false});
  testCounterMinMax(sa, t, {useGPU: false, size: 2});
  testCounterMinMax(sa, t, {useGPU: false, size: 3});
  t.end();
});

test('GPUGridAggregator#CompareCPUandGPU', t => {
  const aggregator = new GPUGridAggregator(gl);

  const pointsData = generateRandomGridPoints(5000);
  const maxMinweight = Object.assign({}, pointsData.weights.weight1, {combineMaxMin: true});
  let results = aggregator.run(Object.assign({}, fixture, {useGPU: false}, pointsData));
  // console.log('CPU:');
  // GPUGridAggregator.logData(results.weight1);
  const cpuResults = {
    aggregationData: results.weight1.aggregationBuffer.getData(),
    minData: results.weight1.minBuffer.getData(),
    maxData: results.weight1.maxBuffer.getData()
  };
  results = aggregator.run(
    Object.assign({}, fixture, {useGPU: false}, pointsData, {weights: {weight1: maxMinweight}})
  );
  cpuResults.maxMinData = results.weight1.maxMinBuffer.getData();

  results = aggregator.run(Object.assign({}, fixture, {useGPU: true}, pointsData));
  // console.log('GPU:');
  // GPUGridAggregator.logData(results.weight1);
  const gpuResults = {
    aggregationData: results.weight1.aggregationBuffer.getData(),
    minData: results.weight1.minBuffer.getData(),
    maxData: results.weight1.maxBuffer.getData()
  };
  results = aggregator.run(
    Object.assign({}, fixture, {useGPU: true}, pointsData, {weights: {weight1: maxMinweight}})
  );
  gpuResults.maxMinData = results.weight1.maxMinBuffer.getData();

  // Compare aggregation details for each grid-cell, total count and max count.
  t.deepEqual(gpuResults, cpuResults, 'cpu and gpu results should match');
  t.end();
});

test('GPUGridAggregator worldspace aggregation #CompareCPUandGPU', t => {
  const sa = new GPUGridAggregator(gl);
  let results = sa.run(Object.assign({}, fixtureWorldSpace, {useGPU: false}));
  const cpuResults = {
    aggregationData: results.weight1.aggregationBuffer.getData(),
    minData: results.weight1.minBuffer.getData(),
    maxData: results.weight1.maxBuffer.getData()
  };

  // 32-bit aggregation
  results = sa.run(Object.assign({}, fixtureWorldSpace, {useGPU: true}));
  let gpuResults = {
    aggregationData: results.weight1.aggregationBuffer.getData(),
    minData: results.weight1.minBuffer.getData(),
    maxData: results.weight1.maxBuffer.getData()
  };
  t.deepEqual(gpuResults, cpuResults, '32bit aggregation: cpu and gpu results should match');

  // 64-bit aggregation
  results = sa.run(Object.assign({}, fixtureWorldSpace, {useGPU: true, fp64: true}));
  gpuResults = {
    aggregationData: results.weight1.aggregationBuffer.getData(),
    minData: results.weight1.minBuffer.getData(),
    maxData: results.weight1.maxBuffer.getData()
  };
  t.deepEqual(gpuResults, cpuResults, '64bit aggregation: cpu and gpu results should match');

  t.end();
});

test('GPUGridAggregator#ChangeFlags#dataChanged', t => {
  const aggregator = new GPUGridAggregator(gl);

  let useGPU = false;
  let results = aggregator.run(Object.assign({}, fixture, {useGPU}));
  const cpuResults = getCPUResults(results.weight1);

  // Change only data (positions and weights)
  results = aggregator.run(
    Object.assign({}, fixture, {
      useGPU,
      positions: fixtureUpdated.positions,
      weights: fixtureUpdated.weights,
      changeFlags: {dataChanged: true}
    })
  );

  const cpuResultsUpdated = getCPUResults(results.weight1);

  useGPU = true;
  results = aggregator.run(
    Object.assign({}, fixture, {
      useGPU,
      changeFlags: {} // switch from cpu to gpu should internally should treat as dataChanged=true
    })
  );
  const gpuResults = getGPUResults(results.weight1);

  // Change only data (positions and weights)
  results = aggregator.run(
    Object.assign({}, fixture, {
      useGPU,
      positions: fixtureUpdated.positions,
      weights: fixtureUpdated.weights,
      changeFlags: {dataChanged: true}
    })
  );

  const gpuResultsUpdated = getGPUResults(results.weight1);

  t.deepEqual(gpuResults, cpuResults, 'cpu and gpu results should match');
  t.deepEqual(gpuResultsUpdated, cpuResultsUpdated, 'cpu and gpu results should match');
  t.end();
});

test('GPUGridAggregator#ChangeFlags#cellSizeChanged', t => {
  const aggregator = new GPUGridAggregator(gl);

  let useGPU = false;
  let results = aggregator.run(Object.assign({}, fixture, {useGPU}));
  const cpuResults = getCPUResults(results.weight1);

  // Change only cellSize
  const biggerCellSize = fixture.cellSize.map(x => x * 15);
  results = aggregator.run(
    Object.assign({}, fixture, {
      useGPU,
      positions: null,
      weights: null,
      cellSize: biggerCellSize,
      changeFlags: {cellSizeChanged: true}
    })
  );

  const cpuResultsUpdated = getCPUResults(results.weight1);

  useGPU = true;
  results = aggregator.run(
    Object.assign({}, fixture, {
      useGPU,
      changeFlags: {} // switch from cpu to gpu should internally treated as dataChanged=true
    })
  );
  const gpuResults = getGPUResults(results.weight1);

  // Change only data (positions and weights)
  results = aggregator.run(
    Object.assign({}, fixture, {
      useGPU,
      positions: null,
      weights: null,
      cellSize: biggerCellSize,
      changeFlags: {cellSizeChanged: true}
    })
  );

  const gpuResultsUpdated = getGPUResults(results.weight1);

  t.deepEqual(gpuResults, cpuResults, 'cpu and gpu results should match');
  t.deepEqual(gpuResultsUpdated, cpuResultsUpdated, 'cpu and gpu results should match');
  t.end();
});

test('GPUGridAggregator#ChangeFlags#viewportChanged', t => {
  const aggregator = new GPUGridAggregator(gl);

  let useGPU = false;
  let results = aggregator.run(Object.assign({}, fixture, {useGPU}));
  const cpuResults = getCPUResults(results.weight1);

  // Change only viewport
  results = aggregator.run(
    Object.assign({}, fixture, {
      useGPU,
      viewport: fixtureUpdated.viewport,
      changeFlags: {viewportChanged: true}
    })
  );

  const cpuResultsUpdated = getCPUResults(results.weight1);

  useGPU = true;
  results = aggregator.run(
    Object.assign({}, fixture, {
      useGPU,
      changeFlags: {} // switch from cpu to gpu should internally treated as dataChanged=true
    })
  );
  const gpuResults = getGPUResults(results.weight1);

  // Change only data (positions and weights)
  results = aggregator.run(
    Object.assign({}, fixture, {
      useGPU,
      viewport: fixtureUpdated.viewport,
      changeFlags: {viewportChanged: true}
    })
  );

  const gpuResultsUpdated = getGPUResults(results.weight1);

  t.deepEqual(gpuResults, cpuResults, 'cpu and gpu results should match');
  t.deepEqual(gpuResultsUpdated, cpuResultsUpdated, 'cpu and gpu results should match');
  t.end();
});
