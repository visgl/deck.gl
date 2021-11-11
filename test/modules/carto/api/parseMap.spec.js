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

const DATASET = {
  id: 'DATA_ID',
  data: {type: 'FeatureCollection', features: []}
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
      datasets: [DATASET],
      keplerMapConfig: {version: 'v1', config: {visState}}
    };
    const map = parseMap(json);

    const names = map.layers.map(layer => layer.toString());
    t.deepEquals(names, layers.map(l => l.name), 'Layers have correct types');

    // Get all non-dynamic props to compare
    const props = map.layers.map(layer => {
      const layerProps = {...layer.props};
      for (const [key, value] of Object.entries(layerProps)) {
        if (typeof value === 'function') {
          delete layerProps[key];
        }
      }
      return layerProps;
    });

    t.deepEquals(props, layers.map(l => l.props), 'Layers are correctly instantiated');
    t.end();
  });
}
