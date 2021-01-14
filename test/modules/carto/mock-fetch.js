/* global global, window */
const _global = typeof global !== 'undefined' ? global : window;

export function mockFetchWithTileJSON() {
  const fetch = _global.fetch;
  _global.fetch = url =>
    Promise.resolve({
      json: () => {
        return {
          tilejson: '2.2.0',
          tiles: ['https://xyz.com/{z}/{x}/{y}']
        };
      },
      ok: true
    });
  return fetch;
}

export function restoreFetch(fetch) {
  _global.fetch = fetch;
}
