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

const DATASETS = [
  {
    id: 'DATA_ID',
    data: {type: 'FeatureCollection', features: []}
  },
  {
    id: 'DATA_TILESET_ID',
    data: {
      tilestats: {
        layers: [
          {
            attributes: [
              {
                attribute: 'STRING_ATTR',
                categories: [{category: '1'}, {category: '2'}, {category: '3'}]
              },
              {
                attribute: 'NUMBER_ATTR',
                min: 0,
                max: 10
              }
            ]
          }
        ]
      }
    }
  }
];

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
      datasets: DATASETS,
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

    // Fill in tileset data to avoid duplicatation
    layers.forEach(({props: layerProps}) => {
      if (layerProps.data === 'DATA_TILESET') {
        layerProps.data = DATASETS[1].data;
      }
    });

    t.deepEquals(props, layers.map(l => l.props), 'Layers are correctly instantiated');
    t.end();
  });
}

// TODO test for no matching dataId
