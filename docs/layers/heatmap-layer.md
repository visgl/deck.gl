<!-- INJECT:"HeatmapLayerDemo" -->

<p class="badges">
  <img src="https://img.shields.io/badge/@deck.gl/aggregation--layers-lightgrey.svg?style=flat-square" alt="@deck.gl/aggregation-layers" />
</p>


# HeatmapLayer **Experimental**

`HeatmapLayer` can be used to visualize spatial distribution of data. It internally implements [Gaussian Kernel Density Estimation](https://en.wikipedia.org/wiki/Kernel_(statistics%29#Kernel_functions_in_common_use) to render heatmaps.

* NOTE: Current version of this layer is supported only for WebGL2 enabled browsers, support for WebGL1 browsers will be added in future releases.

```js
import DeckGL from '@deck.gl/react';
import {HeatmapLayer} from '@deck.gl/aggregation-layers';

const App = ({data, viewport}) => {

  /**
   * Data format:
   * [
   *   {COORDINATES: [-122.42177834, 37.78346622], WEIGHT: 10},
   *   ...
   * ]
   */
  const layer = new HeatmapLayer({
    id: 'heatmapLayer',
    getPosition: d => d.COORDINATES,
    getWeight: d => d.WEIGHT    
  });

  return (<DeckGL {...viewport} layers={[layer]} />);
};
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
<script src="https://unpkg.com/deck.gl@~7.0.0/dist.min.js"></script>
<!-- or -->
<script src="https://unpkg.com/@deck.gl/core@~7.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/layers@~7.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/aggregation-layers@~7.0.0/dist.min.js"></script>
```

```js
new deck.HeatmapLayer({});
```


## Properties

Inherits from all [Base Layer](/docs/api-reference/layer.md) and [CompositeLayer](/docs/api-reference/composite-layer.md) properties.

### Render Options

##### `radiusPixels` (Number, optional)

* Default: `30`

Radius of the circle in pixels, to which the weight of an object is distributed.

##### `colorRange` (Array, optional)

* Default: <img src="/website/src/static/images/colorbrewer_YlOrRd_6.png"/></a>

Specified as an array of 6 colors [color1, color2, ... color6]. Each color is an array of 3 or 4 values [R, G, B] or [R, G, B, A], representing Red, Green, Blue and Alpha channels.  Each channel is a value between 0 and 255. When Alpha not provided a value of 255 is used. By default `colorRange` is set to
[colorbrewer](http://colorbrewer2.org/#type=sequential&scheme=YlOrRd&n=6) `6-class YlOrRd`.

##### `intensity` (Number, optional)

* Default: `1`

Value that is multiplied with the total weight at a pixel to obtain the final weight.

##### `softness` (Number, optional)

* Default: `10`

`softness` can be used to smoothen the boundaries of color blobs while keeping the hot spots unchanged. However, at the same time, pixels with low relative weight get harder to spot (due to low alpha value).

### Data Accessors

##### `getPosition` ([Function](/docs/developer-guide/using-layers.md#accessors), optional)

* Default: `object => object.position`

Method called to retrieve the position of each point.

##### `getWeight` ([Function](/docs/developer-guide/using-layers.md#accessors), optional)

* Default: `1`

Method called to retrieve weight of each point. By default each point will use a weight of `1`.

## Source

[modules/aggregation-layers/src/heatmap-layer](https://github.com/uber/deck.gl/tree/master/modules/aggregation-layers/src/heatmap-layer)
