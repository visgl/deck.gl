# CPUGridLayer

import {CPUGridLayerDemo} from '@site/src/doc-demos/aggregation-layers';

<CPUGridLayerDemo />

The `CPUGridLayer` aggregates data into a grid-based heatmap. The color and height of a cell are determined based on the objects it contains. Aggregation is performed on CPU.

`CPUGridLayer` is one of the sublayers for [GridLayer](./grid-layer.md), and is provided to customize CPU Aggregation for advanced use cases. For any regular use case, [GridLayer](./grid-layer.md) is recommended.

`CPUGridLayer` is a [CompositeLayer](../core/composite-layer.md).


import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs groupId="language">
  <TabItem value="js" label="JavaScript">

```js
import {Deck} from '@deck.gl/core';
import {CPUGridLayer} from '@deck.gl/geo-layers';

const layer = new CPUGridLayer({
  id: 'CPUGridLayer',
  data: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/sf-bike-parking.json',

  extruded: true,
  getPosition: d => d.COORDINATES,
  getColorWeight: d => d.SPACES,
  getElevationWeight: d => d.SPACES,
  elevationScale: 4,
  cellSize: 200,
  pickable: true
});

new Deck({
  initialViewState: {
    longitude: -122.4,
    latitude: 37.74,
    zoom: 11
  },
  controller: true,
  getTooltip: ({object}) => object && `Count: ${object.elevationValue}`,
  layers: [layer]
});
```

  </TabItem>
  <TabItem value="ts" label="TypeScript">

```ts
import {Deck, PickingInfo} from '@deck.gl/core';
import {CPUGridLayer} from '@deck.gl/geo-layers';

type BikeRack = {
  ADDRESS: string;
  SPACES: number;
  COORDINATES: [longitude: number, latitude: number];
};

const layer = new CPUGridLayer<BikeRack>({
  id: 'CPUGridLayer',
  data: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/sf-bike-parking.json',

  extruded: true,
  getPosition: (d: BikeRack) => d.COORDINATES,
  getColorWeight: (d: BikeRack) => d.SPACES,
  getElevationWeight: (d: BikeRack) => d.SPACES,
  elevationScale: 4,
  cellSize: 200,
  pickable: true
});

new Deck({
  initialViewState: {
    longitude: -122.4,
    latitude: 37.74,
    zoom: 11
  },
  controller: true,
  getTooltip: ({object}: PickingInfo<BikeRack>) => object && `Count: ${object.elevationValue}`,
  layers: [layer]
});
```

  </TabItem>
  <TabItem value="react" label="React">

```tsx
import React from 'react';
import DeckGL from '@deck.gl/react';
import {CPUGridLayer} from '@deck.gl/geo-layers';
import type {PickingInfo} from '@deck.gl/core';

type BikeRack = {
  ADDRESS: string;
  SPACES: number;
  COORDINATES: [longitude: number, latitude: number];
};

function App() {
  const layer = new CPUGridLayer<BikeRack>({
    id: 'CPUGridLayer',
    data: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/sf-bike-parking.json',

    extruded: true,
    getPosition: (d: BikeRack) => d.COORDINATES,
    getColorWeight: (d: BikeRack) => d.SPACES,
    getElevationWeight: (d: BikeRack) => d.SPACES,
    elevationScale: 4,
    cellSize: 200,
    pickable: true
  });

  return <DeckGL
    initialViewState={{
      longitude: -122.4,
      latitude: 37.74,
      zoom: 11
    }}
    controller
    getTooltip={({object}: PickingInfo<BikeRack>) => object && `Count: ${object.elevationValue}`}
    layers={[layer]}
  />;
}
```

  </TabItem>
</Tabs>

**Note:** The `CPUGridLayer` at the moment only works with `COORDINATE_SYSTEM.LNGLAT`.


## Installation

To install the dependencies from NPM:

```bash
npm install deck.gl
# or
npm install @deck.gl/core @deck.gl/layers @deck.gl/aggregation-layers
```

```ts
import {CPUGridLayer} from '@deck.gl/aggregation-layers';
import type {CPUGridLayerProps} from '@deck.gl/aggregation-layers';

new CPUGridLayer<DataT>(...props: CPUGridLayerProps<DataT>[]);
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
new deck.CPUGridLayer({});
```


## Properties

Inherits from all [Base Layer](../core/layer.md) and [CompositeLayer](../core/composite-layer.md) properties.

### Render Options

#### `cellSize` (number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#cellsize}

* Default: `1000`

Size of each cell in meters

#### `colorDomain` (number[2], optional) {#colordomain}

* Default: `[min(colorWeight), max(colorWeight)]`

