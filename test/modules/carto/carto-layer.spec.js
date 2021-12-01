import {testLayerAsync} from '@deck.gl/test-utils';
import {makeSpy} from '@probe.gl/test-utils';
import {CartoLayer, API_VERSIONS, FORMATS, MAP_TYPES} from '@deck.gl/carto';
import {MVTLayer} from '@deck.gl/geo-layers';
import {GeoJsonLayer} from '@deck.gl/layers';
import CartoDynamicTileLayer from '@deck.gl/carto/layers/carto-dynamic-tile-layer';
import {mockedV1Test, mockedV2Test, mockedV3Test} from './mock-fetch';

const CREDENTIALS_V3 = {
  apiVersion: API_VERSIONS.V3,
  apiBaseUrl: 'https://tenant.api.carto.com',
  accessToken: 'XXX'
};

mockedV2Test('CartoLayer#v2', async t => {
  const onAfterUpdate = ({layer, subLayers, subLayer}) => {
    const {data} = layer.state;
    if (!data) {
      t.is(subLayers.length, 0, 'should no render subLayers');
    } else {
      t.is(subLayers.length, 1, 'should render a subLayer');
      t.ok(Array.isArray(data.tiles), 'tiles should be an array');
      t.ok(subLayer instanceof MVTLayer, 'subLayer should be an MVTLayer ');
      t.is(
        subLayer.props.uniqueIdProperty,
        'cartodb_id',
        'should default to correct uniqueIdProperty'
      );
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

  spy.restore();
});

mockedV3Test('CartoLayer#v3', async t => {
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
          t.is(
            subLayer.props.uniqueIdProperty,
            'cartodb_id',
            'should default to correct uniqueIdProperty'
          );
          break;
        case MAP_TYPES.TABLE:
          if (layer.props.format === FORMATS.TILEJSON) {
            t.ok(subLayer instanceof CartoDynamicTileLayer, 'should be a CartoDynamicTileLayer');
          } else {
            t.ok(subLayer instanceof GeoJsonLayer, 'should be a GeoJsonLayer');
          }
          break;
        case MAP_TYPES.QUERY:
          t.ok(subLayer instanceof GeoJsonLayer, 'should be a GeoJsonLayer');
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
      },
      {
        props: {
          data: 'dynamic_tileset',
          connection: 'conn_name',
          type: MAP_TYPES.TABLE,
          format: FORMATS.TILEJSON,
          credentials: CREDENTIALS_V3
        },
        onAfterUpdate
      }
    ]
  });

  spy.restore();
});

mockedV1Test('CartoLayer#should throw with invalid params for v1 and v2', t => {
  const layer = new CartoLayer();

  const TEST_CASES = [
    {
      title: 'should throw on invalid api version',
      props: {...layer.props, credentials: {apiVersion: 'wrong'}},
      regex: /invalid apiVersion/i
    },
    {
      title: 'should throw when type is not defined for v1',
      props: {
        ...layer.props,
        type: null,
        credentials: {apiVersion: API_VERSIONS.V1}
      },
      regex: /invalid type/i
    },
    {
      title: 'should throw when type is not defined for v2',
      props: {
        ...layer.props,
        type: null,
        credentials: {apiVersion: API_VERSIONS.V2}
      },
      regex: /invalid type/i
    },
    {
      title: `should throw when ${MAP_TYPES.TABLE} prop is used for v1`,
      props: {
        ...layer.props,
        type: MAP_TYPES.TABLE,
        credentials: {apiVersion: API_VERSIONS.V1}
      },
      regex: /Invalid type/i
    },
    {
      title: `should throw when ${MAP_TYPES.TABLE} prop is used for v2`,
      props: {
        ...layer.props,
        type: MAP_TYPES.TABLE,
        credentials: {apiVersion: API_VERSIONS.V2}
      },
      regex: /Invalid type/i
    },
    ...[API_VERSIONS.V1, API_VERSIONS.V2]
      .map(apiVersion => {
        return [{connection: 'connection'}, {geoColumn: 'geoColumn'}, {columns: ['a', 'b']}].map(
          prop => {
            return {
              title: `should throw when ${
                Object.keys(prop)[0]
              } prop is used for apiVersion ${apiVersion}`,
              props: {
                ...layer.props,
                type: MAP_TYPES.QUERY,
                credentials: {apiVersion},
                ...prop
              },
              regex: /prop is not supported for apiVersion/i
            };
          }
        );
      })
      .flat(),
    ...[MAP_TYPES.QUERY, MAP_TYPES.TILESET]
      .map(type => {
        return [{geoColumn: 'geoColumn'}, {columns: ['a', 'b']}].map(prop => {
          return {
            title: `should throw when geoColumn prop is used with type ${type}`,
            props: {
              ...layer.props,
              connection: 'conn_name',
              type,
              credentials: {apiVersion: API_VERSIONS.V3},
              ...prop
            },
            regex: /prop is only supported for type/i
          };
        });
      })
      .flat()
  ];

  TEST_CASES.forEach(c => {
    t.throws(() => layer._checkProps(c.props), c.regex, c.title);
  });
});

