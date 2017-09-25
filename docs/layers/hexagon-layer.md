<!-- INJECT:"HexagonLayerDemo" -->

<p class="badges">
  <img src="https://img.shields.io/badge/64--bit-support-blue.svg?style=flat-square" alt="64-bit" />
  <img src="https://img.shields.io/badge/extruded-yes-blue.svg?style=flat-square" alt="extruded" />
</p>

# HexagonLayer

The Hexagon Layer renders a hexagon heatmap based on an array of points.
It takes the radius of hexagon bin, projects points into hexagon bins. The color
and height of the hexagon is scaled by number of points it contains.

HexagonLayer is a `CompositeLayer` and at the moment only works with COORDINATE_SYSTEM.LNGLAT.

```js
import DeckGL, {HexagonLayer} from 'deck.gl';

const App = ({data, viewport}) => {

  /**
   * Data format:
   * [
   *   {position: [-122.4, 37.7]},
   *   ...
   * ]
   */
  const layer = new HexagonLayer({
    id: 'hexagon-layer',
    data,
    radius: 1000
  });

  return (<DeckGL {...viewport} layers={[layer]} />);
};
```

## Properties

Inherits from all [Base Layer](/docs/api-reference/base-layer.md) properties.

### Render Options

##### `radius` (Number, optional)

- Default: `1000`

Radius of hexagon bin in meters. The hexagons are pointy-topped (rather than flat-topped).

##### `hexagonAggregator` (Function, optional)

- Default: `d3-hexbin`

`hexagonAggregator` is a function to aggregate data into hexagonal bins.
The `hexagonAggregator` takes props of the layer and current viewport as arguments.
The output should be `{hexagons: [], hexagonVertices: []}`. `hexagons` is
an array of `{centroid: [], points: []}`, where `centroid` is the
center of the hexagon, and `points` is an array of points that contained by it.  `hexagonVertices`
(optional) is an array of points define the primitive hexagon geometry.

By default, the `HexagonLayer` uses
[d3-hexbin](https://github.com/d3/d3-hexbin) as `hexagonAggregator`,
see `src/layers/core/point-density-hexagon-layer/hexagon-aggregator`

##### `colorDomain` (Array, optional)

- Default: `[min(count), max(count)]`

Color scale input domain. The color scale maps continues numeric domain into
discrete color range. If not provided, the layer will set `colorDomain` to the
range of counts in each hexagon. You can control how the color of hexagons mapped
to number of counts by passing in an arbitrary color domain. This property is extremely handy when you want to render different data input with the same color mapping for comparison.

##### `colorRange` (Array, optional)

- Default: <img src="/demo/src/static/images/colorbrewer_YlOrRd_6.png"/></a>

Hexagon color ranges as an array of colors formatted as `[[255, 255, 255, 255]]`. Default is
[colorbrewer](http://colorbrewer2.org/#type=sequential&scheme=YlOrRd&n=6) `6-class YlOrRd`.

##### `getColorValue` (Function, optional)

- Default: `points => points.length`

`getColorValue` is the accessor function to get the value that bin color is based on.
It takes an array of points inside each bin as arguments, returns a number. For example,
You can pass in `getColorValue` to color the bins by avg/mean/max of a specific attributes of each point.
By default `getColorValue` returns the length of the points array.

Note: hexagon layer compares whether `getColorValue` has changed to
recalculate the value for each bin that its color based on. You should
pass in the function defined outside the render function so it doesn't create a
new function on every rendering pass.

```
 class MyHexagonLayer {
    getColorValue (points) {
        return points.length;
    }

    renderLayers() {
      return new HexagonLayer({
        id: 'hexagon-layer',
        getColorValue: this.getColorValue // instead of getColorValue: (points) => { return points.length; }
        data,
        radius: 500
      });
    }
 }
```

##### `coverage` (Number, optional)

- Default: `1`

Hexagon radius multiplier, clamped between 0 - 1. The final radius of hexagon
is calculated by `coverage * radius`. Note: coverage does not affect how points
are binned. The radius of the bin is determined only by the `radius` property.

##### `elevationDomain` (Array, optional)

- Default: `[0, max(count)]`

Elevation scale input domain. The elevation scale is a linear scale that
maps number of counts to elevation. By default it is set to between
0 and max of point counts in each hexagon.
This property is extremely handy when you want to render different data input
with the same elevation scale for comparison.

##### `elevationRange` (Array, optional)

- Default: `[0, 1000]`

Elevation scale output range

##### `getElevationValue` (Function, optional)

- Default: `points => points.length`

Similar to `getColorValue`, `getElevationValue` is the accessor function to get the value that bin elevation is based on.
It takes an array of points inside each bin as arguments, returns a number.
By default `getElevationValue` returns the length of the points array.

Note: hexagon layer compares whether `getElevationValue` has changed to
recalculate the value for each bin for elevation. You should
pass in the function defined outside the render function so it doesn't create a
new function on every rendering pass.

##### `elevationScale` (Number, optional)

- Default: `1`

Hexagon elevation multiplier. The actual elevation is calculated by
  `elevationScale * getElevation(d)`. `elevationScale` is a handy property to scale
all hexagons without updating the data.

##### `extruded` (Boolean, optional)

- Default: `true`

Whether to enable cell elevation. Cell elevation scale by count of points in each cell. If set to false, all cells will be flat.

##### `upperPercentile` (Number, optional)

- Default: `100`

Filter bins and re-calculate color by `upperPercentile`. Hexagons with color value
larger than the upperPercentile will be hidden.

##### `lowerPercentile` (Number, optional)

- Default: `0`

Filter bins and re-calculate color by `lowerPercentile`. Hexagons with color value
smaller than the lowerPercentile will be hidden.

##### `elevationUpperPercentile` (Number, optional)

- Default: `100`

Filter bins and re-calculate elevation by `elevationUpperPercentile`. Hexagons with elevation value
larger than the elevationUpperPercentile will be hidden.

##### `elevationLowerPercentile` (Number, optional)

- Default: `100`

Filter bins and re-calculate elevation by `elevationLowerPercentile`. Hexagons with elevation value
smaller than the elevationLowerPercentile will be hidden.

##### `fp64` (Boolean, optional)

- Default: `false`

Whether the layer should be rendered in high-precision 64-bit mode

##### `lightSettings` (Object, optional) **EXPERIMENTAL**

This is an object that contains light settings for extruded polygons.
  Be aware that this prop will likely be changed in a future version of deck.gl.

### Data Accessors

##### `getPosition` (Function, optional)

- Default: `object => object.position`

Method called to retrieve the position of each point.

##### `onSetColorDomain` (Function, optional)

- Default: `() => {}`

This callback will be called when bin color domain has been calculated.

##### `onSetElevationDomain` (Function, optional)

- Default: `() => {}`

This callback will be called when bin elevation domain has been calculated.

## Source

[src/layers/core/hexagon-layer](https://github.com/uber/deck.gl/tree/4.1-release/src/layers/core/hexagon-layer)