Color scale domain, default is set to the extent of aggregated weights in each cell.
You can control how the colors of cells are mapped to weights by passing in an arbitrary color domain.
This is useful when you want to render different data input with the same color mapping for comparison.

#### `colorRange` (Color[], optional) {#colorrange}

* Default: [colorbrewer](http://colorbrewer2.org/#type=sequential&scheme=YlOrRd&n=6) `6-class YlOrRd` <img src="https://deck.gl/images/colorbrewer_YlOrRd_6.png"/>

Specified as an array of colors [color1, color2, ...]. Each color is an array of 3 or 4 values [R, G, B] or [R, G, B, A], representing intensities of Red, Green, Blue and Alpha channels.  Each intensity is a value between 0 and 255. When Alpha not provided a value of 255 is used.

`colorDomain` is divided into `colorRange.length` equal segments, each mapped to one color in `colorRange`.

#### `coverage` (number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#coverage}

* Default: `1`

Cell size multiplier, clamped between 0 - 1. The displayed size of cell is calculated by `coverage * cellSize`.
Note: coverage does not affect how objects are binned.

#### `elevationDomain` (number[2], optional) {#elevationdomain}

* Default: `[0, max(elevationWeight)]`

Elevation scale input domain, default is set to between 0 and the max of aggregated weights in each cell.
You can control how the elevations of cells are mapped to weights by passing in an arbitrary elevation domain.
This is useful when you want to render different data input with the same elevation scale for comparison.

#### `elevationRange` (number[2], optional) {#elevationrange}

* Default: `[0, 1000]`

Elevation scale output range

#### `elevationScale` (number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#elevationscale}

* Default: `1`

Cell elevation multiplier.
This is a handy property to scale all cells without updating the data.

#### `extruded` (boolean, optional) {#extruded}

* Default: `true`

Whether to enable cell elevation. If set to false, all cell will be flat.

#### `upperPercentile` (number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#upperpercentile}

* Default: `100`

Filter cells and re-calculate color by `upperPercentile`. Cells with value
larger than the upperPercentile will be hidden.

#### `lowerPercentile` (number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#lowerpercentile}

* Default: `0`

Filter cells and re-calculate color by `lowerPercentile`. Cells with value
smaller than the lowerPercentile will be hidden.

#### `elevationUpperPercentile` (number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#elevationupperpercentile}

* Default: `100`

Filter cells and re-calculate elevation by `elevationUpperPercentile`. Cells with elevation value
larger than the elevationUpperPercentile will be hidden.

#### `elevationLowerPercentile` (number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#elevationlowerpercentile}

* Default: `0`

Filter cells and re-calculate elevation by `elevationLowerPercentile`. Cells with elevation value
smaller than the elevationLowerPercentile will be hidden.

#### `colorScaleType` (string, optional) {#colorscaletype}

* Default: 'quantize'

Scaling function used to determine the color of the grid cell, default value is 'quantize'. Supported Values are 'quantize', 'linear', 'quantile' and 'ordinal'.

#### `material` (Material, optional) {#material}

* Default: `true`

This is an object that contains material props for [lighting effect](../core/lighting-effect.md) applied on extruded polygons.
Check [the lighting guide](../../developer-guide/using-effects.md#material-settings) for configurable settings.


#### `colorAggregation` (string, optional) {#coloraggregation}

* Default: `'SUM'`

Defines the operation used to aggregate all data object weights to calculate a bin's color value. Valid values are `'SUM'`, `'MEAN'`, `'MIN'` and `'MAX'`. `'SUM'` is used when an invalid value is provided.

`getColorWeight` and `colorAggregation` together determine the elevation value of each cell. If the `getColorValue` prop is supplied, they will be ignored.

##### Example: Color by the count of data elements

```ts title="Option A: use getColorValue"
const layer = new CPUGridLayer<BikeRack>({
  // ...
  getColorValue: (points: BikeRack[]) => points.length,
});
```

```ts title="Option B: use getColorWeight and colorAggregation"
const layer = new CPUGridLayer<BikeRack>({
  // ...
  getColorWeight: (d: BikeRack) => 1,
  colorAggregation: 'SUM'
});
```

##### Example: Color by the mean value of 'SPACES' field

```ts title="Option A: use getColorValue"
const layer = new CPUGridLayer<BikeRack>({
  // ...
  getColorValue: (points: BikeRack[]) => {
    // Calculate mean value
    return points.reduce((sum: number, p: BikeRack) => sum += p.SPACES, 0) / points.length;
  }
});
```

```ts title="Option B: use getColorWeight and colorAggregation"
const layer = new CPUGridLayer<BikeRack>({
  // ...
  getColorWeight: (point: BikeRack) => point.SPACES,
  colorAggregation: 'SUM'
});
```

If your use case requires aggregating using an operation that is not one of 'SUM', 'MEAN', 'MAX' and 'MIN', `getColorValue` should be used to define such custom aggregation function.


#### `elevationAggregation` (string, optional) {#elevationaggregation}

* Default: `'SUM'`

Defines the operation used to aggregate all data object weights to calculate a bin's elevation value. Valid values are `'SUM'`, `'MEAN'`, `'MIN'` and `'MAX'`. `'SUM'` is used when an invalid value is provided.

`getElevationWeight` and `elevationAggregation` together determine the elevation value of each cell. If the `getElevationValue` prop is supplied, they will be ignored.

##### Example: Elevation by the count of data elements

```ts title="Option A: use getElevationValue"
const layer = new CPUGridLayer<BikeRack>({
  // ...
  getElevationValue: (points: BikeRack[]) => points.length
});
```

```ts title="Option B: use getElevationWeight and elevationAggregation"
const layer = new CPUGridLayer<BikeRack>({
  // ...
  getElevationWeight: (point: BikeRack) => 1,
  elevationAggregation: 'SUM'
});
```

##### Example: Elevation by the maximum value of 'SPACES' field

```ts title="Option A: use getElevationValue"
const layer = new CPUGridLayer<BikeRack>({
  // ...
  getElevationValue: (points: BikeRack[]) => {
    // Calculate max value
    return points.reduce((max: number, p: BikeRack) => p.SPACES > max ? p.SPACES : max, -Infinity);
  }
});
```

```ts title="Option B: use getElevationWeight and elevationAggregation"
const layer = new CPUGridLayer<BikeRack>({
  // ...
  getElevationWeight: (point: BikeRack) => point.SPACES,
  elevationAggregation: 'MAX'
});
```

If your use case requires aggregating using an operation that is not one of 'SUM', 'MEAN', 'MAX' and 'MIN', `getElevationValue` should be used to define such custom aggregation function.


### Data Accessors

#### `getPosition` ([Accessor&lt;Position&gt;](../../developer-guide/using-layers.md#accessors), optional) {#getposition}

* Default: `object => object.position`

Method called to retrieve the position of each object.


#### `getColorWeight` ([Accessor&lt;number&gt;](../../developer-guide/using-layers.md#accessors), optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#getcolorweight}

* Default: `1`

The weight of a data object used to calculate the color value for a cell.

* If a number is provided, it is used as the weight for all objects.
* If a function is provided, it is called on each object to retrieve its weight.


#### `getColorValue` (Function, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#getcolorvalue}

* Default: `null`

After data objects are aggregated into cells, this accessor is called on each cell to get the value that its color is based on. If supplied, this will override the effect of `getColorWeight` and `colorAggregation` props.

Arguments:

- `objects` (DataT[]) - a list of objects whose positions fall inside this cell.
- `objectInfo` (object) - contains the following fields:
  + `indices` (number[]) - the indices of `objects` in the original data
  + `data` - the value of the `data` prop.


#### `getElevationWeight` ([Accessor&lt;number&gt;](../../developer-guide/using-layers.md#accessors), optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#getelevationweight}

* Default: `1`

The weight of a data object used to calculate the elevation value for a cell.

* If a number is provided, it is used as the weight for all objects.
* If a function is provided, it is called on each object to retrieve its weight.


#### `getElevationValue` (Function, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#getelevationvalue}

* Default: `null`

After data objects are aggregated into cells, this accessor is called on each cell to get the value that its elevation is based on. If supplied, this will override the effect of `getElevationWeight` and `elevationAggregation` props.

Arguments:

- `objects` (DataT[]) - a list of objects whose positions fall inside this cell.
- `objectInfo` (object) - contains the following fields:
  + `indices` (number[]) - the indices of `objects` in the original data
  + `data` - the value of the `data` prop.


### Callbacks

#### `onSetColorDomain` (Function, optional) {#onsetcolordomain}

* Default: `([min, max]) => {}`

This callback will be called when cell color domain has been calculated.

#### `onSetElevationDomain` (Function, optional) {#onsetelevationdomain}

* Default: `([min, max]) => {}`

This callback will be called when cell elevation domain has been calculated.


## Sub Layers

The CPUGridLayer renders the following sublayers:

* `grid-cell` - a [GridCellLayer](../layers/grid-cell-layer.md) rendering the aggregated columns.

## Source

[modules/aggregation-layers/src/cpu-grid-layer](https://github.com/visgl/deck.gl/tree/9.0-release/modules/aggregation-layers/src/cpu-grid-layer)
