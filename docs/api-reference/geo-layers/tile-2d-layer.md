# Tile2DLayer

import {Tile2DLayerDemo} from '@site/src/doc-demos/shared-tile-2d-layer';

<Tile2DLayerDemo />

`Tile2DLayer` is the tile layer API for new applications. It renders tiled content with independent selection and visibility per view, while multiple layers can reuse the same `Tileset2D`. The existing [`TileLayer`](./tile-layer.md) remains available for compatibility with existing applications and subclasses.

Use `Tile2DLayer` when the same tiled payload should feed multiple views, such as a main map and minimap. The layer keeps selection and visibility state per viewport, while [`Tileset2D`](./tileset-2d.md) owns loading, request scheduling, cache eviction, stats, and TileSource metadata.

The inline demo uses two styled layers and three synchronized views. Toggle **Share tile cache** to compare one tileset with two independently owned caches. [Open the full example](/examples/shared-tile-2d-layer) or [browse its source](https://github.com/visgl/deck.gl/tree/master/examples/website/shared-tile-2d-layer). Counts reset on each toggle; visible and cached entries are counted once per cache, not once per view.

```ts
import {Deck, MapView} from '@deck.gl/core';
import {BitmapLayer} from '@deck.gl/layers';
import {
  Tile2DLayer,
  Tileset2D,
  tile2DDeckAdapter
} from '@deck.gl/geo-layers';

const tileset = new Tileset2D<ImageBitmap>({
  adapter: tile2DDeckAdapter,
  minZoom: 0,
  maxZoom: 19,
  getTileData: async ({index, signal}) => {
    const {x, y, z} = index;
    const response = await fetch(`https://tile.openstreetmap.org/${z}/${x}/${y}.png`, {signal});
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return createImageBitmap(await response.blob());
  }
});

const layer = new Tile2DLayer<ImageBitmap>({
  id: 'shared-raster-tiles',
  data: tileset,
  renderSubLayers: props => {
    const [[west, south], [east, north]] = props.tile.boundingBox;
    return new BitmapLayer(props, {
      data: null,
      image: props.data,
      bounds: [west, south, east, north]
    });
  }
});

new Deck({
  views: [
    new MapView({id: 'main', controller: true}),
    new MapView({id: 'minimap', x: 16, y: 16, width: 240, height: 160})
  ],
  initialViewState: {longitude: -122.4, latitude: 37.74, zoom: 11},
  layers: [layer]
});
```

## Installation

```bash
npm install deck.gl
# or
npm install @deck.gl/core @deck.gl/layers @deck.gl/geo-layers
```

```ts
import {Tile2DLayer} from '@deck.gl/geo-layers';
import type {Tile2DLayerPickingInfo, Tile2DLayerProps} from '@deck.gl/geo-layers';

