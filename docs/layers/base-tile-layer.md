<p class="badges">
  <img src="https://img.shields.io/badge/@deck.gl/geo--layers-lightgrey.svg?style=flat-square" alt="@deck.gl/geo-layers" />
  <img src="https://img.shields.io/badge/lighting-yes-blue.svg?style=flat-square" alt="lighting" />
</p>

# BaseTileLayer

This `BaseTileLayer` takes in a function `getTileData` that fetches tiles,`tileToBoundingBox` to calculate the bounds of each tile in the global cooridantes,
`getTileIndices` to calculate the tile index given the current viewport, and `renderSubLayers` to render the tile in a layer.  This layer thus allows for non-geospatial tiling use-cases i.e with `COORDINATE_SYSTEM.IDENTITY`


## Installation

To install the dependencies from NPM:

```bash
npm install deck.gl
# or
npm install @deck.gl/core @deck.gl/layers @deck.gl/geo-layers
```

```js
import {BaseTileLayer} from '@deck.gl/layers';
new BaseTileLayer({});
```

To use pre-bundled scripts:

```html
<script src="https://unpkg.com/deck.gl@^8.0.0/dist.min.js"></script>
<!-- or -->
<script src="https://unpkg.com/@deck.gl/core@^8.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/layers@^8.0.0/dist.min.js"></script>
```

```js
new deck.TileLayer({});
```


## Properties

Inherits from all [BaseLayer](/docs/api-reference/layer.md) properties and the following:

##### `tileToBoundingBox` (Function, necessary)
This function converts from `x, y, z` tile indices to a box in the global
coordinates.

Receives arguments:

- `x` (Number)
- `y` (Number)
- `z` (Number)

##### `getTileIndices` (Function, necessary)
This function converts the given viewport to the indices needed to fetch tiles
contained in the viewport.

Receives arguments:

- `viewport` (Viewport)
- `minZoom` (Number) The minimum zoom level
- `maxZoom` (Number) The maximum zoom level

##### `maxZoom` (Number|Null, optional)

Use tiles from this level when over-zoomed.

- Default: `null`

##### `minZoom` (Number, optional)

Hide tiles when under-zoomed.

- Default: 0

##### `maxCacheSize` (Number|Null, optional)

The maximum cache size for a tile layer. If not defined, it is calculated using the number of tiles in the current viewport times constant 5 (5 is picked because it's a common zoom range).

- Default: `null`

##### `strategy` (Enum, optional)

How the tile layer determines the visibility of tiles. One of the following:

* `'default'`: If some tiles in the current viewport are waiting for data to load, aggresively use cached content from other zoom levels to fill the empty space.
* `'exclusive'`: Avoid showing overlapping tiles when backfilling with cached content.

- Default: `BaseTileLayer.STRATEGY_DEFAULT`

### Render Options

##### `onViewportLoad` (Function, optional)

`onViewportLoad` is a function that is called when all tiles in the current viewport are loaded. Data in the viewport is passed in as an array to this callback function.

- Default: `onViewportLoad: (data) => null`

##### `getTileData` (Function,  optional)

`getTileData` given x, y, z indices of the tile, returns the tile data or a Promise that resolves to the tile data. For the default `renderSubLayers`, `bbox` is an object of `{west, north, east, south}`.

- Default: `getTileData: ({x, y, z}) => Promise.resolve(null)`

Receives arguments:

- `x` (Number) The X coordinate of the tile index
- `y` (Number) The Y coordinate of the tile index
- `z` (Number) The Z coordinate of the tile index
- `bbox` (Object, optional) - bounding box of the tile

##### `onTileError` (Function, optional)

`onTileError` called when a tile failed to load.

- Default: `(err) => console.error(err)`

##### `renderSubLayers` (Function, optional))

Renders one or an array of Layer instances with all the `TileLayer` props and the following props:

* `data`: Resolved from `getTileData`
* `tile`: An object containing tile index `x`, `y`, `z`, and `bbox` of the tile. `bbox` contains the global coordinates of the boundary of the box the tile occupies on the screen to be passed down to the sublayer.

- Default: `props => new GeoJsonLayer(props)`

# Source

[modules/layers/src/base-tile-layer](https://github.com/uber/deck.gl/tree/master/modules/layers/src/base-tile-layer)
