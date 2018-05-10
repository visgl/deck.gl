# Viewport Class

A deck.gl `Viewport` is essentially a geospatially enabled camera, and combines a number of responsibilities, which can project and unproject 3D coordinates to the screen.

For more information:

* See the deck.gl [Viewports](/docs/developer-guide/viewports.md) article.
* See the math.gl article on [View and Projection Matrices](https://uber-web.github.io/math.gl/#/documentation/articles/view-and-projection-matrices)


## Usage

The `Viewport` class is normally not instantiated directly. The [`View`](/docs/api-reference/view.md) class is more commonly used by applications. Instead, internally deck.gl automatically creates `Viewport`s from `View`s when needed.

However, in cases where the application wants to use "externally" generated view or projection matrices (e.g. when using the WebVR API), the `Viewport` class can be useful.


## Constructor

```js
new Viewport({width: 500, height: 500, viewMatrix, projectionMatrix, ...});
```

General Parameters

* `x`=`0` (`Number`) - x position of viewport top-left corner
* `y`=`0` (`Number`) - y position of viewport top-left corner
* `width`=`1` (`Number`) - Width of viewport
* `height`=`1` (`Number`) - Height of viewport
* `focalDistance`=`1` - Distance at which pixel sized geometry is one pixel

View Matrix Parameters

* `viewMatrix`= (`Array[16]`, optional) - View matrix. Defaults to the identity matrix.

Position and Geospatial Anchor Options (Optional)

* `latitude` (`Number`, optional) - Center of viewport on map (alternative to center).
* `longitude` (`Number`, optional) - Center of viewport on map (alternative to center).
* `zoom` (`Number`, optional) - [zoom level](https://wiki.openstreetmap.org/wiki/Zoom_levels) .
* `focalDistance` (`Number`, optional) - modifier of viewport scale if `zoom` is not supplied. Corresponds to the number of pixels per meter. Default to `1`.

* `position` - Position of viewport camera
* `modelMatrix` - Optional model matrix applied to position

Projection Matrix Parameters.

* `projectionMatrix`= (`Array[16]`, optional) - Projection matrix.

If `projectionMatrix` is not supplied, an attempt is made to build from the remaining parameters. Otherwise the remaining parameters will be ignored.

* `fovyDegrees`=`75` (`Number`) - Field of view covered by camera, in the perspective case.
* `aspect`= (`Number`) - Aspect ratio. Defaults to the Viewport's `width/height` ratio.
* `near`=`0.1` (`Number`) - Distance of near clipping plane.
* `far`=`1000` (`Number`) - Distance of far clipping plane.
* `orthographic`=`false` (`Boolean`) - whether to create an orthographic or perspective projection matrix. Default is perspective projection.
* `focalDistance`=`1` (`Number`) - (orthographic projections only) The distance at which the field-of-view frustum is sampled to extract the extents of the view box. Note: lso used for pixel scale identity distance above.
* `orthographicFocalDistance` (`Number`) - (orthographic projections only) Can be used to specify different values for pixel scale focal distance and orthographic focal distance.


## Methods

##### `equals`

Parameters:

* `viewport` (Viewport) - The viewport to compare with.

Returns:

* `true` if the given viewport is identical to the current one.


##### `project`

Projects latitude, longitude (and altitude) to pixel coordinates in window using
viewport projection parameters.

Parameters:

* `coordinates` (Array) - `[lng, lat, altitude]` Passing an altitude is optional.
* `opts` (Object)
  + `topLeft` (Boolean, optional) - Whether projected coords are top left. Default to `true`.

Returns:

* `[x, y]` or `[x, y, z]` in pixels coordinates. `z` is pixel depth.
  + If input is `[lng, lat]`: returns `[x, y]`.
  + If input is `[lng, lat, Z]`: returns `[x, y, z]`.

Note:

* By default, returns top-left coordinates for canvas/SVG type render


##### `unproject`

Unproject pixel coordinates on screen onto [lng, lat, altitude] on map.

Parameters:

* `pixels` (Array) - `[x, y, z]` Passing a `z` is optional.
* `opts` (Object)
  + `topLeft` (Boolean, optional) - Whether projected coords are top left. Default to `true`.
  + `targetZ` (Number, optional) - If pixel depth `z` is not specified in `pixels`, this is used as the elevation plane to unproject onto. Default `0`.

Returns:

* `[lng, lat]` or `[longitude, lat, Z]` in map coordinates. `Z` is elevation in meters.
  + If input is `[x, y]` without specifying `opts.targetZ`: returns `[lng, lat]`.
  + If input is `[x, y]` with `opts.targetZ`: returns `[lng, lat, targetZ]`.
  + If input is `[x, y, z]`: returns `[lng, lat, Z]`.

Note:

* By default, takes top-left coordinates from JavaScript mouse events.

## Remarks

* The `Viewport` class and its subclasses are perhaps best thought of as geospatially enabled counterparts of the typical `Camera` classes found in most 3D libraries.
* The `Viewport` class works together with the `project` shader module and generates the uniforms that module needs to project correctly in GLSL code.
* Accordingly, a main function of viewports is to generate WebGL compatible view and projection matrices (column-major format).
* Functions (including projection and unprojection of coordinates) are available both in JavaScript and in GLSL, so that layers can do consistent projection calculations in both GLSL and JavaScript.
* To support pixel project/unproject functions (in addition to the clipspace projection that Camera classes typically manage), the `Viewport` is also aware of the viewport extents.
* In geospatial setups, Viewports can contain geospatial anchors.

## Source

[modules/core/src/core/viewports/viewport.js](https://github.com/uber/deck.gl/blob/5.2-release/modules/core/src/core/viewports/viewport.js)
