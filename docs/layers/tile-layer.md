<!-- INJECT:"TileLayerDemo" -->

<p class="badges">
  <img src="https://img.shields.io/badge/@deck.gl/geo--layers-lightgrey.svg?style=flat-square" alt="@deck.gl/geo-layers" />
  <img src="https://img.shields.io/badge/lighting-yes-blue.svg?style=flat-square" alt="lighting" />
</p>

# TileLayer

The `TileLayer` is a composite layer that makes it possible to visualize very large datasets. Instead of fetching the entire dataset, it only loads and renders what's visible in the current viewport.

To use this layer, the data must be sliced into "tiles". Each tile has a pre-defined bounding box and level of detail. The layer takes in a function `getTileData` that fetches tiles when they are needed, and renders the loaded data in a GeoJsonLayer or with the layer returned in `renderSubLayers`.

```js
import DeckGL from '@deck.gl/react';
import {TileLayer} from '@deck.gl/geo-layers';
import {VectorTile} from '@mapbox/vector-tile';
import Protobuf from 'pbf';

export const App = ({viewport}) => {

  const layer = new TileLayer({
    stroked: false,

    getLineColor: [192, 192, 192],
    getFillColor: [140, 170, 180],

    getLineWidth: f => {
      if (f.properties.layer === 'transportation') {
        switch (f.properties.class) {
        case 'primary':
          return 12;
        case 'motorway':
          return 16;
        default:
          return 6;
        }
      }
      return 1;
    },
    lineWidthMinPixels: 1,

    getTileData: ({x, y, z}) => {
      const mapSource = `https://a.tiles.mapbox.com/v4/mapbox.mapbox-streets-v7/${z}/${x}/${y}.vector.pbf?access_token=${MapboxAccessToken}`;
      return fetch(mapSource)
        .then(response => response.arrayBuffer())
        .then(buffer => {
          const tile = new VectorTile(new Protobuf(buffer));
          const features = [];
          for (const layerName in tile.layers) {
            const vectorTileLayer = tile.layers[layerName];
            for (let i = 0; i < vectorTileLayer.length; i++) {
              const vectorTileFeature = vectorTileLayer.feature(i);
              const feature = vectorTileFeature.toGeoJSON(x, y, z);
              features.push(feature);
            }
          }
          return features;
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


## Properties

### Data Options

##### `getTileData` (Function)

`getTileData` given x, y, z indices of the tile, returns the tile data or a Promise that resolves to the tile data.

- Default: `tile => Promise.resolve(null)`

The `tile` argument contains the following fields:

- `x` (Number) - x of [the OSM tile index](https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames)
- `y` (Number) - y of [the OSM tile index](https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames)
- `z` (Number) - z of [the OSM tile index](https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames)
- `bbox` (Object) - bounding box of the tile, in the shape of `{west: <longitude>, north: <latitude>, east: <longitude>, south: <latitude>}`.

You may also use a different indexing system by implementing your own tiling logic. See the `Tileset2D` documentation below.


##### `maxZoom` (Number|Null, optional)

Use tiles from this level when over-zoomed.

- Default: `null`


##### `minZoom` (Number, optional)

Hide tiles when under-zoomed.

- Default: 0


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


##### `Tileset` (Function, optional)

A custom implemetation of the `Tileset2D` interface. This can be used to override some of the default behaviors of the `TileLayer`. See the `Tileset2D` documentation below.


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


##### `onTileError` (Function, optional)

`onTileError` called when a tile failed to load.

- Default: `console.error`


## Tileset2D

> This section describes advanced customization of the TileLayer.

`Tileset2D` is a class that manages the request and traversal of tiles. Based on the current viewport and existing cached tiles, it determines which tiles need to be rendered, whether to fetch new data, and grooms the cache if becomes too big.

```js
import {TileLayer, _Tileset2D as Tileset2D} from '@deck.gl/geo-layers';

class NonGeospatialTileset extends Tileset2D {
  // viewport is an OrthographicViewport
  getTileIndicesInViewport({viewport}) {
    const z = Math.ceil(viewport);
    const TILE_SIZE = 256;
    const scale = Math.pow(2, z);
    const topLeft = viewport.unproject([0, 0]);
    const bottomRight = viewport.unproject([viewport.width, viewport.height]);

    const minX = Math.floor(topLeft[0] * scale / TILE_SIZE);
    const minY = Math.floor(topLeft[1] * scale / TILE_SIZE);
    const maxX = Math.ceil(bottomRight[0] * scale / TILE_SIZE);
    const maxY = Math.ceil(bottomRight[1] * scale / TILE_SIZE);

    const result = [];
    for (let x = minX; x < maxX; x++) {
      for (let y = minY; y < maxY; y++) {
        indices.push({x, y, z});
      }
    }
    return result;
  }

  // Add custom metadata to tiles
  getTileMetadata({x, y, z}) {
    const TILE_SIZE = 256;
    const scale = Math.pow(2, z);
    return {
      id: `${x}_${y}_${z}`,
      bbox: [
        x * TILE_SIZE / scale,
        y * TILE_SIZE / scale,
        (x + 1) * TILE_SIZE / scale,
        (y + 1) * TILE_SIZE / scale
      ];
    }
  }
}

new TileLayer({
  Tileset: NonGeospatialTileset,
  ...
});
```

### Tileset2D:Members

##### `opts` (Object)

User options, contains the following fields:

* `maxCacheSize` (Number, optional)
* `maxCacheByteSize` (Number, optional)
* `maxZoom` (Number, optional)
* `minZoom` (Number, optional)
* `refinementStrategy` (Enum, optional)

##### `tiles` (Array)

All tiles in the current cache. 
Each `tile` contains the following properties:

- `x` (Number)
- `y` (Number)
- `z` (Number)
- `parent` (Tile): the parent tile
- `children` (Array): children tiles
- `isLoaded` (Boolean): whether the tile's data has been loaded
- `content` (Any): resolved from `getTileData`

##### `selectedTiles` (Array)

All tiles that should be displayed in the current viewport.

##### `isLoaded` (Boolean)

`true` if all selected tiles are loaded.

### Tileset2D:Methods

The following methods can be overriden by a subclass in order to customize the `TileLayer`'s behavior.

##### `getTileIndices`

`getTileIndices({viewport, maxZoom, minZoom})`

This function converts a given viewport to the indices needed to fetch tiles contained in the viewport. The default implementation returns visible tiles defined by [the OSM tile index](https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames).

Receives arguments:

- `viewport` (Viewport)
- `minZoom` (Number) The minimum zoom level
- `maxZoom` (Number) The maximum zoom level

Returns:

An array of objects in the shape of `{x, y, z}`.


##### `getTileMetadata`

`getTileMetadata({x, y, z})`

Generates additional metadata for a tile. The metadata is then stored as properties in a `tile` instance. The default implementation adds a `bbox`.

Receives arguments:

- `x` (Number)
- `y` (Number)
- `z` (Number)

Returns:

An object that contains the fields that should be added to the `tile` instance.


##### `getParentIndex`

`getParentIndex({x, y, z})`

Retrives the parent of a tile. The parent tile is usually a tile in the previous zoom level (`z - 1`) and contains the given tile. This method is called to populate the `parent` and `children` fields of a tile.

Returns:

`{x, y, z}` of the parent tile.


##### `updateTileStates`

`updateTileStates()`

Updates the visibility of all tiles. This method is called when the viewport changes, or new tile content has been loaded. It is called after the tiles are selected by `getTileIndicesInViewport`. This method can access all tiles and selected tiles via `this.tiles` and `this.selectedTiles`, and is expected to update the `isVisible` property of each tile.


## Source

[modules/geo-layers/src/tile-layer](https://github.com/uber/deck.gl/tree/master/modules/geo-layers/src/tile-layer)
