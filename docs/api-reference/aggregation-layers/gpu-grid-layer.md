# GPUGridLayer

import {GPUGridLayerDemo} from '@site/src/doc-demos/aggregation-layers';

<GPUGridLayerDemo />

The `GPUGridLayer` aggregates data into a grid-based heatmap. The color and height of a cell are determined based on the objects it contains.

`GPUGridLayer` is one of the sublayers for [GridLayer](./grid-layer.md). It is provided to customize GPU Aggregation for advanced use cases. For any regular use case, [GridLayer](./grid-layer.md) is recommended.

`GPUGridLayer` is a [CompositeLayer](../core/composite-layer.md).



import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs groupId="language">
  <TabItem value="js" label="JavaScript">

```js
import {Deck} from '@deck.gl/core';
import {GPUGridLayer} from '@deck.gl/geo-layers';

const layer = new GPUGridLayer({
  id: 'GPUGridLayer',
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
import {GPUGridLayer} from '@deck.gl/geo-layers';

type BikeRack = {
  ADDRESS: string;
  SPACES: number;
  COORDINATES: [longitude: number, latitude: number];
};

const layer = new GPUGridLayer<BikeRack>({
  id: 'GPUGridLayer',
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
import {GPUGridLayer} from '@deck.gl/geo-layers';
import type {PickingInfo} from '@deck.gl/core';

type BikeRack = {
  ADDRESS: string;
  SPACES: number;
  COORDINATES: [longitude: number, latitude: number];
};

function App() {
  const layer = new GPUGridLayer<BikeRack>({
    id: 'GPUGridLayer',
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

```ts
import {GPUGridLayer} from '@deck.gl/aggregation-layers';
import type {GPUGridLayerProps} from '@deck.gl/aggregation-layers';

new GPUGridLayer<DataT>(...props: GPUGridLayerProps<DataT>[]);
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
new deck._GPUGridLayer({});
```


## Properties

Inherits from all [Base Layer](../core/layer.md) and [CompositeLayer](../core/composite-layer.md) properties.

### Render Options

#### `cellSize` (number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#cellsize}

* Default: `1000`

Size of each cell in meters. Must be greater than `0`.

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
This is a handy property to scale the height of all cells without updating the data.

#### `extruded` (boolean, optional) {#extruded}

* Default: `true`

Whether to enable cell elevation. If set to false, all cell will be flat.

#### `material` (Material, optional) {#material}

* Default: `true`

This is an object that contains material props for [lighting effect](../core/lighting-effect.md) applied on extruded polygons.
Check [the lighting guide](../../developer-guide/using-effects.md#material-settings) for configurable settings.



#### `colorAggregation` (string, optional) {#coloraggregation}

* Default: `'SUM'`

Defines the operation used to aggregate all data object weights to calculate a bin's color value. Valid values are `'SUM'`, `'MEAN'`, `'MIN'` and `'MAX'`. `'SUM'` is used when an invalid value is provided.

`getColorWeight` and `colorAggregation` together determine the elevation value of each cell.

#### `elevationAggregation` (string, optional) {#elevationaggregation}

* Default: `'SUM'`

Defines the operation used to aggregate all data object weights to calculate a bin's elevation value. Valid values are `'SUM'`, `'MEAN'`, `'MIN'` and `'MAX'`. `'SUM'` is used when an invalid value is provided.

`getElevationWeight` and `elevationAggregation` together determine the elevation value of each cell.


### Data Accessors

#### `getPosition` ([Accessor&lt;Position&gt;](../../developer-guide/using-layers.md#accessors), optional) {#getposition}

* Default: `object => object.position`

Method called to retrieve the position of each object.


#### `getColorWeight` ([Accessor&lt;number&gt;](../../developer-guide/using-layers.md#accessors), optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#getcolorweight}

* Default: `1`

The weight of a data object used to calculate the color value for a cell.

* If a number is provided, it is used as the weight for all objects.
* If a function is provided, it is called on each object to retrieve its weight.


#### `getElevationWeight` ([Accessor&lt;number&gt;](../../developer-guide/using-layers.md#accessors), optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#getelevationweight}

* Default: `1`

The weight of a data object used to calculate the elevation value for a cell.

* If a number is provided, it is used as the weight for all objects.
* If a function is provided, it is called on each object to retrieve its weight.


## Differences compared to CPUGridLayer

### Unsupported props

Due to the nature of GPU Aggregation implementation, the following `CPUGridLayer` props are not supported by this layer.

`upperPercentile` `lowerPercentile` `elevationUpperPercentile`, `elevationLowerPercentile`, `getColorValue`, `getElevationValue`, `onSetColorDomain` and `onSetElevationDomain`

Instead of `getColorValue`, `getColorWeight` and `colorAggregation` should be used. Instead of `getElevationValue`, `getElevationWeight` and `elevationAggregation` should be used. There is no alternate for all other unsupported props, if they are needed `CPUGridLayer` should be used instead of this layer.

### Picking

When picking mode is `hover`, only the elevation value, color value of selected cell are included in picking result. Array of all objects that aggregated into that cell is not provided. For all other modes, picking results match with `CPUGridLayer`, for these cases data is aggregated on CPU to provide array of all objects that aggregated to the cell.


## Source

[modules/aggregation-layers/src/gpu-grid-layer](https://github.com/visgl/deck.gl/tree/master/modules/aggregation-layers/src/gpu-grid-layer)
