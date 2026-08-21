# OrthographicView

The `OrthographicView` class is a subclass of [View](./view.md) that creates a top-down view of the XY plane. It is usually used for rendering 2D charts in non-geospatial use cases.

It's recommended that you read the [Views and Projections guide](../../developer-guide/views.md) before using this class.

<div style={{position:'relative',height:450}}></div>
<div style={{position:'absolute',transform:'translateY(-450px)',paddingLeft:'inherit',paddingRight:'inherit',left:0,right:0}}>
  <iframe height="450" style={{width:'100%'}} scrolling="no" title="deck.gl OrthographicView" src="https://codepen.io/vis-gl/embed/YzpXqzv?height=450&theme-id=light&default-tab=result" frameborder="no" loading="lazy" allowtransparency="true" allowfullscreen="true">
    See the Pen <a href='https://codepen.io/vis-gl/pen/YzpXqzv'>deck.gl OrthographicView</a> by vis.gl
    (<a href='https://codepen.io/vis-gl'>@vis-gl</a>) on <a href='https://codepen.io'>CodePen</a>.
  </iframe>
</div>


## Constructor

```js
import {OrthographicView} from '@deck.gl/core';
const view = new OrthographicView({id, ...});
```

`OrthographicView` takes the same parameters as the [View](./view.md) superclass constructor, plus the following:

#### `flipY` (boolean) {#flipy}

Whether to use top-left coordinates (`true`) or bottom-left coordinates (`false`). Default `true`.

#### `near` (number, optional) {#near}

Distance of near clipping plane. Default `0.1`.

#### `far` (number, optional) {#far}

Distance of far clipping plane. Default `1000`.


## View State

To render, `OrthographicView` needs to be used together with a `viewState` with the following parameters:

* `target` (number[3], optional) - The world position at the center of the viewport. Default `[0, 0, 0]`.
* `zoom` (number, optional) - The zoom level of the viewport. `zoom: 0` maps one unit distance to one pixel on screen, and increasing `zoom` by `1` scales the same object to twice as large. To apply independent zoom levels to the X and Y axes, use `zoomX` and `zoomY`. Default `0`.
* `zoomX` (number, optional) - The zoom level along X axis. Overrides `zoom` if supplied.
* `zoomY` (number, optional) - The zoom level along Y axis. Overrides `zoom` if supplied.
* `minZoom` (number, optional) - The min zoom level of the viewport. Default `-Infinity`.
* `maxZoom` (number, optional) - The max zoom level of the viewport. Default `Infinity`.
* `minZoomX` (number, optional) - The min zoom level of the viewport on X axis. Default `minZoom`.
* `maxZoomX` (number, optional) - The max zoom level of the viewport on X axis. Default `maxZoom`.
* `minZoomY` (number, optional) - The min zoom level of the viewport on Y axis. Default `minZoom`.
* `maxZoomY` (number, optional) - The max zoom level of the viewport on Y axis. Default `maxZoom`.


## Controller

By default, `OrthographicView` uses the `OrthographicController` to handle interactivity. To enable the controller, use:

```js
const view = new OrthographicView({id: '2d-scene', controller: true});
```

Visit the [OrthographicController](./orthographic-controller.md) documentation for a full list of supported options.

Bounded charts and timelines can use the controller's `maxBoundsAlignment` option to place content that remains smaller than the viewport on either world axis:

```js
const view = new OrthographicView({
  controller: {
    maxBounds: contentBounds,
    maxBoundsAlignment: {x: 'center', y: 'start'}
  }
});
```

This alignment changes only the constrained target. It does not alter the orthographic projection or the existing `maxBounds` zoom behavior.


## Remarks

### Common size resolution

This section describes how geometry size (e.g. scatterplot radius, path width, text size) of [common units](../../developer-guide/coordinate-systems.md#common) is resolved in OrthographicView.

When a uniform zoom is used, like all other view types, the `zoom` view state is used to project both position and size.
When the X and Y axes zoom independently, it becomes ambiguous whether size should follow X or Y. By default, size is scaled to `Math.min(zoomX, zoomY)`, to provide visual stability. You may override this behavior by supplying a `zoom` value. While `zoom` is shadowed by `zoomX` and `zoomY` during position projection, it will be used to project sizes.


## Source

[modules/core/src/views/orthographic-view.ts](https://github.com/visgl/deck.gl/blob/master/modules/core/src/views/orthographic-view.ts)
