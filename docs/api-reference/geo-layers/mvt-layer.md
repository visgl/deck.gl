# MVTLayer

<!-- -->

[OpenFreeMap](https://openfreemap.org/) [© OpenMapTiles](https://openmaptiles.org/) Data from

<!-- -->

[OpenStreetMap](https://www.openstreetmap.org/copyright)

Edit on Codepen

The `MVTLayer` is a derived `TileLayer` that makes it possible to visualize very large datasets through MVTs ([Mapbox Vector Tiles](https://docs.mapbox.com/vector-tiles/specification/)). Behaving like `TileLayer`, it will only load, decode and render MVTs containing features that are visible within the current viewport.

Data is loaded from URL templates in the `data` property.

This layer also handles feature clipping so that there are no features divided by tile divisions.

The default `GeoJsonLayer` rendering path supports both WebGL and WebGPU. Custom layers returned from `renderSubLayers` must separately support the selected device backend.

<!-- -->

* JavaScript
* TypeScript
* React

```
import {Deck} from '@deck.gl/core';

import {MVTLayer} from '@deck.gl/geo-layers';



const layer = new MVTLayer({

  id: 'MVTLayer',

  data: 'https://tiles.openfreemap.org/planet',

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



const attribution = document.createElement('div');

attribution.innerHTML = '<a href="https://openfreemap.org/">OpenFreeMap</a> <a href="https://openmaptiles.org/">© OpenMapTiles</a> Data from <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

Object.assign(attribution.style, {

  position: 'absolute', right: '0', bottom: '0',

  background: 'rgba(255,255,255,0.8)', padding: '0 5px', font: '12px/20px sans-serif'

});

document.body.appendChild(attribution);
```

```
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

  data: 'https://tiles.openfreemap.org/planet',

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



const attribution = document.createElement('div');

attribution.innerHTML = '<a href="https://openfreemap.org/">OpenFreeMap</a> <a href="https://openmaptiles.org/">© OpenMapTiles</a> Data from <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

Object.assign(attribution.style, {

  position: 'absolute', right: '0', bottom: '0',

  background: 'rgba(255,255,255,0.8)', padding: '0 5px', font: '12px/20px sans-serif'

});

document.body.appendChild(attribution);
```

```
import React from 'react';

import {DeckGL} from '@deck.gl/react';

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

    data: 'https://tiles.openfreemap.org/planet',

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



  return <>

    <DeckGL

      initialViewState={{

        longitude: -122.4,

        latitude: 37.74,

        zoom: 11

      }}

      controller

      getTooltip={({object}: MVTLayerPickingInfo<PropertiesType>) => object && (object.properties.name || object.properties.layerName)}

      layers={[layer]}

    />

    <div style={{position: 'absolute', right: 0, bottom: 0, background: 'rgba(255,255,255,0.8)', padding: '0 5px', font: '12px/20px sans-serif'}}>

      <a href="https://openfreemap.org/">OpenFreeMap</a>{' '}

      <a href="https://openmaptiles.org/">© OpenMapTiles</a> Data from{' '}

      <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>

    </div>

  </>;

}
```

When rendering OpenFreeMap tiles directly with `MVTLayer`, include visible attribution as above. MapLibre basemaps display their TileJSON attribution automatically.

## Installation[​](#installation "Direct link to Installation")

To install the dependencies from NPM:

```
npm install deck.gl

# or

npm install @deck.gl/core @deck.gl/layers @deck.gl/extensions @deck.gl/geo-layers
```

```
import {MVTLayer} from '@deck.gl/geo-layers';

import type {MVTLayerProps, MVTLayerPickingInfo} from '@deck.gl/geo-layers';



new MVTLayer<FeaturePropertiesT>(...props: MVTLayerProps<FeaturePropertiesT>[]);
```

To use pre-bundled scripts:

```
<script src="https://unpkg.com/deck.gl@^9.0.0/dist.min.js"></script>

<!-- or -->

<script src="https://unpkg.com/@deck.gl/core@^9.0.0/dist.min.js"></script>

<script src="https://unpkg.com/@deck.gl/layers@^9.0.0/dist.min.js"></script>

<script src="https://unpkg.com/@deck.gl/geo-layers@^9.0.0/dist.min.js"></script>
```

```
new deck.MVTLayer({});
```

## Properties[​](#properties "Direct link to Properties")

Inherits all properties from [`TileLayer`](https://deck.gl/docs/api-reference/geo-layers/tile-layer.md) and [base `Layer`](https://deck.gl/docs/api-reference/core/layer.md), with exceptions indicated below.

If using the default `renderSubLayers`, supports all [`GeoJSONLayer`](https://deck.gl/docs/api-reference/layers/geojson-layer.md) properties to style features.

#### `data` (string | string\[] | object)[​](#data "Direct link to data")

The remote data for the MVT layer.

* String: Either a URL template or a [TileJSON](https://github.com/mapbox/tilejson-spec) URL.
* Array: an array of URL templates. It allows to balance the requests across different tile endpoints. For example, if you define an array with 4 urls and 16 tiles need to be loaded, each endpoint is responsible to server 16/4 tiles.
* JSON: A valid [TileJSON object](https://github.com/mapbox/tilejson-spec/tree/master/2.2.0).

See `TileLayer`'s `data` prop documentation for the URL template syntax.

The `getTileData` prop from the `TileLayer` class will not be called.

#### `uniqueIdProperty` (string, optional)[​](#uniqueidproperty "Direct link to uniqueidproperty")

Needed for highlighting a feature split across two or more tiles if no [feature id](https://github.com/mapbox/vector-tile-spec/tree/master/2.1#42-features) is provided.

An string pointing to a tile attribute containing a unique identifier for features across tiles.

#### `highlightedFeatureId` (number | string, optional)[​](#highlightedfeatureid "Direct link to highlightedfeatureid")

* Default: `null`

When provided, a feature with ID corresponding to the supplied value will be highlighted with `highlightColor`.

If `uniqueIdProperty` is provided, value within that feature property will be used for ID comparison. If not, [feature id](https://github.com/mapbox/vector-tile-spec/tree/master/2.1#42-features) will be used.

#### `loadOptions` (object, optional)[​](#loadoptions "Direct link to loadoptions")

On top of the [default options](https://deck.gl/docs/api-reference/core/layer.md#loadoptions), also accepts options for the following loaders:

* [MVTLoader](https://loaders.gl/modules/mvt/docs/api-reference/mvt-loader)

Note that by default, the `MVTLoader` parses data using web workers, with code loaded from a [CDN](https://unpkg.com). To change this behavior, see [loaders and workers](https://deck.gl/docs/developer-guide/loading-data.md#loaders-and-web-workers).

#### `binary` (boolean, optional)[​](#binary "Direct link to binary")

* Default: `true`

Use tile data in [binary format](https://github.com/visgl/loaders.gl/blob/master/modules/gis/docs/api-reference/geojson-to-binary.md) to improve performance (2-3x faster on large datasets). It removes the need for serialization and deserialization of data transferred by the worker back to the main process. [See here](https://deck.gl/docs/api-reference/layers/geojson-layer.md#binary-format-details) for details on this format.

Remarks:

* It requires using `GeoJsonLayer` in the `renderSubLayers` callback.

### Callbacks[​](#callbacks "Direct link to Callbacks")

#### `onDataLoad` (Function, optional)[​](#ondataload "Direct link to ondataload")

Called if `data` is a TileJSON URL when it is successfully fetched

Receives arguments:

* `tileJSON` (object) - the loaded TileJSON

## Methods[​](#methods "Direct link to Methods")

#### `getRenderedFeatures` (Function)[​](#getrenderedfeatures "Direct link to getrenderedfeatures")

Get the rendered features in the current viewport.

If a `uniqueIdProperty` is provided only unique properties are returned.

Requires `pickable` prop to be true.

Parameters:

* `maxFeatures` (number, optional): Max number of features to retrieve when getRenderedFeatures is called. Default to `null`.

Returns:

* An array with geometries in GeoJSON format.

Remarks:

* As it's an expensive operation, it's not recommended to call `getRenderedFeatures` every time `onViewStateChange` is executed, use a debounce function instead.
* In most of the cases you probably want to use it attached to `onViewStateChange` and `onViewportLoad`.

## Tile[​](#tile "Direct link to Tile")

Aside from all members of the [Tile](https://deck.gl/docs/api-reference/geo-layers/tile-layer.md#tile) class, tile instances from the `MVTLayer` also include the following fields:

#### `dataInWGS84` (Feature\[])[​](#datainwgs84 "Direct link to datainwgs84")

A list of features in world coordinates (WGS84).

Usage example:

```
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

## Source[​](#source "Direct link to Source")

[modules/geo-layers/src/mvt-layer](https://github.com/visgl/deck.gl/tree/9.4-release/modules/geo-layers/src/mvt-layer)
