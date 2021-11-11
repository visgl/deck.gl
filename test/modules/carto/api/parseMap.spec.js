import test from 'tape-catch';
import {parseMap} from '@deck.gl/carto/api/parseMap';

const METADATA = {
  id: 1234,
  title: 'Title',
  description: 'Description',
  createdAt: 'createdAt timestamp',
  updatedAt: 'updatedAt timestamp'
};

const EMPTY_KEPLER_MAP_CONFIG = {
  version: 'v1',
  config: {
    mapState: 'MAP_STATE',
    mapStyle: 'MAP_STYLE',
    visState: {
      layers: []
    }
  }
};

// const TESTS = [
//   {
//     title: 'point',
//     json: {},
//     layers: []
//     ]
//   }
// ];
//
// for (const {title, json, layers} of TESTS) {
// }

test('parseMap#invalid version', t => {
  t.end();
});

test('parseMap#metadata', t => {
  const json = {
    ...METADATA,
    keplerMapConfig: EMPTY_KEPLER_MAP_CONFIG
  };
  const {layers, mapState, mapStyle, ...metadata} = parseMap(json);
  t.deepEquals(metadata, METADATA, 'Metadata is passed through');
  t.end();
});
