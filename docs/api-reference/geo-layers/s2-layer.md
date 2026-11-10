# S2Layer

import {S2LayerDemo} from '@site/src/doc-demos/geo-layers';

<S2LayerDemo />

The `S2Layer` renders filled and/or stroked polygons based on the [S2](http://s2geometry.io/) geospatial indexing system.

`S2Layer` is a [CompositeLayer](../core/composite-layer.md).


import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs groupId="language">
  <TabItem value="js" label="JavaScript">

```js
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

  </TabItem>
  <TabItem value="ts" label="TypeScript">

```ts
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

  </TabItem>
  <TabItem value="react" label="React">

```tsx
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
import {S2Layer} from '@deck.gl/geo-layers';
import type {S2LayerProps} from '@deck.gl/geo-layers';

new S2Layer<DataT>(...props: S2LayerProps<DataT>[]);
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
new deck.S2Layer({});
```


## Properties

Inherits from all [Base Layer](../core/layer.md), [CompositeLayer](../core/composite-layer.md), and [PolygonLayer](../layers/polygon-layer.md) properties, plus the following:

### Data Accessors

#### `getS2Token` ([Accessor&lt;string&gt;](../../developer-guide/using-layers.md#accessors), optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#gets2token}

Called for each data object to retrieve the identifier of the S2 cell. May return one of the following:

- A string that is the cell's hex token
- A string that is the Hilbert quad key (containing `/`)
- A [Long](https://www.npmjs.com/package/long) object that is the cell's id

Check [S2 Cell](http://s2geometry.io/devguide/s2cell_hierarchy) for more details.

* default: `object => object.token`


### Column Inputs

#### `cells` (object, optional) {#cells}

* Default: `null`

A CPU-readable Arrow column of cell identifiers. Each row contains one cell or a list of cells
belonging to one feature. String and dictionary-encoded string columns are accepted.
Arrow `Int64` and `Uint64` identifiers are accepted without losing precision. Signed values
are interpreted as unsigned 64-bit cell identifiers.

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

The `S2Layer` renders the following sublayers:

* `cell` - a [PolygonLayer](../layers/polygon-layer.md) rendering all S2 cells.


## Source

[modules/geo-layers/src/s2-layer](https://github.com/visgl/deck.gl/tree/master/modules/geo-layers/src/s2-layer)
