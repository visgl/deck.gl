# GlobeController (Experimental)

Inherits from [Base Controller](./controller.md).

The `GlobeController` class can be passed to either the `Deck` class's [controller](./deck.md#controller) prop or a `View` class's [controller](./view.md#controller) prop to specify that viewport interaction should be enabled.

`GlobeController` is the default controller for [GlobeView](./globe-view.md).

It is **terrain-aware**: when the scene contains a layer with `pickable: '3d'`, the camera follows picked terrain elevation and rotation pivots around the 3D point under the pointer. This is the same terrain behavior as [TerrainController](./terrain-controller.md), composed in via a shared mixin — `GlobeController` does **not** inherit `MapController`, so the Web-Mercator map constraints never apply to the globe.

## Usage

Use with the default view:

```js
import {Deck, _GlobeView as GlobeView} from '@deck.gl/core';

new Deck({
  views: new GlobeView(),
  controller: {keyboard: false, inertia: true},
  initialViewState: viewState
});
```

is equivalent to:

```js
import {Deck, _GlobeView as GlobeView} from '@deck.gl/core';

new Deck({
  views: new GlobeView({
    controller: {keyboard: false, inertia: true}
  }),
  initialViewState: viewState
})
```

## Options

Supports all [Controller options](./controller.md#options) with the following default behavior:

- `dragPan`: default `'pan'` (drag to pan)
- `dragRotate`: shift+drag or right-click drag to change bearing and pitch
- `rotationPivot`: default `'3d'` (rotate around the picked object under the pointer)
- `touchRotate`: multi-touch rotate to change bearing
- `keyboard`: arrow keys to pan, +/- to zoom
- `inertia`: when set to a number (milliseconds), the globe continues spinning after a fling gesture with exponential decay
- `maxBounds` - constrains the viewport to the specified bounding box `[[minLng, minLat], [maxLng, maxLat]]`
- Terrain following requires a layer with `pickable: '3d'`; without one, the controller behaves like a standard `GlobeController`.

## Custom GlobeController

You can further customize the `GlobeController`'s behavior by extending the class:

```js
import {Deck, _GlobeView as GlobeView, _GlobeController as GlobeController} from '@deck.gl/core';

class MyGlobeController extends GlobeController {

  handleEvent(event) {
    if (event.type === 'pan') {
      // do something
    } else {
      super.handleEvent(event);
    }
  }
}

new Deck({
  views: new GlobeView(),
  controller: {type: MyGlobeController},
  initialViewState: viewState
})
```

See the `Controller` class [documentation](./controller.md#methods) for the methods that you can use and/or override.


## Source

[modules/core/src/controllers/globe-controller.ts](https://github.com/visgl/deck.gl/blob/master/modules/core/src/controllers/globe-controller.ts)
