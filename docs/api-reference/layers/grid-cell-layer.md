# GridCellLayer

import {GridCellLayerDemo} from '@site/src/doc-demos/layers';

<GridCellLayerDemo />


The `GridCellLayer` can render a grid-based heatmap.
It is a variation of the [ColumnLayer](./column-layer.md).
It takes the constant width / height of all cells and bottom-left coordinate of each cell.
This is the primitive layer rendered by [CPUGridLayer](../aggregation-layers/cpu-grid-layer.md) after aggregation. Unlike the CPUGridLayer, it renders one column for each data object.

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs groupId="language">
  <TabItem value="js" label="JavaScript">

```js
import {Deck} from '@deck.gl/core';
import {GridCellLayer} from '@deck.gl/layers';

const layer = new GridCellLayer({
  id: 'GridCellLayer',
  data: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/hexagons.json',

  cellSize: 200,
  extruded: true,
  elevationScale: 5000,
  getElevation: d => d.value,
  getFillColor: d => [48, 128, d.value * 255, 255],
  getPosition: d => d.centroid,
  pickable: true
});

new Deck({
  initialViewState: {
    longitude: -122.4,
    latitude: 37.74,
    zoom: 11
  },
  controller: true,
  getTooltip: ({object}) => object && `height: ${object.value * 5000}m`,
  layers: [layer]
});
```

  </TabItem>
  <TabItem value="ts" label="TypeScript">

```ts
import {Deck, PickingInfo} from '@deck.gl/core';
import {GridCellLayer} from '@deck.gl/layers';
import type {PickingInfo} from '@deck.gl/core';

type DataType = {
  value: number;
  centroid: [longitude: number, latitude: number];
};

const layer = new GridCellLayer<DataType>({
  id: 'GridCellLayer',
  data: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/hexagons.json',

  cellSize: 200,
  extruded: true,
  elevationScale: 5000,
  getElevation: (d: DataType) => d.value,
  getFillColor: (d: DataType) => [48, 128, d.value * 255, 255],
  getPosition: (d: DataType) => d.centroid,
  pickable: true
});

new Deck({
  initialViewState: {
    longitude: -122.4,
    latitude: 37.74,
    zoom: 11
  },
  controller: true,
  getTooltip: ({object}: PickingInfo<DataType>) => object && `height: ${object.value * 5000}m`,
  layers: [layer]
});
```

  </TabItem>
  <TabItem value="react" label="React">

```tsx
import React from 'react';
import DeckGL from '@deck.gl/react';
import {GridCellLayer} from '@deck.gl/layers';
import type {PickingInfo} from '@deck.gl/core';

type DataType = {
  value: number;
  centroid: [longitude: number, latitude: number];
};

function App() {
  const layer = new GridCellLayer<DataType>({
    id: 'GridCellLayer',
    data: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/hexagons.json',

    cellSize: 200,
    extruded: true,
    elevationScale: 5000,
    getElevation: (d: DataType) => d.value,
    getFillColor: (d: DataType) => [48, 128, d.value * 255, 255],
    getPosition: (d: DataType) => d.centroid,
    pickable: true
  });

  return <DeckGL
    initialViewState={{
      longitude: -122.4,
      latitude: 37.74,
      zoom: 11
    }}
    controller
    getTooltip={({object}: PickingInfo<DataType>) => object && `height: ${object.value * 5000}m`}
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
npm install @deck.gl/core @deck.gl/layers
```

```ts
import {GridCellLayer} from '@deck.gl/layers';
import type {GridCellLayerProps} from '@deck.gl/layers';

new GridCellLayer<DataT>(...props: GridCellLayerProps<DataT>[]);
```

To use pre-bundled scripts:

```html
<script src="https://unpkg.com/deck.gl@^9.0.0/dist.min.js"></script>
<!-- or -->
<script src="https://unpkg.com/@deck.gl/core@^9.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/layers@^9.0.0/dist.min.js"></script>
```

```js
new deck.GridCellLayer({});
```


## Properties

Inherits from all [Base Layer](../core/layer.md) properties.

### Render Options

##### `cellSize` (number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#cellsize}

* Default: `1000`

Size of each grid cell in meters

##### `coverage` (number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#coverage}

* Default: `1`

Cell size scale factor. The size of cell is calculated by
`cellSize * coverage`.

##### `elevationScale` (number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#elevationscale}

* Default: `1`

Elevation multiplier. The elevation of cell is calculated by
`elevationScale * getElevation(d)`. `elevationScale` is a handy property
to scale all cell elevations without updating the data.

##### `extruded` (boolean, optional) {#extruded}

* Default: `true`

Whether to enable grid elevation. If set to false, all grid will be flat.

##### `material` (Material, optional) {#material}

* Default: `true`

This is an object that contains material props for [lighting effect](../core/lighting-effect.md) applied on extruded polygons.
Check [the lighting guide](../../developer-guide/using-effects.md#material-settings) for configurable settings.

### Data Accessors

##### `getPosition` ([Accessor&lt;Position&gt;](../../developer-guide/using-layers.md#accessors), optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#getposition}

* Default: `x => x.position`

Method called to retrieve the bottom-left corner (`[minX, minY]`) of each cell.


##### `getColor` ([Accessor&lt;Color&gt;](../../developer-guide/using-layers.md#accessors), optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#getcolor}

* Default: `[255, 0, 255, 255]`

The rgba color of each object, in `r, g, b, [a]`. Each component is in the 0-255 range.

* If an array is provided, it is used as the color for all objects.
* If a function is provided, it is called on each object to retrieve its color.

##### `getElevation` ([Accessor&lt;number&gt;](../../developer-guide/using-layers.md#accessors), optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#getelevation}

* Default: `1000`

The elevation of each cell in meters.

* If a number is provided, it is used as the elevation for all objects.
* If a function is provided, it is called on each object to retrieve its elevation.


## Source

[modules/layers/src/column-layer/grid-cell-layer.ts](https://github.com/visgl/deck.gl/tree/master/modules/layers/src/column-layer/grid-cell-layer.ts)
