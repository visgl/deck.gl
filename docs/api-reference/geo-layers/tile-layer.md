# TileLayer

import {TileLayerDemo} from '@site/src/doc-demos/geo-layers';

<TileLayerDemo />

The `TileLayer` is a composite layer that makes it possible to visualize very large datasets. Instead of fetching the entire dataset, it only loads and renders what's visible in the current viewport.

To use this layer, the data must be sliced into "tiles". Each tile has a pre-defined bounding box and level of detail.
Users have the option to load each tile from a unique URL, defined by a template in the `data` property.
The layer can also supply a callback `getTileData` that does custom fetching when a tile is requested.
The loaded tile data is then rendered with the layer(s) returned by `renderSubLayers`.

```js
import DeckGL from '@deck.gl/react';
import {BitmapLayer} from '@deck.gl/layers';
import {TileLayer} from '@deck.gl/geo-layers';

function App({viewState}) {
  const layer = new TileLayer({
    // https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#Tile_servers
    data: 'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png',

    minZoom: 0,
    maxZoom: 19,
    tileSize: 256,

    renderSubLayers: props => {
      const {
        bbox: {west, south, east, north}
      } = props.tile;

      return new BitmapLayer(props, {
        data: null,
        image: props.data,
        bounds: [west, south, east, north]
      });
    }
  });

  return <DeckGL viewState={viewState} layers={[layer]} />;
}
```


## Installation

To install the dependencies from NPM:

```bash
npm install deck.gl
# or
npm install @deck.gl/core @deck.gl/layers @deck.gl/geo-layers
```

```js
import {TileLayer} from '@deck.gl/geo-layers';
new TileLayer({});
```

To use pre-bundled scripts:

```html
<script src="https://unpkg.com/deck.gl@^8.0.0/dist.min.js"></script>
<!-- or -->
<script src="https://unpkg.com/@deck.gl/core@^8.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/layers@^8.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/geo-layers@^8.0.0/dist.min.js"></script>
```

```js
new deck.TileLayer({});
```

## Indexing System

At each integer zoom level (`z`), the XY plane in the view space is divided into square tiles of the same size, each uniquely identified by their `x` and `y` index. When `z` increases by 1, the view space is scaled by 2, meaning that one tile at `z` covers the same area as four tiles at `z+1`.

When the `TileLayer` is used with a geospatial view such as the [MapView](../core/map-view.md), x, y, and z are determined from [the OSM tile index](https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames).

When the `TileLayer` is used with a non-geospatial view such as the [OrthographicView](../core/orthographic-view.md) or the [OrbitView](../core/orbit-view.md), `x` and `y` increment from the world origin, and each tile's width and height match that defined by the `tileSize` prop. For example, the tile `x: 0, y: 0` occupies the square between `[0, 0]` and `[tileSize, tileSize]`.

If you need to offset the `z` level at which the tiles are fetched in order to fetch tiles at a higher resolution in order to produce a "crisper" picture, there is a `zoomOffset` prop.


## Properties

Inherits all properties from [base `Layer`](../core/layer.md).

If using the default `renderSubLayers`, supports all [`GeoJSONLayer`](../layers/geojson-layer.md) properties to style features.

### Data Options

##### `data` (String|Array, optional) {#data}

- Default: `[]`

Either a URL template or an array of URL templates from which the tile data should be loaded.

If the value is a string: a URL template. Substrings `{x}` `{y}` and `{z}`, if present, will be replaced with a tile's actual index when it is requested.

