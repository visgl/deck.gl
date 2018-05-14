# ThirdPersonViewport Class (Deprecated)

> ThirdPersonViewport is deprecated. Use [ThirdPersonView](/docs/api-reference/third-person-view.md) instead.

The [`ThirdPersonViewport`] class is a subclass of [Viewport](/docs/api-reference/viewport.md). This viewport creates a "camera" that looks at an exact position, position using the direction, distance and orientation specified by the application.

This is in contrast with e.g. [FirstPersonViewport](/docs/api-reference/viewport.md) where the camera will be position exactly at the specified position.

For more information consult the [Viewports](/docs/developer-guide/viewports.md) article.

## Usage

```js
import {ThirdPersonViewport} from 'deck.gl';

const viewport = new ThirdPersonViewport({
  // Viewport params
  width: 500,
  height: 500,

  // "Object" position
  position: [0, 0, 100], // "Object" position
  bearing: 45,
  pitch: 30,

  up: [0, 0, 1], //
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


## Constructor

```js
new ThirdPersonViewport({width, height, pitch, bearing, ...});
```

Parameters:

* `opts` (Object) - Third person viewport options

  + `width` (Number) - Width of "viewport" or window. Default to `1`.
  + `height` (Number) - Height of "viewport" or window. Default to `1`.
  + `pitch` (Number, optional) - Camera angle in degrees (0 is straight down). Default to `0`.
  + `bearing` (Number, optional) - Map rotation in degrees (0 means north is up). Default to `0`.

  projection matrix arguments:

  + `fov` (Number, optional) - Field of view covered by camera. Default to `75`.
  + `near` (Number, optional) - Distance of near clipping plane. Default to `1`.
  + `far` (Number, optional) - Distance of far clipping plane. Default to `100`.
  + `aspect` (Number, optional) - Aspect ratio. Default to the viewport's `width/height`.

See [Viewport constructor](/docs/api-reference/viewport.md#constructor) for additional parameters, especially for specifying alternate projection matrices, geospatial anchor etc.

## Methods

Inherits all [Viewport methods](/docs/api-reference/viewport.md#methods).


## Remarks

* Like all `Viewport`s, the `ThirdPersonViewport` will work with all geospatial coordinate systems if a geospatial "anchor point" is supplied through the `longitude`, `latitude` and `zoom` options. The `position` vector will then be interpreted as meter offsets from this anchor point.

## Source

[modules/core/src/core/viewports/third-person-viewport.js](https://github.com/uber/deck.gl/blob/5.2-release/modules/core/src/core/viewports/third-person-viewport.js)
