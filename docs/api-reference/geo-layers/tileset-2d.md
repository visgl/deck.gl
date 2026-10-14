# Tileset2D

`Tileset2D` manages tile loading and caching for both the new [Tile2DLayer](./tile-2d-layer.md) and the compatibility `TileLayer`. One instance can serve multiple layers and views. It owns [tile headers](./tile-2d-header.md), content, scheduling, cache eviction, `TileSource` metadata, stats, and subscriptions. New layers keep independent selection and visibility state per view.

The previous `_Tileset2D` export is a compatibility alias for this same class. Its `update(viewport)`, `selectedTiles`, `isLoaded`, and `isTileVisible()` APIs retain the legacy default-view behavior. Subclasses retain their tile-index, parent-index, ID, zoom, and metadata hooks.

When only registered consumers use the cache, `selectedTiles` reports their union. `visibleTiles` and stats combine the default view and registered consumers. New consumers never overwrite the default view's `tile.isSelected` or `tile.isVisible` flags.

The consumer cache defaults to a 100-tile high-water mark and evicts unused tiles in LRU order. Selected tiles, including unfinished requests, and visible placeholders are protected. The cache can exceed the high-water mark when every entry is needed. The default-view compatibility path retains its viewport-scaled cache default when no limit is specified.

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
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
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

## Options

| Option | Default | Behavior |
| --- | --- | --- |
| `getTileData` | Returns `null` | Receives `{id, index, bbox, url?, signal?}`; returns content, `null`, or a promise |
| `tileSource` | None | Uses `source.getTileData(loadProps)` instead of `getTileData` |
| `adapter` | `null` | Optional index/bounds adapter; omitted for standard deck.gl viewports |
| `tileSize` | `512` | Source tile size in pixels, used during zoom selection |
| `minZoom`, `maxZoom` | `null` | Requested source zoom bounds; min rounds up, max rounds down |
| `extent` | `null` | Source bounds as `[west, south, east, north]` |
| `maxCacheSize` | `null` | New consumers use a 100-entry high-water mark; legacy default view uses five times its selected count |
| `maxCacheByteSize` | `null` | Optional byte high-water mark; counts finite `content.byteLength` values |
| `maxRequests` | `6` | Concurrency budget across all consumers; nonpositive values disable concurrency throttling |
| `debounceTime` | `0` | Quiet period in milliseconds before queued requests start |
| `zoomOffset` | `0` | Adjustment applied before source-zoom rounding |
| `visibleMinZoom`, `visibleMaxZoom` | `null` | View zoom range where selection and rendering are enabled |
| `refinementStrategy` | `'best-available'` | Placeholder policy described below |
| `zRange` | `null` | Optional elevation bounds for traversal |
| `onTileLoad`, `onTileUnload`, `onTileError` | No-op | Owner callbacks for cache events; layers also subscribe independently |

Byte accounting is an estimate of CPU tile content, not GPU memory. Objects without `byteLength`, including `ImageBitmap` and GeoJSON arrays, contribute zero. Set a count limit when byte sizes are not supplied. Both limits preserve required tiles rather than cause holes in visible coverage.

## TileSource metadata

When created from a loaders.gl `TileSource`, `Tileset2D` calls `getMetadata()` asynchronously and adopts supported `minZoom`, `maxZoom`, and `boundingBox` metadata. Explicit tileset options win over metadata. Replacing the `tileSource` ignores late metadata from the previous source.

```ts
const tileset = Tileset2D.fromTileSource(source, {maxCacheSize: 100});
const layer = new Tile2DLayer({id: 'source-consumer', data: tileset});
```

Only these three metadata fields are mapped. Projection, schema, attribution, and decoder options remain the source/application's responsibility. Metadata resolution invalidates stationary views, so callers do not need to pan to apply new bounds or zoom limits. Subscribe to `onError` to handle asynchronous metadata failures.

## Ownership

An external `Tileset2D` can be passed to one or more `Tile2DLayer` instances. Those layers do not finalize the external tileset. The owner should call `tileset.finalize()` when the shared cache is no longer needed.

## Runtime API

