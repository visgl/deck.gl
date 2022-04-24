import {HexagonLayerDemo} from 'website-components/doc-demos/aggregation-layers';

<HexagonLayerDemo />

<p class="badges">
  <img src="https://img.shields.io/badge/lighting-yes-blue.svg?style=flat-square" alt="lighting" />
</p>

# HexagonLayer

The Hexagon Layer renders a hexagon heatmap based on an array of inputs.
It takes the radius of hexagon bin and aggregates input objects into hexagon bins. The color
and height of a hexagon are determined based on the objects it contains.

HexagonLayer is a [CompositeLayer](/docs/api-reference/core/composite-layer.md) and at the moment only works with `COORDINATE_SYSTEM.LNGLAT`.

```js
import DeckGL from '@deck.gl/react';
import {HexagonLayer} from '@deck.gl/aggregation-layers';

function App({data, viewState}) {
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
    getPosition: d => d.COORDINATES
  });

  return <DeckGL viewState={viewState}
    layers={[layer]}
    getTooltip={({object}) => object && `${object.centroid.join(', ')}\nCount: ${object.points.length}`} />;
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

Inherits from all [Base Layer](/docs/api-reference/core/layer.md) and [CompositeLayer](/docs/api-reference/core/composite-layer.md) properties.

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

* Default: `[min(colorWeight), max(colorWeight)]`

Color scale input domain. The color scale maps continues numeric domain into
discrete color range. If not provided, the layer will set `colorDomain` to the
extent of aggregated weights in each hexagon.
You can control how the colors of hexagons are mapped to weights by passing in an arbitrary color domain.
This is useful when you want to render different data input with the same color mapping for comparison.

##### `colorRange` (Array, optional)

* Default: [colorbrewer](http://colorbrewer2.org/#type=sequential&scheme=YlOrRd&n=6) `6-class YlOrRd` <img src="https://deck.gl/images/colorbrewer_YlOrRd_6.png"/>

Specified as an array of colors [color1, color2, ...]. Each color is an array of 3 or 4 values [R, G, B] or [R, G, B, A], representing intensities of Red, Green, Blue and Alpha channels.  Each intensity is a value between 0 and 255. When Alpha not provided a value of 255 is used.

`colorDomain` is divided into `colorRange.length` equal segments, each mapped to one color in `colorRange`.

##### `coverage` (Number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `1`

Hexagon radius multiplier, clamped between 0 - 1. The displayed radius of hexagon is calculated by `coverage * radius`.
Note: coverage does not affect how objects are binned.

##### `elevationDomain` (Array, optional)

* Default: `[0, max(elevationWeight)]`

Elevation scale input domain. The elevation scale is a linear scale that
maps number of counts to elevation. By default it is set to between
0 and the max of aggregated weights in each hexagon.
You can control how the elevations of hexagons are mapped to weights by passing in an arbitrary elevation domain.
This property is useful when you want to render different data input
with the same elevation scale for comparison.

##### `elevationRange` (Array, optional)

* Default: `[0, 1000]`

Elevation scale output range

##### `elevationScale` (Number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `1`

Hexagon elevation multiplier. The actual elevation is calculated by
  `elevationScale * getElevationValue(d)`. `elevationScale` is a handy property to scale
all hexagons without updating the data.

##### `extruded` (Boolean, optional)

* Default: `false`

Whether to enable cell elevation. If set to false, all cells will be flat.

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

* Default: `0`

Filter bins and re-calculate elevation by `elevationLowerPercentile`. Hexagons with elevation value
smaller than the elevationLowerPercentile will be hidden.

##### `colorScaleType` (String, optional)

* Default: 'quantize'

Scaling function used to determine the color of the grid cell, default value is 'quantize'. Supported Values are 'quantize', 'quantile' and 'ordinal'.

##### `material` (Object, optional)

* Default: `true`

This is an object that contains material props for [lighting effect](/docs/api-reference/core/lighting-effect.md) applied on extruded polygons.
Check [the lighting guide](/docs/developer-guide/using-lighting.md#constructing-a-material-instance) for configurable settings.


##### `colorAggregation` (String, optional)

* Default: 'SUM'

Defines the operation used to aggregate all data object weights to calculate a bin's color value. Valid values are 'SUM', 'MEAN', 'MIN' and 'MAX'. 'SUM' is used when an invalid value is provided.

`getColorWeight` and `colorAggregation` together determine the elevation value of each bin. If the `getColorValue` prop is supplied, they will be ignored.

###### Example 1 : Using count of data elements that fall into a bin to encode the its color

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

###### Example 2 : Using mean value of 'SPACES' field of data elements to encode the color of the bin

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

If your use case requires aggregating using an operation that is not one of 'SUM', 'MEAN', 'MAX' and 'MIN', `getColorValue` should be used to define such custom aggregation function.


##### `elevationAggregation` (String, optional)

* Default: 'SUM'

Defines the operation used to aggregate all data object weights to calculate a bin's elevation value. Valid values are 'SUM', 'MEAN', 'MIN' and 'MAX'. 'SUM' is used when an invalid value is provided.

`getElevationWeight` and `elevationAggregation` together determine the elevation value of each bin. If the `getElevationValue` prop is supplied, they will be ignored.

###### Example 1 : Using count of data elements that fall into a bin to encode the its elevation

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

###### Example 2 : Using maximum value of 'SPACES' field of data elements to encode the elevation of the bin

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

If your use case requires aggregating using an operation that is not one of 'SUM', 'MEAN', 'MAX' and 'MIN', `getElevationValue` should be used to define such custom aggregation function.


### Data Accessors

##### `getPosition` ([Function](/docs/developer-guide/using-layers.md#accessors), optional)

* Default: `object => object.position`

Method called to retrieve the position of each object.


##### `getColorWeight` (Function, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `1`

The weight of a data object used to calculate the color value for a bin.

* If a number is provided, it is used as the weight for all objects.
* If a function is provided, it is called on each object to retrieve its weight.


##### `getColorValue` (Function, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `null`

After data objects are aggregated into bins, this accessor is called on each bin to get the value that its color is based on. If supplied, this will override the effect of `getColorWeight` and `colorAggregation` props.

Arguments:

- `objects` (Array) - a list of objects whose positions fall inside this cell.
- `objectInfo` (Object) - contains the following fields:
  + `indices` (Array) - the indices of `objects` in the original data
  + `data` - the value of the `data` prop.


##### `getElevationWeight` (Function, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `1`

The weight of a data object used to calculate the elevation value for a bin.

* If a number is provided, it is used as the weight for all objects.
* If a function is provided, it is called on each object to retrieve its weight.


##### `getElevationValue` (Function, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `null`

After data objects are aggregated into bins, this accessor is called on each bin to get the value that its elevation is based on. If supplied, this will override the effect of `getElevationWeight` and `elevationAggregation` props.

Arguments:

- `objects` (Array) - a list of objects whose positions fall inside this cell.
- `objectInfo` (Object) - contains the following fields:
  + `indices` (Array) - the indices of `objects` in the original data
  + `data` - the value of the `data` prop.


### Callbacks

##### `onSetColorDomain` (Function, optional)

* Default: `([min, max]) => {}`

This callback will be called when bin color domain has been calculated.

##### `onSetElevationDomain` (Function, optional)

* Default: `([min, max]) => {}`

This callback will be called when bin elevation domain has been calculated.



## Sub Layers

The HexagonLayer renders the following sublayers:

* `hexagon-cell` - a [ColumnLayer](/docs/api-reference/layers/column-layer.md) rendering the aggregated columns.


## Source

[modules/aggregation-layers/src/hexagon-layer](https://github.com/visgl/deck.gl/tree/master/modules/aggregation-layers/src/hexagon-layer)
