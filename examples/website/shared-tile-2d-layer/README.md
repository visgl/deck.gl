Two `Tile2DLayer`s render the same raster source with original and cool-tinted styling in
synchronized split-screen views. A bottom-right deck.gl minimap follows the right view,
zoomed out two levels. All three views render in one canvas; its DOM frame has no background.

Toggle **Share tile cache** to compare one externally owned `Tileset2D` with two independent
caches. `viewIds` ensures each layer selects only its assigned views. The main views start
with identical cameras and dimensions, so sharing eliminates their duplicate tile requests.
The minimap may select additional zoom levels. Panning either main view synchronizes all views.

Requests, visible entries, cached entries, and loading entries update from tileset subscriptions,
not polling. Counts reset on mode changes. Visible/cached entries are counted once per cache;
the independent mode can therefore count the same source tile twice. Different widths and
cache history affect the exact savings; this is a live comparison, not a benchmark.

### Usage

This example uses the new APIs from this repository branch, not the older published `deck.gl`
version in the template package.json. To run against the current source, install dependencies
and build packages **from the repository root**, then use the local Vite configuration:

```bash
yarn
yarn build
cd examples/website/shared-tile-2d-layer
yarn start-local
```

To build against local packages from the same directory:

```bash
yarn build
```

For a standalone project, use a deck.gl release containing `Tile2DLayer` and `Tileset2D`,
update the package dependency accordingly, and use `vite` without the repository's local
config. Both `start` and `build` in this folder default to local source resolution.
Stable releases predating those APIs cannot
run this example. `renderToDOM` requires a container with a defined height.

## Website and Documentation

The standalone website route is `/examples/shared-tile-2d-layer`. The `Tile2DLayer` API page
embeds the same `App` in a bounded container. The website route disables the app's local
counters so its existing infobox shows the subscription-driven counters once.

The owner finalizes caches when switching modes or unmounting. Evicted `ImageBitmap` content
is closed, subscriptions are disconnected, and cancelled bitmap decodes are disposed.

## Smoke Test

From the repository root:

```bash
yarn test-headless --run test/modules/geo-layers/tile-2d-example.spec.ts
```

The test uses deterministic raster tiles and real WebGL rendering to check both styles,
the minimap, sharing savings, mobile resize, and unmount/remount cleanup without depending
on OpenStreetMap availability.

### Data Source

OpenStreetMap raster tiles from [OpenStreetMap contributors](https://www.openstreetmap.org/copyright).

Network access is required. Failed requests are reported in the controls and in the layer's
default error handler. Respect the [tile usage policy](https://operations.osmfoundation.org/policies/tiles/)
when adapting this example; public OSM tiles are not a bulk-download or offline service.

For more information, check out the
[documentation of Tile2DLayer](../../../docs/api-reference/geo-layers/tile-2d-layer.md).
