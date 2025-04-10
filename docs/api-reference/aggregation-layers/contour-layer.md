# ContourLayer

import {ContourLayerDemo} from '@site/src/doc-demos/aggregation-layers';

<ContourLayerDemo />

The `ContourLayer` aggregates data into iso-lines or iso-bands for a given threshold and cell size. `Isoline` represents collection of line segments that separate the area above and below a given threshold. `Isoband` represents a collection of polygons (filled) that fill the area containing values in a given threshold range. To generate an `Isoline` single threshold value is needed, to generate an `Isoband` an array with two values needed. Data is first aggregated using given cell size and resulting scalar field is used to run [Marching Squares](https://en.wikipedia.org/wiki/Marching_squares) algorithm that generates a set of vertices to form Isolines or Isobands. In below documentation `Isoline` and `Isoband` is referred as `contour`.


import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs groupId="language">
  <TabItem value="js" label="JavaScript">

```js
import {Deck} from '@deck.gl/core';
import {ContourLayer} from '@deck.gl/aggregation-layers';

const layer = new ContourLayer({
  id: 'ContourLayer',
  data: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/sf-bike-parking.json',

  cellSize: 200,
  contours: [
    {threshold: 1, color: [255, 0, 0], strokeWidth: 2, zIndex: 1},
    {threshold: [3, 10], color: [55, 0, 55], zIndex: 0},
    {threshold: 5, color: [0, 255, 0], strokeWidth: 6, zIndex: 2},
    {threshold: 15, color: [0, 0, 255], strokeWidth: 4, zIndex: 3}
  ],
  getPosition: d => d.COORDINATES,
  getWeight: d => d.SPACES,
  pickable: true
});

new Deck({
  initialViewState: {
    longitude: -122.4,
    latitude: 37.74,
    zoom: 11
  },
  controller: true,
  getTooltip: ({object}) => object && `threshold: ${object.contour.threshold}`,
  layers: [layer]
});
```

  </TabItem>
  <TabItem value="ts" label="TypeScript">

```ts
import {Deck, PickingInfo} from '@deck.gl/core';
import {ContourLayer} from '@deck.gl/aggregation-layers';

type BikeRack = {
  ADDRESS: string;
  SPACES: number;
  COORDINATES: [longitude: number, latitude: number];
};

const layer = new ContourLayer<BikeRack>({
  id: 'ContourLayer',
  data: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/sf-bike-parking.json',

  cellSize: 200,
  contours: [
    {threshold: 1, color: [255, 0, 0], strokeWidth: 2, zIndex: 1},
    {threshold: [3, 10], color: [55, 0, 55], zIndex: 0},
    {threshold: 5, color: [0, 255, 0], strokeWidth: 6, zIndex: 2},
    {threshold: 15, color: [0, 0, 255], strokeWidth: 4, zIndex: 3}
  ],
  getPosition: (d: BikeRack) => d.COORDINATES,
  getWeight: (d: BikeRack) => d.SPACES,
  pickable: true
});

new Deck({
  initialViewState: {
    longitude: -122.4,
    latitude: 37.74,
    zoom: 11
  },
  controller: true,
  getTooltip: ({object}: PickingInfo<BikeRack>) => object && `threshold: ${object.contour.threshold}`,
  layers: [layer]
});
```

  </TabItem>
  <TabItem value="react" label="React">

```tsx
import React from 'react';
import {DeckGL} from '@deck.gl/react';
import {ContourLayer} from '@deck.gl/aggregation-layers';
import type {PickingInfo} from '@deck.gl/core';

type BikeRack = {
  ADDRESS: string;
  SPACES: number;
  COORDINATES: [longitude: number, latitude: number];
};

function App() {
  const layer = new ContourLayer<BikeRack>({
    id: 'ContourLayer',
    data: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/sf-bike-parking.json',

    cellSize: 200,
    contours: [
      {threshold: 1, color: [255, 0, 0], strokeWidth: 2, zIndex: 1},
      {threshold: [3, 10], color: [55, 0, 55], zIndex: 0},
      {threshold: 5, color: [0, 255, 0], strokeWidth: 6, zIndex: 2},
      {threshold: 15, color: [0, 0, 255], strokeWidth: 4, zIndex: 3}
    ],
    getPosition: (d: BikeRack) => d.COORDINATES,
    getWeight: (d: BikeRack) => d.SPACES,
    pickable: true
  });

  return <DeckGL
    initialViewState={{
      longitude: -122.4,
      latitude: 37.74,
      zoom: 11
    }}
    controller
    getTooltip={({object}: PickingInfo<BikeRack>) => object && `threshold: ${object.contour.threshold}`}
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
npm install @deck.gl/core @deck.gl/layers @deck.gl/aggregation-layers
```

```ts
import {ContourLayer} from '@deck.gl/aggregation-layers';
import type {ContourLayerProps, ContourLayerPickingInfo} from '@deck.gl/aggregation-layers';

new ContourLayer<DataT>(...props: ContourLayerProps<DataT>[]);
```

To use pre-bundled scripts:

```html
<script src="https://unpkg.com/deck.gl@^9.0.0/dist.min.js"></script>
<!-- or -->
<script src="https://unpkg.com/@deck.gl/core@^9.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/layers@^9.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/aggregation-layers@^9.0.0/dist.min.js"></script>
```

```js
new deck.ContourLayer({});
```


## Properties

Inherits from all [Base Layer](../core/layer.md) properties.

### Aggregation Options

#### `cellSize` (number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#cellsize}

* Default: `1000`

Size of each cell in meters

#### `gpuAggregation` (boolean, optional) {#gpuaggregation}

* Default: true

When set to `true` and the browser supports it, aggregation is performed on GPU.

In the right context, enabling GPU aggregation can significantly speed up your application. However, depending on the nature of input data and required application features, there are pros and cons in leveraging this functionality. See [CPU vs GPU aggregation](./overview.md#cpu-vs-gpu-aggregation) for an in-depth discussion.


#### `aggregation` (string, optional) {#aggregation}

* Default: `'SUM'`

Defines the operation used to aggregate all data object weights to calculate a cell's value. Valid values are:

- `'SUM'`: The sum of weights across all points that fall into a cell.
- `'MEAN'`: The mean weight across all points that fall into a cell.
- `'MIN'`: The minimum weight across all points that fall into a cell.
- `'MAX'`: The maximum weight across all points that fall into a cell.
- `'COUNT'`: The number of points that fall into a cell.

`getWeight` and `aggregation` together determine the elevation value of each cell. 


### Render Options

#### `contours` (object[], optional) {#contours}

* Default: `[{threshold: 1}]`

Array of objects with following keys

* `threshold` (number | number[2]) :

  - Isolines: `threshold` value must be a single number, Isolines are generated based on this threshold value.
  - Isobands: `threshold` value must be an array of two numbers. Isobands are generated using `[threshold[0], threshold[1])` as threshold range, i.e area that has values `>= threshold[0]` and `< threshold[1]` are rendered with corresponding color. NOTE: `threshold[0]` is inclusive and `threshold[1]` is not inclusive.

* `color` (Color, optional) : RGBA color array to be used to render the contour, if not specified a default value of `[255, 255, 255, 255]` is used. When a three component RGB array specified, a default value of 255 is used for Alpha.

* `strokeWidth` (number, optional) : Applicable for `Isoline`s only, width of the Isoline in pixels, if not specified a default value of `1` is used.

* `zIndex` (number, optional) : Defines z order of the contour. Contour with higher `zIndex` value is rendered above contours with lower `zIndex` values. When visualizing overlapping contours, `zIndex` along with `zOffset` (defined below) can be used to precisely layout contours. This also avoids z-fighting rendering issues. If not specified a unique value from `0` to `n` (number of contours) is assigned.

NOTE: Like any other layer prop, a shallow comparison is performed on `contours` prop to determine if it is changed. This prop should be set to an array object, that changes only when contours need to be changed.

#### `zOffset` (number, optional) {#zoffset}

* Default: `0.005`

A very small z offset that is added for each vertex of a contour (Isoline or Isoband). This is needed to control the layout of contours, especially when rendering overlapping contours. Imagine a case where an Isoline is specified which is overlapped with an Isoband. To make sure the Isoline is visible we need to render this above the Isoband.

### Data Accessors

#### `getPosition` ([Accessor&lt;Position&gt;](../../developer-guide/using-layers.md#accessors), optional) {#getposition}

* Default: `object => object.position`

Method called to retrieve the position of each object.

#### `getWeight` ([Accessor&lt;number&gt;](../../developer-guide/using-layers.md#accessors), optional) {#getweight}

* Default: `1`

The weight of each object.

* If a number is provided, it is used as the weight for all objects.
* If a function is provided, it is called on each object to retrieve its weight.


## Picking

The [PickingInfo.object](../../developer-guide/interactivity.md#the-pickinginfo-object) field returned by hover/click events of this layer represents a path (isoline) or a polygon (isoband). The object contains the following fields:

- `contour` (object) - one of the contour configurations passed to the `contours` prop.


## Sub Layers

The `ContourLayer` renders the following sublayers:

* `lines` - For Isolines, rendered by [PathLayer](../layers/path-layer.md)
* `bands` - For Isobands, rendered by [SolidPolygonLayer](../layers/solid-polygon-layer.md)


## Source

[modules/aggregation-layers/src/contour-layer](https://github.com/visgl/deck.gl/tree/9.1-release/modules/aggregation-layers/src/contour-layer)
