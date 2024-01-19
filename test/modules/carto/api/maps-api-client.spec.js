/* global global, setTimeout, window */

import test from 'tape-catch';

import {
  API_VERSIONS,
  FORMATS,
  MAP_TYPES,
  _getDataV2,
  fetchLayerData,
  fetchMap,
  getDefaultCredentials,
  setDefaultCredentials
} from '@deck.gl/carto';
import {
  GEOJSON_RESPONSE,
  MAPS_API_V1_RESPONSE,
  TILEJSON_RESPONSE,
  TILESTATS_RESPONSE,
  mockFetchMapsV3
} from '../mock-fetch';
import {EMPTY_KEPLER_MAP_CONFIG} from './parseMap.spec';

for (const useSetDefaultCredentials of [true, false]) {
  test(`getDataV2#v1#setDefaultCredentials(${String(useSetDefaultCredentials)})`, async t => {
    const credentials = {
      apiVersion: API_VERSIONS.V1,
      mapsUrl: 'https://maps-v1'
    };
    setDefaultCredentials(useSetDefaultCredentials ? credentials : {});

    const fetch = globalThis.fetch;

    globalThis.fetch = url => {
      t.is(
        url,
        'https://maps-v1?api_key=default_public&client=deck-gl-carto&config=%7B%22version%22%3A%221.3.1%22%2C%22buffersize%22%3A%7B%22mvt%22%3A16%7D%2C%22layers%22%3A%5B%7B%22type%22%3A%22mapnik%22%2C%22options%22%3A%7B%22sql%22%3A%22select%20*%20from%20a%22%2C%22vector_extent%22%3A4096%7D%7D%5D%7D',
        'should be a right map instantiation v1'
      );
      return Promise.resolve({
        json: () => MAPS_API_V1_RESPONSE,
        ok: true
      });
    };

    const data = await _getDataV2({
      type: MAP_TYPES.QUERY,
      source: 'select * from a',
      credentials: useSetDefaultCredentials ? getDefaultCredentials() : credentials
    });

    t.ok(
      Array.isArray(data.tiles) && data.tiles.length === 1,
      'tiles should be an array with content'
    );

    setDefaultCredentials({});
    globalThis.fetch = fetch;

    t.end();
  });

  test(`getDataV2#v2#setDefaultCredentials(${String(useSetDefaultCredentials)})`, async t => {
    const credentials = {
      apiVersion: API_VERSIONS.V2,
      mapsUrl: 'https://maps-v2'
    };
    setDefaultCredentials(useSetDefaultCredentials ? credentials : {});

    const fetch = globalThis.fetch;

    globalThis.fetch = url => {
      t.is(
        url,
        'https://maps-v2/carto/sql?source=select%20*%20from%20a&format=tilejson&api_key=default_public&client=deck-gl-carto',
        'should be a right url for a query at v2'
      );
      return Promise.resolve({
        json: () => TILEJSON_RESPONSE,
        ok: true
      });
    };

    let data = await _getDataV2({
      type: MAP_TYPES.QUERY,
      source: 'select * from a',
      credentials: useSetDefaultCredentials ? getDefaultCredentials() : credentials
    });

    t.ok(
      Array.isArray(data.tiles) && data.tiles.length === 1,
      'tiles should be an array with content'
    );

    globalThis.fetch = url => {
      t.is(
        url,
        'https://maps-v2/bigquery/tileset?source=tileset&format=tilejson&api_key=default_public&client=deck-gl-carto',
        'should be a right url for a tileset at v2'
      );
      return Promise.resolve({
        json: () => TILEJSON_RESPONSE,
        ok: true
      });
    };

    data = await _getDataV2({
      type: MAP_TYPES.TILESET,
      source: 'tileset',
      credentials: useSetDefaultCredentials ? getDefaultCredentials() : credentials
    });

    t.ok(
      Array.isArray(data.tiles) && data.tiles.length === 1,
      'tiles should be an array with content'
    );

    globalThis.fetch = fetch;
    setDefaultCredentials({});
    t.end();
  });
}

const TABLE_PARAMS = {
  type: MAP_TYPES.TABLE,
  connection: 'connection_name',
  source: 'table',
  credentials: {accessToken: 'XXX', apiVersion: API_VERSIONS.V3, apiBaseUrl: 'http://maps-v3'}
};

