import test from 'tape-catch';
import {getTextAccessor} from '@deck.gl/carto/api/layer-map';

const TEXT_TESTS = [
  {
    colorField: {name: 'color'},
    colorScale: 'linear'
    data: {properties: {color: '2021-10-29T13:25:01.067Z'}},
    expected: '10/29/21 13:25:01pm'
  },
];
const TEXT_TESTS = [
  {
    textLabelField: {name: 'date', type: 'date'},
    data: {properties: {date: '2021-10-29T13:25:01.067Z'}},
    expected: '10/29/21 13:25:01pm'
  },
  {
    textLabelField: {name: 'field', type: 'integer'},
    data: {properties: {field: 1234}},
    expected: '1234'
  },
  {
    textLabelField: {name: 'field', type: 'float'},
    data: {properties: {field: 5.18}},
    expected: '5.18000'
  },
  {
    textLabelField: {name: 'ts', type: 'timestamp'},
    data: {properties: {ts: '2021-10-29T13:25:01.067Z'}},
    expected: '1635513901'
  }
];

for (const {textLabelField, data, expected} of TEXT_TESTS) {
  test(`getTextAccessor#${textLabelField.type}`, t => {
    const accessor = getTextAccessor(textLabelField);
    t.deepEquals(accessor(data), expected, `getTextAccessor correctly returns ${expected}`);
    t.end();
  });
}
