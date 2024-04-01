# MapView

The `MapView` class is a subclass of [View](./view.md). This viewport creates a camera that looks at a geospatial location on a map from a certain direction. The behavior of `MapView` is generally modeled after that of Mapbox GL JS.

It's recommended that you read the [Views and Projections guide](../../developer-guide/views.md) before using this class.

<div style={{position:'relative',height:450}}></div>
<div style={{position:'absolute',transform:'translateY(-450px)',paddingLeft:'inherit',paddingRight:'inherit',left:0,right:0}}>
  <iframe height="450" width="100%" scrolling="no" title="deck.gl MapView" src="https://codepen.io/vis-gl/embed/MWbwyWy?height=450&theme-id=light&default-tab=result" frameborder="no" loading="lazy" allowtransparency="true" allowfullscreen="true">
    See the Pen <a href='https://codepen.io/vis-gl/pen/MWbwyWy'>deck.gl MapView</a> by vis.gl
    (<a href='https://codepen.io/vis-gl'>@vis-gl</a>) on <a href='https://codepen.io'>CodePen</a>.
  </iframe>
</div>


## Constructor

```js
import {MapView} from '@deck.gl/core';
const view = new MapView({id, ...});
```

`MapView` takes the same parameters as the [View](./view.md) superclass constructor, plus the following:

#### `repeat` (boolean, optional) {#repeat}

Whether to render multiple copies of the map at low zoom levels. Default `false`.

#### `nearZMultiplier` (number, optional) {#nearzmultiplier}

Scaler for the near plane, 1 unit equals to the height of the viewport. Default to `0.1`. Overwrites the `near` parameter.

#### `farZMultiplier` (number, optional) {#farzmultiplier}

Scaler for the far plane, 1 unit equals to the distance from the camera to the top edge of the screen. Default to `1.01`. Overwrites the `far` parameter.

#### `projectionMatrix` (number[16], optional) {#projectionmatrix}

Projection matrix.

If `projectionMatrix` is not supplied, the `View` class will build a projection matrix from the following parameters:

#### `fovy` (number, optional) {#fovy}

Field of view covered by the camera, in the perspective case. In degrees. If not supplied, will be calculated from `altitude`.

#### `altitude` (number, optional) {#altitude}

Distance of the camera relative to viewport height. Default `1.5`.

#### `orthographic` (boolean) {#orthographic}

Whether to create an orthographic or perspective projection matrix. Default is `false` (perspective projection).


## View State

To render, `MapView` needs to be used together with a `viewState` with the following parameters:

- `longitude` (number) - longitude at the map center
- `latitude` (number) - latitude at the map center
- `zoom` (number) - zoom level
- `pitch` (number, optional) - pitch angle in degrees. Default `0` (top-down).
- `bearing` (number, optional) - bearing angle in degrees. Default `0` (north).
- `maxZoom` (number, optional) - max zoom level. Default `20`.
- `minZoom` (number, optional) - min zoom level. Default `0`.
- `maxPitch` (number, optional) - max pitch angle. Default `60`.
- `minPitch` (number, optional) - min pitch angle. Default `0`.
- `position` (number[3], optional) - Viewport center offsets from lng, lat in meters. Default: `[0,0,0]`.

## Controller

By default, `MapView` uses the `MapController` to handle interactivity. To enable the controller, use:

```js
const view = new MapView({id: 'base-map', controller: true});
```

Visit the [MapController](./map-controller.md) documentation for a full list of supported options.

## Source

[modules/core/src/views/map-view.ts](https://github.com/visgl/deck.gl/tree/9.0-release/modules/core/src/views/map-view.ts)
