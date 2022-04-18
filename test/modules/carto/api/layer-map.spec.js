import test from 'tape-catch';
import {
  getColorAccessor,
  getSizeAccessor,
  getTextAccessor,
  getTextPixelOffsetAccessor,
  getLayer,
  _domainFromValues
} from '@deck.gl/carto/api/layer-map';

const colors = ['#5A1846', '#900C3F', '#C70039', '#E3611C', '#F1920E', '#FFC300'];
const COLOR_TESTS = [
  {
    colorField: {name: 'v'},
    colorScale: 'linear',
    colorRange: {colors},
    opacity: 1,
    data: [{v: 0}, {v: 1}, {v: 5}],
    d: {v: 0},
    expected: [90, 24, 70, 255]
  },
  {
    colorField: {name: 'v'},
    colorScale: 'linear',
    colorRange: {colors},
    opacity: 0.5,
    data: [{v: 0}, {v: 1}, {v: 5}],
    d: {v: 1},
    expected: [101, 22, 69, 186]
  },
  {
    colorField: {name: 'v'},
    colorScale: 'linear',
    colorRange: {colors},
    opacity: 0.5,
    data: {
      type: 'FeatureCollection',
      features: [{properties: {v: 0}}, {properties: {v: 1}}, {properties: {v: 5}}]
    },
    d: {properties: {v: 1}},
    expected: [101, 22, 69, 186]
  },
  {
    colorField: {name: 'v'},
    colorScale: 'linear',
    colorRange: {colors},
    opacity: 0.5,
    data: [{}], // Default range will be [0, 1]
    d: {v: 0.5},
    expected: [117, 18, 67, 186]
  },
  {
    colorField: {name: 'v'},
    colorScale: 'custom',
    colorRange: {
      colors,
      colorMap: [
        [0, '#E3611C'],
        [1, '#F1920E'],
        [5, '#FFC300']
      ]
    },
    opacity: 1,
    data: [{v: 0}, {v: 1}, {v: 5}],
    d: {v: 0},
    expected: [241, 146, 14, 255]
  },
  {
    colorField: {name: 'v'},
    colorScale: 'ordinal',
    colorRange: {
      colors,
      colorMap: [
        [0, '#E3611C'],
        [1, '#F1920E'],
        [5, '#FFC300']
      ]
    },
    opacity: 1,
    data: [{v: 0}, {v: 1}, {v: 5}],
    d: {v: 0},
    expected: [227, 97, 28, 255]
  },
  {
    colorField: {name: 'v'},
    colorScale: 'ordinal',
    colorRange: {
      colors,
      colorMap: [[99, '#E3611C']]
    },
    opacity: 1,
    data: [{v: 0}, {v: 1}, {v: 5}],
    d: {v: 0},
    expected: [134, 141, 145, 255]
  }
];

for (const {colorField, colorScale, colorRange, opacity, data, d, expected} of COLOR_TESTS) {
  test(`getColorAccessor#${colorScale}`, t => {
    const accessor = getColorAccessor(colorField, colorScale, colorRange, opacity, data);
    t.deepEquals(accessor(d), expected, `getColorAccessor correctly returns ${expected}`);
    t.end();
  });
}

const SIZE_TESTS = [
  {
    sizeField: {name: 'v'},
    sizeScale: 'linear',
    sizeRange: [0, 1000],
    data: [{v: 1}, {v: 5}, {v: 10}],
    d: {v: 1},
    expected: 0
  },
  {
    sizeField: {name: 'v'},
    sizeScale: 'sqrt',
    sizeRange: [100, 1000],
    data: [{v: 1}, {v: 5}, {v: 10}],
    d: {v: 1},
    expected: 100
  },
  {
    sizeField: {name: 'v'},
    sizeScale: 'log',
    sizeRange: [0, 1000],
    data: [{v: 1}, {v: 10}],
    d: {v: 5},
    expected: 698.9700043360187
  }
];

for (const {sizeField, sizeScale, sizeRange, data, d, expected} of SIZE_TESTS) {
  test(`getSizeAccessor#${sizeScale}`, t => {
    const accessor = getSizeAccessor(sizeField, sizeScale, sizeRange, data);
    t.deepEquals(accessor(d), expected, `getSizeAccessor correctly returns ${expected}`);
    t.end();
  });
}

const TEXT_TESTS = [
  {
    textLabelField: {name: 'date', type: 'date'},
    data: {date: '2021-10-29T13:25:01.067Z'},
    expected: '10/29/21 13:25:01pm'
  },
  {
    textLabelField: {name: 'field', type: 'integer'},
    data: {field: 1234},
    expected: '1234'
  },
  {
    textLabelField: {name: 'field', type: 'float'},
    data: {field: 5.18},
    expected: '5.18000'
  },
  {
    textLabelField: {name: 'ts', type: 'timestamp'},
    data: {ts: '2021-10-29T13:25:01.067Z'},
    expected: '1635513901'
  }
];

for (const {textLabelField, data, expected} of TEXT_TESTS) {
  test(`getTextAccessor#${textLabelField.type}`, t => {
    const accessor = getTextAccessor(textLabelField, [data]);
    t.deepEquals(accessor(data), expected, `getTextAccessor correctly returns ${expected}`);
    t.end();
  });
}

const TEXT_PIXEL_OFFSET_TESTS = [
  {
    anchor: 'middle',
    alignment: 'center',
    radius: 20,
    size: 10,
    expected: [0, 0]
  },
  {
    anchor: 'start',
    alignment: 'bottom',
    radius: 20,
    size: 10,
    expected: [40, 50]
  },
  {
    anchor: 'end',
    alignment: 'top',
    radius: r => 2 * r,
    data: 10,
    size: 10,
    expected: [-40, -50]
  }
];

for (const {anchor, alignment, radius, size, data, expected} of TEXT_PIXEL_OFFSET_TESTS) {
  test(`getTextPixelOffsetAccessor#${anchor} ${alignment}`, t => {
    const accessor = getTextPixelOffsetAccessor({alignment, anchor, size}, radius);
    t.deepEquals(
      typeof radius === 'function' ? accessor(data) : accessor,
      expected,
      `getTextPixelOffsetAccessor correctly returns ${expected}`
    );
    t.end();
  });
}

test('getHexagon', t => {
  const accessor = getLayer('hexagonId', {columns: {hex_id: 'h3'}}).defaultProps.getHexagon;
  const data = {h3: 1234};
  t.deepEquals(accessor(data), 1234, 'getHexagon correctly returns 1234');
  t.end();
});

test('domainFromValues', t => {
  t.deepEquals(_domainFromValues(['a', 'a', 'b', 'c', 'b'], 'ordinal'), ['a', 'b', 'c']);
  t.deepEquals(_domainFromValues([1, 4, 2, 3, 1], 'quantile'), [1, 1, 2, 3, 4]);
  t.deepEquals(_domainFromValues([1, 0, -3], 'log'), [-3, 1]);
  t.deepEquals(_domainFromValues([1, 0, 3], 'log'), [0.00001, 3]);
  t.end();
});
