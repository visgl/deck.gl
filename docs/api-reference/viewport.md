# Viewport Class

> The `Viewport` class is normally not instantiated directly. Firstly, the `View` class is more commonly used by apps, and even when a `Viewport` is needed, one of its subclasses is typically used. However, in cases where the application wants to use "externally" generated view or projection matrices (e.g. when using the WebVR API), the `Viewport` class can be useful.

A deck.gl `Viewport` is essentially a geospatially enabled camera, and combines a number of responsibilities:
* It enables projection and unprojection of coordinates (between world and viewport), both in JavaScript and in GLSL.
* It also contains the size and position of the target rectangle on screen where the camera will render.
* The viewport class provides both direct `project`/`unproject` function members as well as projection matrices including `view` and `projection` matrices, and can generate their inverses as well to facilitate e.g. lighting calculations in WebGL shaders.
* In geospatial setups, Viewports can contain geospatial anchors.

For more information:
* See the deck.gl [Viewports](/docs/advanced/viewports.md) article.
* See the math.gl article on [View and Projection Matrices](https://uber-web.github.io/math.gl/#/documentation/articles/view-and-projection-matrices)


## Usage

```js
const viewport = new Viewport({width: 500, height: 500, ...});
```

## Methods

### Constructor

`new Viewport({width: 500, height: 500, viewMatrix, projectionMatrix, ...});`

View Parameters
* `x`=`0`
* `y`=`0`
* `width`=`1` (`Number`) - Width of "viewport" or window.
* `height`=`1` (`Number`) - Height of "viewport" or window.
* `viewMatrix`= (`Array[16]`, optional) - View matrix. Defaults to identity matrix.
* `projectionMatrix` (`Array[16]`, optional) - Projection matrix.

Position parameters
* `position`
* `modelMatrix`

Geospatial Anchor Options (Optional)
* `latitude`=`37` (`Number`, optional) - Center of viewport on map (alternative to center).
* `longitude`=`-122` (`Number`, optional) - Center of viewport on map (alternative to center).
* `zoom`=`11` (`Number`, optional)  - [zoom level](https://wiki.openstreetmap.org/wiki/Zoom_levels) .
* `focalDistance` (Number, optional) - modifier of viewport scale if `zoom` is not supplied. Corresponds to the number of pixels per meter. Default to `1`.

Projection Matrix Parameters (Optional).
* `orthographic`=`false` - whether to create an orthographic or perspective projection matrix.
* `fov`=`75` (`Number`) - Field of view covered by camera, in the perspective case.
* `focalDistance`=`1` - (orthographic projections only). The distance at which the field-of-view frustum is sampled to extract the extents of the view box.
* `aspect`=`1` (`Number`) - Aspect ratio. Defaults to the viewport's `width/height`.
* `near`=`0.1` (`Number`) - Distance of near clipping plane.
* `far`=`500` (`Number`) - Distance of far clipping plane..
- Option 3: Specify parameters for an orthographic projection matrix. Same parameters


Remarks:
* If the `projectionMatrix` parameter is not supplied, `Viewport` will try to create a projection matrix from the project matrix parameters.


### equals

Parameters:

- `viewport` (Viewport) - The viewport to compare with.

Returns:

- `true` if the given viewport is identical to the current one.


### project

Projects latitude, longitude (and altitude) to pixel coordinates in window using
viewport projection parameters.

Parameters:

  - `coordinates` (Array) - `[lng, lat, altitude]` Passing an altitude is optional.
  - `opts` (Object)
    - `topLeft` (Boolean, optional) - Whether projected coords are top left. Default to `true`.

Returns: `[x, y]` or `[x, y, z]` in pixels coordinates. `z` is pixel depth.
- If input is `[lng, lat]`: returns `[x, y]`.
- If input is `[lng, lat, Z]`: returns `[x, y, z]`.

Note: By default, returns top-left coordinates for canvas/SVG type render


### unproject

Unproject pixel coordinates on screen onto [lng, lat, altitude] on map.

Parameters:

  - `pixels` (Array) - `[x, y, z]` Passing a `z` is optional.
  - `opts` (Object)
    - `topLeft` (Boolean, optional) - Whether projected coords are top left. Default to `true`.
    - `targetZ` (Number, optional) - If pixel depth `z` is not specified in `pixels`, this is used as the elevation plane to unproject onto. Default `0`.

Returns: `[lng, lat]` or `[longitude, lat, Z]` in map coordinates. `Z` is elevation in meters.
- If input is `[x, y]` without specifying `opts.targetZ`: returns `[lng, lat]`.
- If input is `[x, y]` with `opts.targetZ`: returns `[lng, lat, targetZ]`.
- If input is `[x, y, z]`: returns `[lng, lat, Z]`.

Note: By default, takes top-left coordinates from JavaScript mouse events.


## Remarks

* The `Viewport` class and its subclasses are perhaps best thought of as geospatially enabled counterparts of the typical `Camera` classes found in most 3D libraries.
* One addition is that to support pixel project/unproject functions (in addition to the clipspace projection that Camera classes typically manage), the `Viewport` is also aware of the viewport extents.
* Also, it can generate WebGL compatible projection matrices (column-major) - Note that these still need to be converted to typed arrays.
* The `Viewport` is used to generate uniforms for the shader `project` module and tries to provide similar projection functions to JavaScript code so that layers can do projection calculations wherever it is most suitable (i.e. in GLSL or JavaScript) in each specific case.


## Source

[src/core/viewports/viewport.js](https://github.com/uber/deck.gl/blob/5.1-release/src/core/viewports/viewport.js)
