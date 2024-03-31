# H3HexagonLayer

import {H3HexagonLayerDemo} from '@site/src/doc-demos/geo-layers';

<H3HexagonLayerDemo />

The `H3HexagonLayer` renders hexagons from the [H3](https://h3geo.org/) geospatial indexing system.

`H3HexagonLayer` is a [CompositeLayer](../core/composite-layer.md).


import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs groupId="language">
  <TabItem value="js" label="JavaScript">

```js
import {Deck} from '@deck.gl/core';
import {H3HexagonLayer} from '@deck.gl/geo-layers';

const layer = new H3HexagonLayer({
  id: 'H3HexagonLayer',
  data: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/sf.h3cells.json',

  extruded: true,
  getHexagon: d => d.hex,
  getFillColor: d => [255, (1 - d.count / 500) * 255, 0],
  getElevation: d => d.count,
  elevationScale: 20,
  pickable: true
});

new Deck({
  initialViewState: {
    longitude: -122.4,
    latitude: 37.74,
    zoom: 11
  },
  controller: true,
  getTooltip: ({object}) => object && `${object.hex} count: ${object.count}`,
  layers: [layer]
});
```

  </TabItem>
  <TabItem value="ts" label="TypeScript">

```ts
import {Deck, PickingInfo} from '@deck.gl/core';
import {H3HexagonLayer} from '@deck.gl/geo-layers';

type DataType = {
  hex: string;
  count: number;
};

const layer = new H3HexagonLayer<DataType>({
  id: 'H3HexagonLayer',
  data: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/sf.h3cells.json',

  extruded: true,
  getHexagon: (d: DataType) => d.hex,
  getFillColor: (d: DataType) => [255, (1 - d.count / 500) * 255, 0],
  getElevation: (d: DataType) => d.count,
  elevationScale: 20,
  pickable: true
});

new Deck({
  initialViewState: {
    longitude: -122.4,
    latitude: 37.74,
    zoom: 11
  },
  controller: true,
  getTooltip: ({object}: PickingInfo<DataType>) => object && `${object.hex} count: ${object.count}`,
  layers: [layer]
});
```

  </TabItem>
  <TabItem value="react" label="React">

```tsx
import React from 'react';
import DeckGL from '@deck.gl/react';
import {H3HexagonLayer} from '@deck.gl/geo-layers';
import type {PickingInfo} from '@deck.gl/core';

type DataType = {
  hex: string;
  count: number;
};

function App() {
  const layer = new H3HexagonLayer<DataType>({
    id: 'H3HexagonLayer',
    data: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/sf.h3cells.json',

    extruded: true,
    getHexagon: (d: DataType) => d.hex,
    getFillColor: (d: DataType) => [255, (1 - d.count / 500) * 255, 0],
    getElevation: (d: DataType) => d.count,
    elevationScale: 20,
    pickable: true
  });

  return <DeckGL
    initialViewState={{
      longitude: -122.4,
      latitude: 37.74,
      zoom: 11
    }}
    controller
    getTooltip={({object}: PickingInfo<DataType>) => object && `${object.hex} count: ${object.count}`}
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
import {H3HexagonLayer} from '@deck.gl/geo-layers';
import type {H3HexagonLayerProps} from '@deck.gl/geo-layers';

new H3HexagonLayer<DataT>(...props: H3HexagonLayerProps<DataT>[]);
```

To use pre-bundled scripts:

```html
<script src="https://unpkg.com/h3-js@^4.0.0"></script>
<script src="https://unpkg.com/deck.gl@^9.0.0/dist.min.js"></script>
<!-- or -->
<script src="https://unpkg.com/@deck.gl/core@^9.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/layers@^9.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/geo-layers@^9.0.0/dist.min.js"></script>
```

```js
new deck.H3HexagonLayer({});
```

Note that `h3-js` must be included before `deck.gl`.

## Properties

Inherits from all [Base Layer](../core/layer.md), [CompositeLayer](../core/composite-layer.md), and [PolygonLayer](../layers/polygon-layer.md) properties, plus the following:


### Render Options

#### `highPrecision` (boolean, optional) {#highprecision}

* Default: `'auto'`

Each hexagon in the H3 indexing system is [slightly different in shape](https://h3geo.org/docs/core-library/coordsystems). To draw a large number of hexagons efficiently, the `H3HexagonLayer` may choose to use instanced drawing by assuming that all hexagons within the current viewport have the same shape as the one at the center of the current viewport. The discrepancy is usually too small to be visible.

There are several cases in which high-precision mode is required. In these cases, `H3HexagonLayer` may choose to switch to high-precision mode, where it trades performance for accuracy:

* The input set contains a pentagon. There are 12 pentagons world wide at each resolution, and these cells and their immediate neighbors have significant differences in shape.
* The input set is at a coarse resolution (res `0` through res `5`). These cells have larger differences in shape, particularly when using a Mercator projection.
* The input set contains hexagons with different resolutions.

Possible values:

* `'auto'`: The layer chooses the mode automatically. High-precision rendering is only used if an edge case is encountered in the data.
* `true`: Always use high-precision rendering.
* `false`: Always use instanced rendering, regardless of the characteristics of the data.

#### `coverage` (number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#coverage}

* Default: `1`

Hexagon radius multiplier, between 0 - 1. When `coverage` = 1, hexagon is rendered with actual size, by specifying a different value (between 0 and 1) hexagon can be scaled down.


### Data Accessors

#### `getHexagon` ([Accessor&lt;string&gt;](../../developer-guide/using-layers.md#accessors), optional) {#gethexagon}

* Default: `object => object.hexagon`

Method called to retrieve the [H3](https://h3geo.org/) hexagon index of each object. Note that all hexagons within one `H3HexagonLayer` must use the same [resolution](https://h3geo.org/docs/core-library/restable).


## Sub Layers

The `H3HexagonLayer` renders the following sublayers:

* `hexagon-cell-hifi` - On `highPrecision` mode, rendered by [SolidPolygonLayer](../layers/solid-polygon-layer.md)
* `hexagon-cell` - On non `highPrecision` mode, rendered by [ColumnLayer](../layers/column-layer.md)



## Source

[modules/geo-layers/src/h3-layers/h3-hexagon-layer.ts](https://github.com/visgl/deck.gl/tree/master/modules/geo-layers/src/h3-layers/h3-hexagon-layer.ts)