[
  {
    title: 'v2',
    params: {...TABLE_PARAMS, credentials: {apiVersion: API_VERSIONS.V2}},
    regex: /Method only available for v3/
  },
  {
    title: 'no access token',
    params: {
      ...TABLE_PARAMS,
      credentials: {apiVersion: API_VERSIONS.V3, apiBaseUrl: 'http://maps-v3'}
    },
    regex: /Must define an accessToken/
  },
  {
    title: 'tileset + geoColumn',
    params: {...TABLE_PARAMS, type: MAP_TYPES.TILESET, geoColumn: 'geo'},
    regex: /geoColumn parameter is not supported by type tileset/
  },
  {
    title: 'no geoColumn + aggregationExp',
    params: {...TABLE_PARAMS, aggregationExp: 'sum(x) as y'},
    regex: /aggregationExp, but geoColumn parameter is missing/
  },
  {
    title: 'no geoColumn + aggregationResLevel',
    params: {...TABLE_PARAMS, aggregationResLevel: 8},
    regex: /aggregationResLevel, but geoColumn parameter is missing/
  }
].forEach(({title, params, regex}) => {
  test(`fetchLayerData#parameters ${title}`, async t => {
    try {
      await fetchLayerData(params);
      t.fail('it should throw an error');
    } catch (e) {
      t.throws(
        () => {
          throw e;
        },
        regex,
        'Error message should match'
      );
    }

    t.end();
  });
});

[
  {
    status: 401,
    title: 'Should catch unauthorized access to API',
    regex:
      /Unauthorized access to Maps API: invalid combination of user \('USER'\) and apiKey \('API_KEY'\)/i
  },
  {
    status: 403,
    title: 'Should catch unauthorized access to data',
    regex:
      /Unauthorized access to dataset: the provided apiKey\('API_KEY'\) doesn't provide access to the requested data/i
  },
  {
    status: 500,
    title: 'Should catch unknown API error',
    regex: /SERVER ERROR MESSAGE/i
  }
].forEach(({status, title, regex}) => {
  test(`dealWithError#v2#(${String(status)})`, async t => {
    const credentials = {
      apiKey: 'API_KEY',
      apiVersion: API_VERSIONS.V2,
      username: 'USER',
      mapsUrl: 'https://maps-v2'
    };

    setDefaultCredentials(credentials);

    const fetch = globalThis.fetch;

    globalThis.fetch = (url, options) => {
      return Promise.resolve({
        json: () => {
          return {
            error: 'SERVER ERROR MESSAGE'
          };
        },
        ok: false,
        status
      });
    };

    try {
      await _getDataV2({
        type: MAP_TYPES.QUERY,
        source: 'select * from a'
      });
      t.error('should throw');
    } catch (e) {
      t.throws(
        () => {
          throw e;
        },
        regex,
        title
      );
    }

    setDefaultCredentials({});
    globalThis.fetch = fetch;

    t.end();
  });
});

[
  {
    status: 400,
    title: 'Should catch bad request',
    regex: /Bad request \(400\): SERVER ERROR MESSAGE/i
  },
  ...[401, 403].map(status => ({
    status,
    title: 'Should catch unauthorized access to data',
    regex: new RegExp(`Unauthorized access \\(${status}\\): SERVER ERROR MESSAGE`, 'i')
  })),
  {
    status: 500,
    title: 'Should catch unknown API error',
    regex: /SERVER ERROR MESSAGE/i
  }
].forEach(({status, title, regex}) => {
  test(`dealWithError#v3#(${String(status)})`, async t => {
    const fetch = globalThis.fetch;

    globalThis.fetch = (url, options) => {
      return Promise.resolve({
        json: () => {
          return {
            error: 'SERVER ERROR MESSAGE'
          };
        },
        ok: false,
        status
      });
    };

    try {
      await fetchLayerData({
        type: MAP_TYPES.QUERY,
        source: 'select * from a',
        connection: 'connection_name',
        credentials: {accessToken: 'XXX'}
      });
      t.error('should throw');
    } catch (e) {
      t.throws(
        () => {
          throw e;
        },
        regex,
        title
      );
    }

    globalThis.fetch = fetch;

    t.end();
  });
});
Object.values(API_VERSIONS).forEach(apiVersion => {
  test(`connectionError#(${apiVersion})`, async t => {
    setDefaultCredentials({apiVersion});

    const fetch = globalThis.fetch;

    globalThis.fetch = (url, options) => {
      throw new Error('Connection error');
    };

    const legacy = [API_VERSIONS.V1, API_VERSIONS.V2].includes(apiVersion);
    try {
      await (legacy ? _getDataV2 : fetchLayerData)({
        type: MAP_TYPES.QUERY,
        source: 'select * from a',
        ...(!legacy && {
          connection: 'connection_name',
          credentials: {accessToken: 'XXX'}
        })
      });
      t.error('should throw');
    } catch (e) {
      t.throws(
        () => {
          throw e;
        },
        /Connection error/,
        'Throws error when connection fails'
      );
    }

    setDefaultCredentials({});
    globalThis.fetch = fetch;

    t.end();
  });
});

