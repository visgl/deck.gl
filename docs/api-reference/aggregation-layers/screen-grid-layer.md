# ScreenGridLayer

import {ScreenGridLayerDemo} from '@site/src/doc-demos/aggregation-layers';

<ScreenGridLayerDemo />

The `ScreenGridLayer` aggregates data into histogram bins in screen space and renders them as a overlaid grid.


import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs groupId="language">
  <TabItem value="js" label="JavaScript">

```js
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

  </TabItem>
  <TabItem value="ts" label="TypeScript">

```ts
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

  </TabItem>
  <TabItem value="react" label="React">

```tsx
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

  </TabItem>
</Tabs>


**Note:** The aggregation is done in screen space, so the data prop
needs to be reaggregated by the layer whenever the map is zoomed or panned.
This means that this layer is best used with small data set, however the
visuals when used with the right data set can be quite effective.



## Installation

To install the dependencies from NPM:

```bash
npm install deck.gl
# or
npm install @deck.gl/core @deck.gl/layers @deck.gl/aggregation-layers
```

```ts
import {ScreenGridLayer} from '@deck.gl/aggregation-layers';
import type {ScreenGridLayerProps, ScreenGridLayerPickingInfo} from '@deck.gl/aggregation-layers';

new ScreenGridLayer<DataT>(...props: ScreenGridLayerProps<DataT>[]);
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
new deck.ScreenGridLayer({});
```


## Properties

Inherits from all [Base Layer](../core/layer.md) properties.

### Aggregation Options

#### `gpuAggregation` (boolean, optional) {#gpuaggregation}

* Default: `true`

When set to `true` and the browser supports it, aggregation is performed on GPU.

In the right context, enabling GPU aggregation can significantly speed up your application. However, depending on the nature of input data and required application features, there are pros and cons in leveraging this functionality. See [CPU vs GPU aggregation](./overview.md#cpu-vs-gpu-aggregation) for an in-depth discussion.


#### `cellSizePixels` (number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#cellsizepixels}

* Default: `100`

Unit width/height of the bins.

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

#### `cellMarginPixels` (number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#cellmarginpixels}

* Default: `2`, gets clamped to [0, 5]

Cell margin size in pixels.

Note that setting this prop does not affect how points are binned.

#### `colorScaleType` (string, optional) {#colorscaletype}

* Default: `'linear'`

The color scale converts from a continuous numeric stretch (`colorDomain`) into a list of colors (`colorRange`). Cells with value of `colorDomain[0]` will be rendered with the color of `colorRange[0]`, and cells with value of `colorDomain[1]` will be rendered with the color of `colorRange[colorRange.length - 1]`.

`colorScaleType` determines how a numeric value in domain is mapped to a color in range. Supported values are:
- `'linear'`: `colorRange` is linearly interpolated based on where the value lies in `colorDomain`.
- `'quantize'`: `colorDomain` is divided into `colorRange.length` equal segments, each mapped to one discrete color in `colorRange`.

#### `colorDomain` (number[2], optional) {#colordomain}

* Default: `null` (auto)

If not provided, the layer will set `colorDomain` to the
actual min, max values from all cells at run time.

By providing a `colorDomain`, you can control how a value is represented by color. This is useful when you want to render different data input with the same color mapping for comparison.

#### `colorRange` (Color[6], optional) {#colorrange}

* Default: [colorbrewer](http://colorbrewer2.org/#type=sequential&scheme=YlOrRd&n=6) `6-class YlOrRd` <img src="https://deck.gl/images/colorbrewer_YlOrRd_6.png"/>

Specified as an array of 6 colors [color1, color2, ... color6]. Each color is an array of 3 or 4 values [R, G, B] or [R, G, B, A], representing intensities of Red, Green, Blue and Alpha channels.  Each intensity is a value between 0 and 255. When Alpha is omitted a value of 255 is used.

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

The [PickingInfo.object](../../developer-guide/interactivity.md#the-pickinginfo-object) field returned by hover/click events of this layer represents an aggregated cell. The object contains the following fields:

- `col` (number) - Column index of the picked cell, starting from 0 at the left of the viewport.
- `row` (number) - Row index of the picked cell, starting from 0 at the top of the viewport.
- `value` (number) - Aggregated value, as determined by `getWeight` and `aggregation`
- `count` (number) - Number of data points in the picked cell
- `pointIndices` (number[]) - Indices of the data objects in the picked cell. Only available if using CPU aggregation.
- `points` (object[]) - The data objects in the picked cell. Only available if using CPU aggregation and layer data is an array.


## Source

[modules/aggregation-layers/src/screen-grid-layer](https://github.com/visgl/deck.gl/tree/9.1-release/modules/aggregation-layers/src/screen-grid-layer)
