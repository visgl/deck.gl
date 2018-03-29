import test from 'tape-catch';
import GPUGridAggregator from '../../../src/experimental-layers/src/utils/gpu-grid-aggregator';
import {gl} from 'deck.gl-test-utils';
import {GridAggregationData} from 'deck.gl/test/data';

const {fixture, generateRandomGridPoints} = GridAggregationData;

test('GPUGridAggregator#GPU', t => {
  const sa = new GPUGridAggregator(gl);

  const result = sa.run(Object.assign({}, fixture, {useGPU: true}));
  const maxCountBufferData = result.maxCountBuffer.getData();
  t.equal(maxCountBufferData[3], 2, 'maxCount should match');
  t.equal(maxCountBufferData[0], 3, 'totalCount should match');
  t.end();
});

test('GPUGridAggregator#CPU', t => {
  const sa = new GPUGridAggregator(gl);

  const result = sa.run(Object.assign({}, fixture, {useGPU: false}));

  const maxCountBufferData = result.maxCountBuffer.getData();
  t.equal(maxCountBufferData[3], 2, 'maxCount should match');
  t.equal(maxCountBufferData[0], 3, 'totalCount should match');
  // t.equal(result.maxCount, 2, 'maxCount should match');
  // t.equal(result.totalCount, 3, 'totalCount should match');
  t.end();
});

test('GPUGridAggregator#CompareCPUandGPU', t => {
  const sa = new GPUGridAggregator(gl);
  const positions = generateRandomGridPoints(5000);
  let result = sa.run(Object.assign({}, fixture, {useGPU: false, positions}));
  const cpuResults = {
    counts: result.countsBuffer.getData(),
    maxCount: result.maxCountBuffer.getData()
  };
  result = sa.run(Object.assign({}, fixture, {useGPU: true, positions}));
  const gpuResults = {
    counts: result.countsBuffer.getData(),
    maxCount: result.maxCountBuffer.getData()
  };

  // Compare aggregation details for each grid-cell, total count and max count.
  t.deepEqual(cpuResults, gpuResults, 'cpu and gpu results should match');
  t.end();
});
