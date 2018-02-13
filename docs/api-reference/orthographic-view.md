# OrthographicView Class

The `OrthographicView` class is a subclass of the [Viewport](/docs/api-reference/view.md) that creates an orthogonal view.

Remarks:
* This class is just a convenience, the application can use `Viewport` directly together with e.g. the `mat4.ortho` and `mat4.lookAt` functions from the `gl-matrix` module.


## Constructor

Parameters:

- `opts` (Object) - Orthogonal view options
  projection matrix arguments:
  * `near` (Number, optional) - Distance of near clipping plane. Default to `1`.
  * `far` (Number, optional) - Distance of far clipping plane. Default to `100`.
  * `left` (Number) - Left bound of the frustum
  * `top` (Number) - Top bound of the frustum

  automatically calculated by default:
  * `right` (Number, optional) - Right bound of the frustum.
  * `bottom` (Number, optional) - Bottom bound of the frustum.

  when zooming with orthographic view, the size (width and height) of the view and window are no longer the same. In such case, specify `right` and `bottom` together with `left` and `top` explicitly to define the view size.

  refer to `examples/experimental/orthographic-zooming` for example.

```js
const view = new OrthographicView({
  left: 0,
  top: 0,
  width: 500,
  height: 500
});
```

## Methods

Inherits all [Viewport methods](/docs/api-reference/view.md#methods).

## Source
[src/core/views/orthographic-view.js](https://github.com/uber/deck.gl/blob/5.1-release/src/core/views/orthographic-view.js)
