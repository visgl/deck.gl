# CameraLight (Experimental)

CameraLight is a special [point light](https://deck.gl/docs/api-reference/core/point-light.md) source which always emits from the camera position.

![](https://raw.github.com/visgl/deck.gl-data/master/images/whats-new/camera-light.gif)

*Two spheres with camera light*

## Usage[​](#usage "Direct link to Usage")

Create an camera light source.

```
import {_CameraLight as CameraLight} from '@deck.gl/core';



new CameraLight({

  color: [255, 255, 255],

  intensity: 1

});
```

## constructor[​](#constructor "Direct link to constructor")

The constructor for the `CameraLight` class. Use this to create a new `CameraLight`.

```
const cameraLight = new CameraLight({color, intensity});
```

* `color` - (number\[3]) RGB color of camera light source, default value is `[255, 255, 255]`.
* `intensity` - (number) Strength of camera light source, default value is `1.0`.

## Source[​](#source "Direct link to Source")

[/modules/core/src/effects/lighting/camera-light.ts](https://github.com/visgl/deck.gl/tree/9.4-release/modules/core/src/effects/lighting/camera-light.ts)
