import {MVTLayerDemo} from 'website-components/doc-demos/geo-layers';

<MVTLayerDemo />

<p class="badges">
  <img src="https://img.shields.io/badge/lighting-yes-blue.svg?style=flat-square" alt="lighting" />
</p>

# MVTLayer

`MVTLayer` is a derived `TileLayer` that makes it possible to visualize very large datasets through MVTs ([Mapbox Vector Tiles](https://docs.mapbox.com/vector-tiles/specification/)). Behaving like `TileLayer`, it will only load, decode and render MVTs containing features that are visible within the current viewport.

Data is loaded from URL templates in the `data` property.

This layer also handles feature clipping so that there are no features divided by tile divisions.

```js
import DeckGL from '@deck.gl/react';
import {MVTLayer} from '@deck.gl/geo-layers';

function App({viewState}) {
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

Inherits all properties from [`TileLayer`](/docs/api-reference/geo-layers/tile-layer.md) and [base `Layer`](/docs/api-reference/core/layer.md), with exceptions indicated below.

If using the default `renderSubLayers`, supports all [`GeoJSONLayer`](/docs/api-reference/layers/geojson-layer.md) properties to style features.


##### `data` (String | Array | JSON)

Required. It defines the remote data for the MVT layer.

- String: Either a URL template or a [TileJSON](https://github.com/mapbox/tilejson-spec) URL. 

- Array: an array of URL templates. It allows to balance the requests across different tile endpoints. For example, if you define an array with 4 urls and 16 tiles need to be loaded, each endpoint is responsible to server 16/4 tiles.

- JSON: A valid [TileJSON object](https://github.com/mapbox/tilejson-spec/tree/master/2.2.0).

See `TileLayer`'s `data` prop documentation for the URL template syntax.

The `getTileData` prop from the `TileLayer` class will not be called.

##### `uniqueIdProperty` (String)

Optional. Needed for highlighting a feature split across two or more tiles if no [feature id](https://github.com/mapbox/vector-tile-spec/tree/master/2.1#42-features) is provided.

An string pointing to a tile attribute containing a unique identifier for features across tiles.

##### `highlightedFeatureId` (Number | String)

* Default: `null`

Optional. When provided, a feature with ID corresponding to the supplied value will be highlighted with `highlightColor`.

If `uniqueIdProperty` is provided, value within that feature property will be used for ID comparison. If not, [feature id](https://github.com/mapbox/vector-tile-spec/tree/master/2.1#42-features) will be used.


##### `loadOptions` (Object, optional)

On top of the [default options](/docs/api-reference/core/layer.md#loadoptions), also accepts options for the following loaders:

- [MVTLoader](https://loaders.gl/modules/mvt/docs/api-reference/mvt-loader)


### Callbacks

##### `onDataLoad` (Function, optional)

`onDataLoad` called when a tileJSON is successfully fetched

Receives arguments:

tileJSON (Object) - the tileJSON fetched

##### `onViewportChange` (Function, optional)

`onViewportChange` called when the viewport changes or all tiles in the current viewport have been loaded.

Remarks

* It is not recommended to call these function every time `onViewportChange` is executed, instead, use a debounce function.

Receives arguments:

* `getRenderedFeatures` (Function)

  Calculates the features rendered in the current viewport.

  + maxFeatures: Optional. Max number of features to retrieve when `getRenderedFeatures` is called. Default to `null`.

  Requires `pickable` to be true.

  If a `uniqueIdProperty` is provided only unique properties are returned.

```javascript
const onViewportChange = e => {
  const features = e.getRenderedFeatures();
};

new MVTLayer({
  id: "..."
  data: "..."
  pickable: true
  onViewportChange: debounce(onViewportChange, 500)
  uniqueIdProperty: 'geoid'
})
```

* `getVisibleTiles` (Function)

  Retrieves the visible tiles in the current viewport

  + tileCoords: Optional. Tile data coordinates, one of `'wgs84'`, `'local'`. Default to `'local'`.

  If `tileCoords` is `'wgs84'`, each tile will contain a new `dataInWorldCoordinates` getter.

```javascript
const onViewportChange = e => {
  const visibleTiles = e.getVisibleTiles();
  visibleTiles.forEach(tile => {
    // tile.data
  });

  const visibleTilesInWGS84 = e.getVisibleTiles('wgs84');
  visibleTilesInWGS84.forEach(tile => {
    // tile.dataInWorldCoordinates
  });
};

new MVTLayer({
  id: "..."
  data: "..."
  onViewportChange: debounce(onViewportChange, 500)
})
```

* `viewport` (Object). An instance of the current [`Viewport`](/docs/api-reference/core/viewport.md).

## Source

[modules/geo-layers/src/mvt-layer/mvt-layer.js](https://github.com/visgl/deck.gl/tree/master/modules/geo-layers/src/mvt-layer/mvt-layer.js)