- `tiles`, `selectedTiles`, `visibleTiles`, `loadingTiles`, `unloadedTiles`, and `cacheByteSize` expose current cache state. `unloadedTiles` lists requests that have not settled; it is distinct from the cumulative `Unloaded Tiles` stat.
- `stats` is a `@probe.gl/stats` `Stats` object with tile cache, visibility, loading, eviction, and consumer counters.
- `setOptions()` updates effective tileset options. Pass `{replace: true}` as the second argument to replace prior caller options instead of merging them.
- `reloadAll()` marks required tiles stale and drops unused cached tiles. The compatibility-only default view retains its existing render list until a later traversal rebuilds it, preserving legacy reload rendering.
- `subscribe()` listens for tile load, tile error, tile unload, metadata/config update, metadata error, and stats change events.
- `finalize()` aborts in-flight requests and clears the shared cache.

## Refinement

`'best-available'` shows loaded selected tiles, falling back to the closest loaded ancestor or loaded descendants while a request is pending. `'no-overlap'` suppresses descendants while a visible ancestor covers them. `'never'` shows only directly selected tiles, so gaps may appear during loading.

Custom refinement callbacks receive all cached tiles with mutable `isSelected`, `isVisible`, `state`, `parent`, and `children` flags/links for that consumer. New layers use view-local facades; their changes do not affect another viewport or the legacy default view. Do not mutate content, IDs, or tile metadata in these callbacks.

```ts
tileset.setOptions({
  refinementStrategy: tiles => {
    for (const tile of tiles) tile.isVisible = tile.isSelected && tile.isLoaded;
  }
});
```

## Stats and Subscriptions

`stats` is stable for the tileset's lifetime. Counters are recomputed when selection, requests, cache contents, or consumers change; `onStatsChange` runs only when a counter value changes.

| Stat | Meaning |
| --- | --- |
| `Tiles In Cache` | All retained cache entries, including pending and failed requests |
| `Cache Size` | Sum of finite content byte lengths |
| `Visible Tiles` | Unique union of selected tiles and visible fallbacks across consumers; includes unloaded selected tiles |
| `Selected Tiles` | Unique tiles directly selected across consumers |
| `Loading Tiles` | Entries with an active or queued load |
| `Unloaded Tiles` | Cumulative cache evictions/unloads, not unfinished requests |
| `Consumers` | Registered per-layer/per-view consumers; excludes the compatibility default view |

```ts
const unsubscribe = tileset.subscribe({
  onStatsChange: stats => {
    console.log(stats.get('Visible Tiles').count, stats.get('Tiles In Cache').count);
  },
  onTileError: (error, tile) => console.error(tile.id, error),
  onError: error => console.error('TileSource metadata', error)
});

// Disconnect the observer when its UI or owner is removed.
unsubscribe();
```

`subscribe(listener)` returns an unsubscribe function. Besides stats, listeners support `onTileLoad(tile)`, `onTileUnload(tile)`, `onTileError(error, tile)`, `onUpdate()` for configuration/metadata changes, and `onError(error)` for metadata failures. These callbacks observe the cache once, unlike per-layer callbacks that each observe the same shared event.

## Compatibility and Adapters

Legacy `update(viewport, {zRange, modelMatrix})` drives one default consumer and returns its visibility revision. `selectedTiles`, `isLoaded`, and `isTileVisible(tile, cullRect, modelMatrix)` retain that consumer's behavior. When no legacy update has run, `selectedTiles` instead exposes registered consumers' union; the new layers compute their own loaded state.

Standard applications do not need a custom adapter. `Tileset2DAdapter<ViewStateT>` is useful when a source has a different tile pyramid or an application uses a non-deck view representation. Its `getTileIndices(context)` selects indices, and `getTileBoundingBox(context, index)` supplies geographic or planar bounds. The public `tile2DDeckAdapter` delegates to the same traversal utility as the compatibility layers.

Low-level `attachConsumer(id)`, `updateConsumer(id, selectedTiles, visibleTiles)`, and `detachConsumer(id)` control retention for custom consumers. `getTile(index, true)` starts or reuses a request; `prepareTiles()` synchronizes the tile tree before refinement. Normal `Tile2DLayer` applications must not call these methods themselves.

See the [shared-tileset example](/examples/shared-tile-2d-layer) for ownership, subscriptions, and multiple consumers in one application.
