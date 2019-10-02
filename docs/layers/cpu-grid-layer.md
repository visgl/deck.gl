<!-- INJECT:"CPUGridLayerDemo" -->

<p class="badges">
  <img src="https://img.shields.io/badge/@deck.gl/aggregation--layers-lightgrey.svg?style=flat-square" alt="@deck.gl/aggregation-layers" />
  <img src="https://img.shields.io/badge/lighting-yes-blue.svg?style=flat-square" alt="lighting" />
</p>

# CPUGridLayer

The `CPUGridLayer` renders a grid heatmap based on an array of points.
It takes the constant cell size, aggregates input points into cells. Aggregation is performed on CPU. The color
and height of the cell is scaled by number of points it contains.

`CPUGridLayer` is one of the sublayers for [GridLayer](/docs/layers/grid-layer.md), and is provided to customize CPU Aggregation for advanced use cases. For any regular use case, [GridLayer](/docs/layers/grid-layer.md) is recommended.

`CPUGridLayer` is a [CompositeLayer](/docs/api-reference/composite-layer.md).

```js
import DeckGL from '@deck.gl/react';
import {CPUGridLayer} from '@deck.gl/aggregation-layers';

const App = ({data, viewport}) => {

  /**
   * Data format:
   * [
   *   {COORDINATES: [-122.42177834, 37.78346622]},
   *   ...
   * ]
   */
  const layer = new CPUGridLayer({
    id: 'grid-layer',
    data,
    pickable: true,
    extruded: true,
    cellSize: 200,
    elevationScale: 4,
    getPosition: d => d.COORDINATES,
    onHover: ({object, x, y}) => {
      const tooltip = `${object.position.join(', ')}\nCount: ${object.count}`;
      /* Update tooltip
         http://deck.gl/#/documentation/developer-guide/adding-interactivity?section=example-display-a-tooltip-for-hovered-object
      */
    }
  });

  return (<DeckGL {...viewport} layers={[layer]} />);
};
```

**Note:** The `CPUGridLayer` at the moment only works with `COORDINATE_SYSTEM.LNGLAT`.


## Installation

To install the dependencies from NPM:

```bash
npm install deck.gl
# or
npm install @deck.gl/core @deck.gl/layers @deck.gl/aggregation-layers
```

```js
import {CPUGridLayer} from '@deck.gl/aggregation-layers';
new CPUGridLayer({});
```

To use pre-bundled scripts:

```html
<script src="https://unpkg.com/deck.gl@^7.0.0/dist.min.js"></script>
<!-- or -->
<script src="https://unpkg.com/@deck.gl/core@^7.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/layers@^7.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/aggregation-layers@^7.0.0/dist.min.js"></script>
```

```js
new deck.CPUGridLayer({});
```


## Properties

Inherits from all [Base Layer](/docs/api-reference/layer.md) and [CompositeLayer](/docs/api-reference/composite-layer.md) properties.

### Render Options

##### `cellSize` (Number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `1000`

Size of each cell in meters

##### `colorDomain` (Array, optional)

* Default: `[min(count), max(count)]`

Color scale domain, default is set to the range of point counts in each cell.

##### `colorRange` (Array, optional)

* Default: <img src="/website/src/static/images/colorbrewer_YlOrRd_6.png"/></a>

