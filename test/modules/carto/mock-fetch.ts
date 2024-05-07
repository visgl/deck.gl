/* global Headers */

// See test/modules/carto/responseToJson for details for creating test data
import binaryTileData from './data/binaryTile.json';
const BINARY_TILE = new Uint8Array(binaryTileData).buffer;

const fetch = globalThis.fetch;
type MockFetchCall = {
  url: string;
  headers: Record<string, unknown>;
  method?: 'GET' | 'POST';
  body?: string;
};

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

const createDefaultResponse = (
  url: string,
  headers: HeadersInit,
  cacheKey?: string
): Promise<unknown> => {
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
            url: [`https://xyz.com?format=tilejson&cache=${cacheKey}`]
          }
        };
      }
      if (url.indexOf('stats') !== -1) {
        return TILESTATS_RESPONSE;
      }
      if (url.indexOf('query') !== -1 || url.indexOf('table')) {
        return {
          tilejson: {
            url: [`https://xyz.com?format=tilejson&cache=${cacheKey}`]
          },
          geojson: {
            url: [`https://xyz.com?format=geojson&cache=${cacheKey}`]
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

async function setupMockFetchMapsV3(
  responseFunc = createDefaultResponse,
  cacheKey = btoa(Math.random().toFixed(4))
): Promise<MockFetchCall[]> {
  const calls: MockFetchCall[] = [];

  const mockFetch = (url: string, {headers, method, body}) => {
    calls.push({url, headers, method, body});
    if (url.indexOf('formatTiles=binary') !== -1) {
      headers = {...headers, 'Content-Type': 'application/vnd.carto-vector-tile'};
    }
    return responseFunc(url, headers, cacheKey);
  };

  globalThis.fetch = mockFetch as unknown as typeof fetch;

  return calls;
}

function teardownMockFetchMaps() {
  globalThis.fetch = fetch;
}

export async function withMockFetchMapsV3(
  testFunc: (calls: MockFetchCall[]) => Promise<void>,
  responseFunc: (
    url: string,
    headers: HeadersInit,
    cacheKey?: string
  ) => Promise<unknown> = createDefaultResponse
): Promise<void> {
  try {
    const calls = await setupMockFetchMapsV3(responseFunc);
    await testFunc(calls);
  } finally {
    teardownMockFetchMaps();
  }
}
