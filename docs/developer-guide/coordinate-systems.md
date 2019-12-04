# Coordinate Systems

In most deck.gl layers, every data object is expected to contain one or more **positions** (e.g. the center of a point, or the start and end of an arc, the vertices of a polygon, etc). Positions are expected to be supplied as two or three element arrays (`[x, y]` or `[x, y, z]`). Objects can also have **dimensions** (e.g. the radius of a circle, the width of a path, etc), most of which are specified as a single number. Positions and dimensions are used to construct a 3D world with your data.

By default, deck.gl layers interprets positions as geospatial coordinates (i.e. `[longitude, latitude, altitude]`), and dimensions as in meters. So when working with geospatial data sources such as GeoJSON, deck.gl will automatically interpret any positions correctly.

deck.gl also supports a selection of alternative coordinate systems, supporting data from e.g. LIDAR sensors, and non-geospatial use cases.

Each deck.gl layer can define its own coordinate system. Within the data supplied to a single layer, all positions must be specified in the same coordinate system. Layers using different coordinate systems can be composed together, which is very useful when dealing with datasets from different sources.

```js
import {COORDINATE_SYSTEM} from '@deck.gl/core';
import {PointCloudLayer} from '@deck.gl/layers';

new PointCloudLayer({
  coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
  coordinateOrigin: [-122.4004935, 37.7900486, 0],  // anchor point in longitude/latitude/altitude
  data: [
    {position: [33.22, 109.87, 1.455]}, // meter offsets from the coordinate origin
    ...
  ],
  ...
})
```


## Supported Coordinate Systems

