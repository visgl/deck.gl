# OrthographicView

The `OrthographicView` class is a subclass of [View](/docs/api-reference/core/view.md) that creates a top-down view of the XY plane. It is usually used for rendering 2D charts in non-geospatial use cases.

It's recommended that you read the [Views and Projections guide](/docs/developer-guide/views.md) before using this class.

<div style="position:relative;height:450px"></div>
<div style="position:absolute;transform:translateY(-450px);padding-left:inherit;padding-right:inherit;left:0;right:0">
  <iframe height="450" style="width: 100%;" scrolling="no" title="deck.gl OrthographicView" src="https://codepen.io/vis-gl/embed/YzpXqzv?height=450&theme-id=light&default-tab=result" frameborder="no" loading="lazy" allowtransparency="true" allowfullscreen="true">
    See the Pen <a href='https://codepen.io/vis-gl/pen/YzpXqzv'>deck.gl OrthographicView</a> by vis.gl
    (<a href='https://codepen.io/vis-gl'>@vis-gl</a>) on <a href='https://codepen.io'>CodePen</a>.
  </iframe>
</div>


## Constructor

```js
import {OrthographicView} from '@deck.gl/core';
const view = new OrthographicView({id, ...});
```

`OrthographicView` takes the same parameters as the [View](/docs/api-reference/core/view.md) superclass constructor, plus the following:

##### `flipY` (Boolean)

Whether to use top-left coordinates (`true`) or bottom-left coordinates (`false`). Default `true`.


## View State

To render, `OrthographicView` needs to be used together with a `viewState` with the following parameters:

* `target` (Number[3], optional) - The world position at the center of the viewport. Default `[0, 0, 0]`.
* `zoom` (Number, optional) - The zoom level of the viewport. `zoom: 0` maps one unit distance to one pixel on screen, and increasing `zoom` by `1` scales the same object to twice as large. Default `0`.
* `minZoom` (Number, optional) - The min zoom level of the viewport. Default `-Infinity`.
* `maxZoom` (Number, optional) - The max zoom level of the viewport. Default `Infinity`.


## Controller

By default, `OrthographicView` uses the `OrthographicController` to handle interactivity. To enable the controller, use:

```js
const view = new OrthographicView({id: '2d-scene', controller: true});
```

Visit the [OrthographicController](/docs/api-reference/core/orthographic-controller.md) documentation for a full list of supported options.


## Source

[modules/core/src/views/orthographic-view.js](https://github.com/visgl/deck.gl/blob/master/modules/core/src/views/orthographic-view.js)
