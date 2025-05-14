# DGGSLayer

import {DGGSLayerDemo} from '@site/src/doc-demos/geo-layers';

<DGGSLayerDemo />

The `DGGSLayer` renders filled and/or stroked polygons based on the specified DGGS geospatial indexing system.

`DGGSLayer` is a [CompositeLayer](../core/composite-layer.md).


import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs groupId="language">
  <TabItem value="js" label="JavaScript">

```js
import {Deck} from '@deck.gl/core';
import {DGGSLayer, A5Decoder} from '@deck.gl/geo-layers';

const layer = new SGGSLayer({
  id: 'DGGSLayer',
  data: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/sf.bike.parking.a5.json',
  dggsDecoder: A5Decoder,
  
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

  </TabItem>
  <TabItem value="ts" label="TypeScript">

```ts
import {Deck, PickingInfo} from '@deck.gl/core';
import {DGGSLayer} from '@deck.gl/geo-layers';

type DataType = {
  pentagon: string;
  count: number;
};

const layer = new DGGSLayer<DataType>({
  id: 'DGGSLayer',
  data: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/sf.bike.parking.a5.json',
  dggsDecoder: A5Decoder,

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

  </TabItem>
  <TabItem value="react" label="React">

```tsx
import React from 'react';
import {DeckGL} from '@deck.gl/react';
import {DGGSLayer} from '@deck.gl/geo-layers';
import type {PickingInfo} from '@deck.gl/core';

type DataType = {
  pentagon: string;
  count: number;
};

function App() {
  const layer = new DGGSLayer<DataType>({
    id: 'DGGSLayer',
    data: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/sf.bike.parking.a5.json',
    dggsDecoder: A5Decoder,
    
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

  </TabItem>
</Tabs>


## Installation

To install the dependencies from NPM:

```bash
npm install deck.gl
# or
npm install @deck.gl/core @deck.gl/layers @deck.gl/geo-layers
```

```ts
import {DGGSLayer} from '@deck.gl/geo-layers';
import type {DGGSLayerProps} from '@deck.gl/geo-layers';

new DGGSLayer<DataT>(...props: DGGSLayerProps<DataT>[]);
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
new deck.DGGSLayer({});
```


## Properties

Inherits from all [Base Layer](../core/layer.md), [CompositeLayer](../core/composite-layer.md), and [PolygonLayer](../layers/polygon-layer.md) properties, plus the following:

### Data Accessors

#### `getPentagon` ([Accessor&lt;bigint | string&gt;](../../developer-guide/using-layers.md#accessors), optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#getpentagon}

Called for each data object to retrieve the identifier of the DGGS cell id.  May return one of the following:

- A 64-bit [BigInt](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt) identifier for the cell.
- A string token representing the DGGS-specific string encoding of the 64-bit integer


* default: `object => object.pentagon`


## Sub Layers

The `DGGSLayer` renders the following sublayers:

* `cell` - a [PolygonLayer](../layers/polygon-layer.md) rendering the DGGS cells.


## Source

[modules/geo-layers/src/dggs-layer](https://github.com/visgl/deck.gl/tree/master/modules/geo-layers/src/dggs-layer)

