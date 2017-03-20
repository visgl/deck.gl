<p align="right">
  <img src="https://img.shields.io/badge/extruded-yes-blue.svg?style=flat-square" alt="64-bit" />
</p>

# HexagonLayer

The `HexagonLayer` renders a hexagon heatmap based on an array of points.
 It takes the radius of hexagon bin, projects points into hexagon bins. The color
and height of the hexagon is scaled by number of points it contains. HexagonLayer
at the moment only works with COORDINATE_SYSTEM.LNG_LAT.

  <div align="center">
    <img height="300" src="/demo/src/static/images/hexagon-layer.gif" />
  </div>

    import {HexagonLayer} from 'deck.gl';

## Properties

Inherits from all [Base Layer](/docs/layers/base-layer.md) properties.

##### `radius` (Number, optional)

- Default: `1000`

Radius of hexagon bin in meters. The hexagons are pointy-topped (rather than flat-topped).

##### `hexagonAggregator` (Function, optional)

- Default: `d3-hexbin`

`hexagonAggregator` is the function to aggregate data into hexagonal bins.
The `hexagonAggregator` takes props of the layer and current viewport as input.
The output should be an array of hexagons with each formatted as `{centroid: [], points: []}`, where
`centroid` is the center of the hexagon, and `points` is an array of points that contained by it.

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

##### `coverage` (Number, optional)

- Default: `1`

Hexagon radius multiplier, clamped between 0 - 1. The final radius of hexagon
is calculated by `coverage * radius`. Note: coverage does not affect how points
are binned.
The radius of the bin is determined only by the `radius` property.

##### `elevationDomain` (Array, optional)

- Default: `[0, max(count)]`

Elevation scale input domain. The elevation scale is a linear scale that
maps number of counts to elevation. By default it is set to between
0 and max of point counts in each hexagon.
This property is extremely handy when you want to render different data input
with the same elevation scale for comparison.

#### `elevationRange` (Array, optional)

- Default: `[0, 1000]`

Elevation scale output range

##### `elevationScale` (Number, optional)

- Default: `1`

Hexagon elevation multiplier. The actual elevation is calculated by
  `elevationScale * getElevation(d)`. `elevationScale` is a handy property to scale
all hexagons without updating the data.

##### `extruded` (Boolean, optional)

- Default: `true`

Whether to enable cell elevation. Cell elevation scale by count of points in each cell. If set to false, all cells will be flat.

##### `fp64` (Boolean, optional)

- Default: `false`

Whether the layer should be rendered in high-precision 64-bit mode

##### `lightSettings` (Object, optional) **EXPERIMENTAL**

This is an object that contains light settings for extruded polygons.
  Be aware that this prop will likely be changed in a future version of deck.gl.

## Accessors

##### `getPosition` (Function, optional)

- Default: `object => object.position`

Method called to retrieve the position of each point.
