<!-- INJECT:"HexagonLayerDemo" -->

<p class="badges">
  <img src="https://img.shields.io/badge/@deck.gl/aggregation--layers-lightgrey.svg?style=flat-square" alt="@deck.gl/aggregation-layers" />
  <img src="https://img.shields.io/badge/lighting-yes-blue.svg?style=flat-square" alt="lighting" />
</p>

# HexagonLayer

The Hexagon Layer renders a hexagon heatmap based on an array of points.
It takes the radius of hexagon bin, projects points into hexagon bins. The color
and height of the hexagon is scaled by number of points it contains.

HexagonLayer is a [CompositeLayer](/docs/api-reference/composite-layer.md) and at the moment only works with `COORDINATE_SYSTEM.LNGLAT`.

```js
import DeckGL from '@deck.gl/react';
import {HexagonLayer} from '@deck.gl/aggregation-layers';

const App = ({data, viewport}) => {

  /**
   * Data format:
   * [
   *   {COORDINATES: [-122.42177834, 37.78346622]},
   *   ...
   * ]
   */
  const layer = new HexagonLayer({
    id: 'hexagon-layer',
    data,
    pickable: true,
    extruded: true,
    radius: 200,
    elevationScale: 4,
    getPosition: d => d.COORDINATES,
    onHover: ({object, x, y}) => {
      const tooltip = `${object.centroid.join(', ')}\nCount: ${object.points.length}`;
      /* Update tooltip
         http://deck.gl/#/documentation/developer-guide/adding-interactivity?section=example-display-a-tooltip-for-hovered-object
      */
    }
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
import {HexagonLayer} from '@deck.gl/aggregation-layers';
new HexagonLayer({});
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
new deck.HexagonLayer({});
```


## Properties

Inherits from all [Base Layer](/docs/api-reference/layer.md) and [CompositeLayer](/docs/api-reference/composite-layer.md) properties.

### Render Options

##### `radius` (Number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `1000`

Radius of hexagon bin in meters. The hexagons are pointy-topped (rather than flat-topped).

##### `hexagonAggregator` (Function, optional)

* Default: `d3-hexbin`

`hexagonAggregator` is a function to aggregate data into hexagonal bins.
The `hexagonAggregator` takes props of the layer and current viewport as arguments.
The output should be `{hexagons: [], hexagonVertices: []}`. `hexagons` is
an array of `{centroid: [], points: []}`, where `centroid` is the
center of the hexagon, and `points` is an array of points that contained by it.  `hexagonVertices`
(optional) is an array of points define the primitive hexagon geometry.

