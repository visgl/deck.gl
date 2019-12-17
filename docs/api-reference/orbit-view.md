# OrbitView Class

The [OrbitView] class is a subclass of [View](/docs/api-reference/view.md) that creates a 3D camera that rotates around a target position. It is usually used for the examination of a 3D scene in non-geospatial use cases.

It's recommended that you read the [Views and Projections guide](/docs/developer-guide/views.md) before using this class.


## Constructor

```js
import {OrbitView} from '@deck.gl/core';
const view = new OrbitView({id, ...});
```

`OrbitView` takes the same parameters as the [View](/docs/api-reference/view.md) superclass constructor, plus the following:

* `orbitAxis` (`String`, optional) - Axis with 360 degrees rotating freedom, either `'Y'` or `'Z'`, default to `'Z'`.


## View State

To render, `OrbitView` needs to be used together with a `viewState` with the following parameters:

* `target` (`Number[3]`) - The world position at the center of the viewport. Default `[0, 0, 0]`.
* `rotationOrbit` (`Number`, optional) - Rotating angle around orbit axis. Default `0`.
* `rotationX` (`Number`, optional) - Rotating angle around X axis. Default `0`.
* `zoom` (`Number`, optional) - The zoom level of the viewport. `zoom: 0` maps one unit distance to one pixel on screen, and increasing `zoom` by `1` scales the same object to twice as large. Default `0`.
* `minZoom` (`Number`, optional) - The min zoom level of the viewport. Default `-Infinity`.
* `maxZoom` (`Number`, optional) - The max zoom level of the viewport. Default `Infinity`.
* `minRotationX` (`Number`, optional) - The min rotating angle around X axis. Default `-90`.
* `maxRotationX` (`Number`, optional) - The max rotating angle around X axis. Default `90`.


## OrbitController

By default, `OrbitView` uses the `OrbitController` to handle interactivity. To enable the controller, use:

```js
const view = new OrbitView({id: '3d-scene', controller: true});
```

`OrbitController` supports the following interactions:

- `dragPan`: Drag while pressing shift/ctrl to pan
- `dragRotate`: Drag to rotate
- `scrollZoom`: Mouse wheel to zoom
- `doubleClickZoom`: Double click to zoom in, with shift/ctrl down to zoom out
- `touchZoom`: Pinch zoom
- `touchRotate`: Multi-touch rotate
- `keyboard`: Keyboard (arrow keys to pan, arrow keys with shift/ctrl down to rotate, +/- to zoom)

You can further customize its behavior by extending the class:

```js
import {OrbitController} from '@deck.gl/core';

class MyOrbitController extends OrbitController {}

const view = new OrbitView({id: '3d-scene', controller: MyOrbitController});
```

See the documentation of [Controller](/docs/api-reference/controller.md) for implementation details.


## Source

[modules/core/src/views/orbit-view.js](https://github.com/uber/deck.gl/blob/master/modules/core/src/views/orbit-view.js)