test(`getDataV2#versionError`, async t => {
  setDefaultCredentials({apiVersion: API_VERSIONS.V3});

  try {
    await _getDataV2({
      type: MAP_TYPES.QUERY,
      source: 'select * from a'
    });
    t.error('should throw');
  } catch (e) {
    t.throws(
      () => {
        throw e;
      },
      /Invalid maps API version. It should be v1 or v2/,
      'Throws error when incorrect API version used'
    );
  }

  setDefaultCredentials({});

  t.end();
});

[
  {
    props: {},
    mapInstantiationUrl:
      'http://carto-api/v3/maps/connection_name/table?client=deck-gl-carto&v=3.2&name=table'
  },
  {
    props: {
      format: FORMATS.GEOJSON
    },
    mapInstantiationUrl:
      'http://carto-api/v3/maps/connection_name/table?client=deck-gl-carto&v=3.2&name=table'
  },
  {
    props: {
      format: FORMATS.NDJSON
    },
    mapInstantiationUrl:
      'http://carto-api/v3/maps/connection_name/table?client=deck-gl-carto&v=3.2&name=table'
  },
  {
    props: {
      credentials: {
        apiVersion: API_VERSIONS.V3,
        apiBaseUrl: 'http://carto-api-with-slash/',
        accessToken: 'XXX'
      }
    },
    mapInstantiationUrl:
      'http://carto-api-with-slash/v3/maps/connection_name/table?client=deck-gl-carto&v=3.2&name=table'
  },
  {
    props: {geoColumn: 'geog'},
    mapInstantiationUrl:
      'http://carto-api/v3/maps/connection_name/table?client=deck-gl-carto&v=3.2&name=table&geo_column=geog'
  },
  {
    props: {columns: ['a', 'b', 'c']},
    mapInstantiationUrl:
      'http://carto-api/v3/maps/connection_name/table?client=deck-gl-carto&v=3.2&name=table&columns=a%2Cb%2Cc'
  },
  {
    props: {columns: ['a', 'b', 'c'], geoColumn: 'geog'},
    mapInstantiationUrl:
      'http://carto-api/v3/maps/connection_name/table?client=deck-gl-carto&v=3.2&name=table&geo_column=geog&columns=a%2Cb%2Cc'
  },
  {
    props: {geoColumn: 'geog', aggregationExp: 'sum(col) as value'},
    mapInstantiationUrl:
      'http://carto-api/v3/maps/connection_name/table?client=deck-gl-carto&v=3.2&name=table&geo_column=geog&aggregationExp=sum(col)%20as%20value'
  },
  {
    props: {geoColumn: 'quadbin:quadbin', aggregationExp: 'sum(col) as v', aggregationResLevel: 7},
    mapInstantiationUrl:
      'http://carto-api/v3/maps/connection_name/table?client=deck-gl-carto&v=3.2&name=table&geo_column=quadbin%3Aquadbin&aggregationExp=sum(col)%20as%20v&aggregationResLevel=7'
  },
  {
    props: {geoColumn: 'h3:h3', aggregationResLevel: 7},
    mapInstantiationUrl:
      'http://carto-api/v3/maps/connection_name/table?client=deck-gl-carto&v=3.2&name=table&geo_column=h3%3Ah3&aggregationExp=1%20AS%20value&aggregationResLevel=7'
  },
  {
    props: {
      type: MAP_TYPES.QUERY,
      source: 'select * from table',
      queryParameters: {end: '2021-09-17', start: '2021-09-15'}
    },
    mapInstantiationUrl:
      'http://carto-api/v3/maps/connection_name/query?client=deck-gl-carto&v=3.2&q=select%20*%20from%20table&queryParameters=%7B%22end%22%3A%222021-09-17%22%2C%22start%22%3A%222021-09-15%22%7D'
  }
].forEach(({props, mapInstantiationUrl}) => {
  for (const useSetDefaultCredentials of [true, false]) {
    test(`fetchLayerData#setDefaultCredentials(${String(useSetDefaultCredentials)})`, async t => {
      const geojsonURL = 'http://geojson';
      const ndjsonURL = 'http://ndjson';
      const accessToken = 'XXX';
      const credentials = {
        apiVersion: API_VERSIONS.V3,
        apiBaseUrl: 'http://carto-api',
        accessToken
      };
      const headers = {'Custom-Header': 'Custom-Header-Value'};

      setDefaultCredentials(useSetDefaultCredentials ? credentials : {});

      const fetch = globalThis.fetch;

      globalThis.fetch = (url, options) => {
        if (url === mapInstantiationUrl) {
          t.pass('should call to the right instantiation url');
          t.is(
            options.headers.Authorization,
            `Bearer ${accessToken}`,
            'should provide a valid authentication header'
          );
          t.is(
            options.headers['Custom-Header'],
            'Custom-Header-Value',
            'should include custom header in instantiation request'
          );
          return Promise.resolve({
            json: () => {
              return {
                geojson: {url: [geojsonURL]},
                ndjson: {url: [ndjsonURL]}
              };
            },
            ok: true
          });
        } else if (url === geojsonURL) {
          t.pass('should call to the right geojson url');
          return Promise.resolve({
            json: () => {
              return {
                geojson: {url: [geojsonURL]}
              };
            },
            ok: true
          });
        } else if (url === ndjsonURL) {
          t.pass('should call to the right ndjson url');
          return Promise.resolve({
            ok: true
          });
        }

        t.fail(`Invalid URL request : ${url}`);
        return null;
      };

      try {
        await fetchLayerData({
          type: MAP_TYPES.TABLE,
          connection: 'connection_name',
          source: 'table',
          credentials: useSetDefaultCredentials ? getDefaultCredentials() : credentials,
          headers,
          ...props
        });
      } catch (e) {
        t.error(e, 'should not throw');
      }

      setDefaultCredentials({});

      globalThis.fetch = fetch;

      t.end();
    });
  }
});

