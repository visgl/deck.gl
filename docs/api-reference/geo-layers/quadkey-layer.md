# QuadkeyLayer

import {QuadkeyLayerDemo} from '@site/src/doc-demos/geo-layers';

<QuadkeyLayerDemo />

The `QuadkeyLayer` renders filled and/or stroked polygons based on the [Quadkey](https://towardsdatascience.com/geospatial-indexing-with-quadkeys-d933dff01496) geospatial indexing system.

`QuadkeyLayer` is a [CompositeLayer](../core/composite-layer.md).


import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs groupId="language">
  <TabItem value="js" label="JavaScript">

```js
import {Deck} from '@deck.gl/core';
import {QuadkeyLayer} from '@deck.gl/geo-layers';

const layer = new QuadkeyLayer({
  id: 'QuadkeyLayer',
  data: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/sf.quadkeys.json',
  
  extruded: true,
  getQuadkey: d => d.quadkey,
  getFillColor: d => [d.value * 128, (1 - d.value) * 255, (1 - d.value) * 255, 180],
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
  getTooltip: ({object}) => object && `${object.quadkey} value: ${object.value}`,
  layers: [layer]
});
```

  </TabItem>
  <TabItem value="ts" label="TypeScript">

```ts
import {Deck, PickingInfo} from '@deck.gl/core';
import {QuadkeyLayer} from '@deck.gl/geo-layers';

type DataType = {
  quadkey: string;
  value: number;
};

const layer = new QuadkeyLayer<DataType>({
  id: 'QuadkeyLayer',
  data: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/sf.quadkeys.json',
  
  extruded: true,
  getQuadkey: (d: DataType) => d.quadkey,
  getFillColor: (d: DataType) => [d.value * 128, (1 - d.value) * 255, (1 - d.value) * 255, 180],
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
  getTooltip: ({object}: PickingInfo<DataType>) => object && `${object.quadkey} value: ${object.value}`,
  layers: [layer]
});
```

  </TabItem>
  <TabItem value="react" label="React">

```tsx
import React from 'react';
import DeckGL from '@deck.gl/react';
import {QuadkeyLayer} from '@deck.gl/geo-layers';
import type {PickingInfo} from '@deck.gl/core';

type DataType = {
  quadkey: string;
  value: number;
};

function App() {
  const layer = new QuadkeyLayer<DataType>({
    id: 'QuadkeyLayer',
    data: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/sf.quadkeys.json',
    
    extruded: true,
    getQuadkey: (d: DataType) => d.quadkey,
    getFillColor: (d: DataType) => [d.value * 128, (1 - d.value) * 255, (1 - d.value) * 255, 180],
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
    getTooltip={({object}: PickingInfo<DataType>) => object && `${object.quadkey} value: ${object.value}`}
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
import {QuadkeyLayer} from '@deck.gl/geo-layers';
import type {QuadkeyLayerProps} from '@deck.gl/geo-layers';

new QuadkeyLayer<DataT>(...props: QuadkeyLayerProps<DataT>[]);
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
new deck.QuadkeyLayer({});
```


## Properties

Inherits from all [Base Layer](../core/layer.md), [CompositeLayer](../core/composite-layer.md), and [PolygonLayer](../layers/polygon-layer.md) properties, plus the following:

### Data Accessors

#### `getQuadkey` ([Accessor&lt;string&gt;](../../developer-guide/using-layers.md#accessors), optional) {#getquadkey}

Called for each data object to retrieve the quadkey string identifier.

* default: `object => object.quadkey`


## Sub Layers

The `QuadkeyLayer` renders the following sublayers:

* `cell` - a [PolygonLayer](../layers/polygon-layer.md) rendering all quadkey cells.


## Source

[modules/geo-layers/src/quadkey-layer](https://github.com/visgl/deck.gl/tree/9.1-release/modules/geo-layers/src/quadkey-layer)
