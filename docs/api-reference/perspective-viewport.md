## PerspectiveViewport

A subclass of `Viewport` that creates a perspective view based on typical
affine perspective projection matrix parameters (`fov`, `aspect`, `near`, `far`).

Remarks:
* This class is just a convenience, the application can use `Viewport` directly
  together with e.g. the `mat4.perspective` and `mat4.lookAt` functions from the
  `gl-matrix` module.


### `PerspectiveViewport.constructor`

`new PerspectiveViewport({lookAt, eye, up, fov, aspect, near, far, width, height})`

| Parameter    | Type        | Default | Description                                   |
| ------------ | ----------- | ------- | --------------------------------------------- |
| `width`      | `Number`    | 1       | Width of "viewport" or window                 |
| `height`     | `Number`    | 1       | Height of "viewport" or window                |
view matrix arguments
* `eye` (Vector3) - Defines eye position
* `lookAt` (Vector3 = [0, 0, 0]) - Which point is camera looking at, default origin
* `up` (Vector3 = [0, 1, 0]) - Defines up direction, default positive y axis
projection matrix arguments
* `fov` (Number = 75) - Field of view covered by camera
* `near` (Number = 1) - Distance of near clipping plane
* `far` (Number = 100) - Distance of far clipping plane
automatically calculated
* `aspect` (Number) - Aspect ratio (set to viewport widht/height)
