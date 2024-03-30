# GridLayer

import {GridLayerDemo} from '@site/src/doc-demos/aggregation-layers';

<GridLayerDemo />

The `GridLayer` aggregates data into a grid-based heatmap. The color and height of a cell are determined based on the objects it contains.

This layer renders either a [GPUGridLayer](./gpu-grid-layer.md) or a [CPUGridLayer](./cpu-grid-layer.md), depending on its props and whether GPU aggregation is supported. For more details check the `GPU Aggregation` section below.

`GridLayer` is a [CompositeLayer](../core/composite-layer.md).

```js
import DeckGL from '@deck.gl/react';
import {GridLayer} from '@deck.gl/aggregation-layers';

function App({data, viewState}) {
  /**
   * Data format:
   * [
   *   {COORDINATES: [-122.42177834, 37.78346622]},
   *   ...
   * ]
   */
  const layer = new GridLayer({
    id: 'new-grid-layer',
    data,
    pickable: true,
    extruded: true,
    cellSize: 200,
    elevationScale: 4,
    getPosition: d => d.COORDINATES
  });

  return <DeckGL viewState={viewState}
    layers={[layer]}
    getTooltip={({object}) => object && `${object.position.join(', ')}\nCount: ${object.count}`} />;
}
```

**Note:** The `GridLayer` at the moment only works with `COORDINATE_SYSTEM.LNGLAT`.


## Installation

To install the dependencies from NPM:

```bash
npm install deck.gl
# or
npm install @deck.gl/core @deck.gl/layers @deck.gl/aggregation-layers
```

```js
import {GridLayer} from '@deck.gl/aggregation-layers';
new GridLayer({});
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
new deck.GridLayer({});
```


## Properties

Inherits from all [Base Layer](../core/layer.md) and [CompositeLayer](../core/composite-layer.md) properties.

### Render Options

##### `cellSize` (number, optional) {#cellsize}

* Default: `1000`

Size of each cell in meters

##### `colorDomain` (number[2], optional) {#colordomain}

* Default: `[min(colorWeight), max(colorWeight)]`

Color scale domain, default is set to the extent of aggregated weights in each cell.
You can control how the colors of cells are mapped to weights by passing in an arbitrary color domain.
This is useful when you want to render different data input with the same color mapping for comparison.

##### `colorRange` (Color[], optional) {#colorrange}

