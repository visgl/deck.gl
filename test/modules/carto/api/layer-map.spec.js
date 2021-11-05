import test from 'tape-catch';
import {getColorAccessor, getTextAccessor} from '@deck.gl/carto/api/layer-map';

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
    expected: [144, 12, 63, 186]
  }
];

for (const {colorField, colorScale, colorRange, opacity, data, d, expected} of COLOR_TESTS) {
  test(`getColorAccessor#${colorScale}`, t => {
    const accessor = getColorAccessor(colorField, colorScale, colorRange, opacity, data);
    t.deepEquals(accessor(d), expected, `getColorAccessor correctly returns ${expected}`);
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
