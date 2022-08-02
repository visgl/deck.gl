import test from 'tape-promise/tape';

import {binaryToSpatialjson} from '@deck.gl/carto/layers/schema/spatialjson-utils';
import {spatialjsonToBinary} from './spatialjson-utils';

const TEST_CASES = [
  {
    name: 'H3 index only',
    spatial: [{id: '8411b01ffffffff', properties: {}}],
    expected: {
      scheme: 'h3',
      cells: {
        indices: {value: new BigUint64Array([594786321193500671n])},
        numericProps: {},
        properties: [{}]
      }
    }
  },
  {
    name: 'Quadbin index only',
    spatial: [{id: '48e62966eaffffff', properties: {}}],
    expected: {
      scheme: 'quadbin',
      cells: {
        indices: {value: new BigUint64Array([5252931537380311039n])},
        numericProps: {},
        properties: [{}]
      }
    }
  },
  {
    name: 'Mixed props',
    spatial: [
      {id: '48e62966eaffffff', properties: {stringProp: 'abc', floatProp: 123.45, intProp: 12345}}
    ],
    expected: {
      scheme: 'quadbin',
      cells: {
        indices: {value: new BigUint64Array([5252931537380311039n])},
        numericProps: {
          floatProp: {value: new Float64Array([123.45])},
          intProp: {value: new Int32Array([12345])}
        },
        properties: [{stringProp: 'abc'}]
      }
    }
  }
];

test('Spatialjson to binary', async t => {
  for (const {name, spatial, expected} of TEST_CASES) {
    const converted = spatialjsonToBinary(spatial);
    t.deepEqual(converted, expected, `Spatialjson is converted to binary: ${name}`);
    t.deepEqual(
      binaryToSpatialjson(converted),
      spatial,
      `Spatialjson is converted from binary: ${name}`
    );
  }
  t.end();
});