test('fetchLayerData#post', async t => {
  const geojsonURL = 'http://geojson';
  const mapInstantiationUrl = 'http://carto-api/v3/maps/connection_name/query';

  const accessToken = 'XXX';
  const headers = {'Custom-Header': 'Custom-Header-Value'};

  const source = `SELECT *, '${Array(8192).join('x')}' as r FROM cartobq.testtables.points_10k`;
  const aggregationExp = 'avg(value) as value';
  const aggregationResLevel = 4;
  const geoColumn = 'customGeom';
  const queryParameters = ['a', 'b'];
  const props = {aggregationExp, aggregationResLevel, geoColumn, queryParameters};

  setDefaultCredentials({
    apiVersion: API_VERSIONS.V3,
    apiBaseUrl: 'http://carto-api',
    accessToken
  });

  const globalThis = typeof global !== 'undefined' ? global : window;
  const fetch = globalThis.fetch;

  globalThis.fetch = (url, options) => {
    if (url === mapInstantiationUrl) {
      t.pass('should call to the right instantiation url');
      t.is(options.method, 'POST', 'should make a POST request on instantiation');
      t.is(
        options.headers.Authorization,
        `Bearer ${accessToken}`,
        'should provide a valid authentication header'
      );
      t.is(
        options.headers['Custom-Header'],
        'Custom-Header-Value',
        'should include custom header in instantiation request'
      );
      t.ok(options.body, 'should have POST body');
      const body = JSON.parse(options.body);
      t.is(body.q, source, 'should have query in body');
      t.is(body.client, 'deck-gl-carto', 'should have client in body');
      t.is(body.v, '3.2', 'should have v=3.2 in body');
      for (const p in props) {
        // Special case for geoColumn
        const prop = p === 'geoColumn' ? 'geo_column' : p;
        t.deepEqual(body[prop], props[p], `should have ${prop} in body`);
      }

      return Promise.resolve({
        json: () => {
          return {
            geojson: {url: [geojsonURL]}
          };
        },
        ok: true
      });
    } else if (url === geojsonURL) {
      t.pass('should call to the right geojson url');
      t.ok(!options.method, 'should make a GET request to fetch data');
      return Promise.resolve({
        json: () => {
          return {
            geojson: {url: [geojsonURL]}
          };
        },
        ok: true
      });
    }

    t.fail(`Invalid URL request : ${url}`);
    return null;
  };

  try {
    await fetchLayerData({
      type: MAP_TYPES.QUERY,
      connection: 'connection_name',
      source,
      credentials: getDefaultCredentials(),
      headers,
      ...props
    });
  } catch (e) {
    t.error(e, 'should not throw');
  }

  setDefaultCredentials({});

  globalThis.fetch = fetch;

  t.end();
});

