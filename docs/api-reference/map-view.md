# MapView Class

The [`MapView`] class is a subclass of [View](/docs/api-reference/view.md). This viewport creates a camera that looks at a geospatial location on a map from a certain direction. The behavior of `MapView` is generally modeled after that of Mapbox GL JS.

It's recommended that you read the [Views and Projections guide](/docs/developer-guide/views.md) before using this class.

## Constructor

```js
import {MapView} from '@deck.gl/core';
const view = new MapView({id, ...});
```

`MapView` takes the same parameters as the [View](/docs/api-reference/view.md) superclass constructor.

## View State

To render, `MapView` needs to be used together with a `viewState` with the following parameters:

- `longitude` (`Number`) - longitude at the map center
- `latitude` (`Number`) - latitude at the map center
- `zoom` (`Number`) - zoom level
- `pitch` (`Number`, optional) - pitch angle in degrees. Default `0` (top-down).
- `bearing` (`Number`, optional) - bearing angle in degrees. Default `0` (north).
- `maxZoom` (`Number`, optional) - max zoom level. Default `20`.
- `minZoom` (`Number`, optional) - min zoom level. Default `0`.
- `maxPitch` (`Number`, optional) - max pitch angle. Default `60`.
- `minPitch` (`Number`, optional) - min pitch angle. Default `0`.

The default controller of a `MapView` is [MapController](/docs/api-reference/map-controller.md).


## MapController

By default, `MapView` uses the `MapController` to handle interactivity. To enable the controller, use:

```js
const view = new MapView({id: 'base-map', controller: true});
```

`MapController` supports the following interactions:

- `dragPan`: Drag to pan
- `dragRotate`: Drag while pressing shift/ctrl to rotate
- `scrollZoom`: Mouse wheel to zoom
- `doubleClickZoom`: Double click to zoom in, with shift/ctrl down to zoom out
- `touchZoom`: Pinch zoom
- `touchRotate`: Multi-touch rotate
- `keyboard`: Keyboard (arrow keys to pan, arrow keys with shift/ctrl down to rotate, +/- to zoom)

You can further customize its behavior by extending the class:

```js
import {MapController} from '@deck.gl/core';

class MyMapController extends MapController {}

const view = new MapView({id: 'base-map', controller: MyMapController});
```

See the documentation of [Controller](/docs/api-reference/controller.md) for implementation details.


## Source

[modules/core/src/views/map-view.js](https://github.com/uber/deck.gl/blob/master/modules/core/src/views/map-view.js)
