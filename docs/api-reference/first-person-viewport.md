# FirstPersonViewport Class

The [`FirstPersonViewport`] class is a subclass of [Viewport](/docs/api-reference/viewport.md) that creates a "camera" at the exact position, direction and orientation specified by the application. This is in contrast with e.g. [ThirdPersonViewport](/docs/api-reference/viewport.md) where the camera will be offset from and look "down" on the specified position.

## Usage

```js
const viewport = new FirstPersonViewport({
  // Viewport params
  width: 500,
  height: 500,

  // Camera position
  eye: [0, 0, 100],

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
  * `eye` (`Vector3`, optional) - Defines eye position, default unit distance along z axis.
    Default to `[0, 0, 1.5]` (eye 1.5 meters above the "ground" to emulate a human perspective).
  * `lookAt` (`Vector3`, optional) - Which point is camera looking at. Default to origin `[0, 0, 0]`.
  * `up` (`Vector3`, optional) - Defines up direction. Default to positive y axis `[0, 1, 0]`.

  projection matrix arguments:
  * `fov` (Number, optional) - Field of view covered by camera. Default to `75`.
  * `near` (Number, optional) - Distance of near clipping plane. Default to `1`.
  * `far` (Number, optional) - Distance of far clipping plane. Default to `100`.
  * `aspect` (Number, optional) - Aspect ratio. Default to the viewport's `width/height`.

See [Viewport constructor](/docs/api-reference/viewport.md#constructor) for additional parameters, especially for specifying alternate projection matrices, geospatial anchor etc.

## Remarks

* Like all `Viewport`s, the `FirstPersonViewport` will work with all geospatial coordinate systems if a geospatial "anchor point" is supplied through the `longitude`, `latitude` and `zoom` options. The `position` vector will then be interpreted as meter offsets from this anchor point.

## Source

[src/viewports/perspective-viewport.js](https://github.com/uber/deck.gl/blob/4.1-release/src/viewports/perspective-viewport.js)
