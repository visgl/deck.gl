# OrbitView

The `OrbitView` class is a subclass of [View](./view.md) that creates a 3D camera that rotates around a target position. It is usually used for the examination of a 3D scene in non-geospatial use cases.

It's recommended that you read the [Views and Projections guide](../../developer-guide/views.md) before using this class.

<div style={{position:'relative',height:450}}></div>
<div style={{position:'absolute',transform:'translateY(-450px)',paddingLeft:'inherit',paddingRight:'inherit',left:0,right:0}}>
  <iframe height="450" style={{width:'100%'}} scrolling="no" title="deck.gl OrbitView" src="https://codepen.io/vis-gl/embed/gOLprOZ?height=450&theme-id=light&default-tab=result" frameborder="no" loading="lazy" allowtransparency="true" allowfullscreen="true">
    See the Pen <a href='https://codepen.io/vis-gl/pen/gOLprOZ'>deck.gl OrbitView</a> by vis.gl
    (<a href='https://codepen.io/vis-gl'>@vis-gl</a>) on <a href='https://codepen.io'>CodePen</a>.
  </iframe>
</div>


## Constructor

```js
import {OrbitView} from '@deck.gl/core';
const view = new OrbitView({id, ...});
```

`OrbitView` takes the same parameters as the [View](./view.md) superclass constructor, plus the following:

##### `orbitAxis` (string, optional) {#orbitaxis}

Axis with 360 degrees rotating freedom, either `'Y'` or `'Z'`, default to `'Z'`.

##### `projectionMatrix` (number[16], optional) {#projectionmatrix}

Projection matrix.

If `projectionMatrix` is not supplied, the `View` class will build a projection matrix from the following parameters:

##### `fovy` (number, optional) {#fovy}

Field of view covered by camera, in the perspective case. In degrees. Default `50`.

##### `near` (number, optional) {#near}

Distance of near clipping plane. Default `0.1`.

##### `far` (number, optional) {#far}

Distance of far clipping plane. Default `1000`.

##### `orthographic` (boolean) {#orthographic}

Whether to create an orthographic or perspective projection matrix. Default is `false` (perspective projection).


## View State

To render, `OrbitView` needs to be used together with a `viewState` with the following parameters:

* `target` (number[3], optional) - The world position at the center of the viewport. Default `[0, 0, 0]`.
* `rotationOrbit` (number, optional) - Rotating angle around orbit axis. Default `0`.
* `rotationX` (number, optional) - Rotating angle around X axis. Default `0`.
* `zoom` (number, optional) - The zoom level of the viewport. `zoom: 0` maps one unit distance to one pixel on screen, and increasing `zoom` by `1` scales the same object to twice as large. Default `0`.
* `minZoom` (number, optional) - The min zoom level of the viewport. Default `-Infinity`.
* `maxZoom` (number, optional) - The max zoom level of the viewport. Default `Infinity`.
* `minRotationX` (number, optional) - The min rotating angle around X axis. Default `-90`.
* `maxRotationX` (number, optional) - The max rotating angle around X axis. Default `90`.


## Controller

By default, `OrbitView` uses the `OrbitController` to handle interactivity. To enable the controller, use:

```js
const view = new OrbitView({id: '3d-scene', controller: true});
```

Visit the [OrbitController](./orbit-controller.md) documentation for a full list of supported options.

## Source

[modules/core/src/views/orbit-view.ts](https://github.com/visgl/deck.gl/blob/master/modules/core/src/views/orbit-view.ts)
