# GeohashLayer

<!-- -->

Edit on Codepen

The `GeohashLayer` renders filled and/or stroked polygons based on the [Geohash](https://en.wikipedia.org/wiki/Geohash) geospatial indexing system.

`GeohashLayer` is a [CompositeLayer](https://deck.gl/next/docs/api-reference/core/composite-layer.md).

<!-- -->

* JavaScript
* TypeScript
* React

```
import {Deck} from '@deck.gl/core';

import {GeohashLayer} from '@deck.gl/geo-layers';



const layer = new GeohashLayer({

  id: 'GeohashLayer',

  data: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/sf.geohashes.json',

  

  extruded: true,

  getGeohash: d => d.geohash,

  getElevation: d => d.value,

  getFillColor: d => [d.value * 255, (1 - d.value) * 128, (1 - d.value) * 255],

  elevationScale: 1000,

  pickable: true

});



new Deck({

  initialViewState: {

    longitude: -122.4,

    latitude: 37.74,

    zoom: 11

  },

  controller: true,

  getTooltip: ({object}) => object && `${object.geohash} value: ${object.value}`,

  layers: [layer]

});
```

```
import {Deck, PickingInfo} from '@deck.gl/core';

import {GeohashLayer} from '@deck.gl/geo-layers';



type DataType = {

  geohash: string;

  value: number;

};



const layer = new GeohashLayer<DataType>({

  id: 'GeohashLayer',

  data: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/sf.geohashes.json',

  

  extruded: true,

  getGeohash: (d: DataType) => d.geohash,

  getElevation: (d: DataType) => d.value,

  getFillColor: (d: DataType) => [d.value * 255, (1 - d.value) * 128, (1 - d.value) * 255],

  elevationScale: 1000,

  pickable: true

});



new Deck({

  initialViewState: {

    longitude: -122.4,

    latitude: 37.74,

    zoom: 11

  },

  controller: true,

  getTooltip: ({object}: PickingInfo<DataType>) => object && `${object.geohash} value: ${object.value}`,

  layers: [layer]

});
```

```
import React from 'react';

import {DeckGL} from '@deck.gl/react';

import {GeohashLayer} from '@deck.gl/geo-layers';

import type {PickingInfo} from '@deck.gl/core';



type DataType = {

  geohash: string;

  value: number;

};



function App() {

  const layer = new GeohashLayer<DataType>({

    id: 'GeohashLayer',

    data: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/sf.geohashes.json',

    

    extruded: true,

    getGeohash: (d: DataType) => d.geohash,

    getElevation: (d: DataType) => d.value,

    getFillColor: (d: DataType) => [d.value * 255, (1 - d.value) * 128, (1 - d.value) * 255],

    elevationScale: 1000,

    pickable: true

  });



  return <DeckGL

    initialViewState={{

      longitude: -122.4,

      latitude: 37.74,

      zoom: 11

    }}

    controller

    getTooltip={({object}: PickingInfo<DataType>) => object && `${object.geohash} value: ${object.value}`}

    layers={[layer]}

  />;

}
```

## Installation[​](#installation "Direct link to Installation")

To install the dependencies from NPM:

```
npm install deck.gl

# or

npm install @deck.gl/core @deck.gl/layers @deck.gl/geo-layers
```

```
import {GeohashLayer} from '@deck.gl/geo-layers';

import type {GeohashLayerProps} from '@deck.gl/geo-layers';



new GeohashLayer<DataT>(...props: GeohashLayerProps<DataT>[]);
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
new deck.GeohashLayer({});
```

## Properties[​](#properties "Direct link to Properties")

Inherits from all [Base Layer](https://deck.gl/next/docs/api-reference/core/layer.md), [CompositeLayer](https://deck.gl/next/docs/api-reference/core/composite-layer.md), and [PolygonLayer](https://deck.gl/next/docs/api-reference/layers/polygon-layer.md) properties, plus the following:

### Data Accessors[​](#data-accessors "Direct link to Data Accessors")

#### `getGeohash` ([Accessor\<string>](https://deck.gl/next/docs/developer-guide/using-layers.md#accessors), optional)[​](#getgeohash "Direct link to getgeohash")

Called for each data object to retrieve the geohash string identifier.

* default: `object => object.geohash`

## Sub Layers[​](#sub-layers "Direct link to Sub Layers")

The `GeohashLayer` renders the following sublayers:

* `cell` - a [PolygonLayer](https://deck.gl/next/docs/api-reference/layers/polygon-layer.md) rendering all geohash cells.

## Source[​](#source "Direct link to Source")

[modules/geo-layers/src/geohash-layer](https://github.com/visgl/deck.gl/tree/master/modules/geo-layers/src/geohash-layer)
