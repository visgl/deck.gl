# Viewports

## Overview

deck.gl calculates projections using a generic [Viewport class](/docs/api-reference/viewport.md)
(which is essentially a 3D matrix "camera" class of the type you would find in any 3D/WebGL/OpenGL
library, holding `view` and `projection` matrices).

The basic `Viewport` class is generic and can be used directly
if you can calculate your own projection matrices, it is often preferable to
use a `Viewport` subclass that takes higher level parameters, such as
camera position and viewing direction, or map coordinates, rather than
working directly with matrices.

In addition to matrices which are mainly used as WebGL uniforms, the `Viewport`
class also offers JavaScript functions to project and unproject as well as
getting local distance scales.

A special property of the `Viewport` class that sets it apart from the typical
OpenGL Camera class is that it has the necessary plumbing to support non-linear
Web Mercator projection.

There is a special subclass, the `WebMercatorViewport`, that at its core
is a utility for converting to and from map
(latitude, longitude) coordinates to screen coordinates and back.

### Notes on Coordinates

* For the `project`/`unproject` functions, the default pixel coordinate system of
  the viewport is defined with the origin in the top left, where the positive
  x-axis goes right, and the positive y-axis goes down. That is, the
  top left corner is `[0, 0]` and the bottom right corner is `[width - 1, height - 1]`.
  The functions have a flag that can reverse this convention.

* Non-pixel projection matrices are obviously bottom left.

* Mercator coordinates are specified in "lng-lat" format [lng, lat, z] format
  (which naturally corresponds to [x, y, z]).

* Per cartographic tradition, all angles including `latitude`, `longitude`,
  `pitch` and `bearing` are specified in degrees, not radians.

* Longitude and latitude are specified in degrees from Greenwich meridian and
  the equator respectively, and altitude is specified in meters above sea level.

* It is possible to query the WebMercatorViewport for a meters per pixel scale.
  Note that that distance scales are latitude dependent under
  web mercator projection (see [http://wiki.openstreetmap.org/wiki/Zoom_levels](http://wiki.openstreetmap.org/wiki/Zoom_levels) for more details),
  so scaling will depend on the viewport center and any linear scale factor
  should only be expected to be locally correct.
