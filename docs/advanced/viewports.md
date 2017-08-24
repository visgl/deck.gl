# Viewports

# Visualizing Your Data using Viewports

deck.gl offers a set of viewports (essentially geospatially enabled "cameras") that can render data provided in different coordinate systems. The different [Viewport](/docs/api-reference/viewport.md) classes provide the ability to render your visualization from different perspectives (map synchronized, third person, first person, etc) and work together with various event controllers enabling the user to control the viewpoint within your visualization.

As mentioned, the basic [Viewport](/docs/api-reference/viewport.md) class is a  eneric geospatially enabled version of the typical 3D "camera" class you would find in most 3D/WebGL/OpenGL library, holding `view` and `projection` matrices and other uniforms needed by the WebGL vertex shaders.

While the `Viewport` class can certainly be used directly if you need and are able to calculate your own projection matrices. it is often preferable to use a `Viewport` subclass that takes higher level parameters, such as camera position and viewing direction, or map coordinates, rather than working directly with matrices.

In addition to generating WebGL uniforms, the `Viewport` class also offers JavaScript functions to project and unproject as well as getting local distance scales.


# Overview of Viewports

* `Viewport` - The base viewport has to be supplied view and projection matrices. A special property of the `Viewport` class that sets it apart from the typical OpenGL Camera class is that it has the necessary plumbing to support non-linear Web Mercator projection.

* `WebMercatorViewport` - While all `Viewport` subclasses are geospatially enabled, there is a special subclass, this class renders from a perspective that matches a typical top-down map (and is designed to synchronize perfectly with mapbox-gl even in persepricve mode.

* `FirstPersonViewport`- Allows the application to precisely positions


## About Viewport Positioning

Like many things in deck.gl, Viewports can be positioned using a lng/lat "anchor" and a meter offset. See the article about coordinate systems for more information about this setup.


### Notes on Coordinates

* For the `project`/`unproject` JavaScript functions, the default pixel coordinate system of the viewport is defined with the origin in the top left, where the positive x-axis goes right, and the positive y-axis goes down. That is, the top left corner is `[0, 0]` and the bottom right corner is `[width - 1, height - 1]`. The functions have a flag that can reverse this convention.

* Non-pixel projection matrices are obviously bottom left.

* Mercator coordinates are specified in "lng-lat" format [lng, lat, z] format (which naturally corresponds to [x, y, z]).

* Per cartographic tradition, all angles including `latitude`, `longitude`, `pitch` and `bearing` are specified in degrees, not radians.

* Longitude and latitude are specified in degrees from Greenwich meridian and the equator respectively, and altitude is specified in meters above sea level.

* It is possible to query the WebMercatorViewport for a meters per pixel scale. Note that that distance scales are latitude dependent under web mercator projection (see [http://wiki.openstreetmap.org/wiki/Zoom_levels](http://wiki.openstreetmap.org/wiki/Zoom_levels) for more details), so scaling will depend on the viewport center and any linear scale factor should only be expected to be locally correct.