new Tile2DLayer<TileDataT>(...props: Tile2DLayerProps<TileDataT>[]);
```

## Properties

Inherits all properties from base [`Layer`](../core/layer.md). If using the default `renderSubLayers`, supports all [`GeoJSONLayer`](../layers/geojson-layer.md) properties.

### `data` (string | string[] | `Tileset2D` | TileSource, optional) {#data}

- Default: `null`

Accepts the same URL-template input as [`TileLayer`](./tile-layer.md#data), a loaders.gl `TileSource`, or an external `Tileset2D`.

When `data` is a URL template, the layer creates and owns an internal tileset. When `data` is a `TileSource`, the internal tileset uses `TileSource.getTileData()` and adopts supported metadata such as `minZoom`, `maxZoom`, and `boundingBox`. Non-default layer options override that metadata. To override metadata with a default-valued option such as `minZoom: 0` or `extent: null`, pass it explicitly to `Tileset2D.fromTileSource()` and use the resulting external tileset. When `data` is an external `Tileset2D`, the caller owns and finalizes it.

Passing the same `TileSource` to two layers creates **two caches**. To share both loading and content, create one `Tileset2D.fromTileSource(source)` and pass that tileset to both layers.

### `viewIds` (string[] | null, optional) {#viewids}

- Default: `null` (all active views)

Restricts both traversal and rendering to the listed [`View.id`](../core/view.md#id) values. Removing a view or changing this list releases that consumer's selection and cache pins. Use this for differently styled layers assigned to different views:

```ts
const renderSubLayers = layer.props.renderSubLayers;
const original = new Tile2DLayer({
  id: 'original', data: tileset, viewIds: ['left'], renderSubLayers
});
const tinted = new Tile2DLayer({
  id: 'tinted', data: tileset, viewIds: ['right', 'minimap'], renderSubLayers
});
```

`Deck.layerFilter` still controls rendering, but does not restrict tile selection. Use `viewIds` when a layer should not load or retain tiles for other views. An empty array disables this layer in all views.

### `getTileData` (Function, optional) {#gettiledata}

Called for URL-template data with the same tile load props documented by [`TileLayer`](./tile-layer.md#gettiledata). Import `TileLoadProps` for a typed callback parameter; `_TileLoadProps` remains a deprecated compatibility alias. This prop is ignored when `data` is a `TileSource` or external `Tileset2D`.

### `renderSubLayers` (Function, optional) {#rendersublayers}

Receives the loaded tile payload as `props.data` and the shared tile header as `props.tile`. Return one layer, an array of layers, or `null`.

### Tile options

Owned tilesets accept the same core tile options as `TileLayer`: `extent`, `tileSize`, `maxZoom`, `minZoom`, `maxCacheSize`, `maxCacheByteSize`, `zRange`, `maxRequests`, `debounceTime`, `zoomOffset`, `visibleMinZoom`, and `visibleMaxZoom`.

`refinementStrategy` supports `'best-available'`, `'no-overlap'`, `'never'`, and custom callbacks. Callbacks receive view-local tile facades: changes to `isVisible` affect only that view, while content and load state come from the common cache.

### Callbacks

`onViewportLoad(tiles, viewport)` fires independently for each enabled view when its selected requests have settled, or its loaded visible selection changes. `viewport.id` identifies that consumer, including when two views select identical tiles. Existing one-argument callbacks continue to work. It does not wait for the other views. Failed requests count as settled; inspect `tile.content` to distinguish missing content. An unchanged loaded view does not emit the callback repeatedly.

`onTileLoad(tile)`, `onTileUnload(tile)`, and `onTileError(error, tile)` observe the shared cache. Each subscribed layer receives these events, including loads requested by other consumers. Keep source-level counters on the tileset rather than summing layer callbacks, which would double-count shared work. The default `onTileError` logs to the console.

### `TilesetClass` (Constructor, optional) {#tilesetclass}

- Default: `Tileset2D`

Custom `Tileset2D` subclass used for layer-owned URL-template and TileSource caches. Ignored when `data` is already a tileset. Tile-index, parent-index, ID, zoom, and metadata hooks remain available for custom pyramids.

## Ownership and Updates

Keep externally owned tilesets stable across React renders and layer reconstruction. Style/accessor updates invalidate only this layer's rendered sublayers. They do not reload shared content. `getTileData` update triggers affect layer-owned caches only; use `tileset.reloadAll()` to reload an externally owned cache for every consumer.

Configure source zoom bounds, refinement, cache size, and request limits on an external tileset, not on its layers. Layers never replace those settings. `viewIds`, `modelMatrix`, and `zRange` remain layer-local traversal settings. Do not share a tileset between incompatible decoders, coordinate conventions, or authentication/load options.

Removing a layer detaches only its consumers. The owner must call `tileset.finalize()` after all consumers are removed. Dispose source-specific resources, such as `ImageBitmap.close()`, in the owner's unload and teardown handling; finalizing the tileset aborts requests but does not dispose application content.

## Migration

For the common URL-template path, change the import and constructor from `TileLayer` to `Tile2DLayer`. `renderSubLayers`, tile callbacks, tile-index hooks, and picking fields retain their familiar shapes. New layers never write sublayers into `tile.layers`; subclasses should use the layer-local rendering hooks rather than mutate shared headers.

Use the compatibility `TileLayer` for existing subclasses that depend on its internal render cache or default-view flags. A tileset's `tile.isSelected` and `tile.isVisible` describe only its legacy default view, not the new per-view consumers. Use tileset stats to inspect the union across consumers.

## Picking

Use `Tile2DLayerPickingInfo` for typed picking callbacks. It includes `tile`, `sourceTile`, and `sourceTileSubLayer`, matching `TileLayerPickingInfo`.
