/* global global, window */
const _global = typeof global !== 'undefined' ? global : window;

const TILEJSON = {
  tilejson: '2.2.0',
  tiles: ['https://xyz.com/{z}/{x}/{y}']
};

const MAPS_API_V1_RESPONSE = {
  metadata: {
    tilejson: {
      vector: TILEJSON
    }
  }
};

export function mockFetchMapsV2() {
  const fetch = _global.fetch;
  _global.fetch = url =>
    Promise.resolve({
      json: () => TILEJSON,
      ok: true
    });
  return fetch;
}

export function mockFetchMapsV1() {
  const fetch = _global.fetch;
  _global.fetch = url =>
    Promise.resolve({
      json: () => MAPS_API_V1_RESPONSE,
      ok: true
    });
  return fetch;
}

export function restoreFetch(fetch) {
  _global.fetch = fetch;
}
