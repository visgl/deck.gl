# ThirdPersonView Class (Experimental)

The [`ThirdPersonView`] class is a subclass of [View](/docs/api-reference/view.md). This view creates a "camera" that looks at an exact position, position using the direction, distance and orientation specified by the application.

This is in contrast with e.g. [FirstPersonView](/docs/api-reference/view.md) where the camera will be position exactly at the specified position.

For more information consult the [Views](/docs/advanced/views.md) article.

## Usage

```js
const view = new ThirdPersonView({
  cameraDistance: 2, // Camera distance from object
  cameraDirection: 2, // Camera distance from object

  // Projection parameters (perspective projection)
  fov: 45
});
```

## Methods

Inherits all [View methods](/docs/api-reference/view.md#methods).

### Constructor

Parameters:
  projection matrix arguments:
  * `fov` (Number, optional) - Field of view covered by camera. Default to `75`.
  * `near` (Number, optional) - Distance of near clipping plane. Default to `1`.
  * `far` (Number, optional) - Distance of far clipping plane. Default to `100`.
  * `aspect` (Number, optional) - Aspect ratio. Default to the view's `width/height`.

See [View constructor](/docs/api-reference/view.md#constructor) for additional parameters, especially for specifying alternate projection matrices, geospatial anchor etc.

## Remarks

* Like all `View`s, the `ThirdPersonView` will work with all geospatial coordinate systems if a geospatial "anchor point" is supplied through the `longitude`, `latitude` and `zoom` options. The `position` vector will then be interpreted as meter offsets from this anchor point.

## Source

[src/core/views/perspective-view.js](https://github.com/uber/deck.gl/blob/5.1-release/src/core/views/perspective-view.js)
