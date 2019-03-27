# Coordinate Systems

By default, deck.gl layers interprets positions in the [Web Mercator](https://en.wikipedia.org/wiki/Web_Mercator) coordinate system (i.e. `[longitude, latitude, altitude]`), so when working with geospatial data (i.e with longitude and latitude encoded positions) deck.gl will automatically interpret any positions correctly.

In addition, deck.gl layers can be configured to use a selection of alternative coordinate systems, supporting data from e.g. LIDAR sensors, and non-geospatial use cases.

Each deck.gl layer can define its own coordinate system. Within the data supplied to a single layer, all positions must be specified in the same coordinate system. Layers using different coordinate systems can be composed together, which is very useful when dealing with datasets from different sources.


## Supported Coordinate Systems

| Coordinate System Mode               | Coordinates                   | Description |
| ---                                  | ---                           | --- |
| `COORDINATE_SYSTEM.LNGLAT` (default) | [longitude, latitude, altitude] | Longitude and latitude are specified as **Web Mercator coordinates** in degrees from Greenwich meridian / equator respectively, and altitude is specified in meters above sea level. |
| `COORDINATE_SYSTEM.METER_OFFSETS`    | [Δx, Δy, Δz]   | Positions are given in meter offsets from a reference point that is specified separately (the `coordinateOrigin` prop) |
| `COORDINATE_SYSTEM.IDENTITY`         | [x, y, z] | A linear system with no interpretation for pure info-vis layers. Viewports can be used without supplying geospatial reference points. |
| `COORDINATE_SYSTEM.LNGLAT_DEPRECATED`| [longitude, latitude, altitude] | A lower precision version of the `COORDINATE_SYSTEM.LNGLAT` mode, that was the default until deck.gl v6.0. Will be removed in a future release. |


## Choosing the Right Coordinate System

The choice of coordinate system is often dictated by your data. If your data is specified in `lng`/`lat`s or meter offsets the natural choice is of course to just configure any layers displaying that data top use the corresponding coordinate system mode in deck.gl.

The meter offset system is quite performant, but uses a linearized projection that is only locally correct around an "anchor point". So, if your data spans large scales, you will not get the right results, but within 10km or so from the anchor point, the agreement should be quite good.


## Combining Different Coordinate Systems

Coordinate systems can be specified per layer, meaning that each layer can have data with positions specified in a "different" coordinate system. If some care is taken, they can all be rendered and drawn (correctly aligned) at the same time.

An example of a use case where different coordinate systems are combined:

* Render a layer showing 3D buildings could have vertices specified in longitudes and latitudes (simply because available building data sources tend to be encoded this way)
* Render layer showing cars or pedestrians moving between the buildings with all positions specified using meter offsets from an anchor point somewhere in the city), because meter offsets are more natural encoding for this data.


### About Geospatial Positions

In most deck.gl layers, every data object is expected to contain one or more `position`s (e.g. the center of a point, or the start and end of a line or arc, the vertices of a GeoJson polygon, etc). Positions are expected to be supplied as two or three element arrays ([x,y] or [x,y,z]).

When used with a geospatial coordinate system mode, positions will be interpreted as representing points on (or possibly elevated over) a Web Mercator projected map


### About Meter Offsets and Distances

When dealing with data sets that are not widely deck.gl supports working in local coordinates (meter offsets) relative to an anchor point (specified in longitude and latitude).

Like all cartographic projections, the Web Meractor projection is non-linear, and when visualizing data on large scales (countries and large) results will only be correct if you specify longitude and latitude for every point. But when working on local scales, small cities etc, using meter offsets gives a very high degree of precision.

Distances represent either the distance between two points, or just a general sizes, like a radius, elevation(height) or similar. Distances are specified in meters in mercator mode, and simply in world coordinate deltas in linear mode).

Note: deck.gl always calculates a "meters per pixel" scale, allowing the application to specify positions and distances in meters. Whenever the `coordinateOrigin` prop is supplied to a layer (it is expected to contain a `[longitude, latitude]` array, it becomes a base reference point for this scale.


### The modelMatrix

Note that deck.gl only supports **meter** offsets, with y axis aligned with map north. If you like to work in other units (feet, miles etc) or other orientations (y axis pointing south, or at an angle) you should define a `modelMatrix` and build a 4x4 transformation matrix (e.g. using the [math.gl](https://uber-web.github.io/math.gl/#/documentation/overview) library).

The `modelMatrix` is particularly potent when used with meter offset coordinates (and non-geospatial coordinates, of course) and is usually the right solution for pre-processing (flipping, rotating, scaling etc) your data, since these operations will be done essentially for free in the GPU, rather than having to lock up your main thread for seconds after each load to transform your "big data" using JavaScript on the CPU.


### About Viewports

Viewport parameters, such as zoom level, center point, pitch and bearing affect where things are drawn on the screen. The viewport is independent of the layers' coordinate systems (it is shared by all layers), so all layers will always pan zoom and tilt together, regardless of what coordinate system their positions are specified in.

deck.gl provides Viewports both supporting the traditional third-person view of maps (looking down at a specified center point), as well as first-person cameras allowing you to position the viewer directly inside your visualization as if in a first person computer game.


### Non-Cartographic Projection Mode

For non-geospatial visualizations, deck.gl supports working in a standard linear
coordinate system (i.e. cartographically unprojected) which makes it easy to use deck.gl layers without underlying maps.

In this linear mode, positions are simply so called "world" coordinates, i.e. [x, y, z].

This mode does not offer any synchronization with maps, the application simply specifies its view and projection matrices like in any 3D library. The application needs to manage the extents of positions in its data, and adjust view matrices accordingly.


## Remarks

* Note that although UTM (Universal Transverse Mercator) coordinates uses similar meter offsets as the deck.gl meters mode, be aware there are subtle differences, so be careful before making assumptions.
