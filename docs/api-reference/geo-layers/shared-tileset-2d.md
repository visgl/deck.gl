# SharedTileset2D (Experimental)

`_SharedTileset2D` is the experimental shared tile-content cache used by [`_SharedTile2DLayer`](./shared-tile-2d-layer.md). It owns tile headers, tile payloads, request scheduling, cache eviction, loaders.gl `TileSource` metadata, live stats, and lifecycle subscriptions. Per-viewport selection and visibility are intentionally owned by the layer's internal views instead of the tileset.

```ts
import {
  _SharedTileset2D as SharedTileset2D,
  sharedTile2DDeckAdapter
} from '@deck.gl/geo-layers';
import type {SharedTileset2DProps} from '@deck.gl/geo-layers';

const props: SharedTileset2DProps<ImageBitmap> = {
  adapter: sharedTile2DDeckAdapter,
  getTileData: async ({index, signal}) => {
    const {x, y, z} = index;
    const response = await fetch(`https://tile.openstreetmap.org/${z}/${x}/${y}.png`, {signal});
    return createImageBitmap(await response.blob());
  }
};

const tileset = new SharedTileset2D(props);
```

## Construction

```ts
import {_SharedTileset2D as SharedTileset2D} from '@deck.gl/geo-layers';
import type {
  SharedRefinementStrategy,
  SharedTileset2DAdapter,
  SharedTileset2DBaseProps,
  SharedTileset2DProps,
  SharedTileset2DTileContext,
  SharedTileset2DTraversalContext
} from '@deck.gl/geo-layers';

new SharedTileset2D<TileDataT, ViewStateT>(props: SharedTileset2DProps<TileDataT, ViewStateT>);
SharedTileset2D.fromTileSource<TileDataT>(tileSource, props);
```

Provide either `getTileData` or `tileSource`. A shared tileset also needs an adapter before traversal is used. `_SharedTile2DLayer` installs `sharedTile2DDeckAdapter` automatically for deck.gl viewport traversal; applications constructing the tileset directly should usually pass that adapter themselves.

## TileSource metadata

When created from a loaders.gl `TileSource`, `_SharedTileset2D` calls `getMetadata()` asynchronously and adopts supported `minZoom`, `maxZoom`, and `boundingBox` metadata. Explicit tileset options win over metadata. Replacing the `tileSource` ignores late metadata from the previous source.

## Ownership

An external `_SharedTileset2D` can be passed to one or more `_SharedTile2DLayer` instances. Those layers do not finalize the external tileset. The owner should call `tileset.finalize()` when the shared cache is no longer needed.

## Runtime API

- `tiles`, `selectedTiles`, `visibleTiles`, `loadingTiles`, and `cacheByteSize` expose current shared cache state.
- `stats` is a `@probe.gl/stats` `Stats` object with tile cache, visibility, loading, eviction, and consumer counters.
- `setOptions()` updates effective tileset options. Pass `{replace: true}` as the second argument to replace prior caller options instead of merging them.
- `reloadAll()` marks selected tiles stale and drops unselected cached tiles.
- `subscribe()` listens for tile load, tile error, tile unload, metadata/config update, metadata error, and stats change events.
- `finalize()` aborts in-flight requests and clears the shared cache.

## Refinement

`SharedRefinementStrategy` supports `'best-available'`, `'no-overlap'`, and `'never'`. Unlike `TileLayer`, `_SharedTileset2D` does not accept a custom refinement callback because one tile header may be selected or visible in one viewport and hidden in another.