* Default: [colorbrewer](http://colorbrewer2.org/#type=sequential&scheme=YlOrRd&n=6) `6-class YlOrRd` <img src="https://deck.gl/images/colorbrewer_YlOrRd_6.png"/>

Specified as an array of colors [color1, color2, ...]. Each color is an array of 3 or 4 values [R, G, B] or [R, G, B, A], representing intensities of Red, Green, Blue and Alpha channels.  Each intensity is a value between 0 and 255. When Alpha not provided a value of 255 is used.

`colorDomain` is divided into `colorRange.length` equal segments, each mapped to one color in `colorRange`.

##### `coverage` (number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#coverage}

* Default: `1`

Cell size multiplier, clamped between 0 - 1. The displayed size of cell is calculated by `coverage * cellSize`.
Note: coverage does not affect how objects are binned.

##### `elevationDomain` (number[2], optional) {#elevationdomain}

* Default: `[0, max(elevationWeight)]`

Elevation scale input domain, default is set to between 0 and the max of aggregated weights in each cell.
You can control how the elevations of cells are mapped to weights by passing in an arbitrary elevation domain.
This is useful when you want to render different data input with the same elevation scale for comparison.

##### `elevationRange` (number[2], optional) {#elevationrange}

* Default: `[0, 1000]`

Elevation scale output range

##### `elevationScale` (number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#elevationscale}

* Default: `1`

Cell elevation multiplier.
This is a handy property to scale all cells without updating the data.

##### `extruded` (boolean, optional) {#extruded}

* Default: `true`

Whether to enable cell elevation.If set to false, all cell will be flat.

##### `upperPercentile` (number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#upperpercentile}

* Default: `100`

Filter cells and re-calculate color by `upperPercentile`. Cells with value
larger than the upperPercentile will be hidden.

##### `lowerPercentile` (number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#lowerpercentile}

* Default: `0`

Filter cells and re-calculate color by `lowerPercentile`. Cells with value
smaller than the lowerPercentile will be hidden.

##### `elevationUpperPercentile` (number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#elevationupperpercentile}

* Default: `100`

Filter cells and re-calculate elevation by `elevationUpperPercentile`. Cells with elevation value
larger than the elevationUpperPercentile will be hidden.

##### `elevationLowerPercentile` (number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#elevationlowerpercentile}

* Default: `0`

Filter cells and re-calculate elevation by `elevationLowerPercentile`. Cells with elevation value
smaller than the elevationLowerPercentile will be hidden.

##### `colorScaleType` (string, optional) {#colorscaletype}

* Default: 'quantize'

Scaling function used to determine the color of the grid cell, default value is 'quantize'. Supported Values are 'quantize', 'linear', 'quantile' and 'ordinal'.

##### `fp64` (boolean, optional) {#fp64}

* Default: `false`

Whether the aggregation should be performed in high-precision 64-bit mode. Note that since deck.gl v6.1, the default 32-bit projection uses a hybrid mode that matches 64-bit precision with significantly better performance.

##### `gpuAggregation` (bool, optional) {#gpuaggregation}

* Default: `false`

When set to true, aggregation is performed on GPU, provided other conditions are met, for more details check the `GPU Aggregation` section below. GPU aggregation can be a lot faster than CPU depending upon the number of objects and number of cells.

**Note:** GPU Aggregation is faster only when using large data sets. For smaller data sets GPU Aggregation could be potentially slower than CPU Aggregation.

##### `material` (Material, optional) {#material}

* Default: `true`

This is an object that contains material props for [lighting effect](../core/lighting-effect.md) applied on extruded polygons.
Check [the lighting guide](../../developer-guide/using-effects.md#material-settings) for configurable settings.


##### `colorAggregation` (string, optional) {#coloraggregation}

* Default: 'SUM'

Defines the operation used to aggregate all data object weights to calculate a cell's color value. Valid values are 'SUM', 'MEAN', 'MIN' and 'MAX'. 'SUM' is used when an invalid value is provided.

`getColorWeight` and `colorAggregation` together determine the elevation value of each cell. If the `getColorValue` prop is supplied, they will be ignored. Note that supplying `getColorValue` disables GPU aggregation.

###### Example 1 : Using count of data elements that fall into a cell to encode the its color

* Using `getColorValue`
```js

...
const layer = new CPUGridLayer({
  id: 'my-grid-layer',
  ...
  getColorValue: points => points.length,
  ...
});
```

* Using `getColorWeight` and `colorAggregation`
```js

...
const layer = new CPUGridLayer({
  id: 'my-grid-layer',
  ...
  getColorWeight: point => 1,
  colorAggregation: 'SUM'
  ...
});
```

###### Example 2 : Using mean value of 'SPACES' field of data elements to encode the color of the cell

* Using `getColorValue`
```js
function getMean(points) {
  return points.reduce((sum, p) => sum += p.SPACES, 0) / points.length;
}
...
const layer = new CPUGridLayer({
  id: 'my-grid-layer',
  ...
  getColorValue: getMean,
  ...
});
```

* Using `getColorWeight` and `colorAggregation`
```js
...
const layer = new CPUGridLayer({
  id: 'my-grid-layer',
  ...
  getColorWeight: point => point.SPACES,
  colorAggregation: 'SUM'
  ...
});
```

If your use case requires aggregating using an operation that is not one of 'SUM', 'MEAN', 'MAX' and 'MIN', `getColorValue` should be used to define such custom aggregation function. In those cases GPU aggregation is not supported.


##### `elevationAggregation` (string, optional) {#elevationaggregation}

* Default: 'SUM'

Defines the operation used to aggregate all data object weights to calculate a cell's elevation value. Valid values are 'SUM', 'MEAN', 'MIN' and 'MAX'. 'SUM' is used when an invalid value is provided.

`getElevationWeight` and `elevationAggregation` together determine the elevation value of each cell. If the `getElevationValue` prop is supplied, they will be ignored. Note that supplying `getElevationValue` disables GPU aggregation.

###### Example 1 : Using count of data elements that fall into a cell to encode the its elevation

* Using `getElevationValue`

```js
...
const layer = new CPUGridLayer({
  id: 'my-grid-layer',
  ...
  getElevationValue: points => points.length
  ...
});
```

* Using `getElevationWeight` and `elevationAggregation`
```js
...
const layer = new CPUGridLayer({
  id: 'my-grid-layer',
  ...
  getElevationWeight: point => 1,
  elevationAggregation: 'SUM'
  ...
});
```

###### Example 2 : Using maximum value of 'SPACES' field of data elements to encode the elevation of the cell

* Using `getElevationValue`
```js
function getMax(points) {
  return points.reduce((max, p) => p.SPACES > max ? p.SPACES : max, -Infinity);
}
...
const layer = new CPUGridLayer({
  id: 'my-grid-layer',
  ...
  getElevationValue: getMax,
  ...
});
```

* Using `getElevationWeight` and `elevationAggregation`
```js
...
const layer = new CPUGridLayer({
  id: 'my-grid-layer',
  ...
  getElevationWeight: point => point.SPACES,
  elevationAggregation: 'MAX'
  ...
});
```

If your use case requires aggregating using an operation that is not one of 'SUM', 'MEAN', 'MAX' and 'MIN', `getElevationValue` should be used to define such custom aggregation function. In those cases GPU aggregation is not supported.

##### `getElevationValue` (Function, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#getelevationvalue}

* Default: `null`

After data objects are aggregated into cells, this accessor is called on each cell to get the value that its elevation is based on. If supplied, this will override the effect of `getElevationWeight` and `elevationAggregation` props. Note that supplying this prop disables GPU aggregation.

Arguments:

- `objects` (DataT[]) - a list of objects whose positions fall inside this cell.
- `objectInfo` (object) - contains the following fields:
  + `indices` (number[]) - the indices of `objects` in the original data
  + `data` - the value of the `data` prop.


### Data Accessors

##### `getPosition` ([Accessor&lt;Position&gt;](../../developer-guide/using-layers.md#accessors), optional) {#getposition}

* Default: `object => object.position`

Method called to retrieve the position of each object.


##### `getColorWeight` ([Accessor&lt;number&gt;](../../developer-guide/using-layers.md#accessors), optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#getcolorweight}

* Default: `1`

The weight of a data object used to calculate the color value for a cell.

* If a number is provided, it is used as the weight for all objects.
* If a function is provided, it is called on each object to retrieve its weight.


##### `getColorValue` (Function, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#getcolorvalue}

* Default: `null`

After data objects are aggregated into cells, this accessor is called on each cell to get the value that its color is based on. If supplied, this will override the effect of `getColorWeight` and `colorAggregation` props. Note that supplying this prop disables GPU aggregation.

Arguments:

- `objects` (DataT[]) - a list of objects whose positions fall inside this cell.
- `objectInfo` (object) - contains the following fields:
  + `indices` (number[]) - the indices of `objects` in the original data
  + `data` - the value of the `data` prop.


##### `getElevationWeight` ([Accessor&lt;number&gt;](../../developer-guide/using-layers.md#accessors), optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#getelevationweight}

* Default: `1`

The weight of a data object used to calculate the elevation value for a cell.

* If a number is provided, it is used as the weight for all objects.
* If a function is provided, it is called on each object to retrieve its weight.


### Callbacks

##### `onSetColorDomain` (Function, optional) {#onsetcolordomain}

* Default: `([min, max]) => {}`

This callback will be called when cell color domain has been calculated.

##### `onSetElevationDomain` (Function, optional) {#onsetelevationdomain}

* Default: `([min, max]) => {}`

This callback will be called when cell elevation domain has been calculated.


## GPU Aggregation

### Performance Metrics

The following table compares the performance between CPU and GPU aggregations using random data:

| #objects | CPU #iterations/sec | GPU #iterations/sec | Notes |
| ---- | --- | --- | --- |
| 25K | 535 | 359 | GPU is <b style={{color:'red'}}>33%</b> slower |
| 100K | 119 | 437 | GPU is <b style={{color:'green'}}>267%</b> faster |
| 1M | 12.7 | 158 | GPU is <b style={{color:'green'}}>1144%</b> faster |

*Numbers are collected on a 2016 15-inch Macbook Pro (CPU: 2.8 GHz Intel Core i7 and GPU: AMD Radeon R9 M370X 2 GB)*

### Fallback Cases

This layer performs aggregation on GPU when the `gpuAggregation` prop is set to `true`, but will fallback to CPU in the following cases:

#### Percentile Props

When following percentile props are set, it requires sorting of aggregated values, which cannot be supported when aggregating on GPU.

* `lowerPercentile`, `upperPercentile`, `elevationLowerPercentile` and `elevationUpperPercentile`.

#### Color and Elevation Props

When `colorScaleType` props is set to a 'quantile' or 'ordinal', aggregation will fallback to CPU. For GPU Aggregation, use 'quantize', 'linear'.

#### Color Scale Type Props

When following percentile props are set, it requires sorting of aggregated values, which cannot be supported when aggregating on GPU.

* `lowerPercentile`, `upperPercentile`, `elevationLowerPercentile` and `elevationUpperPercentile`.

### Domain setting callbacks

When using GPU Aggregation, `onSetColorDomain` and `onSetElevationDomain` are not fired.


## Sub Layers

The GridLayer renders the following sublayers:

* `CPU` - a [CPUGridLayer](./cpu-grid-layer.md) when using CPU aggregation.

* `GPU` - a [GPUGridLayer](./gpu-grid-layer.md) when using GPU aggregation.

## Source

[modules/aggregation-layers/src/grid-layer](https://github.com/visgl/deck.gl/tree/master/modules/aggregation-layers/src/grid-layer)
