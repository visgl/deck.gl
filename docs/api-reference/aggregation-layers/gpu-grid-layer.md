# GPUGridLayer

import {GPUGridLayerDemo} from '@site/src/doc-demos/aggregation-layers';

<GPUGridLayerDemo />

The `GPUGridLayer` aggregates data into a grid-based heatmap. The color and height of a cell are determined based on the objects it contains.

`GPUGridLayer` is one of the sublayers for [GridLayer](./grid-layer.md). It is provided to customize GPU Aggregation for advanced use cases. For any regular use case, [GridLayer](./grid-layer.md) is recommended.

`GPUGridLayer` is a [CompositeLayer](../core/composite-layer.md).

```js
import DeckGL from '@deck.gl/react';
import {GPUGridLayer} from '@deck.gl/aggregation-layers';

function App({data, viewState}) {
  /**
   * Data format:
   * [
   *   {COORDINATES: [-122.42177834, 37.78346622]},
   *   ...
   * ]
   */
  const layer = new GPUGridLayer({
    id: 'gpu-grid-layer',
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

**Note:** The `GPUGridLayer` at the moment only works with `COORDINATE_SYSTEM.LNGLAT`.

**Note:** GPU Aggregation is faster only when using large data sets (data size is more than 500K), for smaller data sets GPU Aggregation could be potentially slower than CPU Aggregation.

**Note:** This layer is similar to [CPUGridLayer](./cpu-grid-layer.md) but performs aggregation on GPU. Check below for more detailed differences of this layer compared to `CPUGridLayer`.


## Installation

To install the dependencies from NPM:

```bash
npm install deck.gl
# or
npm install @deck.gl/core @deck.gl/layers @deck.gl/aggregation-layers
```

```js
import {GPUGridLayer} from '@deck.gl/aggregation-layers';
new GPUGridLayer({});
```

To use pre-bundled scripts:

```html
<script src="https://unpkg.com/deck.gl@^8.0.0/dist.min.js"></script>
<!-- or -->
<script src="https://unpkg.com/@deck.gl/core@^8.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/layers@^8.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/aggregation-layers@^8.0.0/dist.min.js"></script>
```

```js
new deck._GPUGridLayer({});
```


## Properties

Inherits from all [Base Layer](../core/layer.md) and [CompositeLayer](../core/composite-layer.md) properties.

### Render Options

##### `cellSize` (Number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#cellsize}

* Default: `1000`

Size of each cell in meters. Must be greater than `0`.

##### `colorDomain` (Array, optional) {#colordomain}

* Default: `[min(colorWeight), max(colorWeight)]`

Color scale domain, default is set to the extent of aggregated weights in each cell.
You can control how the colors of cells are mapped to weights by passing in an arbitrary color domain.
This is useful when you want to render different data input with the same color mapping for comparison.


##### `colorRange` (Array, optional) {#colorrange}

* Default: [colorbrewer](http://colorbrewer2.org/#type=sequential&scheme=YlOrRd&n=6) `6-class YlOrRd` <img src="https://deck.gl/images/colorbrewer_YlOrRd_6.png"/>

Specified as an array of colors [color1, color2, ...]. Each color is an array of 3 or 4 values [R, G, B] or [R, G, B, A], representing intensities of Red, Green, Blue and Alpha channels.  Each intensity is a value between 0 and 255. When Alpha not provided a value of 255 is used.

`colorDomain` is divided into `colorRange.length` equal segments, each mapped to one color in `colorRange`.

##### `coverage` (Number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#coverage}

* Default: `1`

Cell size multiplier, clamped between 0 - 1. The displayed size of cell is calculated by `coverage * cellSize`.
Note: coverage does not affect how objects are binned.

##### `elevationDomain` (Array, optional) {#elevationdomain}

* Default: `[0, max(elevationWeight)]`

Elevation scale input domain, default is set to between 0 and the max of aggregated weights in each cell.
You can control how the elevations of cells are mapped to weights by passing in an arbitrary elevation domain.
This is useful when you want to render different data input with the same elevation scale for comparison.

##### `elevationRange` (Array, optional) {#elevationrange}

* Default: `[0, 1000]`

Elevation scale output range

##### `elevationScale` (Number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#elevationscale}

* Default: `1`

Cell elevation multiplier.
This is a handy property to scale the height of all cells without updating the data.

##### `extruded` (Boolean, optional) {#extruded}

* Default: `true`

Whether to enable cell elevation. If set to false, all cell will be flat.

##### `material` (Object, optional) {#material}

* Default: `true`

This is an object that contains material props for [lighting effect](../core/lighting-effect.md) applied on extruded polygons.
Check [the lighting guide](../../developer-guide/using-lighting.md#constructing-a-material-instance) for configurable settings.



##### `colorAggregation` (String, optional) {#coloraggregation}

* Default: 'SUM'

Defines the operation used to aggregate all data object weights to calculate a cell's color value. Valid values are 'SUM', 'MEAN', 'MIN' and 'MAX'. 'SUM' is used when an invalid value is provided.

`getColorWeight` and `colorAggregation` together determine the elevation value of each cell.

##### `elevationAggregation` (String, optional) {#elevationaggregation}

* Default: 'SUM'

Defines the operation used to aggregate all data object weights to calculate a cell's elevation value. Valid values are 'SUM', 'MEAN', 'MIN' and 'MAX'. 'SUM' is used when an invalid value is provided.

`getElevationWeight` and `elevationAggregation` together determine the elevation value of each cell.


### Data Accessors

##### `getPosition` ([Function](../../developer-guide/using-layers.md#accessors), optional) {#getposition}

* Default: `object => object.position`

Method called to retrieve the position of each object.


##### `getColorWeight` (Function, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#getcolorweight}

* Default: `1`

The weight of a data object used to calculate the color value for a cell.

* If a number is provided, it is used as the weight for all objects.
* If a function is provided, it is called on each object to retrieve its weight.


##### `getElevationWeight` (Function, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#getelevationweight}

* Default: `1`

The weight of a data object used to calculate the elevation value for a cell.

* If a number is provided, it is used as the weight for all objects.
* If a function is provided, it is called on each object to retrieve its weight.


## Differences compared to CPUGridLayer

### Unsupported props

Due to the nature of GPU Aggregation implementation following CPUGridLayer props are not supported by this layer.

`upperPercentile` `lowerPercentile` `elevationUpperPercentile`, `elevationLowerPercentile`, `getColorValue`, `getElevationValue`, `onSetColorDomain` and `onSetElevationDomain`

Instead of `getColorValue`, `getColorWeight` and `colorAggregation` should be used. Instead of `getElevationValue`, `getElevationWeight` and `elevationAggregation` should be used. There is no alternate for all other unsupported props, if they are needed `CPUGridLayer` should be used instead of this layer.

### Picking

When picking mode is `hover`, only the elevation value, color value of selected cell are included in picking result. Array of all objects that aggregated into that cell is not provided. For all other modes, picking results match with `CPUGridLayer`, for these cases data is aggregated on CPU to provide array of all objects that aggregated to the cell.


## Source

[modules/aggregation-layers/src/gpu-grid-layer](https://github.com/visgl/deck.gl/tree/master/modules/aggregation-layers/src/gpu-grid-layer)
