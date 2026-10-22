# S2Layer

<!-- -->

Edit on Codepen

The `S2Layer` renders filled and/or stroked polygons based on the [S2](http://s2geometry.io/) geospatial indexing system.

`S2Layer` is a [CompositeLayer](https://deck.gl/docs/api-reference/core/composite-layer.md).

<!-- -->

* JavaScript
* TypeScript
* React

```
import {Deck} from '@deck.gl/core';

import {S2Layer} from '@deck.gl/geo-layers';



const layer = new S2Layer({

  id: 'S2Layer',

  data: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/sf.s2cells.json',

  

  extruded: true,

  getS2Token: d => d.token,

  getFillColor: d => [d.value * 255, (1 - d.value) * 255, (1 - d.value) * 128],

  getElevation: d => d.value,

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

  getTooltip: ({object}) => object && `${object.token} value: ${object.value}`,

  layers: [layer]

});
```

```
import {Deck, PickingInfo} from '@deck.gl/core';

import {S2Layer} from '@deck.gl/geo-layers';



type DataType = {

  token: string;

  value: number;

};



const layer = new S2Layer<DataType>({

  id: 'S2Layer',

  data: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/sf.s2cells.json',

  

  extruded: true,

  getS2Token: (d: DataType) => d.token,

  getFillColor: (d: DataType) => [d.value * 255, (1 - d.value) * 255, (1 - d.value) * 128],

  getElevation: (d: DataType) => d.value,

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

  getTooltip: ({object}: PickingInfo<DataType>) => object && `${object.token} value: ${object.value}`,

  layers: [layer]

});
```

```
import React from 'react';

import {DeckGL} from '@deck.gl/react';

import {S2Layer} from '@deck.gl/geo-layers';

import type {PickingInfo} from '@deck.gl/core';



type DataType = {

  token: string;

  value: number;

};



function App() {

  const layer = new S2Layer<DataType>({

    id: 'S2Layer',

    data: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/sf.s2cells.json',

    

    extruded: true,

    getS2Token: (d: DataType) => d.token,

    getFillColor: (d: DataType) => [d.value * 255, (1 - d.value) * 255, (1 - d.value) * 128],

    getElevation: (d: DataType) => d.value,

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

    getTooltip={({object}: PickingInfo<DataType>) => object && `${object.token} value: ${object.value}`}

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
import {S2Layer} from '@deck.gl/geo-layers';

import type {S2LayerProps} from '@deck.gl/geo-layers';



new S2Layer<DataT>(...props: S2LayerProps<DataT>[]);
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
new deck.S2Layer({});
```

## Properties[​](#properties "Direct link to Properties")

Inherits from all [Base Layer](https://deck.gl/docs/api-reference/core/layer.md), [CompositeLayer](https://deck.gl/docs/api-reference/core/composite-layer.md), and [PolygonLayer](https://deck.gl/docs/api-reference/layers/polygon-layer.md) properties, plus the following:

### Data Accessors[​](#data-accessors "Direct link to Data Accessors")

#### `getS2Token` ([Accessor\<string>](https://deck.gl/docs/developer-guide/using-layers.md#accessors), optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square%22)[​](#gets2token "Direct link to gets2token")

Called for each data object to retrieve the identifier of the S2 cell. May return one of the following:

* A string that is the cell's hex token
* A string that is the Hilbert quad key (containing `/`)
* A [Long](https://www.npmjs.com/package/long) object that is the cell's id

Check [S2 Cell](http://s2geometry.io/devguide/s2cell_hierarchy) for more details.

* default: `object => object.token`

## Sub Layers[​](#sub-layers "Direct link to Sub Layers")

The `S2Layer` renders the following sublayers:

* `cell` - a [PolygonLayer](https://deck.gl/docs/api-reference/layers/polygon-layer.md) rendering all S2 cells.

## Source[​](#source "Direct link to Source")

[modules/geo-layers/src/s2-layer](https://github.com/visgl/deck.gl/tree/9.4-release/modules/geo-layers/src/s2-layer)
