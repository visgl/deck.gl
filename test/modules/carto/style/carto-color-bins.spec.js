import test from 'tape-catch';
import {colorBins} from '@deck.gl/carto';

const BINS_TEST_CASES = [
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
    result: [0, 0, 255]
  },
  {
    title: 'Feature 3',
    argument: {
      properties: {
        target: 100
      }
    },
    result: [0, 0, 255]
  }
];

test('colorBins#tests', t => {
  const colorBinsManual = colorBins({
    attr: 'target',
    domain: [1, 50, 100],
    colors: [[255, 0, 0], [0, 255, 0], [0, 0, 255]]
  });

  for (const tc of BINS_TEST_CASES) {
    const func = colorBinsManual(tc.argument);
    t.deepEqual(func, tc.result, `colorBins ${tc.title} returned expected result`);
  }

  t.end();
});