By default, the `HexagonLayer` uses
[d3-hexbin](https://github.com/d3/d3-hexbin) as `hexagonAggregator`,
see `modules/layers/src/point-density-hexagon-layer/hexagon-aggregator`

##### `colorDomain` (Array, optional)

* Default: `[min(count), max(count)]`

Color scale input domain. The color scale maps continues numeric domain into
discrete color range. If not provided, the layer will set `colorDomain` to the
range of counts in each hexagon. You can control how the color of hexagons mapped
to number of counts by passing in an arbitrary color domain. This property is extremely handy when you want to render different data input with the same color mapping for comparison.

##### `colorRange` (Array, optional)

* Default: <img src="/website/src/static/images/colorbrewer_YlOrRd_6.png"/></a>

Specified as an array of 6 colors [color1, color2, ... color6]. Each color is an array of 3 or 4 values [R, G, B] or [R, G, B, A], representing intensities of Red, Green, Blue and Alpha channels.  Each intensity is a value between 0 and 255. When Alpha not provided a value of 255 is used. By default `colorRange` is set to
[colorbrewer](http://colorbrewer2.org/#type=sequential&scheme=YlOrRd&n=6) `6-class YlOrRd`.

##### `coverage` (Number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `1`

Hexagon radius multiplier, clamped between 0 - 1. The final radius of hexagon
is calculated by `coverage * radius`. Note: coverage does not affect how points
are binned. The radius of the bin is determined only by the `radius` property.

##### `elevationDomain` (Array, optional)

* Default: `[0, max(count)]`

Elevation scale input domain. The elevation scale is a linear scale that
maps number of counts to elevation. By default it is set to between
0 and max of point counts in each hexagon.
This property is extremely handy when you want to render different data input
with the same elevation scale for comparison.

##### `elevationRange` (Array, optional)

* Default: `[0, 1000]`

Elevation scale output range

##### `elevationScale` (Number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `1`

Hexagon elevation multiplier. The actual elevation is calculated by
  `elevationScale * getElevation(d)`. `elevationScale` is a handy property to scale
all hexagons without updating the data.

##### `extruded` (Boolean, optional)

* Default: `false`

Whether to enable cell elevation. Cell elevation scale by count of points in each cell. If set to false, all cells will be flat.

##### `upperPercentile` (Number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `100`

Filter bins and re-calculate color by `upperPercentile`. Hexagons with color value
larger than the upperPercentile will be hidden.

##### `lowerPercentile` (Number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `0`

Filter bins and re-calculate color by `lowerPercentile`. Hexagons with color value
smaller than the lowerPercentile will be hidden.

##### `elevationUpperPercentile` (Number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `100`

Filter bins and re-calculate elevation by `elevationUpperPercentile`. Hexagons with elevation value
larger than the elevationUpperPercentile will be hidden.

##### `elevationLowerPercentile` (Number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `100`

Filter bins and re-calculate elevation by `elevationLowerPercentile`. Hexagons with elevation value
smaller than the elevationLowerPercentile will be hidden.

##### `material` (Object, optional)

* Default: `true`

This is an object that contains material props for [lighting effect](/docs/effects/lighting-effect.md) applied on extruded polygons.
Check [the lighting guide](/docs/developer-guide/using-lighting.md#constructing-a-material-instance) for configurable settings.

### Data Accessors

##### `getPosition` ([Function](/docs/developer-guide/using-layers.md#accessors), optional)

* Default: `object => object.position`

Method called to retrieve the position of each point.


##### `getColorValue` (Function, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `points => points.length`

`getColorValue` is the accessor function to get the value that bin color is based on.
It takes an array of points inside each bin as arguments, returns a number. For example,
You can pass in `getColorValue` to color the bins by avg/mean/max of a specific attributes of each point.
By default `getColorValue` returns the length of the points array.


```js
 class MyHexagonLayer {
    renderLayers() {
      return new HexagonLayer({
        id: 'hexagon-layer',
        getColorValue: points => points.length
        data,
        radius: 500
      });
    }
 }
```

##### `getColorWeight` (Function, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `point => 1`

`getColorWeight` is the accessor function to get the weight of a point used to calcuate the color value for a cell.


##### `colorAggregation` (String, optional)

* Default: 'SUM'

`colorAggregation` defines, operation used to aggregate all data point weights to calculate a cell's color value. Valid values are 'SUM', 'MEAN', 'MIN' and 'MAX'. 'SUM' is used when an invalid value is provided.

Note: `getColorWeight` and `colorAggregation` together define how color value of cell is determined, same can be done by setting `getColorValue` prop. But to enable gpu aggregation, former props must be provided instead of later.

###### Example1 : Using count of data elements that fall into a cell to encode the its color

* Using `getColorValue`
```js
...
const layer = new HexagonLayer({
  id: 'my-hexagon-layer',
  ...
  getColorValue: points => points.length,
  ...
});
```

* Using `getColorWeight` and `colorAggregation`
```js
...
const layer = new HexagonLayer({
  id: 'my-hexagon-layer',
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
const layer = new HexagonLayer({
  id: 'my-hexagon-layer',
  ...
  getColorValue: getMean,
  ...
});
```

* Using `getColorWeight` and `colorAggregation`
```js
...
const layer = new HexagonLayer({
  id: 'my-hexagon-layer',
  ...
  getColorWeight: point => point.SPACES,
  colorAggregation: 'SUM'
  ...
});
```

If your use case requires aggregating using an operation that is not one of 'SUM', 'MEAN', 'MAX' and 'MIN', `getColorValue` should be used to define such custom aggregation function. In those cases GPU aggregation is not supported.


##### `getElevationValue` (Function, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `points => points.length`

Similar to `getColorValue`, `getElevationValue` is the accessor function to get the value that bin elevation is based on.
It takes an array of points inside each bin as arguments, returns a number.
By default `getElevationValue` returns the length of the points array.


##### `getElevationWeight` (Function, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `point => 1`

`getElevationWeight` is the accessor function to get the weight of a point used to calcuate the elevation value for a cell.


##### `elevationAggregation` (String, optional)

* Default: 'SUM'

`elevationAggregation` defines, operation used to aggregate all data point weights to calculate a cell's elevation value. Valid values are 'SUM', 'MEAN', 'MIN' and 'MAX'. 'SUM' is used when an invalid value is provided.

Note: `getElevationWeight` and `elevationAggregation` together define how elevation value of cell is determined, same can be done by setting `getColorValue` prop. But to enable gpu aggregation, former props must be provided instead of later.


###### Example1 : Using count of data elements that fall into a cell to encode the its elevation

* Using `getElevationValue`

```js
...
const layer = new HexagonLayer({
  id: 'my-hexagon-layer',
  ...
  getElevationValue: points => points.length,
  ...
});
```

* Using `getElevationWeight` and `elevationAggregation`
```js
...
const layer = new HexagonLayer({
  id: 'my-hexagon-layer',
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
const layer = new HexagonLayer({
  id: 'my-hexagon-layer',
  ...
  getElevationValue: getMax,
  ...
});
```

* Using `getElevationWeight` and `elevationAggregation`
```js
...
const layer = new HexagonLayer({
  id: 'my-hexagon-layer',
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

The HexagonLayer renders the following sublayers:

* `hexagon-cell` - a [ColumnLayer](/docs/layers/column-layer.md) rendering the aggregated columns.


## Source

[modules/aggregation-layers/src/hexagon-layer](https://github.com/uber/deck.gl/tree/master/modules/aggregation-layers/src/hexagon-layer)
