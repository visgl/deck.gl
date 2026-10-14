# Tileset2D

`Tileset2D` manages tile loading and caching for both the new [Tile2DLayer](./tile-2d-layer.md) and the compatibility `TileLayer`. One instance can serve multiple layers and views. It owns tile headers, content, scheduling, cache eviction, `TileSource` metadata, stats, and subscriptions. New layers keep independent selection and visibility state per view.

The previous `_Tileset2D` export is a compatibility alias for this same class. Its `update(viewport)`, `selectedTiles`, `isLoaded`, and `isTileVisible()` APIs retain the legacy default-view behavior. Subclasses retain their tile-index, parent-index, ID, zoom, and metadata hooks.

When only registered consumers use the cache, `selectedTiles` reports their union. `visibleTiles` and stats combine the default view and registered consumers. New consumers never overwrite the default view's `tile.isSelected` or `tile.isVisible` flags.

The consumer cache defaults to a 100-tile high-water mark and evicts unused tiles in LRU order. The default-view compatibility path retains its viewport-scaled cache default when no limit is specified.

An adapter maps a viewport to the tile indices and geographic bounds it covers. The cache itself stays independent of deck.gl views. Use `tile2DDeckAdapter` for standard deck.gl viewports; custom adapters can traverse a different tile scheme or view representation. Shared layers install the standard adapter automatically.

```ts
import {
  Tileset2D,
  tile2DDeckAdapter
} from '@deck.gl/geo-layers';
import type {Tileset2DProps} from '@deck.gl/geo-layers';

const props: Tileset2DProps<ImageBitmap> = {
  adapter: tile2DDeckAdapter,
  getTileData: async ({index, signal}) => {
    const {x, y, z} = index;
    const response = await fetch(`https://tile.openstreetmap.org/${z}/${x}/${y}.png`, {signal});
    return createImageBitmap(await response.blob());
  }
};

const tileset = new Tileset2D(props);
```

## Construction

```ts
import {Tileset2D} from '@deck.gl/geo-layers';
import type {
  RefinementStrategy,
  Tileset2DAdapter,
  Tileset2DProps,
  Tileset2DTileContext,
  Tileset2DTraversalContext
} from '@deck.gl/geo-layers';

new Tileset2D<TileDataT, ViewStateT>(props: Tileset2DProps<TileDataT, ViewStateT>);
Tileset2D.fromTileSource<TileDataT>(tileSource, props);
```

Provide either `getTileData` or `tileSource`. Standard deck.gl viewports work without an adapter. `Tile2DLayer` installs `tile2DDeckAdapter` automatically; custom view representations require a custom adapter.

## TileSource metadata

When created from a loaders.gl `TileSource`, `Tileset2D` calls `getMetadata()` asynchronously and adopts supported `minZoom`, `maxZoom`, and `boundingBox` metadata. Explicit tileset options win over metadata. Replacing the `tileSource` ignores late metadata from the previous source.

## Ownership

An external `Tileset2D` can be passed to one or more `Tile2DLayer` instances. Those layers do not finalize the external tileset. The owner should call `tileset.finalize()` when the shared cache is no longer needed.

## Runtime API

- `tiles`, `selectedTiles`, `visibleTiles`, `loadingTiles`, and `cacheByteSize` expose current shared cache state.
- `stats` is a `@probe.gl/stats` `Stats` object with tile cache, visibility, loading, eviction, and consumer counters.
- `setOptions()` updates effective tileset options. Pass `{replace: true}` as the second argument to replace prior caller options instead of merging them.
- `reloadAll()` marks required tiles stale and drops unused cached tiles. The compatibility-only default view retains its existing render list until a later traversal rebuilds it, preserving legacy reload rendering.
- `subscribe()` listens for tile load, tile error, tile unload, metadata/config update, metadata error, and stats change events.
- `finalize()` aborts in-flight requests and clears the shared cache.

## Refinement

`RefinementStrategy` supports `'best-available'`, `'no-overlap'`, and `'never'`. Custom refinement callbacks run against view-local tile facades so one viewport's visibility changes do not affect another viewport.
