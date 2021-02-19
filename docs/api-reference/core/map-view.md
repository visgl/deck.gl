# MapView

The `MapView` class is a subclass of [View](/docs/api-reference/core/view.md). This viewport creates a camera that looks at a geospatial location on a map from a certain direction. The behavior of `MapView` is generally modeled after that of Mapbox GL JS.

It's recommended that you read the [Views and Projections guide](/docs/developer-guide/views.md) before using this class.

<div style="position:relative;height:450px"></div>
<div style="position:absolute;transform:translateY(-450px);padding-left:inherit;padding-right:inherit;left:0;right:0">
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

`MapView` takes the same parameters as the [View](/docs/api-reference/core/view.md) superclass constructor, plus the following:

##### `repeat` (Boolean, optional)

Whether to render multiple copies of the map at low zoom levels. Default `false`.

##### `nearZMultiplier` (Number, optional)

Scaler for the near plane, 1 unit equals to the height of the viewport. Default to `0.1`. Overwrites the `near` parameter.

##### `farZMultiplier` (Number, optional)

Scaler for the far plane, 1 unit equals to the distance from the camera to the top edge of the screen. Default to `1.01`. Overwrites the `far` parameter.


## View State

To render, `MapView` needs to be used together with a `viewState` with the following parameters:

- `longitude` (Number) - longitude at the map center
- `latitude` (Number) - latitude at the map center
- `zoom` (Number) - zoom level
- `pitch` (Number, optional) - pitch angle in degrees. Default `0` (top-down).
- `bearing` (Number, optional) - bearing angle in degrees. Default `0` (north).
- `maxZoom` (Number, optional) - max zoom level. Default `20`.
- `minZoom` (Number, optional) - min zoom level. Default `0`.
- `maxPitch` (Number, optional) - max pitch angle. Default `60`.
- `minPitch` (Number, optional) - min pitch angle. Default `0`.

## Controller

By default, `MapView` uses the `MapController` to handle interactivity. To enable the controller, use:

```js
const view = new MapView({id: 'base-map', controller: true});
```

Visit the [MapController](/docs/api-reference/core/map-controller.md) documentation for a full list of supported options.

## Source

[modules/core/src/views/map-view.js](https://github.com/visgl/deck.gl/blob/master/modules/core/src/views/map-view.js)
