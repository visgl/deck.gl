# ThirdPersonViewport Class

The [`ThirdPersonViewport`] class is a subclass of [Viewport](/docs/api-reference/viewport.md). This viewport creates a "camera" that looks at an exact position, position using the direction, distance and orientation specified by the application.

This is in contrast with e.g. [FirstPersonViewport](/docs/api-reference/viewport.md) where the camera will be position exactly at the specified position.

## Usage

```js
const viewport = new ThirdPersonViewport({
  // Viewport params
  width: 500,
  height: 500,

  // "Object" position
  position: [0, 0, 100], // "Object" position
  direction: // object direction,
  up: , //
  cameraDistance: 2, // Camera distance from object
  cameraDirection: 2, // Camera distance from object

  // Projection parameters (perspective projection)
  fov: 45,

  // optional
  longitude,
  latitude,
  zoom
});
```

## Methods

Inherits all [Viewport methods](/docs/api-reference/viewport.md#methods).

### Constructor

Parameters:
- `opts` (Object) - viewport options
  * `width` (Number) - Width of "viewport" or window. Default to `1`.
  * `height` (Number) - Height of "viewport" or window. Default to `1`.

  view matrix arguments:

  projection matrix arguments:
  * `fov` (Number, optional) - Field of view covered by camera. Default to `75`.
  * `near` (Number, optional) - Distance of near clipping plane. Default to `1`.
  * `far` (Number, optional) - Distance of far clipping plane. Default to `100`.
  * `aspect` (Number, optional) - Aspect ratio. Default to the viewport's `width/height`.

See [Viewport constructor](/docs/api-reference/viewport.md#constructor) for additional parameters, especially for specifying alternate projection matrices, geospatial anchor etc.

## Remarks

* Like all `Viewport`s, the `ThirdPersonViewport` will work with all geospatial coordinate systems if a geospatial "anchor point" is supplied through the `longitude`, `latitude` and `zoom` options. The `position` vector will then be interpreted as meter offsets from this anchor point.

## Source

[src/viewports/perspective-viewport.js](https://github.com/uber/deck.gl/blob/4.1-release/src/viewports/perspective-viewport.js)
