
# Viewport Class

The `Viewport` manages projection and unprojection of coordinates between world and viewport coordinates.

The viewport class provides both direct `project`/`unproject` function members as well as projection matrices including `view` and `projection` matrices, and can generate their inverses as well to facilitate e.g. lighting calculations in WebGL shaders.


In geospatial setups

## Usage

```js
const viewport = new Viewport({width: 500, height: 500, ...});
```
Note: The `Viewport` class is normally not instantiated directly but rather one of it's subclasses is used.

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

Returns:

  - A screen coordinates array `[x, y]` or `[x, y, z]` if an altitude was given.

Note: By default, returns top-left coordinates for canvas/SVG type render

### unproject

Unproject pixel coordinates on screen onto [lng, lat, altitude] on map.

Parameters:

  - `pixels` (Array) - `[x, y, z]` Passing a `z` is optional.
  - `opts` (Object)
    - `topLeft` (Boolean, optional) - Whether projected coords are top left. Default to `true`.

Returns:

  - A map coordinates array `[lng, lat]` or `[lng, lat, altitude]` if a `z` was given.

Note: By default, takes top-left coordinates from JavaScript mouse events.

## Remarks

* The `Viewport` class and its subclasses are perhaps best thought of as geospatially enabled counterparts of the typical `Camera` classes found in most 3D libraries.
* One addition is that to support pixel project/unproject functions (in addition to the clipspace projection that Camera classes typically manage), the `Viewport` is also aware of the viewport extents.
* Also, it can generate WebGL compatible projection matrices (column-major) - Note that these still need to be converted to typed arrays.
* The `Viewport` is used to generate uniforms for the shader `project` module and tries to provide similar projection functions to JavaScript code so that layers can do projection calculations wherever it is most suitable (i.e. in GLSL or JavaScript) in each specific case.


## Source

[src/viewports/viewport.js](https://github.com/uber/deck.gl/blob/4.1release/src/viewports/viewport.js)
