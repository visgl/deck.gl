/* global global, window */

export function mockTileJSON() {
  const _global = typeof global !== 'undefined' ? global : window;
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
}
