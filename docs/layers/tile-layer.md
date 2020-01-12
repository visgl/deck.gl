<!-- INJECT:"TileLayerDemo" -->

<p class="badges">
  <img src="https://img.shields.io/badge/@deck.gl/geo--layers-lightgrey.svg?style=flat-square" alt="@deck.gl/geo-layers" />
  <img src="https://img.shields.io/badge/lighting-yes-blue.svg?style=flat-square" alt="lighting" />
</p>

# TileLayer

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

It implements geospatial-specific `tileToBoundingBox` and `getTileIndices` functions as props and also inherits all other [BaseTileLayer](/docs/api-reference/base-tile-layer.md) properties

### Render Options

##### `getTileData` (Function,  optional)

`getTileData` given x, y, z indices of the tile, returns the tile data or a Promise that resolves to the tile data.

- Default: `getTileData: ({x, y, z}) => Promise.resolve(null)`

Receives arguments:

- `x` (Number) - X of [the OSM tile index](https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames)
- `y` (Number) - Y of [the OSM tile index](https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames)
- `z` (Number) - Z of [the OSM tile index](https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames)
- `bbox` (Object) - bounding box of the tile, in the shape of `{west, north, east, south}`.

##### `renderSubLayers` (Function, optional))

Renders one or an array of Layer instances with all the `TileLayer` props and the following props:

* `data`: Resolved from `getTileData`
* `tile`: An object containing tile index `x`, `y`, `z`, and `bbox` of the tile. `bbox` is an object of `{west, north, east, south}`.

- Default: `props => new GeoJsonLayer(props)`

# Source

[modules/geo-layers/src/tile-layer](https://github.com/uber/deck.gl/tree/master/modules/geo-layers/src/tile-layer)
