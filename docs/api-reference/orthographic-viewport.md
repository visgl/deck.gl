## OrthographicViewport

A subclass of `Viewport` that creates an orthogonal matrix

`new OrthographicViewport({lookAt, eye, up, left, right, bottom, top, width, height})`

| Parameter    | Type        | Default | Description                                   |
| ------------ | ----------- | ------- | --------------------------------------------- |
| `width`      | `Number`    | 1       | Width of "viewport" or window                 |
| `height`     | `Number`    | 1       | Height of "viewport" or window                |
view matrix arguments
* `eye` (Vector3 = [0, 0, 1]) - Defines eye position, default [0, 0, 1]
* `lookAt` (Vector3 = [0, 0, 0]) - Which point is camera looking at, default origin
* `up` (Vector3 = [0, 1, 0]) - Defines up direction, default positive y axis
projection matrix arguments
* `near` (Number = 1) - Distance of near clipping plane
* `far` (Number = 100) - Distance of far clipping plane
* `left` (Number) - Left bound of the frustum
* `top` (Number) - Top bound of the frustum
automatically calculated
* `right` (Number) - Right bound of the frustum
* `bottom` (Number) - Bottom bound of the frustum

Remarks:
* This class is just a convenience, the application can use `Viewport` directly
  together with e.g. the `mat4.ortho` and `mat4.lookAt` functions from the
  `gl-matrix` module.
