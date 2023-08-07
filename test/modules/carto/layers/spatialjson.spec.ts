import test from 'tape-promise/tape';

import {binaryToSpatialjson} from '@deck.gl/carto/layers/schema/spatialjson-utils';
import {spatialjsonToBinary} from './spatialjson-utils';
import CartoSpatialTileLoader from '@deck.gl/carto/layers/schema/carto-spatial-tile-loader';

// See test/modules/carto/responseToJson for details for creating test data
import binarySpatialTileData from '../data/binarySpatialTile.json';
const BINARY_SPATIAL_TILE = new Uint8Array(binarySpatialTileData).buffer;

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
    spatial: [{id: 5252931537380311039n, properties: {}}],
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
      {id: 5252931537380311039n, properties: {stringProp: 'abc', floatProp: 123.45, intProp: 12345}}
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

test('Parse Carto Spatial Tile', async t => {
  const expected = [
    {
      id: 613044272586817535n,
      properties: {value: 3.463996610619824, elevation: 0.3463996610619824, str: 'test'}
    },
    {
      id: 613044272593108991n,
      properties: {value: 3.1231066988791127, elevation: 0.3123106698879113, str: 'test'}
    },
    {
      id: 613044272591011839n,
      properties: {value: 3.860728273341417, elevation: 0.3860728273341417, str: 'test'}
    }
  ];

  const converted = CartoSpatialTileLoader.parseSync(BINARY_SPATIAL_TILE);
  t.deepEqual(converted, expected, 'Test data correctly decoded');
  t.end();
});
