# GeohashLayer

import {GeohashLayerDemo} from '@site/src/doc-demos/geo-layers';

<GeohashLayerDemo/>

The `GeohashLayer` renders filled and/or stroked polygons based on the [Geohash](https://en.wikipedia.org/wiki/Geohash) geospatial indexing system.

`GeohashLayer` is a [CompositeLayer](../core/composite-layer.md).


import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs groupId="language">
  <TabItem value="js" label="JavaScript">

```js
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

  </TabItem>
  <TabItem value="ts" label="TypeScript">

```ts
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

  </TabItem>
  <TabItem value="react" label="React">

```tsx
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
import {GeohashLayer} from '@deck.gl/geo-layers';
import type {GeohashLayerProps} from '@deck.gl/geo-layers';

new GeohashLayer<DataT>(...props: GeohashLayerProps<DataT>[]);
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
new deck.GeohashLayer({});
```


## Properties

Inherits from all [Base Layer](../core/layer.md), [CompositeLayer](../core/composite-layer.md), and [PolygonLayer](../layers/polygon-layer.md) properties, plus the following:

### Data Accessors

#### `getGeohash` ([Accessor&lt;string&gt;](../../developer-guide/using-layers.md#accessors), optional) {#getgeohash}

Called for each data object to retrieve the geohash string identifier.

* default: `object => object.geohash`


### Column Inputs

#### `cells` (object, optional) {#cells}

* Default: `null`

A CPU-readable Arrow column of cell identifiers. Each row contains one cell or a list of cells
belonging to one feature. String and dictionary-encoded string columns are accepted.

When `data` is supplied, its row count must match `cells`. Omitted styling columns use accessors
with the original feature and source row index. Null cells and GPU-only columns are unsupported.
`highlightedObjectIndex` selects an expanded cell row in column mode. Picking reports
the source feature index.
See [Using with Arrow](../../developer-guide/using-with-arrow.md#loading-and-updates) for updates.

#### `fillColors` (object, optional) {#fillcolors}

* Default: `null`

RGBA fill colors as a CPU-readable Arrow column in source feature order. Requires `cells`
and the same row count. Each value applies to all cells in that feature. Null values are unsupported.

#### `lineColors` (object, optional) {#linecolors}

* Default: `null`

RGBA outline colors as a CPU-readable Arrow column in source feature order. Requires `cells`
and the same row count. Each value applies to all cells in that feature. Null values are unsupported.

#### `lineWidths` (object, optional) {#linewidths}

* Default: `null`

Outline widths as a CPU-readable Arrow column in source feature order. Requires `cells`
and the same row count. Each value applies to all cells in that feature. Null values are unsupported.

#### `elevations` (object, optional) {#elevations}

* Default: `null`

Elevations as a CPU-readable Arrow column in source feature order. Requires `cells`
and the same row count. Each value applies to all cells in that feature. Null values are unsupported.


## Sub Layers

The `GeohashLayer` renders the following sublayers:

* `cell` - a [PolygonLayer](../layers/polygon-layer.md) rendering all geohash cells.


## Source

[modules/geo-layers/src/geohash-layer](https://github.com/visgl/deck.gl/tree/master/modules/geo-layers/src/geohash-layer)
