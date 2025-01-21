# OrthographicController

Inherits from [Base Controller](./controller.md).

The `OrthographicController` class can be passed to either the `Deck` class's [controller](./deck.md#controller) prop or a `View` class's [controller](./view.md#controller) prop to specify that viewport interaction should be enabled.

`OrthographicController` is the default controller for [OrthographicView](./orthographic-view.md).

## Usage

Use with the default view:

```js
import {Deck, OrthographicView} from '@deck.gl/core';

new Deck({
  views: new OrthographicView(),
  controller: {scrollZoom: false, inertia: true},
  initialViewState: viewState
});
```

is equivalent to:

```js
import {Deck, OrthographicView} from '@deck.gl/core';

new Deck({
  views: new OrthographicView({
    controller: {scrollZoom: false,  inertia: true}
  }),
  initialViewState: viewState
})
```

## Options

Supports all [Controller options](./controller.md#options) with the following default behavior:


- `dragPan`: default `'pan'` (drag to pan)
- `dragRotate`: not effective, this view cannot be rotated
- `touchRotate`: not effective, this view cannot be rotated
- `keyboard`: arrow keys to pan, +/- to zoom

Also accepts additional options:

- `zoomAxis` (string) - which axes to apply zoom to. Affects scroll, keyboard +/- and double tap. One of `X` (zoom along the X axis only), `Y` (zoom along the Y axis only), `all`. Default `all`. If this option is set to `X` or `Y`, `viewState.zoom` must be an array to enable independent zoom for each axis.

## Custom OrthographicController

You can further customize the `OrthographicController`'s behavior by extending the class:

```js
import {Deck, OrthographicView, OrthographicController} from '@deck.gl/core';

class MyOrthographicController extends OrthographicController {

  handleEvent(event) {
    if (event.type === 'pan') {
      // do something
    } else {
      super.handleEvent(event);
    }
  }
}

new Deck({
  views: new OrthographicView(),
  controller: {type: MyOrthographicController},
  initialViewState: viewState
})
```

See the `Controller` class [documentation](./controller.md#methods) for the methods that you can use and/or override.


## Source

[modules/core/src/controllers/orthographic-controller.ts](https://github.com/visgl/deck.gl/tree/9.1-release/modules/core/src/controllers/orthographic-controller.ts)
