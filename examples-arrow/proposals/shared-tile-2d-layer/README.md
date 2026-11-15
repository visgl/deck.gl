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

Run the example from a deck.gl source checkout. From the repository root:

```bash
yarn
yarn build
yarn build-private
yarn --cwd examples/proposals/shared-tile-2d-layer start-local
```

To build the example, run `yarn build-private-examples shared-tile-2d-layer`.
`renderToDOM` requires a container with a defined height.

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
[documentation of Tile2DLayer](../../../docs/api-reference/proposals/tile-2d-layer.md).
