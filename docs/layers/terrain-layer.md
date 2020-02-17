<!-- INJECT:"TerrainLayerDemo" -->

<p class="badges">
  <img src="https://img.shields.io/badge/@deck.gl/geo--layers-lightgrey.svg?style=flat-square" alt="@deck.gl/geo-layers" />
  <img src="https://img.shields.io/badge/lighting-yes-blue.svg?style=flat-square" alt="lighting" />
</p>

# TerrainLayer

This TileLayer takes in a function `getTileData` that fetches tiles, and renders it in a GeoJsonLayer or with the layer returned in `renderSubLayers`.

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
import {TerrainLayer} from '@deck.gl/geo-layers';
new TerrainLayer({});
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
new deck.TerrainLayer({});
```


## Properties

### Data Options

##### `getTileData` (Function)

`getTileData` given x, y, z indices of the tile, returns the tile data or a Promise that resolves to the tile data.

- Default: `tile => Promise.resolve(null)`

The `tile` argument contains the following fields:

- `x` (Number) - x index of the tile
- `y` (Number) - y index of the tile
- `z` (Number) - z index of the tile
- `bbox` (Object) - bounding box of the tile, see `tileToBoundingBox`.

By default, the `TileLayer` loads tiles defined by [the OSM tile index](https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames). You may override this by implementing `getTileIndices`.


##### `maxZoom` (Number|Null, optional)

Use tiles from this level when over-zoomed.

- Default: `null`


##### `minZoom` (Number, optional)

Hide tiles when under-zoomed.

- Default: 0


##### `maxCacheSize` (Number|Null, optional)

The maximum cache size for a tile layer. If not defined, it is calculated using the number of tiles in the current viewport times multiplied by `5`.

- Default: `null`


##### `strategy` (Enum, optional)

How the tile layer determines the visibility of tiles. One of the following:

* `'best-available'`: If a tile in the current viewport is waiting for its data to load, use cached content from the closest zoom level to fill the empty space. This approach minimizes the visual flashing due to missing content.
* `'no-overlap'`: Avoid showing overlapping tiles when backfilling with cached content. This is usually favorable when tiles do not have opaque backgrounds.

- Default: `'best-available'`


##### `tileToBoundingBox` (Function, optional)

**Advanced** Converts from `x, y, z` tile indices to a bounding box in the global coordinates. The default implementation converts an OSM tile index to `{west: <longitude>, north: <latitude>, east: <longitude>, south: <latitude>}`.

Receives arguments:

- `x` (Number)
- `y` (Number)
- `z` (Number)

The returned value will be available via `tile.bbox`.


##### `getTileIndices` (Function, optional)

**Advanced** This function converts a given viewport to the indices needed to fetch tiles contained in the viewport. The default implementation returns visible tiles defined by [the OSM tile index](https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames).

Receives arguments:

- `viewport` (Viewport)
- `minZoom` (Number) The minimum zoom level
- `maxZoom` (Number) The maximum zoom level

Returns:

An array of objects in the shape of `{x, y, z}`.


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


# Source

[modules/geo-layers/src/terrain-layer](https://github.com/uber/deck.gl/tree/master/modules/geo-layers/src/terrain-layer)
