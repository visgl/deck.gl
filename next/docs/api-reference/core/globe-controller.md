# GlobeController (Experimental)

Inherits from [Base Controller](https://deck.gl/next/docs/api-reference/core/controller.md).

The `GlobeController` class can be passed to either the `Deck` class's [controller](https://deck.gl/next/docs/api-reference/core/deck.md#controller) prop or a `View` class's [controller](https://deck.gl/next/docs/api-reference/core/view.md#controller) prop to specify that viewport interaction should be enabled.

`GlobeController` is the default controller for [GlobeView](https://deck.gl/next/docs/api-reference/core/globe-view.md).

## Usage[​](#usage "Direct link to Usage")

Use with the default view:

```
import {Deck, _GlobeView as GlobeView} from '@deck.gl/core';



new Deck({

  views: new GlobeView(),

  controller: {keyboard: false, inertia: true},

  initialViewState: viewState

});
```

is equivalent to:

```
import {Deck, _GlobeView as GlobeView} from '@deck.gl/core';



new Deck({

  views: new GlobeView({

    controller: {keyboard: false, inertia: true}

  }),

  initialViewState: viewState

})
```

## Options[​](#options "Direct link to Options")

Supports all [Controller options](https://deck.gl/next/docs/api-reference/core/controller.md#options) with the following default behavior:

* `dragPan`: default `'pan'` (drag to pan)
* `dragRotate`: shift+drag or right-click drag to change bearing and pitch
* `multiTouchDrag`: two-pointer translation can pan or change bearing and pitch
* `keyboard`: arrow keys to pan, +/- to zoom
* `inertia`: when set to a number (milliseconds), the globe continues spinning after a fling gesture with exponential decay
* `maxBounds` - constrains the viewport to the specified bounding box `[[minLng, minLat], [maxLng, maxLat]]`
* `maxBoundsPadding` - padding inside the viewport when fitting `maxBounds`, using the same `{left, right, top, bottom}` format as view padding. Numeric values are pixels; strings may be percentages or layout expressions such as `calc(10% - 4px)`. Each side is measured from the projected globe center. Default `0`.

## Custom GlobeController[​](#custom-globecontroller "Direct link to Custom GlobeController")

You can further customize the `GlobeController`'s behavior by extending the class:

```
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

See the `Controller` class [documentation](https://deck.gl/next/docs/api-reference/core/controller.md#methods) for the methods that you can use and/or override.

## Source[​](#source "Direct link to Source")

[modules/core/src/controllers/globe-controller.ts](https://github.com/visgl/deck.gl/blob/master/modules/core/src/controllers/globe-controller.ts)
