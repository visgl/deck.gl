import test from 'tape-promise/tape';
import protobuf from 'protobufjs'; // Remove from final PR
import path from 'path';

import {
  binaryToSpatialjson,
  spatialjsonToBinary
} from '@deck.gl/carto/layers/schema/spatialjson-utils';

const TEST_CASES = [
  {
    name: 'H3 index only',
    spatial: [{id: '8411b01ffffffff', properties: {}}],
    expected: {
      scheme: 'h3',
      cells: {
        indices: {value: new BigUint64Array([594786321193500671n]), size: 1},
        numericProps: {},
        properties: [[]]
      }
    }
  },
  {
    name: 'Quadbin index only',
    spatial: [{id: '48e62966eaffffff', properties: {}}],
    expected: {
      scheme: 'quadbin',
      cells: {
        indices: {value: new BigUint64Array([5252931537380311039n]), size: 1},
        numericProps: {},
        properties: [[]]
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
        indices: {value: new BigUint64Array([5252931537380311039n]), size: 1},
        numericProps: {
          floatProp: {value: new Float64Array([123.45]), size: 1},
          intProp: {value: new Int32Array([12345]), size: 1}
        },
        properties: [[{key: 'stringProp', value: 'abc'}]]
      }
    }
  }
];

test.only('Spatialjson to binary', async t => {
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

// Requires "protobufjs": "^6.11.2" in devDependencies

test.only('Spatialjson to pbf', async t => {
  const root = await protobuf.load(
    path.join(__dirname, '../../../../modules/carto/src/layers/schema/carto-spatial-tile.proto')
  );
  t.ok(root);
  const Tile = root.lookupType('carto.Tile');
  t.ok(Tile);

  for (const {name, spatial} of TEST_CASES) {
    // To binary
    const converted = spatialjsonToBinary(spatial);

    const pbDoc = Tile.fromObject(converted);
    const output = Tile.encode(pbDoc).finish();
    t.ok(output, `Tile encoded: ${name}`);

    // ...and back
    const original = Tile.toObject(output);
    t.deepEqual(original, converted, `Tile decoded: ${name}`);
  }

  t.end();
});
