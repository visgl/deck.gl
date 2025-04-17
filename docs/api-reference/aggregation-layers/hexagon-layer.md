# HexagonLayer

import {HexagonLayerDemo} from '@site/src/doc-demos/aggregation-layers';

<HexagonLayerDemo />

The `HexagonLayer` aggregates data into a hexagon-based heatmap. The color and height of a hexagon are determined based on the objects it contains.

HexagonLayer is a [CompositeLayer](../core/composite-layer.md).


import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs groupId="language">
  <TabItem value="js" label="JavaScript">

```js
import {Deck} from '@deck.gl/core';
import {HexagonLayer} from '@deck.gl/aggregation-layers';

const layer = new HexagonLayer({
  id: 'HexagonLayer',
  data: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/sf-bike-parking.json',

  gpuAggregation: true,
  extruded: true,
  getPosition: d => d.COORDINATES,
  getColorWeight: d => d.SPACES,
  getElevationWeight: d => d.SPACES,
  elevationScale: 4,
  radius: 200,
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
import {Deck} from '@deck.gl/core';
import {HexagonLayer, HexagonLayerPickingInfo} from '@deck.gl/aggregation-layers';

type BikeRack = {
  ADDRESS: string;
  SPACES: number;
  COORDINATES: [longitude: number, latitude: number];
};

const layer = new HexagonLayer<BikeRack>({
  id: 'HexagonLayer',
  data: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/sf-bike-parking.json',

  gpuAggregation: true,
  extruded: true,
  getPosition: (d: BikeRack) => d.COORDINATES,
  getColorWeight: (d: BikeRack) => d.SPACES,
  getElevationWeight: (d: BikeRack) => d.SPACES,
  elevationScale: 4,
  radius: 200,
  pickable: true
});

new Deck({
  initialViewState: {
    longitude: -122.4,
    latitude: 37.74,
    zoom: 11
  },
  controller: true,
  getTooltip: ({object}: HexagonLayerPickingInfo<BikeRack>) => object && `Count: ${object.elevationValue}`,
  layers: [layer]
});
```

  </TabItem>
  <TabItem value="react" label="React">

```tsx
import React from 'react';
import {DeckGL} from '@deck.gl/react';
import {HexagonLayer, HexagonLayerPickingInfo} from '@deck.gl/aggregation-layers';

type BikeRack = {
  ADDRESS: string;
  SPACES: number;
  COORDINATES: [longitude: number, latitude: number];
};

function App() {
  const layer = new HexagonLayer<BikeRack>({
    id: 'HexagonLayer',
    data: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/sf-bike-parking.json',

    gpuAggregation: true,
    extruded: true,
    getPosition: (d: BikeRack) => d.COORDINATES,
    getColorWeight: (d: BikeRack) => d.SPACES,
    getElevationWeight: (d: BikeRack) => d.SPACES,
    elevationScale: 4,
    radius: 200,
    pickable: true
  });

  return <DeckGL
    initialViewState={{
      longitude: -122.4,
      latitude: 37.74,
      zoom: 11
    }}
    controller
    getTooltip={({object}: HexagonLayerPickingInfo<BikeRack>) => object && `Count: ${object.elevationValue}`}
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
import {HexagonLayer} from '@deck.gl/aggregation-layers';
import type {HexagonLayerProps, HexagonLayerPickingInfo} from '@deck.gl/aggregation-layers';

new HexagonLayer<DataT>(...props: HexagonLayerProps<DataT>[]);
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
new deck.HexagonLayer({});
```


## Properties

Inherits from all [Base Layer](../core/layer.md) and [CompositeLayer](../core/composite-layer.md) properties.

### Aggregation Options

#### `gpuAggregation` (boolean, optional) {#gpuaggregation}

* Default: `false`

When set to `true`, aggregation is performed on the GPU. 

