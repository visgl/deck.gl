# Coordinate Systems

By default deck.gl layers interprets positions in the Web Mercator
coordinate system, however deck.gl also support positions
specified in several other coordinate systems.


## Overview

In most deck.gl layers, every data object is associated by one or more
positions, usually extracted by application provided accessor functions
in the form of two or three element arrays ([x,y] or [x,y,z]).

The interpretation of these positions, i.e. where they should be
displayed on the screen, depend on which coordinate system is being
used.

In deck.gl, the choice of coordinate system can be specified per layer,
meaning that different layers can have data with positions specified
in different coordinate systems, and they can all be rendered and drawn
at the same time.

Remarks:
* The current viewport parameters, such as zoom level,
  center point, and pitch and bearing also affect where things are drawn
  on the screen). The viewport is independent of coordinate systems,
  and shared by all layers, so they will always pan zoom and tilt
  together, regardless of what coordinate system their positions
  are specified in.

### Non-cartographic Projection Mode

In its simplest mode, deck.gl supports working in standard linear
(i.e. cartographically unprojected) coordinate system
(suitable when using deck.gl layers without underlying maps)

In this mode, which does not offer any synchronization with maps, the
application simply specifies its view and projection matrices like in
any 3D library.

The application needs to manage the extents of positions in its data,
and adjust view matrices accordingly.


## Support for the Web Mercator Projection and Cartographic Coordinate Systems

A deck.gl layer can be configured to work with positions specified
in different units.

- **longitude/latitude/altitude** (`COORDINATE_SYSTEM.LNGLAT`) -
  positions are interpreted as Web Mercator coordinates:
  [longitude, latitude, altitude]. This is the default.
- **meter offsets** (`COORDINATE_SYSTEM.METERS`) -
  positions are given in meter offsets [deltaX, deltaY, deltaZ]
  from a reference point that is specified separately.

* It is possible to query the WebMercatorViewport for a meters per pixel scale.
  Note that that distance scales are latitude dependent under
  web mercator projection [see](http://wiki.openstreetmap.org/wiki/Zoom_levels),
  so scaling will depend on the viewport center and any linear scale factor
  should only be expected to be locally correct.


### Web Mercator Projection Mode

A core feature of deck.gl is that all layers automatically by default
accept latitude and longitude coordinates specified in the
[web mercator](https://en.wikipedia.org/wiki/Web_Mercator) projection,
the de facto standard cartographic projection for computer maps,
making it very easy for applications to visualize latitude/longitude
encoded data.

[longitude, latitude, altitude]. Longitude and latitude
are specified in degrees from Greenwich meridian / equator respectively,
and altitude is specified in meters above sea level.

- Unless otherwise noted, angles are specified in degrees, not radians.
- Coordinates are specified in "long-lat" format [lng, lat, z] format which
  most closely corresponds to [x, y, z] coords.

- **zoom**: At zoom 0, the world is 512 pixels wide.
  Every zoom level magnifies by a factor of 2. Maps typically support zoom
  levels 0 (world) to 20 (sub meter pixels).

### Meter Offset Projection Mode

  positions are given in meter offsets [Δx, Δy, Δz] from a [lng/lat/z] reference point. The reference point is specified in a separate prop.

Such coordinates will be correctly projected onto the map if the layer
is set to the right projection mode.

The meters mode is perfect for high resolution data sets
which are typically specified in sets of coordinates in meters offset from
a single lat/lon (“simplified UTM”). Such data can now be supplied directly
to deck.gl layers (i.e. to the GPU) without any JavaScript transformation.

Remarks:
* UTM - Note that the Meters Offset Projection Mode uses arbitrary
  reference points, rather than the predefined reference points
  set by UTM. The meters mode can simplify working with UTM coordinates
  but should not be used directly as such.
* A nice side effect is that the meters projection mode uses small numeric
  deltas in projection and therefore does not lose precision under extreme
  zoom levels even when using faster 32 bit floating point.



## Coordinate System Concepts

To be able to provide seamless support for the Web Mercator projection,
deck.gl works with two concepts:
- **positions** - represent points on the map. In web mercator mode
  position coordinates are specified in degrees longitude followed by degrees
  latitude.
  In linear mode, positions are simply world coordinates, [x, y, z].
- **distances** - distances represent either the distance between two points,
  or just a general sizes, like a radius or similar. Distances are specified in
  meters in mercator mode, and simply in world coordinate deltas in
  linear mode).

As a deck.gl user, you should mainly make sure to scan a layer definition to
make sure you understand where you are expect to pass in [lng, lat] coordinates.

