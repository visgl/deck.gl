# PerspectiveViewport Class (Deprecated)

> `PerspectiveViewport` is deprecated. Use [PerspectiveView](/docs/api-reference/perspective-view.md) instead.

The [`PerspectiveViewport`] class is a subclass of [Viewport](/docs/api-reference/viewport.md) that creates a perspective view.

Remarks:

* This class is just a convenience, the application can use `Viewport` directly
  together with e.g. the `mat4.perspective` and `mat4.lookAt` functions from the
  `gl-matrix` module.


## Constructor

```js
new PerspectiveViewport({
  eye: [0, 0, 100],
  fov: 45,
  width: 500,
  height: 500
});
```

Parameters:

* `opts` (Object) - Perspective viewport options

  + `width` (Number) - Width of "viewport" or window. Default to `1`.
  + `height` (Number) - Height of "viewport" or window. Default to `1`.

  View matrix arguments:

  + `eye` (Vector3, optional) - Defines eye position, default unit distance along z axis. Default to `[0, 0, 1]`.
  + `lookAt` (Vector3, optional) - Which point is camera looking at. Default to origin `[0, 0, 0]`.
  + `up` (Vector3, optional) - Defines up direction. Default to positive y axis `[0, 1, 0]`.

  Projection matrix arguments:

  + `fov` (Number, optional) - Field of view covered by camera. Default to `75`.
  + `near` (Number, optional) - Distance of near clipping plane. Default to `1`.
  + `far` (Number, optional) - Distance of far clipping plane. Default to `100`.

  Automatically calculated:

  + `fov` (Number, optional) - Field of view covered by camera. Default to `75`.
  + `aspect` (Number, optional) - Aspect ratio. Default to the viewport's `widht/height`.

## Methods

Inherits all [Viewport methods](/docs/api-reference/viewport.md#methods).

## Source

[modules/core/src/viewports/perspective-viewport.js](https://github.com/uber/deck.gl/blob/5.3-release/modules/core/src/viewports/perspective-viewport.js)
