# API Documentation

## Viewport

Manages projection and unprojection of coordinates between world and viewport
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


### `Viewport.constructor`

`new Viewport({viewMatrix, projectionMatrix, width, height})`

| Parameter    | Type        | Default | Description                                   |
| ------------ | ----------- | ------- | --------------------------------------------- |
| `width`      | `Number`    | 1       | Width of "viewport" or window                 |
| `height`     | `Number`    | 1       | Height of "viewport" or window                |
| `viewMatrix` | `Array[16]` | [0, 0]  | Center of viewport [x, y]                     |
| `projectionMatrix` | `Array[16]` | 1 | Either use scale or zoom                      |


### `Viewport.getMatrices`

Returns an object with various matrices

`Viewport.getMatrices({modelMatrix = })`

| Parameter     | Type        | Default  | Description                                   |
| ------------- | ----------- | -------- | --------------------------------------------- |
| `modelMatrix` | `Number`    | IDENTITY | Width of "viewport" or window                 |

* `modelMatrix` (Matrix4) - transforms model to world space
* `viewMatrix` (Matrix4) - transforms world to camera space
* `projectionMatrix` (Matrix4) - transforms camera to clip space
* `viewProjectionMatrix` (Matrix4)  - transforms world to clip space
* `modelViewProjectionMatrix` (Matrix4) - transforms model to clip space

* `pixelProjectionMatrix` (Matrix4)  - transforms world to pixel space
* `pixelUnprojectionMatrix` (Matrix4) - transforms pixel to world space
* `width` (Number) - Width of viewport
* `height` (Height) - Height of viewport


#### `Viewport.project`

Projects latitude, longitude (and altitude) to pixel coordinates in window using
viewport projection parameters.

Parameters:

  - `coordinates` {Array} - `[lng, lat, altitude]` Passing an altitude is optional.
  - `opts` {Object}
    - `topLeft` {Boolean} - Whether projected coords are top left.

Returns:

  - Either `[x, y]` or `[x, y, z]` if an altitude was given.

Note: By default, returns top-left coordinates for canvas/SVG type render


#### `Viewport.unproject`

Unproject pixel coordinates on screen onto [lng, lat, altitude] on map.

Parameters:

  - `pixels` {Array} - `[x, y, z]` Passing a `z` is optional.

Returns:

  - Either `[lng, lat]` or `[lng, lat, altitude]` if a `z` was given.
