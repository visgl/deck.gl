import test from 'tape-catch';
import ScreenGridAggregator from 'deck.gl/core/experimental/utils/screen-grid-aggregator';
import {isWebGL2} from 'luma.gl';
import {gl} from 'deck.gl-test-utils';
import {ScreenGridAggregatorData} from 'deck.gl/test/data';

const {fixture, fixture2} = ScreenGridAggregatorData;

test('ScreenGridAggregator#GPU', t => {
  const sa = new ScreenGridAggregator(gl);

  const result = sa.run(Object.assign({}, fixture, {useGPU: true, readData: true}));

  t.equal(result.maxCount, 2, 'maxCount should match');
  t.equal(result.totalCount, 3, 'totalCount should match');
  t.end();
});

test('ScreenGridAggregator#CPU', t => {
  const sa = new ScreenGridAggregator(gl);

  const result = sa.run(Object.assign({}, fixture, {useGPU: false}));

  t.equal(result.maxCount, 2, 'maxCount should match');
  t.equal(result.totalCount, 3, 'totalCount should match');
  t.end();
});

test('ScreenGridAggregator#CompareCPUandGPU', t => {
  const sa = new ScreenGridAggregator(gl);
  const cpuResults = sa.run(Object.assign({}, fixture2, {useGPU: false}));
  const gpuResults = sa.run(Object.assign({}, fixture2, {useGPU: true, readData: true}));

  t.deepEqual(cpuResults, gpuResults, 'cpu and gpu results should match');
  t.end();
});
