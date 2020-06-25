import {TileLayerDemo} from 'website-components/doc-demos/geo-layers';

<TileLayerDemo />

<p class="badges">
  <img src="https://img.shields.io/badge/@deck.gl/geo--layers-lightgrey.svg?style=flat-square" alt="@deck.gl/geo-layers" />
  <img src="https://img.shields.io/badge/lighting-yes-blue.svg?style=flat-square" alt="lighting" />
</p>

# TileLayer

The `TileLayer` is a composite layer that makes it possible to visualize very large datasets. Instead of fetching the entire dataset, it only loads and renders what's visible in the current viewport.

To use this layer, the data must be sliced into "tiles". Each tile has a pre-defined bounding box and level of detail.
Users have the option to load each tile from a unique URL, defined by a template in the `data` property.
The layer can also supply a callback `getTileData` that does custom fetching when a tile is requested.
The loaded tile data is then rendered with the layer(s) returned by `renderSubLayers`.

```js
import DeckGL from '@deck.gl/react';
import {TileLayer} from '@deck.gl/geo-layers';

export const App = ({viewport}) => {

  const layer = new TileLayer({
    // https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#Tile_servers
    data: 'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png',

    minZoom: 0,
    maxZoom: 19,

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
  return <DeckGL {...viewport} layers={[layer]} />;
};
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

When the `TileLayer` is used with a geospatial view such as the [MapView](/docs/api-reference/map-view.md), x, y, and z are determined from [the OSM tile index](https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames).

When the `TileLayer` is used used with a non-geospatial view such as the [OrthographicView](/docs/api-reference/orthographic-view.md) or the [OrbitView](/docs/api-reference/orbit-view.md), `x` and `y` increment from the world origin, and each tile's width and height match that defined by the `tileSize` prop. For example, the tile `x: 0, y: 0` occupies the square between `[0, 0]` and `[tileSize, tileSize]`.


## Properties

Inherits all properties from [base `Layer`](/docs/api-reference/layer.md).

If using the default `renderSubLayers`, supports all [`GeoJSONLayer`](/docs/layers/geojson-layer.md) properties to style features.

### Data Options

##### `data` (String|Array, optional)

- Default: `[]`

Either a URL template or an array of URL templates from which the tile data should be loaded.

If the value is a string: a URL template. Substrings `{x}` `{y}` and `{z}`, if present, will be replaced with a tile's actual index when it is requested.

If the value is an array: multiple URL templates. Each endpoint must return the same content for the same tile index. This can be used to work around [domain sharding](https://developer.mozilla.org/en-US/docs/Glossary/Domain_sharding), allowing browsers to download more resources simultaneously. Requests made are balanced among the endpoints, based on the tile index.


##### `getTileData` (Function, optional)

- Default: `tile => load(tile.url)`

If supplied, `getTileData` is called to retrieve the data of each tile. It receives one argument `tile` which contains the following fields:

- `x` (Number) - x index of the tile
- `y` (Number) - y index of the tile
- `z` (Number) - z index of the tile
- `url` (String) - resolved url of the tile if the `data` prop is provided, otherwise `null`
- `bbox` (Object) - bounding box of the tile. When used with a geospatial view, `bbox` is in the shape of `{west: <longitude>, north: <latitude>, east: <longitude>, south: <latitude>}`. When used with a non-geospatial view, `bbox` is in the shape of `{left, top, right, bottom}`.

It should return either the tile data or a Promise that resolves to the tile data.

This prop is not required if `data` points to a supported format (JSON or image by default). Additional formats may be added by registering [loaders.gl](https://loaders.gl/modules/core/docs/api-reference/register-loaders) modules.


##### `tileSize` (Number, optional)

The pixel dimension of the tiles, usually a power of 2.

The tile size represents the target pixel width and height of each tile when rendered. Smaller tile sizes display the content at higher resolution, while the layer needs to load more tiles to fill the same viewport.

- Default: `512`


##### `maxZoom` (Number|Null, optional)

Use tiles from this level when over-zoomed.

- Default: `null`


##### `minZoom` (Number, optional)

Hide tiles when under-zoomed.

- Default: 0

##### `extent` (Array, optional)

If provided, the layer will load and render the tiles in this box at `minZoom` when underzoomed (i.e. `zoom < minZoom`).  The box is of the form `[minX, minY, maxX, maxY]`.

If `null`, the layer will not display any tiles when underzoomed to avoid issuing too many tile requests.

- Default: null


##### `maxCacheSize` (Number, optional)

The maximum number of tiles that can be cached. The tile cache keeps loaded tiles in memory even if they are no longer visible. It reduces the need to re-download the same data over and over again when the user pan/zooms around the map, providing a smoother experience.

If not supplied, the `maxCacheSize` is calculated as `5` times the number of tiles in the current viewport.

- Default: `null`


##### `maxCacheByteSize` (Number, optional)

The maximum memory used for caching tiles. If this limit is supplied, `getTileData` must return an object that contains a `byteLength` field.

- Default: `null`


##### `refinementStrategy` (Enum, optional)

How the tile layer refines the visibility of tiles. One of the following:

* `'best-available'`: If a tile in the current viewport is waiting for its data to load, use cached content from the closest zoom level to fill the empty space. This approach minimizes the visual flashing due to missing content.
* `'no-overlap'`: Avoid showing overlapping tiles when backfilling with cached content. This is usually favorable when tiles do not have opaque backgrounds.
* `'never'`: Do not display any tile that is not selected.

- Default: `'best-available'`


### Render Options

##### `renderSubLayers` (Function, optional))

Renders one or an array of Layer instances with all the `TileLayer` props and the following props:

* `id`: An unique id for this sublayer
* `data`: Resolved from `getTileData`
* `tile`: An object containing tile index `x`, `y`, `z`, and `bbox` of the tile.

- Default: `props => new GeoJsonLayer(props)`


### Callbacks

##### `onViewportLoad` (Function, optional)

`onViewportLoad` is a function that is called when all tiles in the current viewport are loaded. The loaded content (as returned by `getTileData`) for each visible tile is passed as an array to this callback function.

- Default: `data => null`


##### `onTileLoad` (Function, optional)

`onTileLoad` called when a tile successfully loads.

- Default: `() => {}`

Receives arguments:

- `tile` (Object) - the tile that has been loaded.

##### `onTileError` (Function, optional)

`onTileError` called when a tile failed to load.

- Default: `console.error`

Receives arguments:

- `error` (`Error`)


## Source

[modules/geo-layers/src/tile-layer](https://github.com/visgl/deck.gl/tree/master/modules/geo-layers/src/tile-layer)
