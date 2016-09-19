# Viewport
Manages coordinate system transformations.

## Viewport Constructor

| Parameter | Type | Default | Description |
| ---- | ---- | ---- | ---- |
| mercator | Boolean | true | Whether to use mercator projection |
| opt.width | Number | 1 | Width of "viewport" or window |
| opt.heigh | Number | 1 | Height of "viewport" or window |
| opt.center | Array | [0, 0]| Center of viewport |
  [longitude, latitude] or [x, y]
| opt.scale=1 | Number | | Either use scale or zoom |
| opt.pitch=0 | Number | | Camera angle in degrees (0 is straight down) |
| opt.bearing=0 | Number | | Map rotation in degrees (0 means north is up) |
| opt.altitude= | Number | | Altitude of camera in screen units |

Web mercator projection short-hand parameters
| Parameter | Type | Default | Description |
| ---- | ---- | ---- | ---- |
| opt.latitude | Number | | Center of viewport on map (alternative to opt.center) |
| opt.longitude | Number | | Center of viewport on map (alternative to opt.center) |
| opt.zoom | Number | | Scale = Math.pow(2,zoom) on map (alternative to opt.scale) |

Notes:
 - Only one of center or [latitude, longitude] can be specified
 - [latitude, longitude] can only be specified when "mercator" is true
 - Altitude has a default value that matches assumptions in mapbox-gl
 - width and height are forced to 1 if supplied as 0, to avoid
   division by zero. This is intended to reduce the burden of apps to
   to check values before instantiating a Viewport.
-  When using mercatorProjection, per cartographic tradition, longitudes and
   latitudes are specified as degrees.

## Viewport.project

Projects latitude and longitude to pixel coordinates in window
using viewport projection parameters
- [longitude, latitude] to [x, y]
- [longitude, latitude, Z] => [x, y, z]
Note: By default, returns top-left coordinates for canvas/SVG type render

- lngLatZ - Array - [lng, lat] or [lng, lat, Z]
- opts.topLeft - Object - true - Whether projected coords are top left
- returns [x, y] or [x, y, z] in top left coords

## Viewport.unproject

Unproject pixel coordinates on screen onto [lon, lat] on map.
- [x, y] => [lng, lat]
- [x, y, z] => [lng, lat, Z]

- xyz - Array
returns
- object with {lat,lon} of point on sphere.
