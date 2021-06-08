import test from 'tape-catch';
import {testLayerAsync} from '@deck.gl/test-utils';
import {makeSpy} from '@probe.gl/test-utils';
import {CartoLayer, API_VERSIONS, MAP_TYPES} from '@deck.gl/carto';
import {MVTLayer} from '@deck.gl/geo-layers';
import {GeoJsonLayer} from '@deck.gl/layers';
import {mockFetchMapsV2, mockFetchMapsV1, mockFetchMapsV3, restoreFetch} from './mock-fetch';

const CREDENTIALS_V3 = {
  apiVersion: API_VERSIONS.V3,
  apiBaseUrl: 'https://tenant.api.carto.com',
  accessToken: 'XXX'
};

test('CartoLayer#v2', async t => {
  const fetchMock = mockFetchMapsV2();

  const onAfterUpdate = ({layer, subLayers, subLayer}) => {
    const {data} = layer.state;
    if (!data) {
      t.is(subLayers.length, 0, 'should no render subLayers');
    } else {
      t.is(subLayers.length, 1, 'should render a subLayer');
      t.ok(Array.isArray(data.tiles), 'tiles should be an array');
      t.ok(subLayer instanceof MVTLayer, 'subLayer should be a MVT layer ');
    }
  };

  const spy = makeSpy(MVTLayer.prototype, 'getTileData');
  spy.returns([]);

  await testLayerAsync({
    Layer: CartoLayer,
    testCases: [
      {
        props: {
          data: 'select * from bbb',
          type: MAP_TYPES.QUERY
        },
        onAfterUpdate
      },
      {
        props: {
          data: 'tileset',
          type: MAP_TYPES.TILESET
        },
        onAfterUpdate
      }
    ]
  });

  restoreFetch(fetchMock);
  spy.restore();
  t.end();
});

test('CartoLayer#v3', async t => {
  const fetchMock = mockFetchMapsV3();
  const spy = makeSpy(MVTLayer.prototype, 'getTileData');
  spy.returns([]);

  const onAfterUpdate = ({layer, subLayer, subLayers}) => {
    const {data} = layer.state;
    if (!data) {
      t.is(subLayers.length, 0, 'should no render subLayers');
    } else {
      t.is(subLayers.length, 1, 'should have only 1 sublayer');
      switch (layer.props.type) {
        case MAP_TYPES.TILESET:
          t.ok(subLayer instanceof MVTLayer, 'should be an MVTLayer');
          break;
        case MAP_TYPES.TABLE:
        case MAP_TYPES.QUERY:
          t.ok(subLayer instanceof GeoJsonLayer, 'should be an GeoJsonLayer');
          break;
        default:
          t.ok(false, 'invalid prop type');
      }
    }
  };

  await testLayerAsync({
    Layer: CartoLayer,
    testCases: [
      {
        props: {
          data: 'select * from table',
          type: MAP_TYPES.QUERY,
          connection: 'conn_name',
          credentials: CREDENTIALS_V3
        },
        onAfterUpdate
      },
      {
        props: {
          data: 'tileset',
          connection: 'conn_name',
          type: MAP_TYPES.TILESET,
          credentials: CREDENTIALS_V3
        },
        onAfterUpdate
      },
      {
        props: {
          data: 'table',
          connection: 'conn_name',
          type: MAP_TYPES.TABLE,
          credentials: CREDENTIALS_V3
        },
        onAfterUpdate
      }
    ]
  });

  restoreFetch(fetchMock);
  spy.restore();

  t.end();
});

test('CartoLayer#should throws with invalid params for v1 and v2', t => {
  const fetchMock = mockFetchMapsV1();

  const layer = new CartoLayer();

  const TEST_CASES = [
    {
      title: 'throws on invalid api version',
      props: {...layer.props, credentials: {apiVersion: 'wrong'}},
      regex: /invalid apiVersion/i
    },
    {
      title: 'throws when type is not defined for v1',
      props: {
        ...layer.props,
        type: null,
        credentials: {apiVersion: API_VERSIONS.V1}
      },
      regex: /invalid type/i
    },
    {
      title: 'throws when type is not defined for v2',
      props: {
        ...layer.props,
        type: null,
        credentials: {apiVersion: API_VERSIONS.V2}
      },
      regex: /invalid type/i
    },
    {
      title: `throws when ${MAP_TYPES.TABLE} prop is used for v1`,
      props: {
        ...layer.props,
        type: MAP_TYPES.TABLE,
        credentials: {apiVersion: API_VERSIONS.V1}
      },
      regex: /Invalid type/i
    },
    {
      title: `throws when ${MAP_TYPES.TABLE} prop is used for v2`,
      props: {
        ...layer.props,
        type: MAP_TYPES.TABLE,
        credentials: {apiVersion: API_VERSIONS.V2}
      },
      regex: /Invalid type/i
    }
  ];

  TEST_CASES.forEach(c => {
    t.throws(() => layer._checkProps(c.props), c.regex, c.title);
  });

  restoreFetch(fetchMock);

  t.end();
});

