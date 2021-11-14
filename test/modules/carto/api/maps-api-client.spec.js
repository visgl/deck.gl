/* global global, setTimeout, window */

import test from 'tape-catch';

import {
  _getDataV2,
  MAP_TYPES,
  API_VERSIONS,
  getData,
  fetchLayerData,
  fetchMap,
  setDefaultCredentials,
  getDefaultCredentials
} from '@deck.gl/carto';
import {
  GEOJSON_RESPONSE,
  MAPS_API_V1_RESPONSE,
  TILEJSON_RESPONSE,
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

    const _global = typeof global !== 'undefined' ? global : window;
    const fetch = _global.fetch;

    _global.fetch = url => {
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
    _global.fetch = fetch;

    t.end();
  });

  test(`getDataV2#v2#setDefaultCredentials(${String(useSetDefaultCredentials)})`, async t => {
    const credentials = {
      apiVersion: API_VERSIONS.V2,
      mapsUrl: 'https://maps-v2'
    };
    setDefaultCredentials(useSetDefaultCredentials ? credentials : {});

    const _global = typeof global !== 'undefined' ? global : window;
    const fetch = _global.fetch;

    _global.fetch = url => {
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

    _global.fetch = url => {
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

    _global.fetch = fetch;
    setDefaultCredentials({});
    t.end();
  });
}

test('getData#parameters', async t => {
  const params = {
    type: MAP_TYPES.TABLE,
    connection: 'connection_name',
    source: 'table'
  };

  try {
    await getData({
      ...params,
      credentials: {
        apiVersion: API_VERSIONS.V2
      }
    });
    t.fail('it should throw an error');
  } catch (e) {
    t.is(e.message, 'Method only available for v3', 'should throw when no v3');
  }

  try {
    await getData({
      type: MAP_TYPES.TABLE,
      connection: 'connection_name',
      source: 'table',
      credentials: {
        apiVersion: API_VERSIONS.V3,
        apiBaseUrl: 'http://maps-v3'
      }
    });
    t.fail('it should throw an error');
  } catch (e) {
    t.is(e.message, 'Must define an accessToken', 'should throw when no accessToken');
  }

  t.end();
});

[
  {
    status: 401,
    title: 'Should catch unauthorized access to API',
    regex: /Unauthorized access to Maps API: invalid combination of user \('USER'\) and apiKey \('API_KEY'\)/i
  },
  {
    status: 403,
    title: 'Should catch unauthorized access to data',
    regex: /Unauthorized access to dataset: the provided apiKey\('API_KEY'\) doesn't provide access to the requested data/i
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

    const _global = typeof global !== 'undefined' ? global : window;
    const fetch = _global.fetch;

    _global.fetch = (url, options) => {
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
    _global.fetch = fetch;

    t.end();
  });
});

