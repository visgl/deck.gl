import {HeatmapLayerDemo} from 'website-components/doc-demos/aggregation-layers';

<HeatmapLayerDemo />


# HeatmapLayer

`HeatmapLayer` can be used to visualize spatial distribution of data. It internally implements [Gaussian Kernel Density Estimation](https://en.wikipedia.org/wiki/Kernel_(statistics%29#Kernel_functions_in_common_use) to render heatmaps. Note that this layer does not support all platforms; see "limitations" section below.

```js
import DeckGL from '@deck.gl/react';
import {HeatmapLayer} from '@deck.gl/aggregation-layers';

function App({data, viewState}) {
  /**
   * Data format:
   * [
   *   {COORDINATES: [-122.42177834, 37.78346622], WEIGHT: 10},
   *   ...
   * ]
   */
  const layer = new HeatmapLayer({
    id: 'heatmapLayer',
    data,
    getPosition: d => d.COORDINATES,
    getWeight: d => d.WEIGHT,
    aggregation: 'SUM'
  });

  return <DeckGL viewState={viewState} layers={[layer]} />;
}
```


## Installation

To install the dependencies from NPM:

```bash
npm install deck.gl
# or
npm install @deck.gl/core @deck.gl/layers @deck.gl/aggregation-layers
```

```js
import {HeatmapLayer} from '@deck.gl/aggregation-layers';
new HeatmapLayer({});
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
new deck.HeatmapLayer({});
```


## Properties

Inherits from all [Base Layer](/docs/api-reference/core/layer.md) and [CompositeLayer](/docs/api-reference/core/composite-layer.md) properties.

### Render Options

##### `radiusPixels` (Number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `30`

Radius of the circle in pixels, to which the weight of an object is distributed.

##### `colorRange` (Array, optional)

* Default: [colorbrewer](http://colorbrewer2.org/#type=sequential&scheme=YlOrRd&n=6) `6-class YlOrRd` <img src="https://deck.gl/images/colorbrewer_YlOrRd_6.png"/>

Specified as an array of colors [color1, color2, ...]. Each color is an array of 3 or 4 values [R, G, B] or [R, G, B, A], representing intensities of Red, Green, Blue and Alpha channels.  Each intensity is a value between 0 and 255. When Alpha not provided a value of 255 is used.

`colorDomain` is divided into `colorRange.length` equal segments, each mapped to one color in `colorRange`.

##### `intensity` (Number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `1`

Value that is multiplied with the total weight at a pixel to obtain the final weight. A value larger than `1` biases the output color towards the higher end of the spectrum, and a value less than `1` biases the output color towards the lower end of the spectrum.

##### `threshold` (Number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `0.05`

The `HeatmapLayer` reduces the opacity of the pixels with relatively low weight to create a fading effect at the edge. A larger `threshold` smoothens the boundaries of color blobs, while making pixels with low relative weight harder to spot (due to low alpha value).

`threshold` is defined as the ratio of the fading weight to the max weight, between `0` and `1`. For example, `0.1` affects all pixels with weight under 10% of the max.

`threshold` is ignored when `colorDomain` is specified.

##### `colorDomain` (Array, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `null`

Weight of each data object is distributed to to all the pixels in a circle centered at the object position, weight a pixel receives is inversely proportional to its distance from the center. Pixels that fall into multiple circles will have sum of all weights. And the weight of the pixel determines its color. When `colorDomain` is specified, all pixels with weight with in specified `colorDomain` will get mapped to `colorRange`, pixels with weight less than `colorDomain[0]` will fade out (reduced alpha) and pixels with weight more than `colorDomain[1]` will mapped to the highest color in `colorRange`.

When not specified, maximum weight (`maxWeight`) is auto calculated and domain will be set to [`maxWeight * threshold`, `maxWeight`].

##### `aggregation` (String, optional)

* Default: `'SUM'`

Operation used to aggregate all data point weights to calculate a pixel's color value. One of `'SUM'` or `'MEAN'`. `'SUM'` is used when an invalid value is provided.

### Data Accessors

##### `getPosition` ([Function](/docs/developer-guide/using-layers.md#accessors), optional)

* Default: `object => object.position`

Method called to retrieve the position of each point.

##### `getWeight` ([Function](/docs/developer-guide/using-layers.md#accessors), optional)

* Default: `1`

Method called to retrieve weight of each point. By default each point will use a weight of `1`.

## Limitations

The `HeatmapLayer` performs aggregation on the GPU. This feature is fully supported in evergreen desktop browsers, but limited in the following platforms due to partial WebGL support:

- iOS Safari: WebGL context does not support rendering to a float texture. The layer therefore falls back to an 8-bit low-precision mode, where weights must be integers and the accumulated weights in any pixel cannot exceed 255.

## Source

[modules/aggregation-layers/src/heatmap-layer](https://github.com/visgl/deck.gl/tree/master/modules/aggregation-layers/src/heatmap-layer)
