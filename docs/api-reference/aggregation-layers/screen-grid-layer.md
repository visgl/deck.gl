# ScreenGridLayer

import {ScreenGridLayerDemo} from '@site/src/doc-demos/aggregation-layers';

<ScreenGridLayerDemo />

The `ScreenGridLayer` aggregates data into histogram bins and renders them as a grid. By default aggregation happens on GPU, aggregation falls back to CPU when browser doesn't support GPU Aggregation or when `gpuAggregation` prop is set to 1.


import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs groupId="language">
  <TabItem value="js" label="JavaScript">

```js
import {Deck} from '@deck.gl/core';
import {ScreenGridLayer} from '@deck.gl/geo-layers';

const layer = new ScreenGridLayer({
  id: 'ScreenGridLayer',
  data: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/sf-bike-parking.json',

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
  layers: [layer]
});
```

  </TabItem>
  <TabItem value="ts" label="TypeScript">

```ts
import {Deck} from '@deck.gl/core';
import {ScreenGridLayer} from '@deck.gl/geo-layers';

type BikeRack = {
  ADDRESS: string;
  SPACES: number;
  COORDINATES: [longitude: number, latitude: number];
};

const layer = new ScreenGridLayer<BikeRack>({
  id: 'ScreenGridLayer',
  data: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/sf-bike-parking.json',

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
  layers: [layer]
});
```

  </TabItem>
  <TabItem value="react" label="React">

```tsx
import React from 'react';
import DeckGL from '@deck.gl/react';
import {ScreenGridLayer} from '@deck.gl/geo-layers';

type BikeRack = {
  ADDRESS: string;
  SPACES: number;
  COORDINATES: [longitude: number, latitude: number];
};

function App() {
  const layer = new ScreenGridLayer<BikeRack>({
    id: 'ScreenGridLayer',
    data: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/sf-bike-parking.json',

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
import type {ScreenGridLayerProps} from '@deck.gl/aggregation-layers';

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

### Render Options

#### `cellSizePixels` (number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#cellsizepixels}

* Default: `100`

Unit width/height of the bins.

#### `cellMarginPixels` (number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#cellmarginpixels}

* Default: `2`, gets clamped to [0, 5]

Cell margin size in pixels.

#### `minColor` (number[4], optional) **DEPRECATED** {#mincolor}

* Default: `[0, 0, 0, 255]`

Expressed as an rgba array, minimal color that could be rendered by a tile. This prop is deprecated in version 5.2.0, use `colorRange` and `colorDomain` instead.

#### `maxColor` (number[4], optional) **DEPRECATED** {#maxcolor}

* Default: `[0, 255, 0, 255]`

Expressed as an rgba array, maximal color that could be rendered by a tile.  This prop is deprecated in version 5.2.0, use `colorRange` and `colorDomain` instead.

#### `colorDomain` (number[2], optional) {#colordomain}

* Default: `[1, max(weight)]`

Color scale input domain. The color scale maps continues numeric domain into
discrete color range. If not provided, the layer will set `colorDomain` to [1, max-of-all-cell-weights], You can control how the color of cells mapped
to value of its weight by passing in an arbitrary color domain. This property is extremely handy when you want to render different data input with the same color mapping for comparison.

#### `colorRange` (Color[6], optional) {#colorrange}

* Default: <img src="https://deck.gl/images/colorbrewer_YlOrRd_6.png"/>

Specified as an array of 6 colors [color1, color2, ... color6]. Each color is an array of 3 or 4 values [R, G, B] or [R, G, B, A], representing intensities of Red, Green, Blue and Alpha channels.  Each intensity is a value between 0 and 255. When Alpha not provided a value of 255 is used. By default `colorRange` is set to
[colorbrewer](http://colorbrewer2.org/#type=sequential&scheme=YlOrRd&n=6) `6-class YlOrRd`.

NOTE: `minColor` and `maxColor` take precedence over `colorDomain` and `colorRange`, to use `colorDomain` and `colorRange` do not provide `minColor` and `maxColor`.

#### `gpuAggregation` (boolean, optional) {#gpuaggregation}

* Default: true

When set to true and browser supports GPU aggregation, aggregation is performed on GPU. GPU aggregation can be 10 to 20 times faster depending upon number of points and number of cells.

#### `aggregation` (string, optional) {#aggregation}

* Default: 'SUM'

Defines the type of aggregation operation, valid values are 'SUM', 'MEAN', 'MIN' and 'MAX'. When no value or an invalid value is set, 'SUM' is used as aggregation.

* SUM : Grid cell contains sum of all weights that fall into it.
* MEAN : Grid cell contains mean of all weights that fall into it.
* MIN : Grid cell contains minimum of all weights that fall into it.
* MAX : Grid cell contains maximum of all weights that fall into it.


### Data Accessors

#### `getPosition` ([Accessor&lt;Position&gt;](../../developer-guide/using-layers.md#accessors), optional) {#getposition}

* Default: `object => object.position`

Method called to retrieve the position of each object.

#### `getWeight` ([Accessor&lt;number&gt;](../../developer-guide/using-layers.md#accessors), optional) {#getweight}

* Default: `1`

The weight of each object.

* If a number is provided, it is used as the weight for all objects.
* If a function is provided, it is called on each object to retrieve its weight.


## Source

[modules/aggregation-layers/src/screen-grid-layer](https://github.com/visgl/deck.gl/tree/master/modules/aggregation-layers/src/screen-grid-layer)