test('CartoLayer#should throws with invalid params for v3', t => {
  const fetchMock = mockFetchMapsV1();
  const layer = new CartoLayer();

  const TEST_CASES = [
    {
      title: 'throws when connection mandatory prop is not defined for v3',
      props: {
        ...layer.props,
        type: MAP_TYPES.TILESET,
        credentials: {apiVersion: API_VERSIONS.V3}
      },
      regex: /missing mandatory connection parameter/i
    },
    {
      title: 'throws when type prop is not defined for v3',
      props: {
        ...layer.props,
        type: null,
        connection: 'bigqquery',
        credentials: {apiVersion: API_VERSIONS.V3}
      },
      regex: /invalid type/i
    },
    {
      title: 'throws when type prop is not valid for v3',
      props: {
        ...layer.props,
        type: 'no-valid',
        connection: 'bigqquery',
        credentials: {apiVersion: API_VERSIONS.V3}
      },
      regex: /invalid type/i
    }
  ];

  TEST_CASES.forEach(c => {
    t.throws(() => layer._checkProps(c.props), c.regex, c.title);
  });

  restoreFetch(fetchMock);

  t.end();
});

test('CartoLayer#_updateData executed when props changes', async t => {
  const fetchMock = mockFetchMapsV3();

  const testCases = [
    {
      spies: ['_updateData'],
      props: {
        type: MAP_TYPES.TABLE,
        data: 'table',
        connection: 'connection_name',
        credentials: CREDENTIALS_V3
      },
      onAfterUpdate({layer, spies}) {
        if (layer.isLoaded) {
          t.ok(spies._updateData.called, 'updateData triggered');
          t.ok(spies._updateData.callCount === 1);
        }
      }
    },
    {
      updateProps: {data: 'table'},
      spies: ['_updateData'],
      onAfterUpdate({layer, spies}) {
        if (layer.isLoaded) {
          t.ok(
            spies._updateData.callCount === 0,
            'same data does not trigger a new map instantiation'
          );
        }
      }
    },
    {
      updateProps: {data: 'table2'},
      spies: ['_updateData'],
      onAfterUpdate({layer, spies}) {
        if (layer.isLoaded) {
          t.ok(
            spies._updateData.callCount === 1,
            'different data triggers a new map instantiation'
          );
        }
      }
    },
    {
      updateProps: {type: MAP_TYPES.QUERY},
      spies: ['_updateData'],
      onAfterUpdate({layer, spies}) {
        if (layer.isLoaded) {
          t.ok(spies._updateData.callCount === 1, 'update type trigger a map instantiation');
        }
      }
    },
    {
      updateProps: {connection: 'bigquery'},
      spies: ['_updateData'],
      onAfterUpdate({layer, spies}) {
        if (layer.isLoaded) {
          t.ok(spies._updateData.callCount === 1, 'update connection trigger a map instantiation');
        }
      }
    },
    {
      updateProps: {credentials: {...CREDENTIALS_V3, accessToken: 'YYY'}},
      spies: ['_updateData'],
      onAfterUpdate({layer, spies}) {
        if (layer.isLoaded) {
          t.ok(spies._updateData.callCount === 1, 'update credentials trigger a map instantiation');
        }
      }
    }
  ];

  await testLayerAsync({Layer: CartoLayer, testCases, onError: t.notOk});

  restoreFetch(fetchMock);

  t.end();
});

test('CartoSQLLayer#onDataLoad', async t => {
  const fetchMock = mockFetchMapsV3();

  const spy = makeSpy(MVTLayer.prototype, 'getTileData');
  spy.returns([]);

  let counter = 0;
  const onDataLoad = () => {
    counter++;
  };

  const testCases = [
    {
      props: {
        data: 'tileset',
        type: MAP_TYPES.TILESET,
        connection: 'connection_name',
        credentials: CREDENTIALS_V3,
        onDataLoad
      },
      onAfterUpdate: ({layer}) => {
        if (layer.isLoaded) {
          t.is(counter, 1, 'should call once to onDataLoad');
        }
      }
    },
    {
      updateProps: {
        data: 'table',
        type: MAP_TYPES.TABLE
      },
      onAfterUpdate: ({layer}) => {
        if (layer.isLoaded) t.is(counter, 2, 'should call twice to onDataLoad');
      }
    }
  ];

  await testLayerAsync({Layer: CartoLayer, testCases, onError: t.notOk});

  spy.restore();
  t.end();

  restoreFetch(fetchMock);
});
