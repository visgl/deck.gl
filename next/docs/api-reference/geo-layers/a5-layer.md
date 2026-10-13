# A5Layer

<!-- -->

Edit on Codepen

The `A5Layer` renders filled and/or stroked polygons based on the [A5](https://a5geo.org) geospatial indexing system.

`A5Layer` is a [CompositeLayer](https://deck.gl/next/docs/api-reference/core/composite-layer.md).

<!-- -->

* JavaScript
* TypeScript
* React

```
import {Deck} from '@deck.gl/core';

import {A5Layer} from '@deck.gl/geo-layers';



const layer = new A5Layer({

  id: 'A5Layer',

  data: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/sf.bike.parking.a5.json',

  

  extruded: true,

  getPentagon: f => f.pentagon,

  getFillColor: f => {

    const value = f.count / 211;

    return [(1 - value) * 235, 255 - 85 * value, 255 - 170 * value];

  },

  getElevation: f => f.count,

  elevationScale: 10,

  pickable: true

});



new Deck({

  initialViewState: {

    longitude: -122.4,

    latitude: 37.74,

    zoom: 11

  },

  controller: true,

  getTooltip: ({object}) => object && `${object.pentagon} count: ${object.count}`,

  layers: [layer]

});
```

```
import {Deck, PickingInfo} from '@deck.gl/core';

import {A5Layer} from '@deck.gl/geo-layers';



type DataType = {

  pentagon: string;

  count: number;

};



const layer = new A5Layer<DataType>({

  id: 'A5Layer',

  data: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/sf.bike.parking.a5.json',

  

  extruded: true,

  getPentagon: (f: DataType) => f.pentagon,

  getFillColor: (f: DataType) => {

    const value = f.count / 211;

    return [(1 - value) * 235, 255 - 85 * value, 255 - 170 * value];

  },

  getElevation: (f: DataType) => f.count,

  elevationScale: 10,

  pickable: true

});



new Deck({

  initialViewState: {

    longitude: -122.4,

    latitude: 37.74,

    zoom: 11

  },

  controller: true,

  getTooltip: ({object}: PickingInfo<DataType>) => object && `${object.pentagon} count: ${object.count}`,

  layers: [layer]

});
```

```
import React from 'react';

import {DeckGL} from '@deck.gl/react';

import {A5Layer} from '@deck.gl/geo-layers';

import type {PickingInfo} from '@deck.gl/core';



type DataType = {

  pentagon: string;

  count: number;

};



function App() {

  const layer = new A5Layer<DataType>({

    id: 'A5Layer',

    data: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/sf.bike.parking.a5.json',

    

    extruded: true,

    getPentagon: (f: DataType) => f.pentagon,

    getFillColor: (f: DataType) => {

      const value = f.count / 211;

      return [(1 - value) * 235, 255 - 85 * value, 255 - 170 * value];

    },

    getElevation: (f: DataType) => f.count,

    elevationScale: 10,

    pickable: true

  });



  return <DeckGL

    initialViewState={{

      longitude: -122.4,

      latitude: 37.74,

      zoom: 11

    }}

    controller

    getTooltip={({object}: PickingInfo<DataType>) => object && `${object.pentagon} count: ${object.count}`}

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
import {A5Layer} from '@deck.gl/geo-layers';

import type {A5LayerProps} from '@deck.gl/geo-layers';



new A5Layer<DataT>(...props: A5LayerProps<DataT>[]);
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
new deck.A5Layer({});
```

## Properties[​](#properties "Direct link to Properties")

Inherits from all [Base Layer](https://deck.gl/next/docs/api-reference/core/layer.md), [CompositeLayer](https://deck.gl/next/docs/api-reference/core/composite-layer.md), and [PolygonLayer](https://deck.gl/next/docs/api-reference/layers/polygon-layer.md) properties, plus the following:

### Data Accessors[​](#data-accessors "Direct link to Data Accessors")

#### `getPentagon` ([Accessor\<bigint | string>](https://deck.gl/next/docs/developer-guide/using-layers.md#accessors), optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square%22)[​](#getpentagon "Direct link to getpentagon")

Called for each data object to retrieve the identifier of the A5 pentagon cell. May return one of the following:

* A 64-bit [BigInt](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt) identifier for the A5 cell.
* A base-16 string encoding of the 64-bit integer

For more information on representing the A5 cell, see [A5 Cell Representation](https://a5geo.org/docs/api-reference/indexing#cell-representation)

* default: `object => object.pentagon`

## Sub Layers[​](#sub-layers "Direct link to Sub Layers")

The `A5Layer` renders the following sublayers:

* `cell` - a [PolygonLayer](https://deck.gl/next/docs/api-reference/layers/polygon-layer.md) rendering all A5 cells.

## Source[​](#source "Direct link to Source")

[modules/geo-layers/src/a5-layer](https://github.com/visgl/deck.gl/tree/master/modules/geo-layers/src/a5-layer)
