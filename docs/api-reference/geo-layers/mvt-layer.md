# MVTLayer

import {MVTLayerDemo} from '@site/src/doc-demos/geo-layers';

<MVTLayerDemo />

The `MVTLayer` is a derived `TileLayer` that makes it possible to visualize very large datasets through MVTs ([Mapbox Vector Tiles](https://docs.mapbox.com/vector-tiles/specification/)). Behaving like `TileLayer`, it will only load, decode and render MVTs containing features that are visible within the current viewport.

Data is loaded from URL templates in the `data` property.

This layer also handles feature clipping so that there are no features divided by tile divisions.


import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs groupId="language">
  <TabItem value="js" label="JavaScript">

```js
import {Deck} from '@deck.gl/core';
import {MVTLayer} from '@deck.gl/geo-layers';

const layer = new MVTLayer({
  id: 'MVTLayer',
  data: [
    'https://tiles-a.basemaps.cartocdn.com/vectortiles/carto.streets/v1/{z}/{x}/{y}.mvt'
  ],
  minZoom: 0,
  maxZoom: 14,
  getFillColor: f => {
    switch (f.properties.layerName) {
      case 'poi':
        return [255, 0, 0];
      case 'water':
        return [120, 150, 180];
      case 'building':
        return [218, 218, 218];
      default:
        return [240, 240, 240];
    }
  },
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
  getLineColor: [192, 192, 192],
  getPointRadius: 2,
  pointRadiusUnits: 'pixels',
  stroked: false,
  picking: true
});

new Deck({
  initialViewState: {
    longitude: -122.4,
    latitude: 37.74,
    zoom: 11
  },
  controller: true,
  getTooltip: ({object}) => object && (object.properties.name || object.properties.layerName),
  layers: [layer]
});
```

  </TabItem>
  <TabItem value="ts" label="TypeScript">

```ts
import {Deck} from '@deck.gl/core';
import {MVTLayer, MVTLayerPickingInfo} from '@deck.gl/geo-layers';
import type {Feature, Geometry} from 'geojson';

type PropertiesType = {
  name?: string;
  rank: number;
  layerName: string;
  class: string;
};

const layer = new MVTLayer<PropertiesType>({
  id: 'MVTLayer',
  data: [
    'https://tiles-a.basemaps.cartocdn.com/vectortiles/carto.streets/v1/{z}/{x}/{y}.mvt'
  ],
  minZoom: 0,
  maxZoom: 14,
  getFillColor: (f: Feature<Geometry, PropertiesType>) => {
    switch (f.properties.layerName) {
      case 'poi':
        return [255, 0, 0];
      case 'water':
        return [120, 150, 180];
      case 'building':
        return [218, 218, 218];
      default:
        return [240, 240, 240];
    }
  },
  getLineWidth: (f: Feature<Geometry, PropertiesType>) => {
    switch (f.properties.class) {
      case 'street':
        return 6;
      case 'motorway':
        return 10;
      default:
        return 1;
    }
  },
  getLineColor: [192, 192, 192],
  getPointRadius: 2,
  pointRadiusUnits: 'pixels',
  stroked: false,
  picking: true
});

new Deck({
  initialViewState: {
    longitude: -122.4,
    latitude: 37.74,
    zoom: 11
  },
  controller: true,
  getTooltip: ({object}: MVTLayerPickingInfo<PropertiesType>) => object && (object.properties.name || object.properties.layerName),
  layers: [layer]
});
```

  </TabItem>
  <TabItem value="react" label="React">

```tsx
import React from 'react';
import DeckGL from '@deck.gl/react';
import {MVTLayer} from '@deck.gl/geo-layers';
import type {MVTLayerPickingInfo} from '@deck.gl/geo-layers';
import type {Feature, Geometry} from 'geojson';

type PropertiesType = {
  name?: string;
  rank: number;
  layerName: string;
  class: string;
};

function App() {
  const layer = new MVTLayer<PropertiesType>({
    id: 'MVTLayer',
    data: [
      'https://tiles-a.basemaps.cartocdn.com/vectortiles/carto.streets/v1/{z}/{x}/{y}.mvt'
    ],
    minZoom: 0,
    maxZoom: 14,
    getFillColor: (f: Feature<Geometry, PropertiesType>) => {
      switch (f.properties.layerName) {
        case 'poi':
          return [255, 0, 0];
        case 'water':
          return [120, 150, 180];
        case 'building':
          return [218, 218, 218];
        default:
          return [240, 240, 240];
      }
    },
    getLineWidth: (f: Feature<Geometry, PropertiesType>) => {
      switch (f.properties.class) {
        case 'street':
          return 6;
        case 'motorway':
          return 10;
        default:
          return 1;
      }
    },
    getLineColor: [192, 192, 192],
    getPointRadius: 2,
    pointRadiusUnits: 'pixels',
    stroked: false,
    picking: true
  });

  return <DeckGL
    initialViewState={{
      longitude: -122.4,
      latitude: 37.74,
      zoom: 11
    }}
    controller
    getTooltip={({object}: MVTLayerPickingInfo<PropertiesType>) => object && (object.properties.name || object.properties.layerName)}
    layers={[layer]}
  />;
}
```

  </TabItem>
</Tabs>



## Installation

To install the dependencies from NPM:

```bash
npm install deck.gl
# or
npm install @deck.gl/core @deck.gl/layers @deck.gl/extensions @deck.gl/geo-layers
```

```ts
import {MVTLayer} from '@deck.gl/geo-layers';
import type {MVTLayerProps, MVTLayerPickingInfo} from '@deck.gl/geo-layers';

new MVTLayer<FeaturePropertiesT>(...props: MVTLayerProps<FeaturePropertiesT>[]);
```

To use pre-bundled scripts:

```html
<script src="https://unpkg.com/deck.gl@^9.0.0/dist.min.js"></script>
<!-- or -->
<script src="https://unpkg.com/@deck.gl/core@^9.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/layers@^9.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/geo-layers@^9.0.0/dist.min.js"></script>
```

```js
new deck.MVTLayer({});
```


## Properties

Inherits all properties from [`TileLayer`](./tile-layer.md) and [base `Layer`](../core/layer.md), with exceptions indicated below.

If using the default `renderSubLayers`, supports all [`GeoJSONLayer`](../layers/geojson-layer.md) properties to style features.


##### `data` (string | string[] | object) {#data}

The remote data for the MVT layer.

- String: Either a URL template or a [TileJSON](https://github.com/mapbox/tilejson-spec) URL. 
- Array: an array of URL templates. It allows to balance the requests across different tile endpoints. For example, if you define an array with 4 urls and 16 tiles need to be loaded, each endpoint is responsible to server 16/4 tiles.
- JSON: A valid [TileJSON object](https://github.com/mapbox/tilejson-spec/tree/master/2.2.0).

See `TileLayer`'s `data` prop documentation for the URL template syntax.

The `getTileData` prop from the `TileLayer` class will not be called.

##### `uniqueIdProperty` (string, optional) {#uniqueidproperty}

Needed for highlighting a feature split across two or more tiles if no [feature id](https://github.com/mapbox/vector-tile-spec/tree/master/2.1#42-features) is provided.

An string pointing to a tile attribute containing a unique identifier for features across tiles.

##### `highlightedFeatureId` (number | string, optional) {#highlightedfeatureid}

* Default: `null`

When provided, a feature with ID corresponding to the supplied value will be highlighted with `highlightColor`.

If `uniqueIdProperty` is provided, value within that feature property will be used for ID comparison. If not, [feature id](https://github.com/mapbox/vector-tile-spec/tree/master/2.1#42-features) will be used.


##### `loadOptions` (object, optional) {#loadoptions}

On top of the [default options](../core/layer.md#loadoptions), also accepts options for the following loaders:

- [MVTLoader](https://loaders.gl/modules/mvt/docs/api-reference/mvt-loader)

Note that by default, the `MVTLoader` parses data using web workers, with code loaded from a [CDN](https://unpkg.com). To change this behavior, see [loaders and workers](../../developer-guide/loading-data.md#loaders-and-web-workers).

##### `binary` (boolean, optional) {#binary}

* Default: `true`

Use tile data in [binary format](https://github.com/visgl/loaders.gl/blob/master/modules/gis/docs/api-reference/geojson-to-binary.md) to improve performance (2-3x faster on large datasets). It removes the need for serialization and deserialization of data transferred by the worker back to the main process. [See here](../layers/geojson-layer.md#binary-format-details) for details on this format.

Remarks: 

- It requires using `GeoJsonLayer` in the `renderSubLayers` callback.

### Callbacks

##### `onDataLoad` (Function, optional) {#ondataload}

Called if `data` is a TileJSON URL when it is successfully fetched

Receives arguments:

- `tileJSON` (object) - the loaded TileJSON

## Methods

##### `getRenderedFeatures` (Function) {#getrenderedfeatures}

Get the rendered features in the current viewport.

If a `uniqueIdProperty` is provided only unique properties are returned.

Requires `pickable` prop to be true.

Parameters:

- `maxFeatures` (number, optional): Max number of features to retrieve when getRenderedFeatures is called. Default to `null`.

Returns:

- An array with geometries in GeoJSON format.

Remarks:

- As it's an expensive operation, it's not recommended to call `getRenderedFeatures` every time `onViewStateChange` is executed, use a debounce function instead. 
- In most of the cases you probably want to use it attached to `onViewStateChange` and `onViewportLoad`.

## Tile

Aside from all members of the [Tile](./tile-layer.md#tile) class, tile instances from the `MVTLayer` also include the following fields:

##### `dataInWGS84` (Feature[]) {#datainwgs84}

A list of features in world coordinates (WGS84).

Usage example:

```javascript
const onViewportLoad = tiles => {
  tiles.forEach(tile => {
    // data in world coordinates (WGS84)
    const dataInWGS84 = tile.dataInWGS84;
  });
};
new MVTLayer({
  id: "..."
  data: "..."
  onViewportLoad
})
```

## Source

[modules/geo-layers/src/mvt-layer](https://github.com/visgl/deck.gl/tree/master/modules/geo-layers/src/mvt-layer)