mockedV1Test('CartoLayer#should throw with invalid params for v3', t => {
  const layer = new CartoLayer();

  const TEST_CASES = [
    {
      title: 'should throw when connection mandatory prop is not defined for v3',
      props: {
        ...layer.props,
        type: MAP_TYPES.TILESET,
        credentials: {apiVersion: API_VERSIONS.V3}
      },
      regex: /missing mandatory connection parameter/i
    },
    {
      title: 'should throw when type prop is not defined for v3',
      props: {
        ...layer.props,
        type: null,
        connection: 'bigqquery',
        credentials: {apiVersion: API_VERSIONS.V3}
      },
      regex: /invalid type/i
    },
    {
      title: 'should throw when type prop is not valid for v3',
      props: {
        ...layer.props,
        type: 'no-valid',
        connection: 'bigqquery',
        credentials: {apiVersion: API_VERSIONS.V3}
      },
      regex: /invalid type/i
    },
    {
      title: 'should throw when columns prop is not an Array',
      props: {
        ...layer.props,
        type: MAP_TYPES.TABLE,
        connection: 'bigqquery',
        credentials: {apiVersion: API_VERSIONS.V3},
        columns: 'a'
      },
      regex: /prop must be an Array/i
    }
  ];

  TEST_CASES.forEach(c => {
    t.throws(() => layer._checkProps(c.props), c.regex, c.title);
  });
});

mockedV3Test('CartoLayer#_updateData executed when props changes', async t => {
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
    },
    {
      updateProps: {type: MAP_TYPES.TABLE, geoColumn: 'geog'},
      spies: ['_updateData'],
      onAfterUpdate({layer, spies}) {
        if (layer.isLoaded) {
          t.ok(spies._updateData.callCount === 1, 'update geoColumns trigger a map instantiation');
        }
      }
    },
    {
      updateProps: {columns: ['geog', 'a']},
      spies: ['_updateData'],
      onAfterUpdate({layer, spies}) {
        if (layer.isLoaded) {
          t.ok(spies._updateData.callCount === 1, 'update columns trigger a map instantiation');
        }
      }
    },
    {
      updateProps: {columns: ['geog', 'b']},
      spies: ['_updateData'],
      onAfterUpdate({layer, spies}) {
        if (layer.isLoaded) {
          t.ok(
            spies._updateData.callCount === 1,
            'update single column trigger a map instantiation'
          );
        }
      }
    }
  ];

  await testLayerAsync({Layer: CartoLayer, testCases, onError: t.notOk});
});

mockedV3Test('CartoLayer#_updateData invalid apiVersion', async t => {
  const testCases = [
    {
      props: {
        type: MAP_TYPES.TABLE,
        data: 'table',
        connection: 'connection_name',
        credentials: CREDENTIALS_V3
      }
    },
    {
      updateProps: {credentials: {apiVersion: 'wrong'}}
    }
  ];

  let didThrow = false;
  const regex = /Invalid apiVersion wrong. Use API_VERSIONS enum./;
  await testLayerAsync({
    Layer: CartoLayer,
    testCases,
    onError: e => {
      t.ok(e.message.match(regex), 'Correct error message');
      didThrow = true;
    }
  });
  t.ok(didThrow, 'exception was thrown on invalid apiVersion prop update');
});

mockedV3Test('CartoLayer#onDataLoad', async t => {
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
});

mockedV3Test('CartoLayer#onDataError', async t => {
  const spy = makeSpy(MVTLayer.prototype, 'getTileData');
  spy.returns([]);

  const onDataLoad = () => {
    throw new Error('onDataLoad ERROR');
  };

  let counter = 0;
  const onDataError = () => {
    counter++;
  };

  const testCases = [
    {
      props: {
        data: 'tileset',
        type: MAP_TYPES.TILESET,
        connection: 'connection_name',
        credentials: CREDENTIALS_V3,
        onDataError
      },
      onAfterUpdate: ({layer}) => {
        if (layer.isLoaded) {
          t.is(counter, 0, 'should not call to onDataError');
        }
      }
    },
    {
      updateProps: {
        data: 'table',
        type: MAP_TYPES.TABLE,
        onDataLoad // <-- will throw error
      },
      onAfterUpdate: ({layer}) => {
        if (layer.isLoaded) {
          t.is(counter, 1, 'should call to onDataError');
        }
      }
    }
  ];

  await testLayerAsync({Layer: CartoLayer, testCases, onError: t.notOk});

  spy.restore();
});
