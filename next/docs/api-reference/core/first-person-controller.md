# FirstPersonController

Inherits from [Base Controller](https://deck.gl/next/docs/api-reference/core/controller.md).

The `FirstPersonController` class can be passed to either the `Deck` class's [controller](https://deck.gl/next/docs/api-reference/core/deck.md#controller) prop or a `View` class's [controller](https://deck.gl/next/docs/api-reference/core/view.md#controller) prop to specify that viewport interaction should be enabled.

`FirstPersonController` is the default controller for [FirstPersonView](https://deck.gl/next/docs/api-reference/core/first-person-view.md). It simulates the movement of a human being, with the scroll motion moving forward/backwards and dragging rotating the head.

## Usage[​](#usage "Direct link to Usage")

Use with the default view:

```
import {Deck, FirstPersonView} from '@deck.gl/core';



new Deck({

  views: new FirstPersonView(),

  controller: {keyboard: false, inertia: true},

  initialViewState: viewState

});
```

is equivalent to:

```
import {Deck, FirstPersonView} from '@deck.gl/core';



new Deck({

  views: new FirstPersonView({

    controller: {keyboard: false,  inertia: true}

  }),

  initialViewState: viewState

})
```

## Options[​](#options "Direct link to Options")

Supports all [Controller options](https://deck.gl/next/docs/api-reference/core/controller.md#options) with the following default behavior:

* `dragMode`: default `'rotate'` (drag to rotate, shift-drag to pan)
* `dragPan`: default `true` (supported only from v9.0)
* `keyboard`: arrow keys to move camera, arrow keys with shift/ctrl down to rotate, +/- to move vertically
* `scrollZoom`: scroll to move in direction of mouse pointer, in horizontal 2D plane

## Custom FirstPersonController[​](#custom-firstpersoncontroller "Direct link to Custom FirstPersonController")

You can further customize the `FirstPersonController`'s behavior by extending the class:

```
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

See the `Controller` class [documentation](https://deck.gl/next/docs/api-reference/core/controller.md#methods) for the methods that you can use and/or override.

## Source[​](#source "Direct link to Source")

[modules/core/src/controllers/first-person-controller.ts](https://github.com/visgl/deck.gl/blob/master/modules/core/src/controllers/first-person-controller.ts)
