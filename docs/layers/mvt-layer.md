<!-- INJECT:"MVTLayerDemo" -->

<p class="badges">
  <img src="https://img.shields.io/badge/@deck.gl/geo--layers-lightgrey.svg?style=flat-square" alt="@deck.gl/geo-layers" />
  <img src="https://img.shields.io/badge/lighting-yes-blue.svg?style=flat-square" alt="lighting" />
</p>

# MVTLayer

`MVTLayer` is a derived `TileLayer` that makes it possible to visualize very large datasets through MVTs ([Mapbox Vector Tiles](https://docs.mapbox.com/vector-tiles/specification/)). Behaving like `TileLayer`, it will only load, decode and render MVTs containing features that are visible within the current viewport.

Data is loaded from URL templates in the `data` property.

This layer also handles feature clipping so that there are no features divided by tile divisions.

```js
import DeckGL from '@deck.gl/react';
import {MVTLayer} from '@deck.gl/geo-layers';

export const App = ({viewport}) => {
  const layer = new MVTLayer({
    data: `https://a.tiles.mapbox.com/v4/mapbox.mapbox-streets-v7/{z}/{x}/{y}.vector.pbf?access_token=${MAPBOX_TOKEN}`,

    minZoom: 0,
    maxZoom: 23,
    getLineColor: [192, 192, 192],
    getFillColor: [140, 170, 180],

    getLineWidth: f => {
      switch (f.properties.class) {
        case 'street':
          return 6;
        case 'motorway':
          return 10;
        default:
          return 1;
      }
    },
    lineWidthMinPixels: 1
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
import {MVTLayer} from '@deck.gl/geo-layers';
new MVTLayer({});
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
new deck.MVTLayer({});
```


## Properties

Inherits all properties from [`TileLayer`](/docs/layers/tile-layer.md) and [base `Layer`](/docs/api-reference/layer.md), with exceptions indicated below.

If using the default `renderSubLayers`, supports all [`GeoJSONLayer`](/docs/layers/geojson-layer.md) properties to style features.


##### `data` (String|Array)

Required. Either a URL template or an array of URL templates from which the MVT data should be loaded. See `TileLayer`'s `data` prop documentation for the templating syntax.

The `getTileData` prop from the `TileLayer` class will not be called.


## Source

[modules/geo-layers/src/mvt-layer/mvt-layer.js](https://github.com/uber/deck.gl/tree/master/modules/geo-layers/src/mvt-layer/mvt-layer.js)
