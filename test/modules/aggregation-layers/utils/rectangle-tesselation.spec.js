import test from 'tape-catch';

import {generateCoords, tesselateRectangle} from '@deck.gl/aggregation-layers/utils/rectangle-tesselation';

test('GridAggregationUtils#generateCoords', t => {
  const TEST_CASES = [
    {
      min: 0,
      max: 1,
      length: 0.5,
      expected: [0, 0.5, 1]
    }, {
      msg: 'should clamp to max value',
      min: 0,
      max: 10,
      length: 3,
      expected: [0, 3, 6, 9, 10]
    }, {
      min: 1,
      max: 7,
      length: 6,
      expected: [1, 7]
    }, {
      min: -10,
      max: -2,
      length: 2,
      expected: [-10, -8, -6, -4, -2]
    }
  ];
  const MESSAGE = 'should return correct array';
  TEST_CASES.forEach(tc => {
    t.deepEqual(tc.expected, generateCoords(tc.min, tc.max, tc.length), tc.msg || MESSAGE);
  });

  t.end();
});

test.only('GridAggregationUtils#tesselateRectangle', t => {
  const TEST_CASES = [
    {
      rect: {xMin: 0, xMax: 2, yMin: 0, yMax: 4},
      opts: {xLength: 1, yLength: 2},
      expected: [0, 0, 1, 0, 1, 2, 0, 0, 1, 2, 0, 2, 1, 0, 2, 0, 2, 2, 1, 0, 2, 2, 1, 2, 0, 2, 1, 2, 1, 4, 0, 2, 1, 4, 0, 4, 1, 2, 2, 2, 2, 4, 1, 2, 2, 4, 1, 4]
    }
  ];
  const MESSAGE = 'should return correct array';
  TEST_CASES.forEach(tc => {
    t.deepEqual(tc.expected, tesselateRectangle(tc.rect, tc.opts), tc.msg || MESSAGE);
  });

  t.end();
});
