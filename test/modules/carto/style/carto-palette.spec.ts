import test from 'tape-catch';
import getPalette from '@deck.gl/carto/style/palette';

const OK_TEST_CASES = [
  {
    title: 'CARTOColors - SunsetDark',
    colorSchema: 'SunsetDark',
    categories: 7,
    result: [
      [252, 222, 156, 255],
      [250, 164, 118, 255],
      [240, 116, 110, 255],
      [227, 79, 111, 255],
      [220, 57, 119, 255],
      [185, 37, 122, 255],
      [124, 29, 111, 255]
    ]
  },
  {
    title: 'CARTOColors - Burg',
    colorSchema: 'Burg',
    categories: 7,
    result: [
      [255, 198, 196, 255],
      [244, 163, 168, 255],
      [227, 129, 145, 255],
      [204, 96, 125, 255],
      [173, 70, 108, 255],
      [139, 48, 88, 255],
      [103, 32, 68, 255]
    ]
  },
  {
    title: 'CARTOColors - Mint',
    colorSchema: 'Mint',
    categories: 7,
    result: [
      [228, 241, 225, 255],
      [180, 217, 204, 255],
      [137, 192, 182, 255],
      [99, 166, 160, 255],
      [68, 140, 138, 255],
      [40, 114, 116, 255],
      [13, 88, 95, 255]
    ]
  }
];

const ERROR_TEST_CASES_NO_CATEGORIES = [
  {
    title: 'CARTOColors - Mint',
    colorSchema: 'Mint',
    categories: -1
  },
  {
    title: 'CARTOColors - Mint',
    colorSchema: 'Mint',
    categories: null
  },
  {
    title: 'CARTOColors - Mint',
    colorSchema: 'Mint',
    categories: undefined
  },
  {
    title: 'CARTOColors - Mint',
    colorSchema: 'Mint',
    categories: ''
  }
];

const ERROR_TEST_CASES_INVALID_SCHEMA = [
  {
    title: 'InvalidColorSchema',
    colorSchema: 'InvalidColorSchema',
    categories: 7
  },
  {
    title: 'InvalidColorSchema',
    colorSchema: 'Mintt',
    categories: 7
  }
];

test('palette', t => {
  for (const tc of OK_TEST_CASES) {
    const func = getPalette(tc.colorSchema, tc.categories);
    t.deepEqual(func, tc.result, `${tc.title} color scheme returned expected result`);
  }

  t.end();
});

test('palette#invalidCategories', t => {
  for (const tc of ERROR_TEST_CASES_NO_CATEGORIES) {
    if (!Number.isInteger(tc.categories)) {
      t.notOk(tc.categories, 'categories should be a number');
    }
  }

  t.end();
});

test('palette#invalidColorSchema', t => {
  for (const tc of ERROR_TEST_CASES_INVALID_SCHEMA) {
    t.throws(
      () => getPalette(tc.colorSchema, tc.categories),
      `throws on ${tc.colorSchema} invalid color schema`
    );
  }

  t.end();
});
