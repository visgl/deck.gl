# OrbitController

Inherits from [Base Controller](https://deck.gl/next/docs/api-reference/core/controller.md).

The `OrbitController` class can be passed to either the `Deck` class's [controller](https://deck.gl/next/docs/api-reference/core/deck.md#controller) prop or a `View` class's [controller](https://deck.gl/next/docs/api-reference/core/view.md#controller) prop to specify that viewport interaction should be enabled.

`OrbitController` is the default controller for [OrbitView](https://deck.gl/next/docs/api-reference/core/orbit-view.md).

## Usage[​](#usage "Direct link to Usage")

Use with the default view:

```
import {Deck, OrbitView} from '@deck.gl/core';



new Deck({

  views: new OrbitView(),

  controller: {dragPan: false, inertia: true},

  initialViewState: viewState

});
```

is equivalent to:

```
import {Deck, OrbitView} from '@deck.gl/core';



new Deck({

  views: new OrbitView({

    controller: {dragPan: false,  inertia: true}

  }),

  initialViewState: viewState

})
```

## Options[​](#options "Direct link to Options")

Supports all [Controller options](https://deck.gl/next/docs/api-reference/core/controller.md#options) with the following default behavior:

* `dragMode`: default `'rotate'` (drag to rotate, shift/ctrl + drag to pan)
* `keyboard`: arrow keys to pan, arrow keys with shift/ctrl down to rotate, +/- to zoom
* `maxBounds` - constrains the target position within the specified bounding box `[[minX, minY, minZ], [maxX, maxY, maxZ]]`
* `maxBoundsPadding` - padding inside the viewport when fitting `maxBounds`, using the same `{left, right, top, bottom}` format as view padding. Numeric values are pixels; strings may be percentages or layout expressions such as `calc(10% - 4px)`. The bounds sphere is fitted within the space around the projected `target`. Default `0`.

## Custom OrbitController[​](#custom-orbitcontroller "Direct link to Custom OrbitController")

You can further customize the `OrbitController`'s behavior by extending the class:

```
import {Deck, OrbitView, OrbitController} from '@deck.gl/core';



class MyOrbitController extends OrbitController {



  handleEvent(event) {

    if (event.type === 'pan') {

      // do something

    } else {

      super.handleEvent(event);

    }

  }

}



new Deck({

  views: new OrbitView(),

  controller: {type: MyOrbitController},

  initialViewState: viewState

})
```

See the `Controller` class [documentation](https://deck.gl/next/docs/api-reference/core/controller.md#methods) for the methods that you can use and/or override.

## Source[​](#source "Direct link to Source")

[modules/core/src/controllers/orbit-controller.ts](https://github.com/visgl/deck.gl/blob/master/modules/core/src/controllers/orbit-controller.ts)
