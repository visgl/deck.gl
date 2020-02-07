<!-- INJECT:"ScreenGridLayerDemo" -->

<p class="badges">
  <img src="https://img.shields.io/badge/@deck.gl/aggregation--layers-lightgrey.svg?style=flat-square" alt="@deck.gl/aggregation-layers" />
</p>

# ScreenGridLayer

The Screen Grid Layer takes in an array of latitude and longitude
coordinated points, aggregates them into histogram bins and
renders as a grid. By default aggregation happens on GPU, aggregation falls back to CPU when browser doesn't support GPU Aggregation or when `gpuAggregation` prop is set to false.

```js
import DeckGL from '@deck.gl/react';
import {ScreenGridLayer} from '@deck.gl/aggregation-layers';

const App = ({data, viewport}) => {

  /**
   * Data format:
   * [
   *   {SPACES: 4, COORDINATES: [-122.42177834, 37.78346622]},
   *   ...
   * ]
   */
  const layer = new ScreenGridLayer({
    id: 'screen-grid-layer',
    data,
    pickable: false,
    opacity: 0.8,
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
    onHover: ({object, x, y}) => {
      const tooltip = 'aggregated cell';
      /* Update tooltip
         http://deck.gl/#/documentation/developer-guide/adding-interactivity?section=example-display-a-tooltip-for-hovered-object
      */
    }
  });

  return (<DeckGL {...viewport} layers={[layer]} />);
};
```

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

```js
import {ScreenGridLayer} from '@deck.gl/aggregation-layers';
new ScreenGridLayer({});
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
new deck.ScreenGridLayer({});
```


## Properties

Inherits from all [Base Layer](/docs/api-reference/layer.md) properties.

### Render Options

##### `cellSizePixels` (Number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `100`

Unit width/height of the bins.

##### `cellMarginPixels` (Number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `2`, gets clamped to [0, 5]

Cell margin size in pixels.

##### `minColor` (Number[4], optional) **DEPRECATED**

* Default: `[0, 0, 0, 255]`

Expressed as an rgba array, minimal color that could be rendered by a tile. This prop is deprecated in version 5.2.0, use `colorRange` and `colorDomain` instead.

##### `maxColor` (Number[4], optional) **DEPRECATED**

* Default: `[0, 255, 0, 255]`

Expressed as an rgba array, maximal color that could be rendered by a tile.  This prop is deprecated in version 5.2.0, use `colorRange` and `colorDomain` instead.

##### `colorDomain` (Array, optional)

* Default: `[1, max(weight)]`

Color scale input domain. The color scale maps continues numeric domain into
discrete color range. If not provided, the layer will set `colorDomain` to [1, max-of-all-cell-weights], You can control how the color of cells mapped
to value of its weight by passing in an arbitrary color domain. This property is extremely handy when you want to render different data input with the same color mapping for comparison.

##### `colorRange` (Array, optional)

* Default: <img src="/website/src/static/images/colorbrewer_YlOrRd_6.png"/></a>

Specified as an array of 6 colors [color1, color2, ... color6]. Each color is an array of 3 or 4 values [R, G, B] or [R, G, B, A], representing intensities of Red, Green, Blue and Alpha channels.  Each intensity is a value between 0 and 255. When Alpha not provided a value of 255 is used. By default `colorRange` is set to
[colorbrewer](http://colorbrewer2.org/#type=sequential&scheme=YlOrRd&n=6) `6-class YlOrRd`.

NOTE: `minColor` and `maxColor` take precedence over `colorDomain` and `colorRange`, to use `colorDomain` and `colorRange` do not provide `minColor` and `maxColor`.

##### `gpuAggregation` (bool, optional)

* Default: true

When set to true and browser supports GPU aggregation, aggregation is performed on GPU. GPU aggregation can be 10 to 20 times faster depending upon number of points and number of cells.

NOTE: GPU Aggregation requires WebGL2 support by the browser. When `gpuAggregation` is set to true and browser doesn't support WebGL2, aggregation falls back to CPU.

##### `aggregation` (String, optional)

* Default: 'SUM'

Defines the type of aggregation operation, valid values are 'SUM', 'MEAN', 'MIN' and 'MAX'. When no value or an invalid value is set, 'SUM' is used as aggregation.

* SUM : Grid cell contains sum of all weights that fall into it.
* MEAN : Grid cell contains mean of all weights that fall into it.
* MIN : Grid cell contains minimum of all weights that fall into it.
* MAX : Grid cell contains maximum of all weights that fall into it.


### Data Accessors

##### `getPosition` ([Function](/docs/developer-guide/using-layers.md#accessors), optional)

* Default: `object => object.position`

Method called to retrieve the position of each object.

##### `getWeight` ([Function](/docs/developer-guide/using-layers.md#accessors), optional)

* Default: `object => 1`

Method called to retrieve the weight of each object.

## Source

[modules/aggregation-layers/src/screen-grid-layer](https://github.com/uber/deck.gl/tree/master/modules/aggregation-layers/src/screen-grid-layer)