test('fetchMap#no datasets', async t => {
  const cartoMapId = 'abcd-1234';
  const mapUrl = `http://carto-api/v3/maps/public/${cartoMapId}`;
  const mapResponse = {id: cartoMapId, datasets: [], keplerMapConfig: EMPTY_KEPLER_MAP_CONFIG};
  const headers = {'Custom-Header': 'Custom-Header-Value'};

  setDefaultCredentials({apiVersion: API_VERSIONS.V3, apiBaseUrl: 'http://carto-api'});

  const globalThis = typeof global !== 'undefined' ? global : window;
  const fetch = globalThis.fetch;

  globalThis.fetch = (url, options) => {
    if (url === mapUrl) {
      t.pass('should call to the right instantiation url');
      t.is(
        options.headers['Custom-Header'],
        'Custom-Header-Value',
        'should include custom header in public map request'
      );
      return Promise.resolve({json: () => mapResponse, ok: true});
    }

    t.fail(`Invalid URL request : ${url}`);
    return null;
  };

  try {
    await fetchMap({cartoMapId, headers});
  } catch (e) {
    t.error(e, 'should not throw');
  }

  setDefaultCredentials({});
  globalThis.fetch = fetch;

  t.end();
});

test('fetchMap#datasets', async t => {
  const cartoMapId = 'abcd-1234';
  const mapUrl = `http://carto-api/v3/maps/public/${cartoMapId}`;
  const token = 'public_token';

  const connectionName = 'test_connection';
  const source = 'test_source';
  const table = {type: MAP_TYPES.TABLE, connectionName, source};
  const tileset = {type: MAP_TYPES.TILESET, connectionName, source};
  const query = {type: MAP_TYPES.QUERY, connectionName, source};

  const mapResponse = {
    id: cartoMapId,
    datasets: [table, tileset, query],
    keplerMapConfig: EMPTY_KEPLER_MAP_CONFIG,
    token
  };

  setDefaultCredentials({apiVersion: API_VERSIONS.V3, apiBaseUrl: 'http://carto-api'});

  const globalThis = typeof global !== 'undefined' ? global : window;
  const fetch = globalThis.fetch;

  globalThis.fetch = (url, options) => {
    if (url === mapUrl) {
      t.pass('should call to the right instantiation url');
      mockFetchMapsV3();
      return Promise.resolve({json: () => mapResponse, ok: true});
    }

    t.fail(`Invalid URL request : ${url}`);
    return null;
  };

  try {
    await fetchMap({cartoMapId});
    t.deepEquals(table.data, GEOJSON_RESPONSE, 'Table has filled in data');
    t.deepEquals(tileset.data, TILEJSON_RESPONSE, 'Tileset has filled in data');
    t.deepEquals(query.data, GEOJSON_RESPONSE, 'Query has filled in data');
  } catch (e) {
    t.error(e, 'should not throw');
  }

  setDefaultCredentials({});
  globalThis.fetch = fetch;

  t.end();
});

