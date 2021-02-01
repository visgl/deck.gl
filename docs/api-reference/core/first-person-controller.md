# FirstPersonController

Inherits from [Base Controller](/docs/api-reference/core/controller.md).

The `FirstPersonController` class can be passed to either the `Deck` class's [controller](/docs/api-reference/core/deck.md#controller) prop or a `View` class's [controller](/docs/api-reference/core/view.md#controller) prop to specify that viewport interaction should be enabled.

`FirstPersonController` is the default controller for [FirstPersonView](/docs/api-reference/core/first-person-view.md).

## Usage

Use with the default view:

```js
import {Deck, FirstPersonView} from '@deck.gl/core';

new Deck({
  views: new FirstPersonView(),
  controller: {keyboard: false, inertia: true},
  initialViewState: viewState
});
```

is equivalent to:

```js
import {Deck, FirstPersonView} from '@deck.gl/core';

new Deck({
  views: new FirstPersonView({
    controller: {keyboard: false,  inertia: true}
  }),
  initialViewState: viewState
})
```

## Options

Supports all [Controller options](/docs/api-reference/core/controller.md#options) with the following default behavior:

- `dragMode`: default `'rotate'` (drag to rotate)
- `dragPan`: not effective, this view does not support panning
- `keyboard`: arrow keys to move camera, arrow keys with shift/ctrl down to rotate, +/- to zoom


## Custom FirstPersonController

You can further customize the `FirstPersonController`'s behavior by extending the class:

```js
import {Deck, FirstPersonView, FirstPersonController} from '@deck.gl/core';

class MyFirstPersonController extends FirstPersonController {

  handleEvent(event) {
    if (event.type === 'pan') {
      // do something
    } else {
      super.handleEvent(event);
    }
  }
}

new Deck({
  views: new FirstPersonView(),
  controller: {type: MyFirstPersonController},
  initialViewState: viewState
})
```

See the `Controller` class [documentation](/docs/api-reference/core/controller.md#methods) for the methods that you can use and/or override.


## Source

[modules/core/src/controllers/first-person-controller.js](https://github.com/visgl/deck.gl/blob/master/modules/core/src/controllers/first-person-controller.js)
