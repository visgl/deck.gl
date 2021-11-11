import test from 'tape-catch';
import VISCONFIG_DATA from '../data/visConfig.json';
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

for (const {title, visConfig, layers} of VISCONFIG_DATA) {
  test(`parseMap#visConfig ${title}`, t => {
    const json = {
      ...METADATA,
      keplerMapConfig: {
        ...EMPTY_KEPLER_MAP_CONFIG,
        visConfig
      }
    };
    const map = parseMap(json);
    t.deepEquals(map.layers, layers, 'Layers are correctly instantiated');
    t.end();
  });
}
