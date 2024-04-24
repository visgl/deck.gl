# HeatmapLayer

import {HeatmapLayerDemo} from '@site/src/doc-demos/aggregation-layers';

<HeatmapLayerDemo />

`HeatmapLayer` can be used to visualize spatial distribution of data. It internally implements [Gaussian Kernel Density Estimation](https://en.wikipedia.org/wiki/Kernel%20%28statistics%29#Kernel_functions_in_common_use) to render heatmaps. Note that this layer does not support all platforms; see "limitations" section below.


import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs groupId="language">
  <TabItem value="js" label="JavaScript">

```js
import {Deck} from '@deck.gl/core';
import {HeatmapLayer} from '@deck.gl/aggregation-layers';

const layer = new HeatmapLayer({
  id: 'HeatmapLayer',
  data: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/sf-bike-parking.json',

  aggregation: 'SUM',
  getPosition: d => d.COORDINATES,
  getWeight: d => d.SPACES,
  radiusPixels: 25
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
import {HeatmapLayer} from '@deck.gl/geo-layers';

type BikeRack = {
  ADDRESS: string;
  SPACES: number;
  COORDINATES: [longitude: number, latitude: number];
};

const layer = new HeatmapLayer<BikeRack>({
  id: 'HeatmapLayer',
  data: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/sf-bike-parking.json',

  aggregation: 'SUM',
  getPosition: (d: BikeRack) => d.COORDINATES,
  getWeight: (d: BikeRack) => d.SPACES,
  radiusPixels: 25
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
import {HeatmapLayer} from '@deck.gl/geo-layers';

type BikeRack = {
  ADDRESS: string;
  SPACES: number;
  COORDINATES: [longitude: number, latitude: number];
};

function App() {
  const layer = new HeatmapLayer<BikeRack>({
    id: 'HeatmapLayer',
    data: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/sf-bike-parking.json',

    aggregation: 'SUM',
    getPosition: (d: BikeRack) => d.COORDINATES,
    getWeight: (d: BikeRack) => d.SPACES,
    radiusPixels: 25
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


## Installation

To install the dependencies from NPM:

```bash
npm install deck.gl
# or
npm install @deck.gl/core @deck.gl/layers @deck.gl/aggregation-layers
```

```ts
import {HeatmapLayer} from '@deck.gl/aggregation-layers';
import type {HeatmapLayerProps} from '@deck.gl/aggregation-layers';

new HeatmapLayer<DataT>(...props: HeatmapLayerProps<DataT>[]);
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
new deck.HeatmapLayer({});
```


## Properties

Inherits from all [Base Layer](../core/layer.md) and [CompositeLayer](../core/composite-layer.md) properties.

### Render Options

#### `radiusPixels` (number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#radiuspixels}

* Default: `30`

Radius of the circle in pixels, to which the weight of an object is distributed.

#### `colorRange` (Color[], optional) {#colorrange}

* Default: [colorbrewer](http://colorbrewer2.org/#type=sequential&scheme=YlOrRd&n=6) `6-class YlOrRd` <img src="https://deck.gl/images/colorbrewer_YlOrRd_6.png"/>

The color palette used in the heatmap, as an array of colors [color1, color2, ...]. Each color is in the format of `[r, g, b, [a]]`. Each channel is a number between 0-255 and `a` is 255 if not supplied.

See the `colorDomain` section below for how weight values are mapped to colors in `colorRange`.

#### `intensity` (number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#intensity}

* Default: `1`

Value that is multiplied with the total weight at a pixel to obtain the final weight. A value larger than `1` biases the output color towards the higher end of the spectrum, and a value less than `1` biases the output color towards the lower end of the spectrum.

#### `threshold` (number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#threshold}

* Default: `0.05`

The `HeatmapLayer` reduces the opacity of the pixels with relatively low weight to create a fading effect at the edge. A larger `threshold` smoothens the boundaries of color blobs, while making pixels with low relative weight harder to spot (due to low alpha value).

`threshold` is defined as the ratio of the fading weight to the max weight, between `0` and `1`. For example, `0.1` affects all pixels with weight under 10% of the max.

`threshold` is ignored when `colorDomain` is specified.

#### `colorDomain` (number[2], optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#colordomain}

* Default: `null`

Controls how weight values are mapped to the `colorRange`, as an array of two numbers [`minValue`, `maxValue`].

When `colorDomain` is specified, a pixel with `minValue` is assigned the first color in `colorRange`, a pixel with `maxValue` is assigned the last color in `colorRange`, and any value in between is linearly interpolated. Pixels with weight less than `minValue` gradually fade out by reducing alpha, until 100% transparency representing `0`. Pixels with weight more than `maxValue` are capped to the last color in `colorRange`.

- If using `aggregation: 'SUM'`, values in `colorDomain` are interpreted as weight per square meter.
- If using `aggregation: 'MEAN'`, values in `colorDomain` are interpreted as weight.

When this prop is not specified, the maximum value is automatically determined from the current viewport, and the domain is set to [`maxValue * threshold`, `maxValue`]. This default behavior ensures that the colors are distributed somewhat reasonably regardless of the data in display. However, as a result, the color at a specific location is dependent on the current viewport and any other data points within view. To obtain a stable color mapping (e.g. for displaying a legend), you need to provide a custom `colorDomain`.


#### `aggregation` (string, optional) {#aggregation}

* Default: `'SUM'`

Operation used to aggregate all data point weights to calculate a pixel's color value. One of `'SUM'` or `'MEAN'`. `'SUM'` is used when an invalid value is provided.

The weight of each data object is distributed to all the pixels in a circle centered at the object position. The weight that a pixel receives is inversely proportional to its distance from the center. In `'SUM'` mode, pixels that fall into multiple circles will have the sum of all weights. In `'MEAN'` mode, pixels that fall into multiple circles will have their weight calculated as the weighted average from all the neighboring data points. And the weight of the pixel determines its color. 

#### `weightsTextureSize` (number, optional) {#weightstexturesize}

* Default: `2048`

`weightsTextureSize` specifies the size of weight texture. Smaller texture sizes can improve rendering performance. Heatmap aggregation calculates the maximum weight value in the texture and the process can take 50-100 ms for 2048x2048 texture, but only 5-7ms for 512x512 texture. Smaller texture sizes lead to visible pixelation.

#### `debounceTimeout` (number, optional) {#debouncetimeout}

* Default: `500`

`debounceTimeout` is an interval in milliseconds during which changes to the viewport don't trigger aggregation. Large datasets combined with a large `radiusPixels` can cause freezes during user interactions due to aggregation updates. Setting positive debounceTimeout delays aggregation updates and prevents freezes during the interaction. As a side effect, the user has to wait to see updated results after the end of the interaction. 

### Data Accessors

#### `getPosition` ([Accessor&lt;Position&gt;](../../developer-guide/using-layers.md#accessors), optional) {#getposition}

* Default: `object => object.position`

Method called to retrieve the position of each point.

#### `getWeight` ([Accessor&lt;number&gt;](../../developer-guide/using-layers.md#accessors), optional) {#getweight}

* Default: `1`

Method called to retrieve weight of each point. By default each point will use a weight of `1`.

## Limitations

The `HeatmapLayer` performs aggregation on the GPU. This feature is fully supported in evergreen desktop browsers, but limited in the following platforms due to partial WebGL support:

- iOS Safari: WebGL context does not support rendering to a float texture. The layer therefore falls back to an 8-bit low-precision mode, where weights must be integers and the accumulated weights in any pixel cannot exceed 255.

## Source

[modules/aggregation-layers/src/heatmap-layer](https://github.com/visgl/deck.gl/tree/master/modules/aggregation-layers/src/heatmap-layer)
