# Coordinate Systems

In most deck.gl layers, every data object is expected to contain one or more **positions** (e.g. the center of a point, or the start and end of an arc, the vertices of a polygon, etc). Positions are expected to be supplied as two or three element arrays (`[x, y]` or `[x, y, z]`). Objects can also have **dimensions** (e.g. the radius of a circle, the width of a path, etc), most of which are specified as a single number. Positions and dimensions are used to construct a 3D world with your data.

deck.gl supports a selection of coordinate systems, addressing diverse geospatial and non-geospatial use cases. Each layer can set its own `coordinateSystem` prop to specify how its positions should be interpreted. Layers using different coordinate systems can be composed together, which is very useful when dealing with datasets from different sources.

Many layers also provide props for defining the units that dimensions are measured in, usually named as `*Units`. A layer can leverage such props to control its appearance in a way that makes the most sense for the data and the desired user experience.

```js
import {COORDINATE_SYSTEM} from '@deck.gl/core';
import {PointCloudLayer} from '@deck.gl/layers';

new PointCloudLayer({
  coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
  coordinateOrigin: [-122.4004935, 37.7900486, 0],  // anchor point in longitude/latitude/altitude
  data: [
    {position: [33.22, 109.87, 1.455]}, // offsets from the coordinate origin in meters
  ],
  getPosition: d => d.position,
  pointSize: 2
})
```


## Concepts

Throughout this document you will find reference to the following **coordinate spaces** in deck.gl's projection system:

##### World space

The natural coordinate system of a dataset. It is usually determined by the source of the data, like the device it is generated on, and the format that it is stored as on disk or a cloud data warehouse.

