# OrthographicViewport Class

The `OrthographicViewport` class is a subclass of the [Viewport](/docs/api-reference/viewport.md) that creates an orthogonal view.

Remarks:
* This class is just a convenience, the application can use `Viewport` directly together with e.g. the `mat4.ortho` and `mat4.lookAt` functions from the `gl-matrix` module.


## Constructor

Parameters:

- `opts` (Object) - Orthogonal view options
  * `width` (Number) - Width of "viewport" or window. Default to `1`.
  * `height` (Number) - Height of "viewport" or window. Default to `1`.

  view matrix arguments:
  * `eye` (Vector3, optional) - Defines eye position, default unit distance along z axis.
    Default to `[0, 0, 1]`.
  * `lookAt` (Vector3, optional) - Which point is camera looking at. Default to origin `[0, 0, 0]`.
  * `up` (Vector3, optional) - Defines up direction. Default to positive y axis `[0, 1, 0]`.

  projection matrix arguments:
  * `near` (Number, optional) - Distance of near clipping plane. Default to `1`.
  * `far` (Number, optional) - Distance of far clipping plane. Default to `100`.
  * `left` (Number) - Left bound of the frustum
  * `top` (Number) - Top bound of the frustum

  automatically calculated by default:
  * `right` (Number, optional) - Right bound of the frustum.
  * `bottom` (Number, optional) - Bottom bound of the frustum.

  when zooming with orthographic viewport, the size (width and height) of the viewport and window are no longer the same. In such case, specify `right` and `bottom` together with `left` and `top` explicitly to define the viewport size.

  refer to `examples/experimental/orthographic-zooming` for example.

```js
const viewport = new OrthographicViewport({
  eye: [0, 0, 100],
  left: 0,
  top: 0,
  width: 500,
  height: 500
});
```

## Methods

Inherits all [Viewport methods](/docs/api-reference/viewport.md#methods).

## Source
[src/core/viewports/orthographic-viewport.js](https://github.com/uber/deck.gl/blob/5.0-release/src/core/viewports/orthographic-viewport.js)
