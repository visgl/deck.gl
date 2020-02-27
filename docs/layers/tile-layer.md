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

- `x` (Number) - x index of the tile
- `y` (Number) - y index of the tile
- `z` (Number) - z index of the tile
- `bbox` (Object) - bounding box of the tile
 
When used with a geospatial view such as the [MapView](/docs/api-reference/map-view.md), x, y, and z are determined from [the OSM tile index](https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames), and `bbox` is in the shape of `{west: <longitude>, north: <latitude>, east: <longitude>, south: <latitude>}`.

When used with a non-geospatial view such as the [OrthographicView](/docs/api-reference/orthographic-view.md) or the [OrbitView](/docs/api-reference/orbit-view.md), x, y, and z are determined by dividing the view space in to 512 pixel by 512 pixel tiles. `bbox` is in the shape of `{left, top, right, bottom}`.


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

[modules/geo-layers/src/tile-layer](https://github.com/uber/deck.gl/tree/master/modules/geo-layers/src/tile-layer)
