# GlobeController (Experimental)

Inherits from [Base Controller](./controller.md).

The `GlobeController` class can be passed to either the `Deck` class's [controller](./deck.md#controller) prop or a `View` class's [controller](./view.md#controller) prop to specify that viewport interaction should be enabled.

`GlobeController` is the default controller for [GlobeView](./globe-view.md).

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
- `dragRotate`: not effective, this view does not currently support rotation
- `touchRotate`: not effective, this view does not currently support rotation
- `keyboard`: arrow keys to pan, +/- to zoom

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

[modules/core/src/controllers/globe-controller.ts](https://github.com/visgl/deck.gl/tree/9.1-release/modules/core/src/controllers/globe-controller.ts)
