/* global Headers */
import test from 'tape-catch';
import {API_VERSIONS, setDefaultCredentials} from '@deck.gl/carto';

// See test/modules/carto/responseToJson for details for creating test data
import binaryTileData from './data/binaryTile.json';
const BINARY_TILE = new Uint8Array(binaryTileData).buffer;

export const TILEJSON_RESPONSE = {
  tilejson: '2.2.0',
  tiles: ['https://xyz.com/{z}/{x}/{y}?formatTiles=binary'],
  tilestats: {
    layers: [
      {
        attributes: [
          {attribute: 'population', type: 'integer'},
          {attribute: 'category', type: 'string'}
        ]
      }
    ]
  }
};

export const GEOJSON_RESPONSE = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Point',
        coordinates: [-6.7531585693359375, 37.57505900514996]
      }
    }
  ]
};

export const TILESTATS_RESPONSE = {
  attribute: 'population',
  avg: 10,
  min: 1,
  max: 20,
  quantiles: [],
  sum: 100,
  type: 'Number'
};

export const MAPS_API_V1_RESPONSE = {
  metadata: {
    tilejson: {
      vector: TILEJSON_RESPONSE
    }
  }
};

function mockFetchMapsV1() {
  const fetch = globalThis.fetch;
  globalThis.fetch = url =>
    Promise.resolve({
      json: () => MAPS_API_V1_RESPONSE,
      ok: true
    });
  return fetch;
}

function mockFetchMapsV2() {
  const fetch = globalThis.fetch;

  globalThis.fetch = url => {
    return Promise.resolve({
      json: () => TILEJSON_RESPONSE,
      ok: true
    });
  };
  return fetch;
}

export function mockFetchMapsV3() {
  const fetch = globalThis.fetch;
  globalThis.fetch = (url, {headers}) => {
    if (url.indexOf('formatTiles=binary') !== -1) {
      headers = {...headers, 'Content-Type': 'application/vnd.carto-vector-tile'};
    }
    return Promise.resolve({
      json: () => {
        if (url.indexOf('format=tilejson') !== -1) {
          return TILEJSON_RESPONSE;
        }
        if (url.indexOf('format=geojson') !== -1) {
          return GEOJSON_RESPONSE;
        }

        if (url.indexOf('tileset') !== -1) {
          return {
            tilejson: {
              url: ['https://xyz.com?format=tilejson&cache=12345678']
            }
          };
        }
        if (url.indexOf('stats') !== -1) {
          return TILESTATS_RESPONSE;
        }
        if (url.indexOf('query') !== -1 || url.indexOf('table')) {
          return {
            tilejson: {
              url: ['https://xyz.com?format=tilejson&cache=12345678']
            },
            geojson: {
              url: ['https://xyz.com?format=geojson&cache=12345678']
            }
          };
        }
        return null;
      },
      arrayBuffer: () => BINARY_TILE,
      text: () => null, // Required to get loaders.gl to use arrayBuffer()
      ok: true,
      url,
      headers: new Headers(headers)
    });
  };
  return fetch;
}

export function restoreFetch(fetch) {
  globalThis.fetch = fetch;
}

export function mockedV1Test(name, testFunc) {
  test(name, async t => {
    const fetchMock = mockFetchMapsV1();
    await testFunc(t);
    restoreFetch(fetchMock);
    t.end();
  });
}

export function mockedV2Test(name, testFunc) {
  test(name, async t => {
    const fetchMock = mockFetchMapsV2();
    setDefaultCredentials({apiVersion: API_VERSIONS.V2});
    await testFunc(t);
    restoreFetch(fetchMock);
    t.end();
  });
}

export function mockedV3Test(name, testFunc) {
  test(name, async t => {
    const fetchMock = mockFetchMapsV3();
    await testFunc(t);
    restoreFetch(fetchMock);
    t.end();
  });
}