Specified as an array of 6 colors [color1, color2, ... color6]. Each color is an array of 3 or 4 values [R, G, B] or [R, G, B, A], representing intensities of Red, Green, Blue and Alpha channels.  Each intensity is a value between 0 and 255. When Alpha not provided a value of 255 is used. By default `colorRange` is set to
[colorbrewer](http://colorbrewer2.org/#type=sequential&scheme=YlOrRd&n=6) `6-class YlOrRd`.

##### `coverage` (Number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `1`

Cell size multiplier, clamped between 0 - 1. The final size of cell
is calculated by `coverage * cellSize`. Note: coverage does not affect how points
are binned. Coverage are linear based.

##### `elevationDomain` (Array, optional)

* Default: `[0, max(count)]`

Elevation scale input domain, default is set to the extent of point counts in each cell.

##### `elevationRange` (Array, optional)

* Default: `[0, 1000]`

Elevation scale output range

##### `elevationScale` (Number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `1`

Cell elevation multiplier. The elevation of cell is calculated by
`elevationScale * getElevation(d)`.
`elevationScale` is a handy property to scale all cells without updating the data.

##### `extruded` (Boolean, optional)

* Default: `true`

Whether to enable cell elevation. Cell elevation scale by count of points in each cell. If set to false, all cell will be flat.

##### `upperPercentile` (Number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `100`

Filter cells and re-calculate color by `upperPercentile`. Cells with value
larger than the upperPercentile will be hidden.

##### `lowerPercentile` (Number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `0`

Filter cells and re-calculate color by `lowerPercentile`. Cells with value
smaller than the lowerPercentile will be hidden.

##### `elevationUpperPercentile` (Number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `100`

Filter cells and re-calculate elevation by `elevationUpperPercentile`. Cells with elevation value
larger than the elevationUpperPercentile will be hidden.

##### `elevationLowerPercentile` (Number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `100`

Filter cells and re-calculate elevation by `elevationLowerPercentile`. Cells with elevation value
smaller than the elevationLowerPercentile will be hidden.

##### `colorScaleType` (String, optional)

* Default: 'quantize'

Scaling function used to determine the color of the grid cell, default value is 'quantize'. Supported Values are 'quantize', 'linear', 'quantile' and 'ordinal'.

##### `material` (Object, optional)

* Default: `new PhongMaterial()`

This is an object that contains material props for [lighting effect](/docs/effects/lighting-effect.md) applied on extruded polygons.
Check [PhongMaterial](https://github.com/uber/luma.gl/tree/7.0-release/docs/api-reference/core/materials/phong-material.md) for more details.

### Data Accessors

##### `getPosition` ([Function](/docs/developer-guide/using-layers.md#accessors), optional)

* Default: `object => object.position`

Method called to retrieve the position of each point.

##### `getColorValue` (Function, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `points => points.length`

`getColorValue` is the accessor function to get the value that cell color is based on.
It takes an array of points inside each cell as arguments, returns a number. For example,
You can pass in `getColorValue` to color the cells by avg/mean/max of a specific attributes of each point.
By default `getColorValue` returns the length of the points array.

```js
 class MyGridLayer {
    renderLayers() {
      return new CPUGridLayer({
        id: 'grid-layer',
        getColorValue: points => points.length
        data,
        cellSize: 500
      });
    }
 }
```


##### `getColorWeight` (Function, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `point => 1`

`getColorWeight` is the accessor function to get the weight of a point used to calculate the color value for a cell.

##### `colorAggregation` (String, optional)

* Default: 'SUM'

`colorAggregation` defines, operation used to aggregate all data point weights to calculate a cell's color value. Valid values are 'SUM', 'MEAN', 'MIN' and 'MAX'. 'SUM' is used when an invalid value is provided.

Note: `getColorWeight` and `colorAggregation` together define how color value of cell is determined, same can be done by setting `getColorValue` prop. But to enable GPU aggregation, former props must be provided instead of later.

###### Example1 : Using count of data elements that fall into a cell to encode the its color

* Using `getColorValue`
```js

...
const layer = new CPUGridLayer({
  id: 'my-grid-layer',
  ...
  getColorValue: points => points.length,
  ...
});
```

* Using `getColorWeight` and `colorAggregation`
```js

...
const layer = new CPUGridLayer({
  id: 'my-grid-layer',
  ...
  getColorWeight: point => 1,
  colorAggregation: 'SUM'
  ...
});
```

###### Example2 : Using mean value of 'SPACES' field of data elements to encode the color of the cell

* Using `getColorValue`
```js
function getMean(points) {
  return points.reduce((sum, p) => sum += p.SPACES, 0) / points.length;
}
...
const layer = new CPUGridLayer({
  id: 'my-grid-layer',
  ...
  getColorValue: getMean,
  ...
});
```

* Using `getColorWeight` and `colorAggregation`
```js
...
const layer = new CPUGridLayer({
  id: 'my-grid-layer',
  ...
  getColorWeight: point => point.SPACES,
  colorAggregation: 'SUM'
  ...
});
```

If your use case requires aggregating using an operation that is not one of 'SUM', 'MEAN', 'MAX' and 'MIN', `getColorValue` should be used to define such custom aggregation function. In those cases GPU aggregation is not supported.


##### `getElevationValue` (Function, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `points => points.length`

Similar to `getColorValue`, `getElevationValue` is the accessor function to get the value that cell elevation is based on.
It takes an array of points inside each cell as arguments, returns a number.
By default `getElevationValue` returns the length of the points array.

##### `getElevationWeight` (Function, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `point => 1`

`getElevationWeight` is the accessor function to get the weight of a point used to calculate the elevation value for a cell.

##### `elevationAggregation` (String, optional)

* Default: 'SUM'

`elevationAggregation` defines, operation used to aggregate all data point weights to calculate a cell's elevation value. Valid values are 'SUM', 'MEAN', 'MIN' and 'MAX'. 'SUM' is used when an invalid value is provided.

Note: `getElevationWeight` and `elevationAggregation` together define how elevation value of cell is determined, same can be done by setting `getColorValue` prop. But to enable GPU aggregation, former props must be provided instead of later.


###### Example1 : Using count of data elements that fall into a cell to encode the its elevation

* Using `getElevationValue`

```js
...
const layer = new CPUGridLayer({
  id: 'my-grid-layer',
  ...
  getElevationValue: points => points.length
  ...
});
```

* Using `getElevationWeight` and `elevationAggregation`
```js
...
const layer = new CPUGridLayer({
  id: 'my-grid-layer',
  ...
  getElevationWeight: point => 1,
  elevationAggregation: 'SUM'
  ...
});
```

###### Example2 : Using maximum value of 'SPACES' field of data elements to encode the elevation of the cell

* Using `getElevationValue`
```js
function getMax(points) {
  return points.reduce((max, p) => p.SPACES > max ? p.SPACES : max, -Infinity);
}
...
const layer = new CPUGridLayer({
  id: 'my-grid-layer',
  ...
  getElevationValue: getMax,
  ...
});
```

* Using `getElevationWeight` and `elevationAggregation`
```js
...
const layer = new CPUGridLayer({
  id: 'my-grid-layer',
  ...
  getElevationWeight: point => point.SPACES,
  elevationAggregation: 'MAX'
  ...
});
```

If your use case requires aggregating using an operation that is not one of 'SUM', 'MEAN', 'MAX' and 'MIN', `getElevationValue` should be used to define such custom aggregation function. In those cases GPU aggregation is not supported.

##### `onSetColorDomain` (Function, optional)

* Default: `() => {}`

This callback will be called when bin color domain has been calculated.

##### `onSetElevationDomain` (Function, optional)

* Default: `() => {}`

This callback will be called when bin elevation domain has been calculated.


## Sub Layers

The CPUGridLayer renders the following sublayers:

* `grid-cell` - a [GridCellLayer](/docs/layers/grid-cell-layer.md) rendering the aggregated columns.

## Source

[modules/aggregation-layers/src/cpu-grid-layer](https://github.com/uber/deck.gl/tree/master/modules/aggregation-layers/src/cpu-grid-layer)
