# FirstPersonView Class (Experimental)

The [`FirstPersonView`] class is a subclass of [View](/docs/api-reference/viewport.md) that creates a "camera" at the exact position, direction and orientation specified by the application. This is in contrast with e.g. [ThirdPersonView](/docs/api-reference/viewport.md) where the camera will be offset from and look "down" on the specified position.

For more information consult the [Views](/docs/advanced/views.md) article.

## Usage

```js
const viewport = new FirstPersonView({
  // Projection parameters (perspective projection)
  fov: 45,
});
```

## Methods

Inherits all [View methods](/docs/api-reference/viewport.md#methods).

### Constructor

Parameters:
  projection matrix arguments:
  * `fov` (Number, optional) - Field of view covered by camera. Default to `75`.
  * `near` (Number, optional) - Distance of near clipping plane. Default to `1`.
  * `far` (Number, optional) - Distance of far clipping plane. Default to `100`.
  * `aspect` (Number, optional) - Aspect ratio. Default to the viewport's `width/height`.

See [View constructor](/docs/api-reference/viewport.md#constructor) for additional parameters, especially for specifying alternate projection matrices, geospatial anchor etc.

## Remarks

* Like all `View`s, the `FirstPersonView` will work with all geospatial coordinate systems if a geospatial "anchor point" is supplied through the `longitude`, `latitude` and `zoom` options. The `position` vector will then be interpreted as meter offsets from this anchor point.

## Source

[src/core/views/perspective-view.js](https://github.com/uber/deck.gl/blob/5.1-release/src/core/views/perspective-view.js)
