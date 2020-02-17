import test from 'tape-catch';
import GPUGridAggregator from '@deck.gl/aggregation-layers/utils/gpu-grid-aggregation/gpu-grid-aggregator';

import {gl} from '@deck.gl/test-utils';
import {GridAggregationData} from 'deck.gl-test/data';

const {fixture, buildAttributes} = GridAggregationData;

/* eslint-disable max-statements */
function testCounterMinMax(aggregator, t, opts) {
  const {params, size = 1} = opts;
  const testName = `GPU : size: ${size}:`;

  let weight1 = Object.assign({}, params.weights.weight1, {size});
  let results = aggregator.run(Object.assign({}, params, {weights: {weight1}}));

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
  results = aggregator.run(Object.assign({}, params, {weights: {weight1}}));

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
  const {data, weights} = fixture;
  const params = Object.assign({}, fixture, buildAttributes({data, weights}));
  testCounterMinMax(sa, t, {params, size: 1});
  testCounterMinMax(sa, t, {params, size: 2});
  testCounterMinMax(sa, t, {params, size: 3});
  t.end();
});
