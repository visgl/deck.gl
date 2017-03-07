
## WebMercatorViewport

The main purpose of the `WebMercatorViewport` is to enable 3D rendering to
seamlessly overlay on top of map components that take web mercator style
map coordinates (`lat`, `lon`, `zoom`, `pitch`, `bearing` etc),
and to facilite the necessary mercator projections by breaking them into a
minimal non-linear piece followed by a standard projection chain.

Remarks:
* Because `WebMercatorViewport` a subclass of `Viewport`, an application
  can implement support for generic 3D `Viewport`s and automatically get
  the ability to accept web mercator style map coordinates
  (`lat`, `lon`, `zoom`, `pitch`, `bearing` etc).
* A limitation at the moment is that there is no way to extract
  web mercator parameters from a "generic" viewport, so for map synchronization
  applications (rendering on top of a typical map component that only accepts
  web mercator parameters) the `WebMercatorViewport` is necessary.

### Constructor

| Parameter    |   Type  | Default | Description                                        |
| ------------ | ------- | ------- | -------------------------------------------------- |


| Parameter     |  Type    | Default | Description                                                |
| ------------- | -------- | ------- | ---------------------------------------------------------- |
| `latitude`    | `Number` | 37      | Center of viewport on map (alternative to center)          |
| `longitude`   | `Number` | -122    | Center of viewport on map (alternative to center)          |
| `zoom`        | `Number` | 11      | Scale = Math.pow(2,zoom) on map (alternative to opt.scale) |
| `width`       | `Number` | 1       | Width of "viewport" or window                              |
| `height`      | `Number` | 1       | Height of "viewport" or window                             |
| `center`      | `Array`  | [0, 0]  | Center of viewport [longitude, latitude] or [x, y]         |
| `scale`       | `Number` | 1       | Either use scale or zoom                                   |
| `pitch`       | `Number` | 0       | Camera angle in degrees (0 is straight down)               |
| `bearing`     | `Number` | 0       | Map rotation in degrees (0 means north is up)              |
| `altitude`    | `Number` | 1.5     | Altitude of camera in screen units                         |


Remarks:
 - Only one of center or [latitude, longitude] can be specified
 - [latitude, longitude] can only be specified when "mercator" is true
 - Only one of `center` or `[latitude, longitude]` can be specified.
 - `[latitude, longitude]` can only be specified when `mercator` is true
 - Altitude has a default value that matches assumptions in mapbox-gl
 - `width` and `height` are forced to 1 if supplied as 0, to avoid
   division by zero. This is intended to reduce the burden of apps to
   to check values before instantiating a `Viewport`.
 -  When using mercatorProjection, per cartographic tradition, longitudes and
   latitudes are specified as degrees.


### `WebMercatorViewport.project`

Projects latitude and longitude to pixel coordinates in window
using viewport projection parameters

| Parameter      | Type      | Default  | Description                     |
| -------------- | --------- | -------- | ------------------------------- |
| `lnglatz`      | `Array`   | required | `[lng, lat]` or `[lng, lat, Z]` |
| `opts`         | `Object`  | `{}`     | named options                   |
| `opts.topLeft` | `Boolean` | `true`   | If true projected coords are top left |

Returns: `[x, y]` or `[x, y, z]` - (depending on length of input array)
  in the requested coordinate system (top left or bottom left)
- `[longitude, latitude]` to `[x, y]`
- `[longitude, latitude, Z]` => `[x, y, z]`

Remarks:
* By default, returns top-left coordinates suitable for canvas/SVG type
  rendering.


### `WebMercatorViewport.unproject`

Unproject pixel coordinates on screen onto [lon, lat] on map.

| Parameter      | Type      | Default  | Description                     |
| -------------- | --------- | -------- | ------------------------------- |
| `xyz`          | `Array`   | required | pixel coordinates in viewport   |

Returns: Unprojected coordinates in array from, depending on input:
- `[x, y]` => `[lng, lat]`
- `[x, y, z]` => `[lng, lat, Z]`


#### `WebMercatorViewport.projectFlat([lng, lat], scale = this.scale)`

Project `[lng, lat]` on sphere onto "screen pixel" coordinates `[x, y]` without
considering any perspective (effectively ignoring pitch, bearing and altitude).

Parameters:

 - `coordinates` {Array} - `[lng, lat]` or `[xmap, ymap]` coordinates.

Returns:

 - `[x, y]`, representing map or world coordinates.

#### `PerspectiveViewport.unprojectFlat`

Unprojects a screen point `[x, y]` on the map or world `[lng, lat]` on sphere.
* `lnglat` - Array `[lng, lat]` or `[xmap, ymap]` coordinates
  Specifies a point on the map (or world) to project onto the screen.
* `returns` - [x,y] - An Array of Numbers representing map or world coordinates.

Parameters:
 - `pixels` {Array} - `[x, y]`


#### `WebMercatorViewport.unprojectFlat([x, y], scale = this.scale)`


Parameters:
 - `[lng, lat]` array xy - object with {x,y} members representing a "point on projected map
plane
Returns:
* [lat, lon] or [x, y] of point on sphere.


#### `getDistanceScales()`

Returns:
- An object with precalculated distance scales allowing conversion between
  lnglat deltas, meters and pixels.

Remarks:
* The returned scales represent simple linear approximations of the local
  Web Mercator projection scale around the viewport center. Error increases
  with distance from viewport center (Very roughly 1% per 100km).
* When converting numbers to 32 bit floats (e.g. for use in WebGL shaders)
  distance offsets can sometimes be used to gain additional computational
  precision, which can greatly outweigh the small linear approximation error
  mentioned above.


#### `metersToLngLatDelta(xyz)`

Converts a meter offset to a lnglat offset using linear approximation.
For information on numerical precision, see remarks on `getDistanceScales`.

* `xyz` ([Number,Number]|[Number,Number,Number])  - array of meter deltas
returns ([Number,Number]|[Number,Number,Number]) - array of [lng,lat,z] deltas


#### `lngLatDeltaToMeters(deltaLngLatZ)`

Converts a lnglat offset to a meter offset using linear approximation.
For information on numerical precision, see remarks on `getDistanceScales`.

* `deltaLngLatZ` ([Number,Number]|[Number,Number,Number])  - array of [lng,lat,z] deltas
Returns ([Number,Number]|[Number,Number,Number]) - array of meter deltas


#### `addMetersToLngLat(lngLatZ, xyz)`

Add a meter delta to a base lnglat coordinate, returning a new lnglat array,
using linear approximation.
For information on numerical precision, see remarks on `getDistanceScales`.

* `lngLatZ` ([Number,Number]|[Number,Number,Number]) - base coordinate
* `xyz` ([Number,Number]|[Number,Number,Number])  - array of meter deltas
Returns ([Number,Number]|[Number,Number,Number]) array of [lng,lat,z] deltas
