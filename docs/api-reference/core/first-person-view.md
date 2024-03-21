# FirstPersonView

The `FirstPersonView` class is a subclass of [View](./viewport.md) that describes a camera placed at a provided location, looking **towards** the direction and orientation specified by `viewState`. The behavior is similar to that of a [first-person game](https://en.wikipedia.org/wiki/First-person_(gaming)).

It's recommended that you read the [Views and Projections guide](../../developer-guide/views.md) before using this class.

<div style={{position:'relative',height:450}}></div>
<div style={{position:'absolute',transform:'translateY(-450px)',paddingLeft:'inherit',paddingRight:'inherit',left:0,right:0}}>
  <iframe height="450" style={{width:'100%'}} scrolling="no" title="deck.gl FirstPersonView" src="https://codepen.io/vis-gl/embed/oNYXxNE?height=450&theme-id=light&default-tab=result" frameborder="no" loading="lazy" allowtransparency="true" allowfullscreen="true">
    See the Pen <a href='https://codepen.io/vis-gl/pen/oNYXxNE'>deck.gl FirstPersonView</a> by vis.gl
    (<a href='https://codepen.io/vis-gl'>@vis-gl</a>) on <a href='https://codepen.io'>CodePen</a>.
  </iframe>
</div>


## Constructor

```js
import {FirstPersonView} from '@deck.gl/core';
new FirstPersonView({id, ...});
```

`FirstPersonView` takes the same parameters as the [View](./view.md) superclass constructor, plus the following:

##### `projectionMatrix` (Array[16], optional) {#projectionmatrix}

Projection matrix.

If `projectionMatrix` is not supplied, the `View` class will build a projection matrix from the following parameters:

##### `fovy` (Number, optional) {#fovy}

Field of view covered by camera, in the perspective case. In degrees. Default `75`.

##### `near` (Number, optional) {#near}

Distance of near clipping plane. Default `0.1`.

##### `far` (Number, optional) {#far}

Distance of far clipping plane. Default `1000`.

##### `focalDistance` (Number, optional) {#focaldistance}

Modifier of viewport scale. Corresponds to the number of pixels per meter. Default `1`.


## View State

To render, a `FirstPersonView` needs to be combined with a `viewState` object with the following parameters:

- `longitude` (Number, optional) - longitude of the camera
- `latitude` (Number, optional) - latitude of the camera
* `position` (Number[3], optional) - meter offsets of the camera from the lng-lat anchor point. Default `[0, 0, 0]`.
* `bearing` (Number, optional) - bearing angle in degrees. Default `0` (north).
* `pitch` (Number, optional) - pitch angle in degrees. Default `0` (horizontal).
- `maxPitch` (Number, optional) - max pitch angle. Default `90` (down).
- `minPitch` (Number, optional) - min pitch angle. Default `-90` (up).


## Controller

By default, `FirstPersonView` uses the `FirstPersonController` to handle interactivity. To enable the controller, use:

```js
const view = new FirstPersonView({id: 'pov', controller: true});
```

Visit the [FirstPersonController](./first-person-controller.md) documentation for a full list of supported options.

## Source

[modules/core/src/views/first-person-view.ts](https://github.com/visgl/deck.gl/tree/9.0-release/modules/core/src/views/first-person-view.ts)
