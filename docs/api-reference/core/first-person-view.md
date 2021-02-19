# FirstPersonView

The `FirstPersonView` class is a subclass of [View](/docs/api-reference/core/viewport.md) that describes a camera placed at a provided location, looking **towards** the direction and orientation specified by `viewState`. The behavior is similar to that of a [first-person game](https://en.wikipedia.org/wiki/First-person_(gaming)).

It's recommended that you read the [Views and Projections guide](/docs/developer-guide/views.md) before using this class.

<div style="position:relative;height:450px"></div>
<div style="position:absolute;transform:translateY(-450px);padding-left:inherit;padding-right:inherit;left:0;right:0">
  <iframe height="450" style="width: 100%;" scrolling="no" title="deck.gl FirstPersonView" src="https://codepen.io/vis-gl/embed/oNYXxNE?height=450&theme-id=light&default-tab=result" frameborder="no" loading="lazy" allowtransparency="true" allowfullscreen="true">
    See the Pen <a href='https://codepen.io/vis-gl/pen/oNYXxNE'>deck.gl FirstPersonView</a> by vis.gl
    (<a href='https://codepen.io/vis-gl'>@vis-gl</a>) on <a href='https://codepen.io'>CodePen</a>.
  </iframe>
</div>


## Constructor

```js
import {FirstPersonView} from '@deck.gl/core';
new FirstPersonView({id, ...});
```

`FirstPersonView` takes the same parameters as the [View](/docs/api-reference/core/view.md) superclass constructor.


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

Visit the [FirstPersonController](/docs/api-reference/core/first-person-controller.md) documentation for a full list of supported options.

## Source

[modules/core/src/views/first-person-view.js](https://github.com/visgl/deck.gl/blob/master/modules/core/src/views/first-person-view.js)