Some examples of different world space definitions include a [Shapefile](https://en.wikipedia.org/wiki/Shapefile) with any [standard geospatial reference](https://epsg.io/); WGS84 as used by GeoJSON or KML; GPS traces; LIDAR scans; info-vis values that do not map to real-world dimensions; [Slippy Map](https://wiki.openstreetmap.org/wiki/Slippy_Map) tiles from services like OpenStreetMaps and Mapbox; 3D tiling standards such as [Cesium 3D Tiles](https://www.ogc.org/standards/3DTiles) and [Esri I3S](https://www.ogc.org/standards/i3s).

Positions in different world spaces come with different scales and orientations, may be measured relative to static or dynamic reference points, and in many cases their scales are not linear. It is common for an application to overlay multiple datasets from different world spaces into the same 3D view.

##### Common space

To correctly compose data from various world spaces together, deck.gl transforms them into common space - a unified, intermediate 3D space that is a [right-handed Cartesian coordinate system](https://en.wikipedia.org/wiki/Cartesian_coordinate_system#In_three_dimensions). Once positions are in the common space, it is safe to add, substract, rotate, scale and extrude them as 3D vectors using standard linear algebra. This is the basis of all geometry processing in deck.gl layers.

The transformation between the world space and the common space is referred to in deck.gl documentation as "project" (world space to common space) and "unproject" (common space to world space), a process controlled by both the specification of the world space, such as WGS84, and the [projection mode](./views.md), such as Web Mercator. Projections are implemented as part of deck.gl's core.

##### Screen space

A top-left coordinate system that runs from `[0, 0]` to `[viewportWidth, viewportHeight]`, measured in pixels.

For a given dataset, positions in the common space normally do not change with user interaction, while their appearance in screen space can be frequently changing as the user pans, zooms and rotates the camera.


## Positions

Each layer is expected to specify its `coordinateSystem` prop to match the world space of its `data`. Within the data supplied to a single layer, all positions will be interpreted in the same coordinate system.

By default, a layer's [coordinateSystem](../api-reference/core/layer.md#coordinatesystem) is assumed to be `COORDINATE_SYSTEM.LNGLAT` if rendered in a geospatial view (e.g. `MapView`, `GlobeView`) and `COORDINATE_SYSTEM.CARTESIAN` if rendered in a non-geospatial view (e.g. `OrbitView`, `OrthographicView`).

Some coordinate systems need to be used with the [coordinateOrigin](../api-reference/core/layer.md#coordinateorigin) prop, which specifies where the positions are measured from.


### Supported coordinate systems

| Coordinate system               | Positions                   | Coordinate origin | Notes |
| ---                                  | ---                           | --- | --- |
| `COORDINATE_SYSTEM.LNGLAT` | `[longitude, latitude, altitude]` | ignored | Longitude and latitude are specified as [WGS84](https://gisgeography.com/wgs84-world-geodetic-system/) coordinates in degrees from Greenwich meridian / equator respectively, and altitude is specified in meters above sea level. |
| `COORDINATE_SYSTEM.METER_OFFSETS`   | `[Δx, Δy, Δz]`   | `[longitude, latitude, altitude]` | Positions are given in meter offsets from a reference geo-location that is specified by `coordinateOrigin`. The `x` axis points map east, the `y` axis points map north, and `z` points up. Only works with geospatial views. |
| `COORDINATE_SYSTEM.LNGLAT_OFFSETS`    | `[Δlongitude, Δlatitude, Δaltitude]`   | `[longitude, latitude, altitude]` | Positions are given in degree offsets from a reference geo-location that is specified by `coordinateOrigin`. Only works with geospatial views. |
| `COORDINATE_SYSTEM.CARTESIAN`         | `[x, y, z]` | `[x, y, z]` (optional, default `[0, 0, 0]`) | A linear system that measures equally on all 3 axes. |

Remarks:

* Although [Universal Transverse Mercator](https://en.wikipedia.org/wiki/Universal_Transverse_Mercator_coordinate_system) uses similar notions as the `METER_OFFSETS` mode, be aware that the deck.gl offset system does not have the sophistication of the UTM spec and should not be used interchangeably. See the [limitations](#limitations-of-the-offset-systems) section for details.
* The `CARTESIAN` mode describes positions that are identical in the world space and the common space. It is the default coordinate system when rendering into non-geospatial views. When combined with geospatial views, the positions are treated as common space coordinates for that particular projection mode. The latter can be seen used by the [MVTLayer](../api-reference/geo-layers/mvt-layer.md), where the data decoded from the tiles are already pre-projected onto the Web Mercator plane.


### Limitations of the offset systems

Most cartographic projections, including the [Web Mercator projection](https://en.wikipedia.org/wiki/Web_Mercator_projection), are non-linear. The `METER_OFFSETS` and `LNGLAT_OFFSETS` coordinate systems trade accuracy for performance by approximating the projection with a linearized local projection system. When working on local scales, such as small cities, using meter offsets gives a [very high degree of precision](https://github.com/uber-web/math.gl/blob/master/modules/web-mercator/docs/developer-guide/offset-projection-accuracy.md). When visualizing data on large scales, such as countries and continents, projection will only be correct if you use the `LNGLAT` mode.


### Transforming positions

Generally speaking, converting data from one coordinate system to another on the CPU is costly and should be avoided, especially when dealing with spherical coordinates. Whether your data comes in longitude/latitude or meter offsets, the best choice is to just configure any deck.gl layers displaying that data to use the corresponding `coordinateSystem`. When dealing with data that come from different coordinate systems, the recommended approach is to render them on separate layers, for each you may specify a coordinate system respectively.

Raw data do not always align cleanly with one of the provided coordinate systems. Here are some examples:

- Instead of meters, offsets and dimensions may come in millimeters, feet or miles.
- Instead of `x` aligning with map east and `y` aligning with map north, the offsets may be measured by a device with dynamic orientation. This is common in use cases such as a LIDAR scanner mounted on a moving vehicle.

Again, converting raw data to match the coordinate system expectations can be very expensive if done on the CPU. This should be avoided whenever possible.

Instead, in addition to specifying `coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS` and `coordinateOrigin`, a layer could also specify the `modelMatrix` prop as a 4x4 transformation matrix. The [math.gl](https://math.gl/modules/core/docs/api-reference/matrix4) library (a light wrapper of [gl-matrix](http://glmatrix.net/)) can be used for this purpose, which is already a dependency of deck.gl.

The `modelMatrix` prop is most useful with the `METER_OFFSETS` and `CARTESIAN` coordinate systems. It is usually the right solution for pre-processing (flipping, rotating, scaling etc) your data, since these operations will be done very performantly in the GPU. Note that these two coordinate systems are the only ones that are linear and uniform in all directions. Longitude and latitude based positions cannot be scaled/rotated/translated correctly with a 4x4 matrix.


## Dimensions

Most deck.gl layers that deal with dimensions allow specifying the dimensions in one of the coordinate spaces, with props such as `radiusUnits` in `ScatterplotLayer`, `sizeUnits` in `IconLayer`, and `widthUnits` in `PathLayer`.

### Supported units

##### `meters` {#meters}

The universal metric unit.

Typically used when sizes should correspond with measurements in the physical world. For example, a `PathLayer` may draw the street network in a city from  GeoJSON LineString features, and each path with width that are calculated from the number of lanes. Or an `IconLayer` may draw traffic signs that match their physical dimensions.

Exactly how big one meter will appear after projection subjects to the projection mode used. One should be aware that all cartographic projections come with some sort of distortion, for example one meter is projected to different pixel sizes at different latitudes in a [Mercator map](https://en.wikipedia.org/wiki/Mercator_projection#/media/File:Mercator_with_Tissot's_Indicatrices_of_Distortion.svg).

When used with non-geospatial views, this value does not have any tangible meaning and is treated as identical to `common`.

##### `common` {#common}

One unit in the [common space](#common-space). When zooming in and out, common sizes scale with the base map.

When visualizing numeric values that do not have any cartographic meaning (e.g. population or income), layers often map them to the size of geometries (e.g. radius of circles). In this case, using `common` units may be preferrable as one common unit projects to the same size regardless of where it is on the map. It offers the visual consistency and comparability that `meters` lacks, especially when viewing data on a global scale.

##### `pixels` {#pixels}

One unit in the [screen space](#screen-space). When zooming in and out, pixel sizes remain the same on screen.

For example, `PathLayer` evaluates `getWidth: 12, widthUnits: 'pixels'` to the same size as a DOM block with the CSS rule `width: 12px`, regardless of the zoom level.

This mode is typically used when legibility is important at all zoom levels, such as text labels.

When pixel sizes are viewed from a perspective (e.g. `MapView` with `pitch`, `FirstPersonView` or `OrbitView`), the same size may appear bigger if the geometry is positioned closer to the camera, in order to preserve the sense of depth. In this case, one pixel at the focal point of the camera (usually the center of the viewport) is always rendered as one true CSS pixel.


### Transforming dimensions

The most performant way to transform the dimensions for each object is to use an uniform multiplier. Most layers that deal with dimensions provide props such as `radiusScale`, `widthScale`, `sizeScale` etc. Check each layer's documentation for what's available.

The conversion between meter sizes and common sizes depend on the projection mode:

- [MapView](../api-reference/core/map-view.md) and [FirstPersonView](../api-reference/core/first-person-view.md): 512 common units equals `C * cos(phi)` where `C` is the circumference of earth, and `phi` is the latitude in radians.
- [GlobeView](../api-reference/core/globe-view.md): 512 common units equals the diameter of the earth.
- [OrbitView](../api-reference/core/orbit-view.md) and [OrthographicView](../api-reference/core/orthographic-view.md): 1 meter unit equals 1 common unit.

The conversion between common sizes and pixel sizes: 1 common unit equals `2 ** z` pixel where `z` is the zoom of the current viewport.


## Comparison to Standard 3D Graphics Concepts

If you are familiar with the traditional 3D graphics/game engine terminologies, here is how they map to deck.gl's coordinate spaces:

- deck.gl's world space maps to the standard "model space", i.e. the data that comes in before any transforms have been applied.
- deck.gl's common space plays the role of standard "world space", but there are a few important differences. To compensate for the lack of 64-bit floats in WebGL2/WebGPU, deck.gl may apply a dynamic translation to common-space positions, determined by the viewport, to improve the precision of projection.
- Zoom levels are applied by scaling the view matrix with `Math.pow(2, zoom)`.
