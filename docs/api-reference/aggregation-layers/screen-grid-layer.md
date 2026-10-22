# ScreenGridLayer

![webgpu](https://img.shields.io/badge/webgpu-supported-blue.svg?style=flat-square)

<!-- -->

Edit on Codepen

The `ScreenGridLayer` aggregates data into histogram bins in screen space and renders them as a overlaid grid.

<!-- -->

* JavaScript
* TypeScript
* React

```
import {Deck} from '@deck.gl/core';

import {ScreenGridLayer} from '@deck.gl/aggregation-layers';



const layer = new ScreenGridLayer({

  id: 'ScreenGridLayer',

  data: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/sf-bike-parking.json',



  gpuAggregation: true,

  cellSizePixels: 50,

  colorRange: [

    [0, 25, 0, 25],

    [0, 85, 0, 85],

    [0, 127, 0, 127],

    [0, 170, 0, 170],

    [0, 190, 0, 190],

    [0, 255, 0, 255]

  ],

  getPosition: d => d.COORDINATES,

  getWeight: d => d.SPACES,

  opacity: 0.8

});



new Deck({

  initialViewState: {

    longitude: -122.4,

    latitude: 37.74,

    zoom: 11

  },

  controller: true,

  getTooltip: ({object}) => object && `Count: ${object.value}`,

  layers: [layer]

});
```

```
import {Deck} from '@deck.gl/core';

import {ScreenGridLayer, ScreenGridLayerPickingInfo} from '@deck.gl/aggregation-layers';



type BikeRack = {

  ADDRESS: string;

  SPACES: number;

  COORDINATES: [longitude: number, latitude: number];

};



const layer = new ScreenGridLayer<BikeRack>({

  id: 'ScreenGridLayer',

  data: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/sf-bike-parking.json',



  gpuAggregation: true,

  cellSizePixels: 50,

  colorRange: [

    [0, 25, 0, 25],

    [0, 85, 0, 85],

    [0, 127, 0, 127],

    [0, 170, 0, 170],

    [0, 190, 0, 190],

    [0, 255, 0, 255]

  ],

  getPosition: (d: BikeRack) => d.COORDINATES,

  getWeight: (d: BikeRack) => d.SPACES,

  opacity: 0.8

});



new Deck({

  initialViewState: {

    longitude: -122.4,

    latitude: 37.74,

    zoom: 11

  },

  controller: true,

  getTooltip: ({object}: ScreenGridLayerPickingInfo<BikeRack>) => object && `Count: ${object.value}`,

  layers: [layer]

});
```

```
import React from 'react';

import {DeckGL} from '@deck.gl/react';

import {ScreenGridLayer, ScreenGridLayerPickingInfo} from '@deck.gl/aggregation-layers';



type BikeRack = {

  ADDRESS: string;

  SPACES: number;

  COORDINATES: [longitude: number, latitude: number];

};



function App() {

  const layer = new ScreenGridLayer<BikeRack>({

    id: 'ScreenGridLayer',

    data: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/sf-bike-parking.json',



    gpuAggregation: true,

    cellSizePixels: 50,

    colorRange: [

      [0, 25, 0, 25],

      [0, 85, 0, 85],

      [0, 127, 0, 127],

      [0, 170, 0, 170],

      [0, 190, 0, 190],

      [0, 255, 0, 255]

    ],

    getPosition: (d: BikeRack) => d.COORDINATES,

    getWeight: (d: BikeRack) => d.SPACES,

    opacity: 0.8

  });



  return <DeckGL

    initialViewState={{

      longitude: -122.4,

      latitude: 37.74,

      zoom: 11

    }}

    controller

    getTooltip={({object}: ScreenGridLayerPickingInfo<BikeRack>) => object && `Count: ${object.value}`}

    layers={[layer]}

  />;

}
```

**Note:** The aggregation is done in screen space, so the data prop needs to be reaggregated by the layer whenever the map is zoomed or panned. This means that this layer is best used with small data set, however the visuals when used with the right data set can be quite effective.

## Installation[​](#installation "Direct link to Installation")

To install the dependencies from NPM:

```
npm install deck.gl

# or

npm install @deck.gl/core @deck.gl/layers @deck.gl/aggregation-layers
```

```
import {ScreenGridLayer} from '@deck.gl/aggregation-layers';

import type {ScreenGridLayerProps, ScreenGridLayerPickingInfo} from '@deck.gl/aggregation-layers';



new ScreenGridLayer<DataT>(...props: ScreenGridLayerProps<DataT>[]);
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
new deck.ScreenGridLayer({});
```

## Properties[​](#properties "Direct link to Properties")

Inherits from all [Base Layer](https://deck.gl/docs/api-reference/core/layer.md) properties.

### Aggregation Options[​](#aggregation-options "Direct link to Aggregation Options")

#### `gpuAggregation` (boolean, optional)[​](#gpuaggregation "Direct link to gpuaggregation")

* Default: `true`

When set to `true` and the browser supports it, aggregation is performed on GPU.

In the right context, enabling GPU aggregation can significantly speed up your application. However, depending on the nature of input data and required application features, there are pros and cons in leveraging this functionality. See [CPU vs GPU aggregation](https://deck.gl/docs/api-reference/aggregation-layers/overview.md#cpu-vs-gpu-aggregation) for an in-depth discussion.

#### `cellSizePixels` (number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square%22)[​](#cellsizepixels "Direct link to cellsizepixels")

* Default: `100`

Unit width/height of the bins.

#### `aggregation` (string, optional)[​](#aggregation "Direct link to aggregation")

* Default: `'SUM'`

Defines the operation used to aggregate all data object weights to calculate a cell's value. Valid values are:

* `'SUM'`: The sum of weights across all points that fall into a cell.
* `'MEAN'`: The mean weight across all points that fall into a cell.
* `'MIN'`: The minimum weight across all points that fall into a cell.
* `'MAX'`: The maximum weight across all points that fall into a cell.
* `'COUNT'`: The number of points that fall into a cell.

`getWeight` and `aggregation` together determine the elevation value of each cell.

### Render Options[​](#render-options "Direct link to Render Options")

#### `cellMarginPixels` (number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square%22)[​](#cellmarginpixels "Direct link to cellmarginpixels")

* Default: `2`, gets clamped to \[0, 5]

Cell margin size in pixels.

Note that setting this prop does not affect how points are binned.

#### `colorScaleType` (string, optional)[​](#colorscaletype "Direct link to colorscaletype")

* Default: `'linear'`

The color scale converts from a continuous numeric stretch (`colorDomain`) into a list of colors (`colorRange`). Cells with value of `colorDomain[0]` will be rendered with the color of `colorRange[0]`, and cells with value of `colorDomain[1]` will be rendered with the color of `colorRange[colorRange.length - 1]`.

`colorScaleType` determines how a numeric value in domain is mapped to a color in range. Supported values are:

* `'linear'`: `colorRange` is linearly interpolated based on where the value lies in `colorDomain`.
* `'quantize'`: `colorDomain` is divided into `colorRange.length` equal segments, each mapped to one discrete color in `colorRange`.

#### `colorDomain` (number\[2], optional)[​](#colordomain "Direct link to colordomain")

* Default: `null` (auto)

If not provided, the layer will set `colorDomain` to the actual min, max values from all cells at run time.

By providing a `colorDomain`, you can control how a value is represented by color. This is useful when you want to render different data input with the same color mapping for comparison.

#### `colorRange` (Color\[6], optional)[​](#colorrange "Direct link to colorrange")

* Default: [colorbrewer](http://colorbrewer2.org/#type=sequential\&scheme=YlOrRd\&n=6) `6-class YlOrRd` ![](https://deck.gl/images/colorbrewer_YlOrRd_6.png)

Specified as an array of 6 colors \[color1, color2, ... color6]. Each color is an array of 3 or 4 values \[R, G, B] or \[R, G, B, A], representing intensities of Red, Green, Blue and Alpha channels. Each intensity is a value between 0 and 255. When Alpha is omitted a value of 255 is used.

### Data Accessors[​](#data-accessors "Direct link to Data Accessors")

#### `getPosition` ([Accessor\<Position>](https://deck.gl/docs/developer-guide/using-layers.md#accessors), optional)[​](#getposition "Direct link to getposition")

* Default: `object => object.position`

Method called to retrieve the position of each object.

#### `getWeight` ([Accessor\<number>](https://deck.gl/docs/developer-guide/using-layers.md#accessors), optional)[​](#getweight "Direct link to getweight")

* Default: `1`

The weight of each object.

* If a number is provided, it is used as the weight for all objects.
* If a function is provided, it is called on each object to retrieve its weight.

## Picking[​](#picking "Direct link to Picking")

The [PickingInfo.object](https://deck.gl/docs/developer-guide/interactivity.md#the-pickinginfo-object) field returned by hover/click events of this layer represents an aggregated cell. The object contains the following fields:

* `col` (number) - Column index of the picked cell, starting from 0 at the left of the viewport.
* `row` (number) - Row index of the picked cell, starting from 0 at the top of the viewport.
* `value` (number) - Aggregated value, as determined by `getWeight` and `aggregation`
* `count` (number) - Number of data points in the picked cell
* `pointIndices` (number\[]) - Indices of the data objects in the picked cell. Only available if using CPU aggregation.
* `points` (object\[]) - The data objects in the picked cell. Only available if using CPU aggregation and layer data is an array.

## Source[​](#source "Direct link to Source")

[modules/aggregation-layers/src/screen-grid-layer](https://github.com/visgl/deck.gl/tree/9.4-release/modules/aggregation-layers/src/screen-grid-layer)