If the value is an array: multiple URL templates. Each endpoint must return the same content for the same tile index. This can be used to work around [domain sharding](https://developer.mozilla.org/en-US/docs/Glossary/Domain_sharding), allowing browsers to download more resources simultaneously. Requests made are balanced among the endpoints, based on the tile index.


##### `getTileData` (Function, optional) {#gettiledata}

- Default: `tile => load(tile.url)`

If supplied, `getTileData` is called to retrieve the data of each tile. It receives one argument `tile` which contains the following fields:

- `index` (Object) - index of the tile. `index` is in the shape of `{x, y, z}`, corresponding to the integer values specifying the tile.
- `id` (String) - unique string representation of index.
- `url` (String) - resolved url of the tile if the `data` prop is provided, otherwise `null`
- `bbox` (Object) - bounding box of the tile. When used with a geospatial view, `bbox` is in the shape of `{west: <longitude>, north: <latitude>, east: <longitude>, south: <latitude>}`. When used with a non-geospatial view, `bbox` is in the shape of `{left, top, right, bottom}`.
- `signal` (Object) - an [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) that may be signalled if there are too many queued requests. Note: only tiles that aren't visible will be aborted.

It should return either the tile data or a Promise that resolves to the tile data.

This prop is not required if `data` points to a supported format (JSON or image by default). Additional formats may be added by registering [loaders.gl](https://loaders.gl/modules/core/docs/api-reference/register-loaders) modules.

It is recommended to pass `signal` to any `fetch` calls and check its `aborted` property before doing any expensive computation. If `signal` is aborted, then throw or return falsy from `getTileData` so the data is not cached; do not return incomplete data. If `signal` is aborted, but `getTileData` still returns a truthy response, then its data will be cached.

```js
const {signal} = tile;
const data = fetch(url, {signal});

if (signal.aborted) {
   return null;
}
// Expensive computation on returned data
```

##### `TilesetClass` (class, optional) {#tilesetclass}

- Default: `Tileset2D`

Tileset class that `TileLayer` uses for tile indexing. Extend [Tileset2D](#tileset2d) to implement a custom indexing scheme.

##### `tileSize` (Number, optional) {#tilesize}

The pixel dimension of the tiles, usually a power of 2.

For geospatial viewports, tile size represents the target pixel width and height of each tile when rendered. Smaller tile sizes display the content at higher resolution, while the layer needs to load more tiles to fill the same viewport.

For non-geospatial viewports, the tile size should correspond to the true pixel size of the tiles.

- Default: `512`

##### `zoomOffset` (Number, optional) {#zoomoffset}

This offset changes the zoom level at which the tiles are fetched.  Needs to be an integer.

- Default: `0`

##### `maxZoom` (Number|Null, optional) {#maxzoom}

The max zoom level of the layer's data. When overzoomed (i.e. `zoom > maxZoom`), tiles from this level will be displayed.

- Default: `null`

##### `minZoom` (Number, optional) {#minzoom}

The min zoom level of the layer's data. When underzoomed (i.e. `zoom < minZoom`), the layer will not display any tiles unless `extent` is defined, to avoid issuing too many tile requests.

- Default: 0

##### `extent` (Array, optional) {#extent}

The bounding box of the layer's data, in the form of `[minX, minY, maxX, maxY]`. If provided, the layer will only load and render the tiles that are needed to fill this box. 

- Default: `null`


##### `maxCacheSize` (Number, optional) {#maxcachesize}

The maximum number of tiles that can be cached. The tile cache keeps loaded tiles in memory even if they are no longer visible. It reduces the need to re-download the same data over and over again when the user pan/zooms around the map, providing a smoother experience.

If not supplied, the `maxCacheSize` is calculated as `5` times the number of tiles in the current viewport.

- Default: `null`


##### `maxCacheByteSize` (Number, optional) {#maxcachebytesize}

The maximum memory used for caching tiles. If this limit is supplied, `getTileData` must return an object that contains a `byteLength` field.

- Default: `null`


##### `refinementStrategy` (String|Function, optional) {#refinementstrategy}

How the tile layer refines the visibility of tiles. When zooming in and out, if the layer only shows tiles from the current zoom level, then the user may observe undesirable flashing while new data is loading. By setting `refinementStrategy` the layer can attempt to maintain visual continuity by displaying cached data from a different zoom level before data is available.

This prop accepts one of the following:

* `'best-available'`: If a tile in the current viewport is waiting for its data to load, use cached content from the closest zoom level to fill the empty space. This approach minimizes the visual flashing due to missing content.
* `'no-overlap'`: Avoid showing overlapping tiles when backfilling with cached content. This is usually favorable when tiles do not have opaque backgrounds.
* `'never'`: Do not display any tile that is not selected.
* A custom function. See "custom strategy" below.

- Default: `'best-available'`

##### custom strategy

Apps may define a custom `refinementStrategy` by supplying its own callback function. The function will be called frequently on every viewport update and every tile loaded event.

When called, the function receives an array of [Tile](#tile) instances representing every tile that is currently in the cache. It is an opportunity to manipulate `tile.isVisible` before sub layers are rendered. `isVisible` is initially set to the value of `isSelected` (equivalent to `refinementStrategy: 'never'`).

##### `maxRequests` (Number, optional) {#maxrequests}

The maximum number of concurrent `getTileData` calls.

If `<= 0`, no throttling will occur, and `getTileData` may be called an unlimited number of times concurrently regardless of how long that tile is or was visible.

If `> 0`, a maximum of `maxRequests` instances of `getTileData` will be called concurrently. Requests may never be called if the tile wasn't visible long enough to be scheduled and started. Requests may also be aborted (through the `signal` passed to `getTileData`) if there are more than `maxRequests` ongoing requests and some of those are for tiles that are no longer visible.

If `getTileData` makes `fetch` requests against an HTTP 1 web server, then `maxRequests` should correlate to the browser's maximum number of concurrent `fetch` requests. For Chrome, the max is 6 per domain. If you use the `data` prop and specify multiple domains, you can increase this limit. For example, with Chrome and 3 domains specified, you can set `maxRequests=18`.

If the web server supports HTTP/2 (Open Chrome dev tools and look for "h2" in the Protocol column), then you can make an unlimited number of concurrent requests (and can set `maxRequests=-1`). Note that this will request data for every tile, no matter how long the tile was visible, and may increase server load.

- Default: `6`

### Render Options

##### `renderSubLayers` (Function, optional) {#rendersublayers}

Renders one or an array of Layer instances with all the `TileLayer` props and the following props:

* `id`: An unique id for this sublayer
* `data`: Resolved from `getTileData`. As of deck.gl 8.2, this prop is always the data resolved from the Promise and is never a Promise itself.
* `tile`: An object containing `index`, `bbox`, and `id` of the tile.

- Default: `props => new GeoJsonLayer(props)`

Note that the following sub layer props are overridden by `TileLayer` internally:

- `visible` (toggled based on tile visibility)
- `highlightedObjectIndex` (set based on the parent layer's highlight state)

##### `zRange` (Array, optional) {#zrange}

An array representing the height range of the content in the tiles, as `[minZ, maxZ]`. This is designed to support tiles with 2.5D content, such as buildings or terrains. At high pitch angles, such a tile may "extrude into" the viewport even if its 2D bounding box is out of view. Therefore, it is necesary to provide additional information for the layer to behave correctly. The value of this prop is used for two purposes: 1) to determine the necesary tiles to load and/or render; 2) to determine the possible intersecting tiles during picking.

This prop currently only has effect when used with a geospatial view.

- Default: `null` (interpreted as `[0, 0]`)

##### `modelMatrix` (Matrix4, optional) {#modelmatrix}

Affects both rendering and tile fetching to produce a transformed tile layer.  Note that this can result in tiles being fetched outside the `extent` prop, for example if the `modelMatrix` defines a rotation.

- Default: `null`

### Callbacks

##### `onViewportLoad` (Function, optional) {#onviewportload}

`onViewportLoad` is a function that is called when all tiles in the current viewport are loaded. An array of loaded [Tile](#tile) instances are passed as argument to this function


- Default: `data => null`


##### `onTileLoad` (Function, optional) {#ontileload}

`onTileLoad` called when a tile successfully loads.

- Default: `() => {}`

Receives arguments:

- `tile` (Object) - the [tile](#tile) that has been loaded.

##### `onTileError` (Function, optional) {#ontileerror}

`onTileError` called when a tile failed to load.

- Default: `console.error`

Receives arguments:

- `error` (`Error`)

##### `onTileUnload` (Function, optional) {#ontileunload}

`onTileUnload` called when a tile is cleared from cache.

- Default: `() => {}`

Receives arguments:

- `tile` (Object) - the [tile](#tile) that has been cleared from cache.

## Tile

Class to hold the reading of a single tile

Properties:

- `index` (Object) - index of the tile. `index` is in the shape of `{x, y, z}`, corresponding to the integer values specifying the tile.
- `id` (String) - unique string representation of index, as 'x-y-z', e.g. '0-2-3'.
- `bbox` (Object) - bounding box of the tile. When used with a geospatial view, `bbox` is in the shape of `{west: <longitude>, north: <latitude>, east: <longitude>, south: <latitude>}`. When used with a non-geospatial view, `bbox` is in the shape of `{left, top, right, bottom}`.
- `content` (Object) - the tile's cached content. `null` if the tile's initial load is pending, cancelled, or encountered an error.
- `data` (Object|Promise) - the tile's requested content. If the tile is loading, returns a Promise that resolves to the loaded content when loading is completed.
- `parent` (Tile) - the nearest ancestor tile (a tile on a lower `z` that contains this tile), if present in the cache
- `children` (Tile[]) - the nearest sub tiles (tiles on higher `z` that are contained by this tile), if present in the cache
- `isSelected` (Boolean) - if the tile is expected to show up in the current viewport
- `isVisible` (Boolean) - if the tile should be rendered
- `isLoaded` (Boolean) - if the content of the tile has been loaded

## Tileset2D

Class that manages loading and purging of tile data. This class caches recently visited tiles and only creates new tiles if they are present.

To implement a custom indexing scheme, extend `Tileset2D` and implement the following interface:

- `getTileIndices({viewport, maxZoom, minZoom, zRange, modelMatrix, modelMatrixInverse})` - returns an array of indices in the given viewport. The indices should have the shape of Objects, like `{q: '0123'}`, to allow referencing in the URL template supplied to the `data` prop.
- `getTileId(index)` - returns unique string key for a tile index.
- `getParentIndex(index)` - returns the index of the parent tile.
- `getTileZoom(index)` - returns a zoom level for a tile index.
- `getTileMetadata(index)` - returns additional metadata to add to tile.  This must be an object that contains a bounding box as `bbox` in the format `{west: number, south: number, east: number, north: number}`.

For example, to index using [quadkeys](https://docs.microsoft.com/en-us/bingmaps/articles/bing-maps-tile-system#tile-coordinates-and-quadkeys):

```js
import {_Tileset2D as Tileset2D} from '@deck.gl/geo-layers';
class QuadkeyTileset2D extends Tileset2D {
  getTileIndices(opts) {
    // Quadkeys and OSM tiles share the layout, leverage existing algorithm
    // Data format: [{quadkey: '0120'}, {quadkey: '0121'}, {quadkey: '0120'},...]
    return super.getTileIndices(opts).map(tileToQuadkey);
  }

  getTileId({quadkey}) {
    return quadkey;
  }

  getTileZoom({quadkey}) {
    return quadkey.length;
  }

  getParentIndex({quadkey}) {
    const quadkey = quadkey.slice(0, -1);
    return {quadkey};
  }
}

const quadkeyTileLayer = new TileLayer({
  TilesetClass: QuadkeyTileset2D,
  data: 'quadkey/{quadkey}.json',
  ...
});
```

## Source

[modules/geo-layers/src/tile-layer](https://github.com/visgl/deck.gl/tree/master/modules/geo-layers/src/tile-layer)
