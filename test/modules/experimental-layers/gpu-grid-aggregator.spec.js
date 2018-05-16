import test from 'tape-catch';
import GPUGridAggregator from '@deck.gl/experimental-layers/utils/gpu-grid-aggregator';
import {gl} from '@deck.gl/test-utils';
import {GridAggregationData} from 'deck.gl/test/data';

const {fixture, generateRandomGridPoints} = GridAggregationData;

test('GPUGridAggregator#GPU', t => {
  const sa = new GPUGridAggregator(gl);

  const result = sa.run(Object.assign({}, fixture, {useGPU: true}));
  const maxCountBufferData = result.maxCountBuffer.getData();
  t.equal(maxCountBufferData[0], 3, 'total count should match');
  t.equal(maxCountBufferData[1], 5, 'total weight should match');
  t.equal(maxCountBufferData[3], 4, 'max weight should match');
  t.end();
});

test('GPUGridAggregator#CPU', t => {
  const sa = new GPUGridAggregator(gl);

  const result = sa.run(Object.assign({}, fixture, {useGPU: false}));

  const maxCountBufferData = result.maxCountBuffer.getData();
  t.equal(maxCountBufferData[0], 3, 'total count should match');
  t.equal(maxCountBufferData[1], 5, 'total weight should match');
  t.equal(maxCountBufferData[3], 4, 'max weight should match');
  t.end();
});

test('GPUGridAggregator#CompareCPUandGPU', t => {
  const sa = new GPUGridAggregator(gl);
  const pointsData = generateRandomGridPoints(5000);
  let result = sa.run(Object.assign({}, fixture, {useGPU: false}, pointsData));
  const cpuResults = {
    counts: result.countsBuffer.getData(),
    maxCount: result.maxCountBuffer.getData()
  };
  result = sa.run(Object.assign({}, fixture, {useGPU: true}, pointsData));
  const gpuResults = {
    counts: result.countsBuffer.getData(),
    maxCount: result.maxCountBuffer.getData()
  };

  // Compare aggregation details for each grid-cell, total count and max count.
  t.deepEqual(cpuResults, gpuResults, 'cpu and gpu results should match');
  t.end();
});
