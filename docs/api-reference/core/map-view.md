# MapView

The `MapView` class is a subclass of [View](https://deck.gl/docs/api-reference/core/view.md). This viewport creates a camera that looks at a geospatial location on a map from a certain direction. The behavior of `MapView` is generally modeled after that of Mapbox GL JS.

It's recommended that you read the [Views and Projections guide](https://deck.gl/docs/developer-guide/views.md) before using this class.

[deck.gl MapView](https://codepen.io/vis-gl/embed/MWbwyWy?height=450\&theme-id=light\&default-tab=result)

## Constructor[​](#constructor "Direct link to Constructor")

```
import {MapView} from '@deck.gl/core';

const view = new MapView({id, ...});
```

`MapView` takes the same parameters as the [View](https://deck.gl/docs/api-reference/core/view.md) superclass constructor, plus the following:

#### `repeat` (boolean, optional)[​](#repeat "Direct link to repeat")

Whether to render multiple copies of the map at low zoom levels. Default `false`.

#### `nearZMultiplier` (number, optional)[​](#nearzmultiplier "Direct link to nearzmultiplier")

Scaler for the near plane, 1 unit equals to the height of the viewport. Default to `0.1`. Overwrites the `near` parameter.

#### `farZMultiplier` (number, optional)[​](#farzmultiplier "Direct link to farzmultiplier")

Scaler for the far plane, 1 unit equals to the distance from the camera to the top edge of the screen. Default to `1.01`. Overwrites the `far` parameter.

#### `projectionMatrix` (number\[16], optional)[​](#projectionmatrix "Direct link to projectionmatrix")

Projection matrix.

If `projectionMatrix` is not supplied, the `View` class will build a projection matrix from the following parameters:

#### `fovy` (number, optional)[​](#fovy "Direct link to fovy")

Field of view covered by the camera, in the perspective case. In degrees. If not supplied, will be calculated from `altitude`.

#### `altitude` (number, optional)[​](#altitude "Direct link to altitude")

Distance of the camera relative to viewport height. Default `1.5`.

#### `orthographic` (boolean)[​](#orthographic "Direct link to orthographic")

Whether to create an orthographic or perspective projection matrix. Default is `false` (perspective projection).

## View State[​](#view-state "Direct link to View State")

To render, `MapView` needs to be used together with a `viewState` with the following parameters:

* `longitude` (number) - longitude at the map center
* `latitude` (number) - latitude at the map center
* `zoom` (number) - zoom level
* `pitch` (number, optional) - pitch angle in degrees. Default `0` (top-down).
* `bearing` (number, optional) - bearing angle in degrees. Default `0` (north).
* `maxZoom` (number, optional) - max zoom level. Default `20`.
* `minZoom` (number, optional) - min zoom level. Default `0`.
* `maxPitch` (number, optional) - max pitch angle. Default `60`.
* `minPitch` (number, optional) - min pitch angle. Default `0`.
* `position` (number\[3], optional) - Viewport center offsets from lng, lat in meters. Default: `[0,0,0]`.

## Controller[​](#controller "Direct link to Controller")

By default, `MapView` uses the `MapController` to handle interactivity. To enable the controller, use:

```
const view = new MapView({id: 'base-map', controller: true});
```

Visit the [MapController](https://deck.gl/docs/api-reference/core/map-controller.md) documentation for a full list of supported options.

## Source[​](#source "Direct link to Source")

[modules/core/src/views/map-view.ts](https://github.com/visgl/deck.gl/tree/9.4-release/modules/core/src/views/map-view.ts)
