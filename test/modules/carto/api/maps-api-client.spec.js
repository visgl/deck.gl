/* global global, window */

import test from 'tape-catch';

import {
  _getDataV2,
  MAP_TYPES,
  API_VERSIONS,
  getData,
  setDefaultCredentials,
  getDefaultCredentials
} from '@deck.gl/carto';
import {MAPS_API_V1_RESPONSE, TILEJSON_RESPONSE} from '../mock-fetch';

test('getDataV2#v1', async t => {
  setDefaultCredentials({
    apiVersion: API_VERSIONS.V1,
    mapsUrl: 'https://maps-v1'
  });

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
    credentials: getDefaultCredentials()
  });

  t.ok(
    Array.isArray(data.tiles) && data.tiles.length === 1,
    'tiles should be an array with content'
  );

  setDefaultCredentials({});
  _global.fetch = fetch;

  t.end();
});

test('getDataV2#v2', async t => {
  setDefaultCredentials({
    apiVersion: API_VERSIONS.V2,
    mapsUrl: 'https://maps-v2'
  });

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
    credentials: getDefaultCredentials()
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
    credentials: getDefaultCredentials()
  });

  t.ok(
    Array.isArray(data.tiles) && data.tiles.length === 1,
    'tiles should be an array with content'
  );

  _global.fetch = fetch;
  setDefaultCredentials({});
  t.end();
});

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
      ...params,
      credentials: {
        apiVersion: API_VERSIONS.V3
      }
    });
    t.fail('it should throw an error');
  } catch (e) {
    t.is(e.message, 'Must define apiBaseUrl', 'should throw when no apiBaseUrl');
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
    props: {},
    mapInstantiationUrl:
      'http://carto-api/v3/maps/connection_name/table?client=deck-gl-carto&name=table'
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
  }
].forEach(({props, mapInstantiationUrl}) => {
  for (const useSetDefaultCredentials of [true, false]) {
    test(`getData#setDefaultCredentials(${String(useSetDefaultCredentials)})`, async t => {
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
        await getData({
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