[
  {
    status: 400,
    title: 'Should catch bad request',
    regex: /Bad request. SERVER ERROR MESSAGE/i
  },
  ...[401, 403].map(status => ({
    status,
    title: 'Should catch unauthorized access to data',
    regex: /Unauthorized access. SERVER ERROR MESSAGE/i
  })),
  {
    status: 500,
    title: 'Should catch unknown API error',
    regex: /SERVER ERROR MESSAGE/i
  }
].forEach(({status, title, regex}) => {
  test(`dealWithError#v3#(${String(status)})`, async t => {
    const _global = typeof global !== 'undefined' ? global : window;
    const fetch = _global.fetch;

    _global.fetch = (url, options) => {
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
      await getData({
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

    _global.fetch = fetch;

    t.end();
  });
});
Object.values(API_VERSIONS).forEach(apiVersion => {
  test(`connectionError#(${apiVersion})`, async t => {
    setDefaultCredentials({apiVersion});

    const _global = typeof global !== 'undefined' ? global : window;
    const fetch = _global.fetch;

    _global.fetch = (url, options) => {
      throw new Error('Connection error');
    };

    const legacy = [API_VERSIONS.V1, API_VERSIONS.V2].includes(apiVersion);
    try {
      await (legacy ? _getDataV2 : getData)({
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
    _global.fetch = fetch;

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
      'http://carto-api/v3/maps/connection_name/table?client=deck-gl-carto&name=table'
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
      'http://carto-api-with-slash/v3/maps/connection_name/table?client=deck-gl-carto&name=table'
  },
  {
    props: {geoColumn: 'geog'},
    mapInstantiationUrl:
      'http://carto-api/v3/maps/connection_name/table?client=deck-gl-carto&name=table&geo_column=geog'
  },
  {
    props: {columns: ['a', 'b', 'c']},
    mapInstantiationUrl:
      'http://carto-api/v3/maps/connection_name/table?client=deck-gl-carto&name=table&columns=a%2Cb%2Cc'
  },
  {
    props: {columns: ['a', 'b', 'c'], geoColumn: 'geog'},
    mapInstantiationUrl:
      'http://carto-api/v3/maps/connection_name/table?client=deck-gl-carto&name=table&geo_column=geog&columns=a%2Cb%2Cc'
  },
  {
    props: {schema: true},
    mapInstantiationUrl:
      'http://carto-api/v3/maps/connection_name/table?client=deck-gl-carto&schema=true&name=table'
  }
].forEach(({props, mapInstantiationUrl}) => {
  for (const useSetDefaultCredentials of [true, false]) {
    test(`fetchLayerData#setDefaultCredentials(${String(useSetDefaultCredentials)})`, async t => {
      const geojsonURL = 'http://geojson';
      const accessToken = 'XXX';
      const credentials = {
        apiVersion: API_VERSIONS.V3,
        apiBaseUrl: 'http://carto-api',
        accessToken
      };

      setDefaultCredentials(useSetDefaultCredentials ? credentials : {});

      const _global = typeof global !== 'undefined' ? global : window;
      const fetch = _global.fetch;

      _global.fetch = (url, options) => {
        if (url === mapInstantiationUrl) {
          t.pass('should call to the right instantiation url');
          t.is(
            options.headers.Authorization,
            `Bearer ${accessToken}`,
            'should provide a valid authentication header'
          );
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
          type: MAP_TYPES.TABLE,
          connection: 'connection_name',
          source: 'table',
          credentials: useSetDefaultCredentials ? getDefaultCredentials() : credentials,
          ...props
        });
      } catch (e) {
        t.error(e, 'should not throw');
      }

      setDefaultCredentials({});

      _global.fetch = fetch;

      t.end();
    });
  }
});

test('getData#post', async t => {
  const geojsonURL = 'http://geojson';
  const mapInstantiationUrl = 'http://carto-api/v3/maps/connection_name/query';

  const accessToken = 'XXX';

  setDefaultCredentials({
    apiVersion: API_VERSIONS.V3,
    apiBaseUrl: 'http://carto-api',
    accessToken
  });

  const _global = typeof global !== 'undefined' ? global : window;
  const fetch = _global.fetch;

  _global.fetch = (url, options) => {
    if (url === mapInstantiationUrl) {
      t.pass('should call to the right instantiation url');
      t.is(options.method, 'POST', 'should make a POST request on instantiation');
      t.is(
        options.headers.Authorization,
        `Bearer ${accessToken}`,
        'should provide a valid authentication header'
      );

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
    await getData({
      type: MAP_TYPES.QUERY,
      connection: 'connection_name',
      source: `SELECT *, '${Array(2048).join('x')}' as r FROM cartobq.testtables.points_10k`,
      credentials: getDefaultCredentials()
    });
  } catch (e) {
    t.error(e, 'should not throw');
  }

  setDefaultCredentials({});

  _global.fetch = fetch;

  t.end();
});

test('fetchMap#no datasets', async t => {
  const cartoMapId = 'abcd-1234';
  const mapUrl = `http://carto-api/v3/maps/public/${cartoMapId}`;
  const mapResponse = {id: cartoMapId, datasets: [], keplerMapConfig: EMPTY_KEPLER_MAP_CONFIG};

  setDefaultCredentials({apiVersion: API_VERSIONS.V3, apiBaseUrl: 'http://carto-api'});

  const _global = typeof global !== 'undefined' ? global : window;
  const fetch = _global.fetch;

  _global.fetch = (url, options) => {
    if (url === mapUrl) {
      t.pass('should call to the right instantiation url');
      return Promise.resolve({json: () => mapResponse, ok: true});
    }

    t.fail(`Invalid URL request : ${url}`);
    return null;
  };

  try {
    await fetchMap({cartoMapId});
  } catch (e) {
    t.error(e, 'should not throw');
  }

  setDefaultCredentials({});
  _global.fetch = fetch;

  t.end();
});

test('fetchMap#datasets', async t => {
  const cartoMapId = 'abcd-1234';
  const mapUrl = `http://carto-api/v3/maps/public/${cartoMapId}`;
  const publicToken = 'public_token';

  const connectionName = 'test_connection';
  const source = 'test_source';
  const table = {type: MAP_TYPES.TABLE, connectionName, source};
  const tileset = {type: MAP_TYPES.TILESET, connectionName, source};
  const query = {type: MAP_TYPES.QUERY, connectionName, source};

  const mapResponse = {
    id: cartoMapId,
    datasets: [table, tileset, query],
    keplerMapConfig: EMPTY_KEPLER_MAP_CONFIG,
    publicToken
  };

  setDefaultCredentials({apiVersion: API_VERSIONS.V3, apiBaseUrl: 'http://carto-api'});

  const _global = typeof global !== 'undefined' ? global : window;
  const fetch = _global.fetch;

  _global.fetch = (url, options) => {
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
  _global.fetch = fetch;

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
  const publicToken = 'public_token';

  const connectionName = 'test_connection';
  const source = 'test_source';
  const tileset = {type: MAP_TYPES.TILESET, connectionName, source};

  const mapResponse = {
    id: cartoMapId,
    datasets: [tileset],
    keplerMapConfig: EMPTY_KEPLER_MAP_CONFIG,
    publicToken
  };

  const _global = typeof global !== 'undefined' ? global : window;
  const fetch = _global.fetch;

  _global.fetch = (url, options) => {
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

  _global.fetch = fetch;

  t.end();
});
