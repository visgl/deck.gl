# GlobeView Class (Experimental)

The [`GlobeView`] class is a subclass of [View](/docs/api-reference/view.md). This view projects the earth into a 3D globe.

It's recommended that you read the [Views and Projections guide](/docs/developer-guide/views.md) before using this class.

## Constructor

```js
import {_GlobeView as GlobeView} from '@deck.gl/core';
const view = new GlobeView({id, ...});
```

`GlobeView` takes the same parameters as the [View](/docs/api-reference/view.md) superclass constructor.

## View State

To render, `GlobeView` needs to be used together with a `viewState` with the following parameters:

- `longitude` (`Number`) - longitude at the viewport center
- `latitude` (`Number`) - latitude at the viewport center
- `zoom` (`Number`) - zoom level
- `maxZoom` (`Number`, optional) - max zoom level. Default `20`.
- `minZoom` (`Number`, optional) - min zoom level. Default `0`.


## GlobeController

By default, `GlobeView` uses the `GlobeController` to handle interactivity. To enable the controller, use:

```js
const view = new GlobeView({id: 'globe', controller: true});
```

`GlobeController` supports the following interactions:

- `dragPan`: Drag to pan
- `scrollZoom`: Mouse wheel to zoom
- `doubleClickZoom`: Double click to zoom in, with shift/ctrl down to zoom out
- `touchZoom`: Pinch zoom
- `keyboard`: Keyboard (arrow keys to pan, +/- to zoom)

You can further customize its behavior by extending the class:

```js
import {_GlobeController as GlobeController} from '@deck.gl/core';

class MyGlobeController extends GlobeController {}

const view = new GlobeView({id: 'globe', controller: MyGlobeController});
```

See the documentation of [Controller](/docs/api-reference/controller.md) for implementation details.


## Source

[modules/core/src/views/globe-view.js](https://github.com/visgl/deck.gl/blob/master/modules/core/src/views/globe-view.js)
