import test from 'tape-catch';
import {colorContinuous} from '@deck.gl/carto';

const CATEGORIES_TEST_CASES = [
  {
    title: 'Feature 1',
    argument: {
      properties: {
        target: 0
      }
    },
    result: [255, 0, 0]
  },
  {
    title: 'Feature 2',
    argument: {
      properties: {
        target: 50
      }
    },
    result: [255, 127.5, 0]
  },
  {
    title: 'Feature 3',
    argument: {
      properties: {
        target: 100
      }
    },
    result: [255, 255, 0]
  }
];

test('colorContinuous#tests', t => {
  const colorContinuousManual = colorContinuous({
    attr: 'target',
    range: [0, 100],
    colors: [[255, 0, 0], [255, 255, 0]]
  });

  for (const tc of CATEGORIES_TEST_CASES) {
    const func = colorContinuousManual(tc.argument);
    t.deepEqual(func, tc.result, `colorContinuous ${tc.title} returned expected result`);
  }

  t.end();
});