| Coordinate System Mode               | Positions                   | Dimensions | Notes |
| ---                                  | ---                           | --- | --- |
| `COORDINATE_SYSTEM.LNGLAT` (default) | [longitude, latitude, altitude] | meters | Longitude and latitude are specified as [WGS84](https://gisgeography.com/wgs84-world-geodetic-system/) coordinates in degrees from Greenwich meridian / equator respectively, and altitude is specified in meters above sea level. |
| `COORDINATE_SYSTEM.METER_OFFSETS` *   | [Δx, Δy, Δz]   | meters | Positions are given in meter offsets from a reference geo-location that is specified separately (`coordinateOrigin`). The `x` axis points map east, the `y` axis points map north, and `z` points up. |
| `COORDINATE_SYSTEM.LNGLAT_OFFSETS`    | [Δlongitude, Δlatitude, Δaltitude]   | meters | Positions are given in meter offsets from a reference geo-location that is specified separately (`coordinateOrigin`). |
| `COORDINATE_SYSTEM.CARTESIAN`         | [x, y, z] | identity units | A linear system with no interpretation for pure info-vis layers. Viewports can be used without supplying geospatial reference points. |
| `COORDINATE_SYSTEM.LNGLAT_DEPRECATED`| [longitude, latitude, altitude] | meters | A lower precision version of the `COORDINATE_SYSTEM.LNGLAT` mode, that was the default until deck.gl v6.2. Will be removed in a future release. |

* Note that although UTM ([Universal Transverse Mercator](https://en.wikipedia.org/wiki/Universal_Transverse_Mercator_coordinate_system)) coordinates uses similar meter offsets as the deck.gl meters mode, be aware there are subtle differences, so be careful before making assumptions.


## Choosing the Right Coordinate System

The choice of coordinate system is often dictated by your data. Generally speaking, converting data from one coordinate system to another on the CPU is costly and should be avoided, especially when dealing with spherical coordinates. Whether your data comes in `lng`/`lat`s or meter offsets, the best choice is to just configure any deck.gl layers displaying that data to use the corresponding `coordinateSystem`.

Coordinate systems can be specified per layer, meaning that each layer can have data with positions specified in a different coordinate system. If configurated correctly, they can all be rendered aligned at the same time.

An example of a use case where different coordinate systems are combined:

* Render a layer showing 3D buildings could have vertices specified in longitudes and latitudes (simply because available building data sources tend to be encoded this way)
* Render layer showing cars or pedestrians moving between the buildings with all positions specified using meter offsets from an anchor point somewhere in the city (e.g. the position of a sensor, in longitude and latitude), because meter offsets are more natural encoding for this data.


### Limitations of the Offset Systems

Like most cartographic projections, the [Web Meractor projection](https://en.wikipedia.org/wiki/Web_Mercator_projection) is non-linear. The offset system trades accuracy for performance by approximating the projection with a linearized local projection system. When working on local scales, small cities etc, using meter offsets gives a [very high degree of precision](https://github.com/uber-common/viewport-mercator-project/blob/master/docs/articles/offset-accuracy.md#meter-offset-to-pixels). When visualizing data on large scales (countries and continents) results will only be correct if you specify longitude and latitude for every point.


## Transforming Positions and Dimensions

Raw data do not always align cleanly with one of the provided coordinate systems. Here are some examples:

- Instead of meters, offsets and dimensions may come in millimeters, feet or miles.
- Instead of `x` aligning with map east and `y` aligning with map north, the offsets may be measured by a device with dynamic orientation. This is common in use cases such as a LIDAR scanner mounted on a moving vehicle.

Again, converting raw data to match the coordinate system expectations can be very expensive if done on the CPU. This should be avoided whenever possible.

Instead, in addition to specifying `coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS` and `coordinateOrigin`, a layer could also specify the `modelMatrix` prop as a 4x4 transformation matrix. The [math.gl](https://uber-web.github.io/math.gl/docs/api-reference/matrix4) library (a light wrapper of [gl-matrix](http://glmatrix.net/)) can be used for this purpose, which is already a dependency of deck.gl.

The `modelMatrix` prop is most useful with the `METER_OFFSETS` and `IDENTITY` coordinate systems. It is usually the right solution for pre-processing (flipping, rotating, scaling etc) your data, since these operations will be done very performantly in the GPU. Note that these two coordinate systems are the only ones that are linear and uniform in all directions. Longitude and latitude based positions cannot be scaled/rotated/translated correctly with a 4x4 matrix.

Also note that `modelMatrix` only applies to positions. To transform the dimensions for each object, most layers provide props such as `radiusScale`, `widthScale`, `sizeScale` etc. Check each layer's documentation for what's available.


## Views and Projections

The same positions can be drawn differently to screen based on what projection method is used. deck.gl's **views** define how the camera should be set up to look at your data objects. View states, such as zoom level, center point, pitch and bearing affect where things are drawn on the screen.

The view is independent of the layers' coordinate systems, and is shared by all layers. So all layers will always pan, zoom and tilt together, regardless of what coordinate system their positions are specified in.

The default view used in deck.gl is the [MapView](/docs/api-reference/map-view.md), which implements the [Web Meractor projection](https://en.wikipedia.org/wiki/Web_Mercator_projection). When working with non-geospatial datasets, the `IDENTITY` coordinate system needs to be used in combination with an alternative view. Read about deck.gl's view system in [Views and Projections](/docs/developer-guide/views.md).


## Comparison to Standard 3D Graphics Coordinate Systems

There can be some confusion when mapping between deck.gl's coordinate systems and those typically seen in 3D graphics applications, i.e. model space, world space, view space, clip space.

- deck.gl's world space maps to the standard "model space", i.e. the data that comes in before any transforms have been applied.
- deck.gl's common space plays the role of standard "world space", but there are a few important differences. The y axis is inverted, which  means it's a left-handed coordinate system. The mercator "zoom" factor is applied as a common space transform (rather than in the view or projection transforms).
- The view transform in deck.gl includes a scaling of the z axis by 1 / height of the screen in pixel. This is done to line up mercator pixels with screen pixels, but also means the "near" and "far" distances used in the perspective transform are not the true distances, but numbers scaled down by the same factor.

