# OrthographicView Class

The [`OrthographicView`] class is a subclass of [View](/docs/api-reference/view.md) that creates a top-down view of the XY plane. It is usually used for rendering 2D charts in non-geospatial use cases.

It's recommended that you read the [Views and Projections guide](/docs/developer-guide/views.md) before using this class.


## Constructor

```js
import {OrthographicView} from '@deck.gl/core';
const view = new OrthographicView({id, ...});
```

`OrthographicView` takes the same parameters as the [View](/docs/api-reference/view.md) superclass constructor.


## View State

To render, `OrthographicView` needs to be used together with a `viewState` with the following parameters:

* `target` (`Number[3]`, optional) - The world position at the center of the viewport. Default `[0, 0, 0]`.
* `zoom` (`Number`, optional) - The zoom level of the viewport. `zoom: 0` maps one unit distance to one pixel on screen, and increasing `zoom` by `1` scales the same object to twice as large. Default `0`.
* `minZoom` (`Number`, optional) - The min zoom level of the viewport. Default `-Infinity`.
* `maxZoom` (`Number`, optional) - The max zoom level of the viewport. Default `Infinity`.


## OrthographicController

By default, `OrthographicView` uses the `OrthographicController` to handle interactivity. To enable the controller, use:

```js
const view = new OrthographicView({id: '2d-scene', controller: true});
```

`OrthographicController` supports the following interactions:

- `dragPan`: Drag to pan
- `scrollZoom`: Mouse wheel to zoom
- `doubleClickZoom`: Double click to zoom in, with shift/ctrl down to zoom out
- `touchZoom`: Pinch zoom
- `keyboard`: Keyboard (arrow keys to pan, +/- to zoom)

You can further customize its behavior by extending the class:

```js
import {OrthographicView} from '@deck.gl/core';

class MyOrthographicView extends OrthographicView {}

const view = new OrthographicView({id: '3d-scene', controller: MyOrthographicView});
```

See the documentation of [Controller](/docs/api-reference/controller.md) for implementation details.


## Source

[modules/core/src/views/orthographic-view.js](https://github.com/uber/deck.gl/blob/master/modules/core/src/views/orthographic-view.js)
