
# Viewport Class

The `Viewport` manages projection and unprojection of coordinates between world and viewport
coordinates.

It provides both direct project/unproject function members as well as
projection matrices including `view` and `projection matrices`, and
can generate their inverses as well to facilitate e.g. lighting calculations
in WebGL shaders.

Remarks:
* The `Viewport` class perhaps best thought of as the counterpart of the
  typical `Camera` class found in most 3D libraries.
* The main addition is that to support pixel project/unproject functions
  (in addition to the clipspace projection that Camera classes typically manage),
  the `Viewport` is also aware of the viewport extents.
* Also, it can generate WebGL compatible projection matrices (column-major) - Note
  that these still need to be converted to typed arrays.


## Constructor

Parameters:

- `props` (Object) - Viewport properties
  * `props.width` (Number) - Width of "viewport" or window. Default to `1`.
  * `props.height` (Number) - Height of "viewport" or window. Default to `1`.
  * `props.viewMatrix` (Array[16], optional) - View matrix. Default to identidy matrix.
  * `props.projectionMatrix` (Array[16], optional) - Projection matrix. Default to identidy matrix.

```js
const viewport = new Viewport({width: 500, height: 500});
```

## Methods

##### `equals`

Parameters:

- `viewport` (Viewport) - The viewport to compare with.

Returns:

- `true` if the given viewport is identical to the current one.

##### `project`

Projects latitude, longitude (and altitude) to pixel coordinates in window using
viewport projection parameters.

Parameters:

  - `coordinates` (Array) - `[lng, lat, altitude]` Passing an altitude is optional.
  - `opts` (Object)
    - `topLeft` (Boolean, optional) - Whether projected coords are top left. Default to `true`.

Returns:

  - A screen coordinates array `[x, y]` or `[x, y, z]` if an altitude was given.

Note: By default, returns top-left coordinates for canvas/SVG type render

##### `unproject`

Unproject pixel coordinates on screen onto [lng, lat, altitude] on map.

Parameters:

  - `pixels` (Array) - `[x, y, z]` Passing a `z` is optional.
  - `opts` (Object)
    - `topLeft` (Boolean, optional) - Whether projected coords are top left. Default to `true`.

Returns:

  - A map coordinates array `[lng, lat]` or `[lng, lat, altitude]` if a `z` was given.

Note: By default, takes top-left coordinates from JavaScript mouse events.

## Source
[src/lib/viewports/viewport.js](https://github.com/uber/deck.gl/blob/4.0-release/src/lib/viewports/viewport.js)
