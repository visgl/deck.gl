# Controller

The base class for all viewport controllers.

A controller class can be passed to either the `Deck` class's [controller](./deck.md#controller) prop or a `View` class's [controller](./view.md#controller) prop to specify viewport interactivity.


## Options

The base Controller class supports the following options:

* `scrollZoom` (boolean | object) - enable zooming with mouse wheel. Default `true`. If an object is supplied, it may contain the following fields to customize the zooming behavior:
  + `speed` (number) - scaler that translates wheel delta to the change of viewport scale. Default `0.01`.
  + `smooth` (boolean) - smoothly transition to the new zoom. If enabled, will provide a slightly lagged but smoother experience. Default `false`.
* `dragPan` (boolean) - enable panning with pointer drag. Default `true`
* `dragRotate` (boolean) - enable rotating with pointer drag. Default `true`
* `doubleClickZoom` (boolean) - enable zooming with double click. Default `true`
* `touchZoom` (boolean) - enable zooming with multi-touch. Default `true`
* `touchRotate` (boolean) - enable rotating with multi-touch. Use two-finger rotating gesture for horizontal and three-finger swiping gesture for vertical rotation. Default `false`
* `keyboard` (boolean | object) - enable interaction with keyboard. Default `true`. If an object is supplied, it may contain the following fields to customize the keyboard behavior:
    * `zoomSpeed` (number) - speed of zoom using +/- keys. Default `2`.
    * `moveSpeed` (number) - speed of movement using arrow keys, in pixels.
    * `rotateSpeedX` (number) - speed of rotation using shift + left/right arrow keys, in degrees. Default `15`.
    * `rotateSpeedY` (number) - speed of rotation using shift + up/down arrow keys, in degrees. Default `10`.
* `dragMode` (string) - drag behavior without pressing function keys, one of `pan` and `rotate`.
* `inertia` (boolean | number) - Enable inertia after panning/pinching. If a number is provided, indicates the duration of time over which the velocity reduces to zero, in milliseconds. Default `false`.

## Methods

> A controller is not meant to be instantiated by the application. The following methods are documented for creating custom controllers that extend the base Controller class.

##### constructor

```js
import {Controller} from 'deck.gl';

class MyController extends Controller {
  constructor(props) {
    super(props);
  }
}
```

The constructor takes one argument:

* `props` (object) - contains the following options: 
  * `eventManager`- handles events subscriptions
  * `makeViewPort (viewState)` - creates new `Viewport` based on provided `ViewState`, and current view's `width` and `height`
  * `onStateChange` callback function
  * `onViewStateChange` callback function
  * `timeline` - an instance of `luma.gl` [animation timeline class](https://github.com/visgl/luma.gl/blob/d5bd93ef6bd0a0ff4af7880424286bda269e29a8/dev-docs/RFCs/v7.1/animation-timeline-rfc.md)


#### `handleEvent(event)` {#handleevent}

Called by the event manager to handle pointer events. This method delegate to the following methods to handle the default events:

* `_onPanStart(event)`
* `_onPan(event)`
* `_onPanEnd(event)`
* `_onPinchStart(event)`
* `_onPinch(event)`
* `_onPinchEnd(event)`
* `_onMultiPanStart(event)`
* `_onMultiPan(event)`
* `_onMultiPanEnd(event)`
* `_onDoubleTap(event)`
* `_onWheel(event)`
* `_onKeyDown(event)`

See [Event object documentation](https://uber-web.github.io/mjolnir.js/docs/api-reference/event).


#### `setProps(props)` {#setprops}

Called by the view when the view state updates. This method handles adding/removing event listeners based on user options.

#### `updateViewport(newMapState, extraProps, interactionState)` {#updateviewport}

Called by the event handlers, this method updates internal state, and invokes `onViewStateChange` callback with a new map state.

#### `getCenter(event)` {#getcenter}

Utility used by the event handlers, returns pointer position `[x, y]` from any event.

#### `isFunctionKeyPressed(event)` {#isfunctionkeypressed}

Utility used by the event handlers, returns `true` if ctrl/alt/meta key is pressed during any event.

#### `isPointInBounds(pos, [event])` {#ispointinbounds}

Utility used by the event handlers, returns `true` if a pointer position `[x, y]` is inside the current view.

If `event` is provided, returns `false` if the event is already handled, and mark the event as handled if the point is in bounds. This can be used to make sure that certain events are only handled by one controller, when there are overlapping viewports.

#### `isDragging()` {#isdragging}

Returns `true` if the user is dragging the view.


## Example: Implementing A Custom Controller

```js
import {Controller} from 'deck.gl';

class MyController extends Controller{
  constructor(props) {
    super(props);
    this.events = ['pointermove'];
  }

  handleEvent(event) {
    if (event.type === 'pointermove') {
      // do something
    } else {
      super.handleEvent(event);
    }
  }
}
```

In its constructor, a controller class can optionally specify a list of event names that it subscribes to with the `events` field. A full list of supported events can be found [here](https://uber-web.github.io/mjolnir.js/docs/api-reference/event-manager#supported-events-and-gestures).

Note that the following events are always toggled on/off by user options:

* `scrollZoom` - `['wheel']`
* `dragPan` and `dragRotate` - `['pan']`
* `touchZoom` - `['pinch']`
* `touchRotate` - `['pinch', 'multipan']`
* `doubleClickZoom` - `['doubletap']`
* `keyboard` - `['keydown']`


## Source

[modules/core/src/controllers/controller.ts](https://github.com/visgl/deck.gl/blob/master/modules/core/src/controllers/controller.ts)
