# ColumnLayer

import {ColumnLayerDemo} from '@site/src/doc-demos/layers';

<ColumnLayerDemo />


The `ColumnLayer` renders extruded cylinders (tessellated regular polygons) at given coordinates. It is the primitive layer rendered by [HexagonLayer](../aggregation-layers/hexagon-layer.md) after aggregation. Unlike the `HexagonLayer`, it renders one column for each data object.

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs groupId="language">
  <TabItem value="js" label="JavaScript">

```js
import {Deck} from '@deck.gl/core';
import {ColumnLayer} from '@deck.gl/layers';

const layer = new ColumnLayer({
  id: 'ColumnLayer',
  data: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/hexagons.json',
  diskResolution: 12,
  extruded: true,
  radius: 250,
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
import {ColumnLayer} from '@deck.gl/layers';

type DataType = {
  value: number;
  centroid: [longitude: number, latitude: number];
};

const layer = new ColumnLayer<DataType>({
  id: 'ColumnLayer',
  data: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/hexagons.json',
  diskResolution: 12,
  extruded: true,
  radius: 250,
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
import {ColumnLayer} from '@deck.gl/layers';
import type {PickingInfo} from '@deck.gl/core';

type DataType = {
  value: number;
  centroid: [longitude: number, latitude: number];
};

function App() {
  const layer = new ColumnLayer<DataType>({
    id: 'ColumnLayer',
    data: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/hexagons.json',
    diskResolution: 12,
    extruded: true,
    radius: 250,
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
import {ColumnLayer} from '@deck.gl/layers';
import type {ColumnLayerProps} from '@deck.gl/layers';

new ColumnLayer<DataT>(...props: ColumnLayerProps<DataT>[]);
```

To use pre-bundled scripts:

```html
<script src="https://unpkg.com/deck.gl@^9.0.0/dist.min.js"></script>
<!-- or -->
<script src="https://unpkg.com/@deck.gl/core@^9.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/layers@^9.0.0/dist.min.js"></script>
```

```js
new deck.ColumnLayer({});
```


## Properties

Inherits from all [Base Layer](../core/layer.md) properties.

### Render Options

#### `diskResolution` (number, optional) {#diskresolution}

* Default: `20`

The number of sides to render the disk as. The disk is a regular polygon that fits inside the given radius. A higher resolution will yield a smoother look close-up, but also need more resources to render.

#### `radius` (number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#radius}

* Default: `1000`

Disk size in units specified by `radiusUnits` (default meters).

#### `angle` (number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#angle}

* Default: `0`

Disk rotation, counter-clockwise in degrees.

#### `vertices` (Position[], optional) {#vertices}

Replace the default geometry (regular polygon that fits inside the unit circle) with a custom one. The length of the array must be at least `diskResolution`. Each vertex is a point `[x, y]` that is the offset from the instance position, relative to the radius.

#### `offset` (number[2], optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#offset}

* Default: `[0, 0]`

Disk offset from the position, relative to the radius. By default, the disk is centered at each position.

#### `coverage` (number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#coverage}

* Default: `1`

Radius multiplier, between 0 - 1. The radius of the disk is calculated by
`coverage * radius`

#### `elevationScale` (number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#elevationscale}

* Default: `1`

Column elevation multiplier. The elevation of column is calculated by
`elevationScale * getElevation(d)`. `elevationScale` is a handy property
to scale all column elevations without updating the data.

#### `filled` (boolean, optional) {#filled}

* Default: `true`

Whether to draw a filled column (solid fill).

#### `stroked` (boolean, optional) {#stroked}

* Default: `false`

Whether to draw an outline around the disks. Only applies if `extruded: false`.

#### `extruded` (boolean, optional) {#extruded}

* Default: `true`

Whether to extrude the columns. If set to `false`, all columns will be rendered as flat polygons.

#### `wireframe` (boolean, optional) {#wireframe}

* Default: `false`

Whether to generate a line wireframe of the column. The outline will have
"horizontal" lines closing the top and bottom polygons and a vertical line
(a "strut") for each vertex around the disk. Only applies if `extruded: true`.

#### `flatShading` (boolean, optional) {#flatshading}

* Default: `false`

If `true`, the vertical surfaces of the columns use [flat shading](https://en.wikipedia.org/wiki/Shading#Flat_vs._smooth_shading).
If `false`, use smooth shading. Only effective if `extruded` is `true`.

#### `radiusUnits` (string, optional) {#radiusunits}

* Default: `'meters'`

The units of the radius, one of `'meters'`, `'common'`, and `'pixels'`. See [unit system](../../developer-guide/coordinate-systems.md#supported-units).

#### `lineWidthUnits` (string, optional) {#linewidthunits}

* Default: `'meters'`

The units of the line width, one of `'meters'`, `'common'`, and `'pixels'`. See [unit system](../../developer-guide/coordinate-systems.md#supported-units).

#### `lineWidthScale` (number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#linewidthscale}

* Default: `1`

The line width multiplier that multiplied to all outlines if the `stroked` attribute is `true`.

#### `lineWidthMinPixels` (number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#linewidthminpixels}

* Default: `0`

The minimum outline width in pixels.

#### `lineWidthMaxPixels` (number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#linewidthmaxpixels}

* Default: Number.MAX_SAFE_INTEGER

The maximum outline width in pixels.


#### `material` (Material, optional) {#material}

* Default: `true`

This is an object that contains material props for [lighting effect](../core/lighting-effect.md) applied on extruded polygons. Check [the lighting guide](../../developer-guide/using-effects.md#material-settings) for configurable settings.


### Data Accessors

#### `getPosition` ([Accessor&lt;Position&gt;](../../developer-guide/using-layers.md#accessors), optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#getposition}

* Default: `object => object.position`

Method called to retrieve the position of each column, in `[x, y]`. An optional third component can be used to set the elevation of the bottom.

#### `getFillColor` ([Accessor&lt;Color&gt;](../../developer-guide/using-layers.md#accessors), optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#getfillcolor}

* Default: `[0, 0, 0, 255]`

The rgba color is in the format of `[r, g, b, [a]]`. Each channel is a number between 0-255 and `a` is 255 if not supplied.

* If an array is provided, it is used as the color for all objects.
* If a function is provided, it is called on each object to retrieve its color.
* If not provided, it falls back to `getColor`.

#### `getLineColor` ([Accessor&lt;Color&gt;](../../developer-guide/using-layers.md#accessors), optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#getlinecolor}

* Default: `[0, 0, 0, 255]`

The rgba color is in the format of `[r, g, b, [a]]`. Each channel is a number between 0-255 and `a` is 255 if not supplied.

* If an array is provided, it is used as the outline color for all columns.
* If a function is provided, it is called on each object to retrieve its outline color.
* If not provided, it falls back to `getColor`.

#### `getElevation` ([Accessor&lt;number&gt;](../../developer-guide/using-layers.md#accessors), optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#getelevation}

* Default: `1000`

The elevation of each cell in meters.

* If a number is provided, it is used as the elevation for all objects.
* If a function is provided, it is called on each object to retrieve its elevation.


#### `getLineWidth` ([Accessor&lt;number&gt;](../../developer-guide/using-layers.md#accessors), optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#getlinewidth}

* Default: `1`

The width of the outline of the column, in units specified by `lineWidthUnits` (default meters). Only applies if `extruded: false` and `stroked: true`.

* If a number is provided, it is used as the outline width for all columns.
* If a function is provided, it is called on each object to retrieve its outline width.

## Source

[modules/layers/src/column-layer](https://github.com/visgl/deck.gl/tree/master/modules/layers/src/column-layer)
