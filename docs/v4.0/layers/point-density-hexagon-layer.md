<p align="right">
  <img src="https://img.shields.io/badge/extruded-yes-blue.svg?style=flat-square" alt="64-bit" />
</p>

# PointDensityHexagonLayer

The PointDensityHexagonLayer renders a hexagon heatmap based on an array of points.
 It takes the radius of hexagon bin, projects points into hexagon bins. The color
and height of the hexagon is scaled by number of points it contains. PointDensityHexagonLayer
at the moment only works with COORDINATE_SYSTEM.LNG_LAT.


  <div align="center">
    <img height="300" src="/demo/src/static/images/point-density-hexagon.gif" />
  </div>

    import {PointDensityHexagonLayer} from 'deck.gl';

Inherits from all [Base Layer](/docs/layers/base-layer.md) properties.


## Layer-specific Properties

##### `radius` (Number, optional)

- Default: `1000`

Radius of hexagon bin in meters. The hexagons are pointy-topped (rather than flat-topped).

##### `hexagonAggregator` (Function, optional)

- Default: `d3-hexbin`

`hexagonAggregator` is the function to aggregate data into hexagonal bins.
The `hexagonAggregator` takes props of the layer and current viewport as input.
The output should be an array of hexagons with each formatted as `{centroid: [], points: []}`
`centroid` is the center of the hexagon, and `points` is an array of points that contained by it.
By default, the `PointDensityHexagonLayer` uses [[d3-hexbin | https://github.com/d3/d3-hexbin]] as `hexagonAggregator`, 
see `src/layers/core/point-density-hexagon-layer/hexagon-aggregator`

##### `colorDomain` (Array, optional)

- Default: `[min(count), max(count)]`

Color scale domain, default is set to the range of point counts in each hexagon.

##### `colorRange` (Array, optional)

- Default: <img src="/demo/src/static/images/colorbrewer_YlOrRd_6.png"/></a>

Hexagon color ranges as an array of colors formatted as `[255, 255, 255, 255]`. Default is 
[colorbrewer] (http://colorbrewer2.org/#type=sequential&scheme=YlOrRd&n=6) `6-class YlOrRd`.

##### `coverage` (Number, optional)

- Default: `1`

Hexagon radius multiplier, between 0 - 1. The final radius of hexagon is calculated by 
`coverage * radius`. Note: coverage does not affect how points are binned. 
The radius of the bin is determined only by `radius`

##### `elevationDomain` (Array, optional)

- Default: `[0, max(count)]`

Elevation scale input domain, default is set to the extent of point counts in each hexagon.

#### `elevationRange` (Array, optional)

- Default: `[0, 1000]`

Elevation scale output range

##### `elevationScale` (Number, optional)

- Default: `1`

Hexagon elevation multiplier. The elevation of hexagon is calculated by
  `elevationScale * getElevation(d)`. `elevationScale` is a handy property to scale
all hexagons without updating the data.

##### `extruded` (Boolean, optional)

- Default: `true`

Whether to enable cell elevation. Cell elevation scale by count of points in each cell.
  If se to false, all cell will be flat.

##### `getPosition` (Function, optional)

- Default: `object => object.position`

Method called to retrieve the position of each point.

##### `lightSettings` (Object, optional) **EXPERIMENTAL**

This is an object that contains light settings for extruded polygons.
  Be aware that this prop will likely be changed in a future version of deck.gl.
