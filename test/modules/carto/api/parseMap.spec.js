import test from 'tape-catch';
import VISSTATE_DATA from '../data/visState.json';
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

test('parseMap#invalid version', t => {
  const json = {
    ...METADATA,
    keplerMapConfig: {...EMPTY_KEPLER_MAP_CONFIG, version: 'invalid'}
  };
  t.throws(
    () => parseMap(json),
    /Only support Kepler v1/,
    'Throws on invalid Kepler schema version'
  );
  t.end();
});

test('parseMap#metadata', t => {
  const json = {
    ...METADATA,
    keplerMapConfig: EMPTY_KEPLER_MAP_CONFIG
  };
  /* eslint-disable no-unused-vars */
  const {layers, mapState, mapStyle, ...metadata} = parseMap(json);
  t.deepEquals(metadata, METADATA, 'Metadata is passed through');
  t.deepEquals(mapState, 'MAP_STATE', 'Map state is passed through');
  t.deepEquals(mapStyle, 'MAP_STYLE', 'Map style is passed through');
  t.end();
});

for (const {title, visState, layers} of VISSTATE_DATA) {
  test(`parseMap#visState ${title}`, t => {
    const json = {
      ...METADATA,
      keplerMapConfig: {
        ...EMPTY_KEPLER_MAP_CONFIG,
        visState
      }
    };
    const map = parseMap(json);
    t.deepEquals(map.layers, layers, 'Layers are correctly instantiated');
    t.end();
  });
}
