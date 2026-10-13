# GridLayer

<!-- -->

Edit on Codepen

The `GridLayer` aggregates data into a grid-based heatmap. The color and height of a grid cell are determined based on the objects it contains.

`GridLayer` is a [CompositeLayer](https://deck.gl/next/docs/api-reference/core/composite-layer.md).

<!-- -->

* JavaScript
* TypeScript
* React

```
import {Deck} from '@deck.gl/core';

import {GridLayer} from '@deck.gl/aggregation-layers';



const layer = new GridLayer({

  id: 'GridLayer',

  data: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/sf-bike-parking.json',



  gpuAggregation: true,

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

```
import {Deck} from '@deck.gl/core';

import {GridLayer, GridLayerPickingInfo} from '@deck.gl/aggregation-layers';



type BikeRack = {

  ADDRESS: string;

  SPACES: number;

  COORDINATES: [longitude: number, latitude: number];

};



const layer = new GridLayer<BikeRack>({

  id: 'GridLayer',

  data: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/sf-bike-parking.json',



  gpuAggregation: true,

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

  getTooltip: ({object}: GridLayerPickingInfo<BikeRack>) => object && `Count: ${object.elevationValue}`,

  layers: [layer]

});
```

```
import React from 'react';

import {DeckGL} from '@deck.gl/react';

import {GridLayer, GridLayerPickingInfo} from '@deck.gl/aggregation-layers';



type BikeRack = {

  ADDRESS: string;

  SPACES: number;

  COORDINATES: [longitude: number, latitude: number];

};



function App() {

  const layer = new GridLayer<BikeRack>({

    id: 'GridLayer',

    data: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/sf-bike-parking.json',



    gpuAggregation: true,

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

    getTooltip={({object}: GridLayerPickingInfo<BikeRack>) => object && `Count: ${object.elevationValue}`}

    layers={[layer]}

  />;

}
```

## Installation[​](#installation "Direct link to Installation")

To install the dependencies from NPM:

```
npm install deck.gl

# or

npm install @deck.gl/core @deck.gl/layers @deck.gl/aggregation-layers
```

```
import {GridLayer} from '@deck.gl/aggregation-layers';

import type {GridLayerProps, GridLayerPickingInfo} from '@deck.gl/aggregation-layers';



new GridLayer<DataT>(...props: GridLayerProps<DataT>[]);
```

To use pre-bundled scripts:

```
<script src="https://unpkg.com/deck.gl@^9.0.0/dist.min.js"></script>

<!-- or -->

<script src="https://unpkg.com/@deck.gl/core@^9.0.0/dist.min.js"></script>

<script src="https://unpkg.com/@deck.gl/layers@^9.0.0/dist.min.js"></script>

<script src="https://unpkg.com/@deck.gl/aggregation-layers@^9.0.0/dist.min.js"></script>
```

```
new deck.GridLayer({});
```

## Properties[​](#properties "Direct link to Properties")

Inherits from all [Base Layer](https://deck.gl/next/docs/api-reference/core/layer.md) and [CompositeLayer](https://deck.gl/next/docs/api-reference/core/composite-layer.md) properties.

### Aggregation Options[​](#aggregation-options "Direct link to Aggregation Options")

#### `gpuAggregation` (boolean, optional)[​](#gpuaggregation "Direct link to gpuaggregation")

* Default: `true`

When set to `true`, aggregation is performed on the GPU.

In the right context, enabling GPU aggregation can significantly speed up your application. However, depending on the nature of input data and required application features, there are pros and cons in leveraging this functionality. See [CPU vs GPU aggregation](https://deck.gl/next/docs/api-reference/aggregation-layers/overview.md#cpu-vs-gpu-aggregation) for an in-depth discussion.

CPU aggregation is used as fallback in the following cases:

* The current browser does not support GPU aggregation
* The layer is rendered with WebGPU, which does not support WebGL GPU aggregation
* `gridAggregator` is defined
* `getColorValue` is defined
* `getElevationValue` is defined

#### `cellSize` (number, optional)[​](#cellsize "Direct link to cellsize")

* Default: `1000`

Size of each cell in meters.

In geospatial views, this size represents locally approximated ground meters. The viewport's distance scale is evaluated at the center of the data bounds and applied uniformly to all bins. Projection distortion may vary across the dataset, so ground dimensions away from that anchor are approximate. Panning does not change the bin definitions.

#### `colorAggregation` (string, optional)[​](#coloraggregation "Direct link to coloraggregation")

* Default: `'SUM'`

Defines the operation used to aggregate all data object weights to calculate a cell's color value. Valid values are:

* `'SUM'`: The sum of weights across all points that fall into a cell.
* `'MEAN'`: The mean weight across all points that fall into a cell.
* `'MIN'`: The minimum weight across all points that fall into a cell.
* `'MAX'`: The maximum weight across all points that fall into a cell.
* `'COUNT'`: The number of points that fall into a cell.

`getColorWeight` and `colorAggregation` together determine the color value of each cell. If the `getColorValue` prop is supplied, they will be ignored.

##### Example: Color by the count of data elements[​](#example-color-by-the-count-of-data-elements "Direct link to Example: Color by the count of data elements")

Option A: use getColorValue (CPU only)

```
const layer = new HexagonLayer<BikeRack>({

  //...

  getColorValue: (points: BikeRack[]) => points.length

});
```

Option B: use getColorWeight and colorAggregation (CPU or GPU)

```
const layer = new HexagonLayer<BikeRack>({

  // ...

  getColorWeight: 1,

  colorAggregation: 'COUNT'

});
```

##### Example: Color by the mean value of 'SPACES' field[​](#example-color-by-the-mean-value-of-spaces-field "Direct link to Example: Color by the mean value of 'SPACES' field")

Option A: use getColorValue (CPU only)

```
const layer = new HexagonLayer<BikeRack>({

  // ...

  getColorValue: (points: BikeRack[]) => {

    // Calculate mean value

    return points.reduce((sum: number, p: BikeRack) => sum += p.SPACES, 0) / points.length;

  }

});
```

Option B: use getColorWeight and colorAggregation (CPU or GPU)

```
const layer = new HexagonLayer<BikeRack>({

  // ...

  getColorWeight: (point: BikeRack) => point.SPACES,

  colorAggregation: 'MEAN'

});
```

If your use case requires aggregating using an operation other than the built-in `colorAggregation` values, `getColorValue` should be used to define such custom aggregation function.

#### `elevationAggregation` (string, optional)[​](#elevationaggregation "Direct link to elevationaggregation")

* Default: `'SUM'`

Defines the operation used to aggregate all data object weights to calculate a cell's elevation value. Valid values are:

* `'SUM'`: The sum of weights across all points that fall into a cell.
* `'MEAN'`: The mean weight across all points that fall into a cell.
* `'MIN'`: The minimum weight across all points that fall into a cell.
* `'MAX'`: The maximum weight across all points that fall into a cell.
* `'COUNT'`: The number of points that fall into a cell.

`getElevationWeight` and `elevationAggregation` together determine the elevation value of each cell. If the `getElevationValue` prop is supplied, they will be ignored.

##### Example: Elevation by the count of data elements[​](#example-elevation-by-the-count-of-data-elements "Direct link to Example: Elevation by the count of data elements")

Option A: use getElevationValue (CPU only)

```
const layer = new HexagonLayer<BikeRack>({

  // ...

  getElevationValue: (points: BikeRack[]) => points.length

});
```

Option B: use getElevationWeight and elevationAggregation (CPU or GPU)

```
const layer = new HexagonLayer<BikeRack>({

  // ...

  getElevationWeight: 1,

  elevationAggregation: 'COUNT'

});
```

##### Example: Elevation by the maximum value of 'SPACES' field[​](#example-elevation-by-the-maximum-value-of-spaces-field "Direct link to Example: Elevation by the maximum value of 'SPACES' field")

Option A: use getElevationValue (CPU only)

```
const layer = new HexagonLayer<BikeRack>({

  // ...

  getElevationValue: (points: BikeRack[]) => {

    // Calculate max value

    return points.reduce((max: number, p: BikeRack) => p.SPACES > max ? p.SPACES : max, -Infinity);

  }

});
```

Option B: use getElevationWeight and elevationAggregation (CPU or GPU)

```
const layer = new HexagonLayer<BikeRack>({

  // ...

  getElevationWeight: (point: BikeRack) => point.SPACES,

  elevationAggregation: 'MAX'

});
```

If your use case requires aggregating using an operation other than the built-in `elevationAggregation` values, `getElevationValue` should be used to define such custom aggregation function.

#### `gridAggregator` (Function, optional)[​](#gridaggregator "Direct link to gridaggregator")

* Default: `null`

A custom function to override how points are grouped into grid cells. If this prop is supplied, GPU aggregation will be disabled regardless of the `gpuAggregation` setting.

This function will be called with the following arguments:

* `position` (number\[]) - the position of a data point
* `cellSize` (number) - value of the `cellSize` prop

It is expected to return an array of 2 integers that represent a cell ID. Points that resolve to the same cell ID are grouped together.

### Render Options[​](#render-options "Direct link to Render Options")

#### `coverage` (number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square%22)[​](#coverage "Direct link to coverage")

* Default: `1`

Cell size multiplier, clamped between 0 - 1. The displayed size of cell is calculated by `coverage * cellSize`. Note: coverage does not affect how objects are binned.

#### `extruded` (boolean, optional)[​](#extruded "Direct link to extruded")

* Default: `true`

Whether to enable cell elevation.If set to false, all cell will be flat.

#### `colorScaleType` (string, optional)[​](#colorscaletype "Direct link to colorscaletype")

* Default: `'quantize'`

The color scale converts from a continuous numeric stretch (`colorDomain`) into a list of colors (`colorRange`). Cells with value of `colorDomain[0]` will be rendered with the color of `colorRange[0]`, and cells with value of `colorDomain[1]` will be rendered with the color of `colorRange[colorRange.length - 1]`.

`colorScaleType` determines how a numeric value in domain is mapped to a color in range. Supported values are:

* `'linear'`: `colorRange` is linearly interpolated based on where the value lies in `colorDomain`.
* `'quantize'`: `colorDomain` is divided into `colorRange.length` equal segments, each mapped to one discrete color in `colorRange`.
* `'quantile'`: input values are divided into `colorRange.length` equal-size groups, each mapped to one discrete color in `colorRange`.
* `'ordinal'`: each unique value is mapped to one discrete color in `colorRange`.

Note that using "quantile" or "ordinal" scale with GPU aggregation will incur a one-time cost of reading aggregated values from the GPU to the CPU. This overhead may be undesirable if the source data updates frequently.

#### `colorDomain` (number\[2], optional)[​](#colordomain "Direct link to colordomain")

* Default: `null` (auto)

If not provided, the layer will set `colorDomain` to the actual min, max values from all cells at run time.

By providing a `colorDomain`, you can control how a value is represented by color. This is useful when you want to render different data input with the same color mapping for comparison.

#### `colorRange` (Color\[], optional)[​](#colorrange "Direct link to colorrange")

* Default: [colorbrewer](http://colorbrewer2.org/#type=sequential\&scheme=YlOrRd\&n=6) `6-class YlOrRd` ![](https://deck.gl/images/colorbrewer_YlOrRd_6.png)

Specified as an array of colors \[color1, color2, ...]. Each color is an array of 3 or 4 values \[R, G, B] or \[R, G, B, A], representing intensities of Red, Green, Blue and Alpha channels. Each intensity is a value between 0 and 255. When Alpha is omitted a value of 255 is used.

#### `elevationScaleType` (string, optional)[​](#elevationscaletype "Direct link to elevationscaletype")

* Default: `'linear'`

The elevation scale converts from a continuous numeric stretch (`elevationDomain`) into another continuous numeric stretch (`elevationRange`). Cells with value of `elevationDomain[0]` will be rendered with the elevation of `elevationRange[0]`, and cells with value of `elevationDomain[1]` will be rendered with the elevation of `elevationRange[1]`.

`elevationScaleType` determines how a numeric value in domain is mapped to a elevation in range. Supported values are:

* `'linear'`: `elevationRange` is linearly interpolated based on where the value lies in `elevationDomain`.
* `'quantile'`: input values are divided into percentile groups, each mapped to one discrete elevation in `elevationRange`.

#### `elevationDomain` (number\[2], optional)[​](#elevationdomain "Direct link to elevationdomain")

* Default: `null` (auto)

If not provided, the layer will set `elevationDomain` to the actual min, max values from all cells at run time.

By providing a `elevationDomain`, you can control how a value is represented by elevation. This is useful when you want to render different data input with the same elevation mapping for comparison.

#### `elevationRange` (number\[2], optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square%22)[​](#elevationrange "Direct link to elevationrange")

* Default: `[0, 1000]`

Elevation scale output range

#### `elevationScale` (number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square%22)[​](#elevationscale "Direct link to elevationscale")

* Default: `1`

Cell elevation multiplier. This is a handy property to scale all cells without updating the data.

#### `upperPercentile` (number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square%22)[​](#upperpercentile "Direct link to upperpercentile")

* Default: `100`

Filter cells and re-calculate color by `upperPercentile`. Cells with value larger than the upperPercentile will be hidden.

Note that using this prop with GPU aggregation will incur a one-time cost of reading aggregated values from the GPU to the CPU. This overhead may be undesirable if the source data updates frequently.

#### `lowerPercentile` (number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square%22)[​](#lowerpercentile "Direct link to lowerpercentile")

* Default: `0`

Filter cells and re-calculate color by `lowerPercentile`. Cells with value smaller than the lowerPercentile will be hidden.

Note that using this prop with GPU aggregation will incur a one-time cost of reading aggregated values from the GPU to the CPU. This overhead may be undesirable if the source data updates frequently.

#### `elevationUpperPercentile` (number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square%22)[​](#elevationupperpercentile "Direct link to elevationupperpercentile")

* Default: `100`

Filter cells and re-calculate elevation by `elevationUpperPercentile`. Cells with elevation value larger than the elevationUpperPercentile will be hidden.

Note that using this prop with GPU aggregation will incur a one-time cost of reading aggregated values from the GPU to the CPU. This overhead may be undesirable if the source data updates frequently.

#### `elevationLowerPercentile` (number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square%22)[​](#elevationlowerpercentile "Direct link to elevationlowerpercentile")

* Default: `0`

Filter cells and re-calculate elevation by `elevationLowerPercentile`. Cells with elevation value smaller than the elevationLowerPercentile will be hidden.

Note that using this prop with GPU aggregation will incur a one-time cost of reading aggregated values from the GPU to the CPU. This overhead may be undesirable if the source data updates frequently.

#### `material` (Material, optional)[​](#material "Direct link to material")

* Default: `true`

This is an object that contains material props for [lighting effect](https://deck.gl/next/docs/api-reference/core/lighting-effect.md) applied on extruded polygons. Check [the lighting guide](https://deck.gl/next/docs/developer-guide/using-effects.md#material-settings) for configurable settings.

### Data Accessors[​](#data-accessors "Direct link to Data Accessors")

#### `getPosition` ([Accessor\<Position>](https://deck.gl/next/docs/developer-guide/using-layers.md#accessors), optional)[​](#getposition "Direct link to getposition")

* Default: `object => object.position`

Method called to retrieve the position of each object.

#### `getColorWeight` ([Accessor\<number>](https://deck.gl/next/docs/developer-guide/using-layers.md#accessors), optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square%22)[​](#getcolorweight "Direct link to getcolorweight")

* Default: `1`

The weight of a data object used to calculate the color value for a cell.

* If a number is provided, it is used as the weight for all objects.
* If a function is provided, it is called on each object to retrieve its weight.

#### `getColorValue` (Function, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square%22)[​](#getcolorvalue "Direct link to getcolorvalue")

* Default: `null`

After data objects are aggregated into cells, this accessor is called on each cell to get the value that its color is based on. If supplied, this will override the effect of `getColorWeight` and `colorAggregation` props. Note that supplying this prop disables GPU aggregation.

Arguments:

* `objects` (DataT\[]) - a list of objects whose positions fall inside this cell.

* `objectInfo` (object) - contains the following fields:

  <!-- -->

  * `indices` (number\[]) - the indices of `objects` in the original data
  * `data` - the value of the `data` prop.

#### `getElevationWeight` ([Accessor\<number>](https://deck.gl/next/docs/developer-guide/using-layers.md#accessors), optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square%22)[​](#getelevationweight "Direct link to getelevationweight")

* Default: `1`

The weight of a data object used to calculate the elevation value for a cell.

* If a number is provided, it is used as the weight for all objects.
* If a function is provided, it is called on each object to retrieve its weight.

#### `getElevationValue` (Function, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square%22)[​](#getelevationvalue "Direct link to getelevationvalue")

* Default: `null`

After data objects are aggregated into cells, this accessor is called on each cell to get the value that its elevation is based on. If supplied, this will override the effect of `getElevationWeight` and `elevationAggregation` props.

Arguments:

* `objects` (DataT\[]) - a list of objects whose positions fall inside this cell.

* `objectInfo` (object) - contains the following fields:

  <!-- -->

  * `indices` (number\[]) - the indices of `objects` in the original data
  * `data` - the value of the `data` prop.

### Callbacks[​](#callbacks "Direct link to Callbacks")

#### `onSetColorDomain` (Function, optional)[​](#onsetcolordomain "Direct link to onsetcolordomain")

* Default: `([min, max]) => {}`

This callback will be called when cell color domain has been calculated.

#### `onSetElevationDomain` (Function, optional)[​](#onsetelevationdomain "Direct link to onsetelevationdomain")

* Default: `([min, max]) => {}`

This callback will be called when cell elevation domain has been calculated.

## Picking[​](#picking "Direct link to Picking")

The [PickingInfo.object](https://deck.gl/next/docs/developer-guide/interactivity.md#the-pickinginfo-object) field returned by hover/click events of this layer represents an aggregated cell. The object contains the following fields:

* `col` (number) - Column index of the picked cell.
* `row` (number) - Row index of the picked cell.
* `colorValue` (number) - Aggregated color value, as determined by `getColorWeight` and `colorAggregation`
* `elevationValue` (number) - Aggregated elevation value, as determined by `getElevationWeight` and `elevationAggregation`
* `count` (number) - Number of data points in the picked cell
* `pointIndices` (number\[]) - Indices of the data objects in the picked cell. Only available if using CPU aggregation.
* `points` (object\[]) - The data objects in the picked cell. Only available if using CPU aggregation and layer data is an array.

## Sub Layers[​](#sub-layers "Direct link to Sub Layers")

The GridLayer renders the following sublayers:

* `cells` - a custom layer that extends the [ColumnLayer](https://deck.gl/next/docs/api-reference/layers/column-layer.md).

## Source[​](#source "Direct link to Source")

[modules/aggregation-layers/src/grid-layer](https://github.com/visgl/deck.gl/tree/master/modules/aggregation-layers/src/grid-layer)
