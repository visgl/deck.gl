# PerspectiveView Class

Note: The `PerspectiveView` class is deprecated. Use `FirstPersonView` instead and specify the `fov` parameter to generate perspective projection matrix.

The [`PerspectiveView`] class is a subclass of [View](/docs/api-reference/view.md) that creates a perspective view.

Remarks:
* This class is just a convenience, the application can use `View` directly
  together with e.g. the `mat4.perspective` and `mat4.lookAt` functions from the
  `gl-matrix` module.

## Constructor

Parameters:

- `opts` (Object) - Perspective view options
  Projection matrix arguments:
  * `fov` (Number, optional) - Field of view covered by camera. Default to `75`.
  * `near` (Number, optional) - Distance of near clipping plane. Default to `1`.
  * `far` (Number, optional) - Distance of far clipping plane. Default to `100`.

  Automatically calculated:
  * `fov` (Number, optional) - Field of view covered by camera. Default to `75`.
  * `aspect` (Number, optional) - Aspect ratio. Default to the view's `widht/height`.

```js
const view = new PerspectiveView({
  fov: 45,
  width: 500,
  height: 500
});
```

## Methods

Inherits all [View methods](/docs/api-reference/view.md#methods).

## Source
[src/core/views/perspective-view.js](https://github.com/uber/deck.gl/blob/5.1-release/src/core/views/perspective-view.js)