test('fetchMap#tilestats', async t => {
  const cartoMapId = 'abcd-1234';
  const mapUrl = `http://carto-api/v3/maps/public/${cartoMapId}`;
  const token = 'public_token';

  const connectionName = 'test_connection';
  const source = 'test_source';
  const query = {id: 'DATA_ID', type: MAP_TYPES.QUERY, format: 'tilejson', connectionName, source};
  const keplerMapConfig = {
    version: 'v1',
    config: {
      mapState: 'INITIAL_VIEW_STATE',
      mapStyle: 'MAP_STYLE',
      visState: {
        layers: [
          {
            type: 'tileset',
            config: {dataId: 'DATA_ID', visConfig: {}},
            visualChannels: {
              testField: {name: 'population', type: 'integer'}
            }
          }
        ]
      }
    }
  };

  const mapResponse = {id: cartoMapId, datasets: [query], keplerMapConfig, token};
  setDefaultCredentials({apiVersion: API_VERSIONS.V3, apiBaseUrl: 'http://carto-api'});

  const globalThis = typeof global !== 'undefined' ? global : window;
  const fetch = globalThis.fetch;

  globalThis.fetch = (url, options) => {
    if (url === mapUrl) {
      t.pass('should call to the right instantiation url');
      mockFetchMapsV3();
      return Promise.resolve({json: () => mapResponse, ok: true});
    }

    t.fail(`Invalid URL request : ${url}`);
    return null;
  };

  try {
    await fetchMap({cartoMapId});
    const {attributes} = query.data.tilestats.layers[0];
    t.deepEquals(attributes[0], TILESTATS_RESPONSE, 'Tile stats filled in for population field');
  } catch (e) {
    t.error(e, 'should not throw');
  }

  setDefaultCredentials({});
  globalThis.fetch = fetch;

  t.end();
});

function sleep(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

test('fetchMap#autoRefresh', async t => {
  const cartoMapId = 'abcd-1234';
  const mapUrl = `https://gcp-us-east1.api.carto.com/v3/maps/public/${cartoMapId}`;
  const token = 'public_token';

  const connectionName = 'test_connection';
  const source = 'test_source';
  const tileset = {type: MAP_TYPES.TILESET, connectionName, source};

  const mapResponse = {
    id: cartoMapId,
    datasets: [tileset],
    keplerMapConfig: EMPTY_KEPLER_MAP_CONFIG,
    token
  };

  const globalThis = typeof global !== 'undefined' ? global : window;
  const fetch = globalThis.fetch;

  globalThis.fetch = (url, options) => {
    if (url === mapUrl) {
      t.pass('should call to the right instantiation url');
      mockFetchMapsV3();
      return Promise.resolve({json: () => mapResponse, ok: true});
    }

    t.fail(`Invalid URL request : ${url}`);
    return null;
  };

  let haveNewData = false;
  const onNewData = () => {
    haveNewData = true;
  };
  try {
    const map = await fetchMap({cartoMapId, autoRefresh: 0.1, onNewData});
    t.deepEquals(tileset.data, TILEJSON_RESPONSE, 'Tileset has filled in data');
    await sleep(200);
    t.ok(!haveNewData, 'Data has not been updated');

    // Modify cache to force an update
    tileset.cache -= 1;
    await sleep(200);
    t.ok(haveNewData, 'Data has been updated');

    map.stopAutoRefresh();
  } catch (e) {
    t.error(e, 'should not throw');
  }

  globalThis.fetch = fetch;

  t.end();
});

test('fetchMap#geoColumn', async t => {
  const cartoMapId = 'abcd-1234';
  const mapUrl = `https://gcp-us-east1.api.carto.com/v3/maps/public/${cartoMapId}`;
  const token = 'public_token';

  const connectionName = 'test_connection';
  const source = 'test_source';
  const geoColumn = 'geo_column';
  const columns = ['a', 'b'];

  const mapInstantiationUrl = `https://gcp-us-east1.api.carto.com/v3/maps/${connectionName}/table?client=deck-gl-carto&v=3.2&name=${source}&geo_column=${geoColumn}&columns=a%2Cb`;
  const table = {type: MAP_TYPES.TABLE, columns, geoColumn, connectionName, source};

  const mapResponse = {
    id: cartoMapId,
    datasets: [table],
    keplerMapConfig: EMPTY_KEPLER_MAP_CONFIG,
    token
  };

  const globalThis = typeof global !== 'undefined' ? global : window;
  const fetch = globalThis.fetch;

  globalThis.fetch = (url, options) => {
    if (url === mapUrl) {
      t.pass('should call to the right instantiation url');
      return Promise.resolve({json: () => mapResponse, ok: true});
    } else if (url === mapInstantiationUrl) {
      t.pass('should pass geoColumn in instantiation url');
      return mockFetchMapsV3()(url, options);
    }

    t.fail(`Invalid URL request : ${url}`);
    return null;
  };

  try {
    await fetchMap({cartoMapId});
    t.deepEquals(table.data, GEOJSON_RESPONSE, 'Table has filled in data');
  } catch (e) {
    t.error(e, 'should not throw');
  }

  globalThis.fetch = fetch;

  t.end();
});