In the right context, enabling GPU aggregation can significantly speed up your application. However, depending on the nature of input data and required application features, there are pros and cons in leveraging this functionality. See [CPU vs GPU aggregation](./overview.md#cpu-vs-gpu-aggregation) for an in-depth discussion.

CPU aggregation is used as fallback in the following cases:

- The current browser does not support GPU aggregation
- `gridAggregator` is defined
- `getColorValue` is defined
- `getElevationValue` is defined


#### `radius` (number, optional) {#radius}

* Default: `1000`

Radius of hexagon in meters. The hexagons are pointy-topped (rather than flat-topped).

#### `colorAggregation` (string, optional) {#coloraggregation}

* Default: `'SUM'`

Defines the operation used to aggregate all data object weights to calculate a hexagon's color value. Valid values are:

- `'SUM'`: The sum of weights across all points that fall into a hexagon.
- `'MEAN'`: The mean weight across all points that fall into a hexagon.
- `'MIN'`: The minimum weight across all points that fall into a hexagon.
- `'MAX'`: The maximum weight across all points that fall into a hexagon.
- `'COUNT'`: The number of points that fall into a hexagon.

`getColorWeight` and `colorAggregation` together determine the color value of each hexagon. If the `getColorValue` prop is supplied, they will be ignored.


##### Example: Color by the count of data elements

```ts title="Option A: use getColorValue (CPU only)"
const layer = new HexagonLayer<BikeRack>({
  //...
  getColorValue: (points: BikeRack[]) => points.length
});
```

```ts title="Option B: use getColorWeight and colorAggregation (CPU or GPU)"
const layer = new HexagonLayer<BikeRack>({
  // ...
  getColorWeight: 1,
  colorAggregation: 'COUNT'
});
```

##### Example: Color by the mean value of 'SPACES' field

```ts title="Option A: use getColorValue (CPU only)"
const layer = new HexagonLayer<BikeRack>({
  // ...
  getColorValue: (points: BikeRack[]) => {
    // Calculate mean value
    return points.reduce((sum: number, p: BikeRack) => sum += p.SPACES, 0) / points.length;
  }
});
```

```ts title="Option B: use getColorWeight and colorAggregation (CPU or GPU)"
const layer = new HexagonLayer<BikeRack>({
  // ...
  getColorWeight: (point: BikeRack) => point.SPACES,
  colorAggregation: 'MEAN'
});
```

If your use case requires aggregating using an operation other than the built-in `colorAggregation` values, `getColorValue` should be used to define such custom aggregation function.


#### `elevationAggregation` (string, optional) {#elevationaggregation}

* Default: `'SUM'`

Defines the operation used to aggregate all data object weights to calculate a hexagon's elevation value. Valid values are:

- `'SUM'`: The sum of weights across all points that fall into a hexagon.
- `'MEAN'`: The mean weight across all points that fall into a hexagon.
- `'MIN'`: The minimum weight across all points that fall into a hexagon.
- `'MAX'`: The maximum weight across all points that fall into a hexagon.
- `'COUNT'`: The number of points that fall into a hexagon.

`getElevationWeight` and `elevationAggregation` together determine the elevation value of each hexagon. If the `getElevationValue` prop is supplied, they will be ignored.

##### Example: Elevation by the count of data elements

```ts title="Option A: use getElevationValue (CPU only)"
const layer = new HexagonLayer<BikeRack>({
  // ...
  getElevationValue: (points: BikeRack[]) => points.length
});
```

```ts title="Option B: use getElevationWeight and elevationAggregation (CPU or GPU)"
const layer = new HexagonLayer<BikeRack>({
  // ...
  getElevationWeight: 1,
  elevationAggregation: 'COUNT'
});
```

##### Example: Elevation by the maximum value of 'SPACES' field

```ts title="Option A: use getElevationValue (CPU only)"
const layer = new HexagonLayer<BikeRack>({
  // ...
  getElevationValue: (points: BikeRack[]) => {
    // Calculate max value
    return points.reduce((max: number, p: BikeRack) => p.SPACES > max ? p.SPACES : max, -Infinity);
  }
});
```

```ts title="Option B: use getElevationWeight and elevationAggregation (CPU or GPU)"
const layer = new HexagonLayer<BikeRack>({
  // ...
  getElevationWeight: (point: BikeRack) => point.SPACES,
  elevationAggregation: 'MAX'
});
```

If your use case requires aggregating using an operation other than the built-in `elevationAggregation` values, `getElevationValue` should be used to define such custom aggregation function.


#### `hexagonAggregator` (Function, optional) {#hexagonaggregator}

* Default: `null`

A custom function to override how points are grouped into hexagonal bins.
If this prop is supplied, GPU aggregation will be disabled regardless of the `gpuAggregation` setting.

This function will be called with the following arguments:
- `position` (number[]) - the position of a data point
- `radius` (number) - value of the `radius` prop

It is expected to return an array of 2 integers that represent a hexagon ID. Points that resolve to the same hexagon ID are grouped together.

By default, the `HexagonLayer` uses
[d3-hexbin](https://github.com/d3/d3-hexbin) as `hexagonAggregator`,
see `modules/aggregation-layers/src/hexagon-layer/hexbin.ts`

### Render Options

#### `coverage` (number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#coverage}

* Default: `1`

Hexagon radius multiplier, clamped between 0 - 1. The displayed radius of hexagon is calculated by `coverage * radius`.
Note: coverage does not affect how objects are binned.

#### `extruded` (boolean, optional) {#extruded}

* Default: `false`

Whether to render the hexagons as 3D columns. If set to `false`, all hexagons will be flat.

#### `colorScaleType` (string, optional) {#colorscaletype}

* Default: `'quantize'`

The color scale converts from a continuous numeric stretch (`colorDomain`) into a list of colors (`colorRange`). Hexagons with value of `colorDomain[0]` will be rendered with the color of `colorRange[0]`, and hexagons with value of `colorDomain[1]` will be rendered with the color of `colorRange[colorRange.length - 1]`.

`colorScaleType` determines how a numeric value in domain is mapped to a color in range. Supported values are:
- `'linear'`: `colorRange` is linearly interpolated based on where the value lies in `colorDomain`.
- `'quantize'`: `colorDomain` is divided into `colorRange.length` equal segments, each mapped to one discrete color in `colorRange`.
- `'quantile'`: input values are divided into `colorRange.length` equal-size groups, each mapped to one discrete color in `colorRange`.
- `'ordinal'`: each unique value is mapped to one discrete color in `colorRange`.

Note that using "quantile" or "ordinal" scale with GPU aggregation will incur a one-time cost of reading aggregated values from the GPU to the CPU. This overhead may be undesirable if the source data updates frequently.

#### `colorDomain` (number[2], optional) {#colordomain}

* Default: `null` (auto)

If not provided, the layer will set `colorDomain` to the
actual min, max values from all hexagons at run time.

By providing a `colorDomain`, you can control how a value is represented by color. This is useful when you want to render different data input with the same color mapping for comparison.

#### `colorRange` (Color[], optional) {#colorrange}

* Default: [colorbrewer](http://colorbrewer2.org/#type=sequential&scheme=YlOrRd&n=6) `6-class YlOrRd` <img src="https://deck.gl/images/colorbrewer_YlOrRd_6.png"/>

Specified as an array of colors [color1, color2, ...]. Each color is an array of 3 or 4 values [R, G, B] or [R, G, B, A], representing intensities of Red, Green, Blue and Alpha channels.  Each intensity is a value between 0 and 255. When Alpha is omitted a value of 255 is used.


#### `elevationScaleType` (string, optional) {#elevationscaletype}

* Default: `'linear'`

The elevation scale converts from a continuous numeric stretch (`elevationDomain`) into another continuous numeric stretch (`elevationRange`). Hexagons with value of `elevationDomain[0]` will be rendered with the elevation of `elevationRange[0]`, and hexagons with value of `elevationDomain[1]` will be rendered with the elevation of `elevationRange[1]`.

`elevationScaleType` determines how a numeric value in domain is mapped to a elevation in range. Supported values are:
- `'linear'`: `elevationRange` is linearly interpolated based on where the value lies in `elevationDomain`.
- `'quantile'`: input values are divided into percentile groups, each mapped to one discrete elevation in `elevationRange`.

#### `elevationDomain` (number[2], optional) {#elevationdomain}

* Default: `null` (auto)

If not provided, the layer will set `elevationDomain` to the
actual min, max values from all hexagons at run time.

By providing a `elevationDomain`, you can control how a value is represented by elevation. This is useful when you want to render different data input with the same elevation mapping for comparison.

#### `elevationRange` (number[2], optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#elevationrange}

* Default: `[0, 1000]`

Elevation scale output range

#### `elevationScale` (number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#elevationscale}

* Default: `1`

Hexagon elevation multiplier.
This is a handy property to scale all hexagons without updating the data.


#### `upperPercentile` (number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#upperpercentile}

* Default: `100`

Filter hexagons and re-calculate color by `upperPercentile`. Hexagons with value larger than the upperPercentile will be hidden.

Note that using this prop with GPU aggregation will incur a one-time cost of reading aggregated values from the GPU to the CPU. This overhead may be undesirable if the source data updates frequently.

#### `lowerPercentile` (number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#lowerpercentile}

* Default: `0`

Filter hexagons and re-calculate color by `lowerPercentile`. Hexagons with value smaller than the lowerPercentile will be hidden.

Note that using this prop with GPU aggregation will incur a one-time cost of reading aggregated values from the GPU to the CPU. This overhead may be undesirable if the source data updates frequently.

#### `elevationUpperPercentile` (number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#elevationupperpercentile}

* Default: `100`

Filter hexagons and re-calculate elevation by `elevationUpperPercentile`. Hexagons with elevation value larger than the elevationUpperPercentile will be hidden.

Note that using this prop with GPU aggregation will incur a one-time cost of reading aggregated values from the GPU to the CPU. This overhead may be undesirable if the source data updates frequently.

#### `elevationLowerPercentile` (number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#elevationlowerpercentile}

* Default: `0`

Filter bns and re-calculate elevation by `elevationLowerPercentile`. Hexagons with elevation value smaller than the elevationLowerPercentile will be hidden.

Note that using this prop with GPU aggregation will incur a one-time cost of reading aggregated values from the GPU to the CPU. This overhead may be undesirable if the source data updates frequently.

#### `material` (Material, optional) {#material}

* Default: `true`

This is an object that contains material props for [lighting effect](../core/lighting-effect.md) applied on extruded polygons.
Check [the lighting guide](../../developer-guide/using-effects.md#material-settings) for configurable settings.


### Data Accessors

#### `getPosition` ([Accessor&lt;Position&gt;](../../developer-guide/using-layers.md#accessors), optional) {#getposition}

* Default: `object => object.position`

Method called to retrieve the position of each object.


#### `getColorWeight` ([Accessor&lt;number&gt;](../../developer-guide/using-layers.md#accessors), optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#getcolorweight}

* Default: `1`

The weight of a data object used to calculate the color value for a hexagon.

* If a number is provided, it is used as the weight for all objects.
* If a function is provided, it is called on each object to retrieve its weight.


#### `getColorValue` (Function, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#getcolorvalue}

* Default: `null`

After data objects are sorted into hexagonal bins, this accessor is called on each hexagon to get the value that its color is based on. If supplied, this will override the effect of `getColorWeight` and `colorAggregation` props.

Arguments:

- `objects` (DataT[]) - a list of objects whose positions fall inside this hexagon.
- `objectInfo` (object) - contains the following fields:
  + `indices` (number[]) - the indices of `objects` in the original data
  + `data` - the value of the `data` prop.


#### `getElevationWeight` ([Accessor&lt;number&gt;](../../developer-guide/using-layers.md#accessors), optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#getelevationweight}

* Default: `1`

The weight of a data object used to calculate the elevation value for a hexagon.

* If a number is provided, it is used as the weight for all objects.
* If a function is provided, it is called on each object to retrieve its weight.


#### `getElevationValue` (Function, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#getelevationvalue}

* Default: `null`

After data objects are sorted into hexagonal bins, this accessor is called on each hexagon to get the value that its elevation is based on. If supplied, this will override the effect of `getElevationWeight` and `elevationAggregation` props.

Arguments:

- `objects` (DataT[]) - a list of objects whose positions fall inside this hexagon.
- `objectInfo` (object) - contains the following fields:
  + `indices` (number[]) - the indices of `objects` in the original data
  + `data` - the value of the `data` prop.


### Callbacks

#### `onSetColorDomain` (Function, optional) {#onsetcolordomain}

* Default: `([min, max]) => {}`

This callback will be called when hexagon color domain has been calculated.

#### `onSetElevationDomain` (Function, optional) {#onsetelevationdomain}

* Default: `([min, max]) => {}`

This callback will be called when hexagon elevation domain has been calculated.


## Picking

The [PickingInfo.object](../../developer-guide/interactivity.md#the-pickinginfo-object) field returned by hover/click events of this layer represents an aggregated hexagon. The object contains the following fields:

- `col` (number) - Column index of the picked hexagon.
- `row` (number) - Row index of the picked hexagon.
- `colorValue` (number) - Aggregated color value, as determined by `getColorWeight` and `colorAggregation`
- `elevationValue` (number) - Aggregated elevation value, as determined by `getElevationWeight` and `elevationAggregation`
- `count` (number) - Number of data points in the picked hexagon
- `pointIndices` (number[]) - Indices of the data objects in the picked hexagon. Only available if using CPU aggregation.
- `points` (object[]) - The data objects in the picked hexagon. Only available if using CPU aggregation and layer data is an array.


## Sub Layers

The HexagonLayer renders the following sublayers:

* `cells` - a [ColumnLayer](../layers/column-layer.md) rendering the aggregated columns.


## Source

[modules/aggregation-layers/src/hexagon-layer](https://github.com/visgl/deck.gl/tree/master/modules/aggregation-layers/src/hexagon-layer)
