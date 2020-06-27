# CameraLight (Experimental)

CameraLight is a special [point light](/docs/api-reference/core/point-light.md) source which always emits from the camera position.

<div align="center">
  <div>
    <img src="https://raw.github.com/visgl/deck.gl-data/master/images/whats-new/camera-light.gif" />
    <p><i>Two spheres with camera light</i></p>
  </div>
</div>

## Usage 

Create an camera light source.

```js
import {_CameraLight as CameraLight} from '@deck.gl/core';

new CameraLight({
  color: [255, 255, 255],
  intensity: 1
});
```

## constructor

The constructor for the `CameraLight` class. Use this to create a new `CameraLight`.

```js
const cameraLight = new CameraLight({color, intensity});
```

* `color` - (*array*)  RGB color of camera light source, default value is `[255, 255, 255]`.
* `intensity` - (*number*) Strength of camera light source, default value is `1.0`.

## Source

[/modules/core/src/effects/lighting/camera-light.js](https://github.com/visgl/deck.gl/tree/master/modules/core/src/effects/lighting/camera-light.js)
