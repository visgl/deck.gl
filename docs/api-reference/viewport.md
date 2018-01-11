# Viewport Class

The `Viewport` combines a number of responsibilities:
* A deck.gl `Viewport` is essentially a geospatially enabled camera.
* In this sense it manages projection and unprojection of coordinates between world and viewport coordinates, both in JavaScript and in GLSL.
* `Viewport`s also contains information about the size and position of the target rectangle on screen where the camera will render.

The viewport class provides both direct `project`/`unproject` function members as well as projection matrices including `view` and `projection` matrices, and can generate their inverses as well to facilitate e.g. lighting calculations in WebGL shaders.

In geospatial setups, Viewports can contain geospatial anchors.

Note: The `Viewport` class is normally not instantiated directly but rather one of its subclasses is used. However, in cases where the application needs to use "externally" generated view or projection matrices (such as WebVR), the `Viewport` class can be used directly.

For more information consult the [Viewports](/docs/advanced/viewports.md) article.

## Usage

```js
const viewport = new Viewport({width: 500, height: 500, ...});
```

## Constructor

Parameters:

- `props` (Object) - Viewport properties
  * `props.width` (Number) - Width of "viewport" or window. Default to `1`.
  * `props.height` (Number) - Height of "viewport" or window. Default to `1`.
  * `props.viewMatrix` (Array[16], optional) - View matrix. Default to identity matrix.

Projection Matrix Options
  - Option 1: Specify arguments for a a perspective projection matrix
      * `fov` (Number, optional) - Field of view covered by camera. Default to `75`.
      * `aspect` (Number, optional) - Aspect ratio. Defaults to the viewport's `width/height`.
      * `near` (Number, optional) - Distance of near clipping plane. Default to `1`.
      * `far` (Number, optional) - Distance of far clipping plane. Default to `100`.
  - Option 2: Supply a **custom** `projectionMatrix`
      * `props.projectionMatrix` (Array[16], optional) - Projection matrix. Defaults to identity matrix. Can be used to

Geospatial Anchor Options (Optional)
  * `latitude` (Number, optional) - Center of viewport on map (alternative to center). Default to `37`.
  * `longitude` (Number, optional) - Center of viewport on map (alternative to center). Default to `-122`.
  * `zoom` (Number, optional) - `center`. Default to `11`.

## Methods

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

[src/core/viewports/viewport.js](https://github.com/uber/deck.gl/blob/5.0-release/src/core/viewports/viewport.js)
