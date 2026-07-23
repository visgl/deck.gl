# SharedTile2DLayer (Experimental)

`_SharedTile2DLayer` is an experimental composite layer for rendering 2D tiled data when multiple layer instances or viewports should reuse one tile-content cache. It is a parallel API to [`TileLayer`](./tile-layer.md), not a replacement for `TileLayer`, `MVTLayer`, or `TerrainLayer`.

Use `_SharedTile2DLayer` when the same tiled payload should feed multiple views, such as a main map and minimap. The layer keeps selection and visibility state per viewport, while [`_SharedTileset2D`](./shared-tileset-2d.md) owns loading, request scheduling, cache eviction, stats, and TileSource metadata.

```ts
import {Deck, MapView} from '@deck.gl/core';
import {BitmapLayer} from '@deck.gl/layers';
import {
  _SharedTile2DLayer as SharedTile2DLayer,
  _SharedTileset2D as SharedTileset2D,
  sharedTile2DDeckAdapter
} from '@deck.gl/geo-layers';

const tileset = new SharedTileset2D<ImageBitmap>({
  adapter: sharedTile2DDeckAdapter,
  minZoom: 0,
  maxZoom: 19,
  getTileData: async ({index, signal}) => {
    const {x, y, z} = index;
    const response = await fetch(`https://tile.openstreetmap.org/${z}/${x}/${y}.png`, {signal});
    return createImageBitmap(await response.blob());
  }
});

const layer = new SharedTile2DLayer<ImageBitmap>({
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
import {_SharedTile2DLayer as SharedTile2DLayer} from '@deck.gl/geo-layers';
import type {SharedTile2DLayerPickingInfo, SharedTile2DLayerProps} from '@deck.gl/geo-layers';

new SharedTile2DLayer<TileDataT>(...props: SharedTile2DLayerProps<TileDataT>[]);
```

## Properties

Inherits all properties from base [`Layer`](../core/layer.md). If using the default `renderSubLayers`, supports all [`GeoJSONLayer`](../layers/geojson-layer.md) properties.

### `data` (string | string[] | `_SharedTileset2D` | TileSource, optional) {#data}

- Default: `[]`

Accepts the same URL-template input as [`TileLayer`](./tile-layer.md#data), a loaders.gl `TileSource`, or an external `_SharedTileset2D`.

When `data` is a URL template, the layer creates and owns an internal tileset. When `data` is a `TileSource`, the internal tileset uses `TileSource.getTileData()` and adopts supported metadata such as `minZoom`, `maxZoom`, and `boundingBox` unless the layer explicitly overrides those props. When `data` is an external `_SharedTileset2D`, the caller owns and finalizes that tileset.

### `getTileData` (Function, optional) {#gettiledata}

Called for URL-template data with the same tile load props documented by [`TileLayer`](./tile-layer.md#gettiledata). This prop is ignored when `data` is a `TileSource` or external `_SharedTileset2D`.

### `renderSubLayers` (Function, optional) {#rendersublayers}

Receives the loaded tile payload as `props.data` and the shared tile header as `props.tile`. Return one layer, an array of layers, or `null`.

### Tile options

Owned tilesets accept the same core tile options as `TileLayer`: `extent`, `tileSize`, `maxZoom`, `minZoom`, `maxCacheSize`, `maxCacheByteSize`, `zRange`, `maxRequests`, `debounceTime`, `zoomOffset`, `visibleMinZoom`, and `visibleMaxZoom`.

`refinementStrategy` is intentionally narrower than `TileLayer`: supported values are `'best-available'`, `'no-overlap'`, and `'never'`. Custom refinement callbacks are not supported because tile visibility is view-specific in a shared cache.

### Callbacks

`onViewportLoad`, `onTileLoad`, `onTileUnload`, and `onTileError` follow the `TileLayer` callback shape, using `_SharedTile2DHeader` tile objects.

## Picking

Use `SharedTile2DLayerPickingInfo` for typed picking callbacks. It includes `tile`, `sourceTile`, and `sourceTileSubLayer`, matching `TileLayerPickingInfo`.
