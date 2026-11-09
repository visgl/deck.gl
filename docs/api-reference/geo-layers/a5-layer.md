# A5Layer

import {A5LayerDemo} from '@site/src/doc-demos/geo-layers';

<A5LayerDemo />

The `A5Layer` renders filled and/or stroked polygons based on the [A5](https://a5geo.org) geospatial indexing system.

`A5Layer` is a [CompositeLayer](../core/composite-layer.md).


import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs groupId="language">
  <TabItem value="js" label="JavaScript">

```js
import {Deck} from '@deck.gl/core';
import {A5Layer} from '@deck.gl/geo-layers';

const layer = new A5Layer({
  id: 'A5Layer',
  data: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/sf.bike.parking.a5v1.json',
  
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
import {A5Layer} from '@deck.gl/geo-layers';

type DataType = {
  pentagon: string;
  count: number;
};

const layer = new A5Layer<DataType>({
  id: 'A5Layer',
  data: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/sf.bike.parking.a5v1.json',
  
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
import {A5Layer} from '@deck.gl/geo-layers';
import type {PickingInfo} from '@deck.gl/core';

type DataType = {
  pentagon: string;
  count: number;
};

function App() {
  const layer = new A5Layer<DataType>({
    id: 'A5Layer',
    data: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/sf.bike.parking.a5v1.json',
    
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
import {A5Layer} from '@deck.gl/geo-layers';
import type {A5LayerProps} from '@deck.gl/geo-layers';

new A5Layer<DataT>(...props: A5LayerProps<DataT>[]);
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
new deck.A5Layer({});
```


## Properties

Inherits from all [Base Layer](../core/layer.md), [CompositeLayer](../core/composite-layer.md), and [PolygonLayer](../layers/polygon-layer.md) properties, plus the following:

### Data Accessors

#### `getPentagon` ([Accessor&lt;bigint | string&gt;](../../developer-guide/using-layers.md#accessors), optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#getpentagon}

Called for each data object to retrieve the identifier of the A5 pentagon cell.  May return one of the following:

- A 64-bit [BigInt](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt) identifier for the A5 cell.
- A base-16 string encoding of the 64-bit integer

For more information on representing the A5 cell, see [A5 Cell Representation](https://a5geo.org/docs/api-reference/indexing#cell-representation)


* default: `object => object.pentagon`


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

The `A5Layer` renders the following sublayers:

* `cell` - a [PolygonLayer](../layers/polygon-layer.md) rendering all A5 cells.


## Source

[modules/geo-layers/src/a5-layer](https://github.com/visgl/deck.gl/tree/master/modules/geo-layers/src/a5-layer)
