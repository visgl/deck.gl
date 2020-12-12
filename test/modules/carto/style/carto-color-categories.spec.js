import test from 'tape-catch';
import {colorCategories} from '@deck.gl/carto';

const CATEGORIES_TEST_CASES = [
  {
    title: 'Feature 1',
    argument: {
      properties: {
        target: 'Category 1'
      }
    },
    result: [255, 0, 0]
  },
  {
    title: 'Feature 2',
    argument: {
      properties: {
        target: 'Category 2'
      }
    },
    result: [0, 255, 0]
  },
  {
    title: 'Feature 3',
    argument: {
      properties: {
        target: 'Category 3'
      }
    },
    result: [0, 0, 255]
  }
];

test('colorCategories#tests', t => {
  const colorCategoriesManual = colorCategories({
    attr: 'target',
    categories: ['Category 1', 'Category 2', 'Category 3'],
    colors: [[255, 0, 0], [0, 255, 0], [0, 0, 255]]
  });

  for (const tc of CATEGORIES_TEST_CASES) {
    const func = colorCategoriesManual(tc.argument);
    t.deepEqual(func, tc.result, `colorCategories ${tc.title} returned expected result`);
  }

  t.end();
});
