# Versions and base map integration

## Which deck.gl is current

- deck.gl **9.x** is the current major (9.4 released September 2026). Training data is dominated by
  8.x examples; do not pin `deck.gl@8` unless the project already depends on it. Check
  `npm view deck.gl version` or the installed lockfile instead of assuming.
- deck.gl 9 runs on luma.gl 9 with WebGL 2 and experimental WebGPU. In 9.4 every layer in the
  official layer catalog has a WebGPU path, but `@deck.gl/carto` layers and most extensions do not,
  WebGPU is opt-in via `deviceProps` and is not production ready. See the WebGPU developer guide.
- The umbrella `deck.gl` package re-exports the modules; scoped packages (`@deck.gl/core`,
  `@deck.gl/layers`, `@deck.gl/geo-layers`, `@deck.gl/aggregation-layers`, `@deck.gl/react`,
  `@deck.gl/maplibre`, `@deck.gl/mapbox`, `@deck.gl/google-maps`, `@deck.gl/json`, `@deck.gl/carto`)
  must all be on the same version. `@luma.gl/core` is a peer dependency that must match the deck.gl
  release; do not install other `@luma.gl/*` packages unless a feature needs them, for example
  `@luma.gl/webgpu` when opting into WebGPU with
  `deviceProps: {type: 'webgpu', adapters: [webgpuAdapter]}`.

## v8 to v9 patterns to leave behind

- `new deck.DeckGL({mapLib, mapStyle, ...})` from the 8.x scripting bundle still works in 9.x for
  quick pages, but the recommended integration is an **overlay control** on a base map (below).
- `window.mapboxgl = maplibregl` shims and `@deck.gl/mapbox` with MapLibre are 8.x-era habits.
- `rounded` on `PathLayer`/`TripsLayer` is deprecated: use `capRounded` and `jointRounded`.
- `getColor` on `ScatterplotLayer` is a legacy alias: use `getFillColor` and `getLineColor`.
- Read `docs/upgrade-guide` for the installed major before touching existing code.

## Base map integration

| Base map | Package (9.4+) | Class | Attach |
| --- | --- | --- | --- |
| MapLibre GL JS v4.5.1, v5, v6 | `@deck.gl/maplibre` | `MapLibreOverlay` | `map.addControl(overlay)` |
| MapLibre, any 9.x | `@deck.gl/mapbox` | `MapboxOverlay` | `map.addControl(overlay)`; still supported with MapLibre in 9.4, but `@deck.gl/maplibre` is now the recommended integration |
| Mapbox GL JS | `@deck.gl/mapbox` | `MapboxOverlay` | `map.addControl(overlay)`; needs a Mapbox access token |
| Google Maps | `@deck.gl/google-maps` | `GoogleMapsOverlay` | `overlay.setMap(map)` |
| React | `@deck.gl/react` `DeckGL` + `react-map-gl/maplibre` (or `/mapbox`) | | `<DeckGL><Map/></DeckGL>` |

- `@deck.gl/maplibre` is distributed as ES modules only. Bundled applications must configure the
  MapLibre worker (`setWorkerUrl` from `maplibre-gl` with the bundler's worker URL); direct browser
  ES module imports and the CDN bundle configure it automatically.
- `interleaved: false` (default) draws deck.gl in its own canvas above the base map: simplest,
  most robust. `interleaved: true` renders into the base map's context so 3D layers can sit under
  labels and buildings; then use `beforeId` on layers to slot them below a base map layer.
- Update layers with `overlay.setProps({layers: [...]})`, passing new layer instances.
- Never attach an overlay with `map.addLayer(overlay)`; it is a control, not a style layer.
- There is no `MaplibreLayer` class and no `@deck.gl/maplibre` before 9.4; do not invent names.
- `react-map-gl` v7+ requires the `/maplibre` or `/mapbox` subpath import; the default export
  is gone.

## Token-free basemaps

Prefer these when the project has no provider account:

- CARTO: `https://basemaps.cartocdn.com/gl/positron-gl-style/style.json`,
  `.../dark-matter-gl-style/style.json`, `.../voyager-gl-style/style.json` (append `-nolabels`
  to the style name for label-free variants). In `@deck.gl/carto` they are the `BASEMAP` constants.
- MapLibre demo tiles: `https://demotiles.maplibre.org/style.json` (low detail, fine for tests).
- `mapbox://` style URLs and Mapbox GL JS itself require an access token; do not use them in a
  "no keys" brief.

## CDN bundles

- `https://unpkg.com/deck.gl@<version>/dist.min.js` (also on jsdelivr) exposes everything under
  the global `deck` (`deck.ScatterplotLayer`, `deck.MapLibreOverlay`, `deck.MapboxOverlay`,
  `deck.DeckGL`, `deck.TripsLayer`, ...). Pin an exact, existing version; a non-existent version
  returns an HTML 404 that the browser refuses to execute and the map stays empty.
- deck.gl is not published on cdnjs; MapLibre and Leaflet are. In hosts that only allow cdnjs
  scripts, use jsdelivr if permitted, otherwise say deck.gl cannot load there.
