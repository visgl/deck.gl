# MapController

Inherits from [Base Controller](/docs/api-reference/core/controller.md).

The `MapController` class can be passed to either the `Deck` class's [controller](/docs/api-reference/core/deck.md#controller) prop or a `View` class's [controller](/docs/api-reference/core/view.md#controller) prop to specify that map interaction should be enabled.

`MapController` is the default controller for [MapView](/docs/api-reference/core/map-view.md)..

## Usage

Use with the default view:

```js
import {Deck} from '@deck.gl/core';

new Deck({
  controller: {doubleClickZoom: false, inertia: true},
  initialViewState: viewState
});
```

is equivalent to:

```js
import {Deck} from '@deck.gl/core';

new Deck({
  views: new MapView({
    controller: {doubleClickZoom: false,  inertia: true}
  }),
  initialViewState: viewState
})
```

## Options

Supports all [Controller options](/docs/api-reference/core/controller.md#options) with the following default behavior:

- `dragMode` - default `'pan'` (drag to pan, shift/ctrl + drag to rotate)
- `keyboard` - arrow keys to pan, arrow keys with shift/ctrl down to rotate, +/- to zoom

## Custom MapController

You can further customize the `MapController`'s behavior by extending the class:

```js
import {Deck, MapController} from '@deck.gl/core';

class MyMapController extends MapController {

  handleEvent(event) {
    if (event.type === 'pan') {
      // do something
    } else {
      super.handleEvent(event);
    }
  }
}

new Deck({
  controller: {type: MyMapController},
  initialViewState: viewState
})
```

See the `Controller` class [documentation](/docs/api-reference/core/controller.md#methods) for the methods that you can use and/or override.


## Source

[modules/core/src/controllers/map-controller.js](https://github.com/visgl/deck.gl/blob/master/modules/core/src/controllers/map-controller.js)
