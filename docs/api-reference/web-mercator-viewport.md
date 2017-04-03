
# WebMercatorViewport Class

The `WebMercatorViewport` class is a subclass of [Viewport](/docs/api-reference/viewport.md) that enables 3D rendering to
seamlessly overlay on top of map components that take web mercator style
map coordinates (`latitude`, `lon`, `zoom`, `pitch`, `bearing` etc),
and to facilite the necessary mercator projections by breaking them into a
minimal non-linear piece followed by a standard projection chain.

Remarks:
* Because `WebMercatorViewport` a subclass of `Viewport`, an application
  can implement support for generic 3D `Viewport`s and automatically get
  the ability to accept web mercator style map coordinates.
* A limitation at the moment is that there is no way to extract
  web mercator parameters from a "generic" viewport, so for map synchronization
  applications (rendering on top of a typical map component that only accepts
  web mercator parameters) the `WebMercatorViewport` is necessary.

## Constructor

Parameters:

- `opts` (Object) - Orthogonal view options
  * `width` (Number) - Width of "viewport" or window. Default to `1`.
  * `height` (Number) - Height of "viewport" or window. Default to `1`.

  web mercator style arguments:
  * `latitude` (Number, optional) - Center of viewport on map (alternative to center). Default to `37`.
  * `longitude` (Number, optional) - Center of viewport on map (alternative to center). Default to `-122`.
  * `zoom` (Number, optional) - `center`. Default to `11`.
  * `pitch` (Number, optional) - Camera angle in degrees (0 is straight down). Default to `0`.
  * `bearing` (Number, optional) - Map rotation in degrees (0 means north is up). Default to `0`.
  * `altitude` (Number, optional) - Altitude of camera in screen units. Default to `1.5`.

  projection matrix arguments:
  * farZMultiplier (Number, optional) - Default to `10`.

Remarks:
 - Altitude has a default value that matches assumptions in mapbox-gl
 - `width` and `height` are forced to 1 if supplied as 0, to avoid
   division by zero. This is intended to reduce the burden of apps to
   to check values before instantiating a `Viewport`.
 -  When using mercatorProjection, per cartographic tradition, longitudes and
   latitudes are specified as degrees.

## Methods

Inherits all [Viewport methods](/docs/api-reference/viewport.md#methods).

##### `projectFlat`

Project `[longitude, latitude]` on sphere onto "screen pixel" coordinates `[x, y]` without
considering any perspective (effectively ignoring pitch, bearing and altitude).

Parameters:

 - `coordinates` (Array) - `[longitude, latitude]` coordinates.
 - `scale` (Number) - Map zoom scale calculated from `Math.pow(2, zoom)`.

Returns:

 - Screen coordinates in `[x, y]`.

##### `unprojectFlat`

Unprojects a screen coordinate `[x, y]` to `[longitude, latitude]` on sphere without
considering any perspective (effectively ignoring pitch, bearing and altitude).

Parameters:
 - `pixels` (Array) - `[x, y]`
 - `scale` (Number) - Map zoom scale calculated from `Math.pow(2, zoom)`.

Returns:

 - Map or world coordinates in `[longitude, latitude]`.

##### `getDistanceScales`

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

##### `metersToLngLatDelta`

Converts a meter offset to a lnglat offset using linear approximation.
For information on numerical precision, see remarks on `getDistanceScales`.

Parameters:

- `xyz` (Array) - Array of `[x, y, z]` in meter deltas. Passing a `z` is optional.

Returns:

- Array of deltas in `[longitude, latitude]` or `[longitude, latitude, altitude]`
if `z` is provided.

##### `lngLatDeltaToMeters`

Converts a lnglat offset to a meter offset using linear approximation.
For information on numerical precision, see remarks on
[`getDistanceScales`](/docs/api-reference/web-mercator-viewport.md#-getdistancescales-).

Parameters:
- `deltaLngLatZ` - Array of `[longitude, latitude, altitude]` deltas.
Passing a `altitude` is optional.

Returns:
- Array of meter deltas in `[x, y]` or `[x, y, z]` if `altitude` is provided.

##### `addMetersToLngLat`

Add a meter delta to a base lnglat coordinate using linear approximation.
For information on numerical precision, see remarks on
[`getDistanceScales`](/docs/api-reference/web-mercator-viewport.md#-getdistancescales-).

Parameters:
- `lngLatZ` (Array) - Base coordinate in `[longitude, latitude, altitude]`.
Passing a `altitude` is optional.
- `xyz` (Array) - Array of `[x, y, z]` in meter deltas. Passing a `z` is optional.

Returns:
- New coordinate array in `[longitude, latitude]` or `[longitude, latitude, altitude]`
if `z` is provided.

## Source
[src/lib/viewports/web-mercator-viewport.js](https://github.com/uber/deck.gl/blob/4.0-release/src/lib/viewports/web-mercator-viewport.js)
