# EventManager

Provides a unified API for subscribing to events about both basic input events (e.g. 'mousemove', 'touchstart', 'wheel') and gestural input (e.g. 'click', 'tap', 'panstart').



## Usage

TBD: Module packaging (npm?)


```
import EventManager from 'event-manager';

const eventManager = new EventManager(domElement);
function onClick (event) {}
function onPointerMove (event) {}

eventManager.on({
  click: onClick,
  pointermove: onPointerMove
});

// ...
eventManager.destroy();
```

__Note:__ While EventManager supports mouse and touch events, we recommend the use of [Pointer Events](https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events) when possible for the broadest input device compatibility.



## Methods

### constructor

Creates a new `EventManager` instance.

`new EventManager(element, {events, recognizers})`

*  `element` {DOM Element} - DOM element on which event handlers will be registered.
*  `options` {Object} -  Options
*  `options.events` {Object} -  Map of {event name: handler} to register on init.
*  `options.recognizers` - {Object}  Gesture recognizers from Hammer.js to register, as an Array in [Hammer.Recognizer format](http://hammerjs.github.io/api/#hammermanager)


### destroy

Tears down internal event management implementations.

`eventManager.destroy()`

Note: It is important to call `destroy` when done since `EventManager` adds event listeners to `window`.


### on

Register an event handler function to be called on `event`.

`eventManager.on(event, handler)`

* `event` {string|Object} - An event name (`String`) or map of event names to handlers.
* `[handler]` {Function} - The function to be called on `event`.


### off

* Deregister a previously-registered event handler.

`eventManager.off(event, handler)`

* `event` {string|Object} - An event name (String) or map of event names to handlers
* `[handler]` {Function} - The function to be called on `event`.



## Event objects

Event handlers subscribed via [`EventManager.on()`](#user-content-on) will be called with one parameter. This event parameter always has the following properties:

* `type` (string) -  The event type to which the event handler is subscribed, e.g. `'click'` or `'pointermove'`
* `center` (Object `{x, y}`) - The center of the event location (e.g. the centroid of a touch) relative to the viewport (basically, [`clientX/Y`](https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/clientX))
* `offsetCenter` (Object `{x, y}`) - The center of the event location (e.g. the centroid of a touch)
* `target` (Object) - The target of the event, as specified by the original `srcEvent`
* `srcEvent` (Object) - The original event object dispatched by the browser to the JS runtime

Additionally, event objects for different event types contain a subset of the following properties:

* `key` (number) - The keycode of the keyboard event
* `isDown` (boolean) - Flag indicating whether an input button is down during the event
* `pointerType` (string) - A string indicating the type of input (e.g. `'mouse'`, `'touch'`, `'pointer'`)
* `delta` (number) - The scroll magnitude/distance of a wheel event



## Supported Events and Gestures

### Native input events
- `'click'`
- `'keydown'`
- `'keyup'`
- `'mousedown'`
- `'mousemove'`
- `'mouseup'`
- `'mouseleave'`
- `'pointerdown'`
- `'pointermove'`
- `'pointerup'`
- `'touchstart'`
- `'touchmove'`
- `'touchend'`
- `'wheel'`
- `'mousewheel'`
- `'DOMMouseScroll'`


### Gesture events
- `'tap'`
- `'doubletap'`
- `'press'`
- `'pan'`
- `'panstart'`
- `'panmove'`
- `'panup'`
- `'pandown'`
- `'panleft'`
- `'panright'`
- `'panend'`
- `'pancancel'`
- `'pinch'`
- `'pinchin'`
- `'pinchout'`
- `'pinchstart'`
- `'pinchmove'`
- `'pinchend'`
- `'pinchcancel'`
- `'rotate'`
- `'rotatestart'`
- `'rotatemove'`
- `'rotateend'`
- `'rotatecancel'`
- `'swipe'`
- `'swipeleft'`
- `'swiperight'`
- `'swipeup'`
- `'swipedown'`



## Event handling shims

`EventManager` currently uses Hammer.js for gesture and touch support, but Hammer.js does not support all input event types out of the box. Therefore, `EventManager` employs the following modules to shim the missing functionality:


### KeyInput

Handles keyboard events.


### MoveInput

Handles pointer/touch/mouse move events while no button pressed, and leave events (for when the cursor leaves the DOM element registered with `EventManager`).


### WheelInput

Handles mouse wheel events and trackpad events that emulate mouse wheel events. Note that this module is stateful: it tracks time elapsed between events in order to determine the magnitude/scroll distance of an event.



## Remarks

* Current implementation delegates touch and gesture event registration and handling to Hammer.js. Includes shims for handling event not supported by Hammer.js, such as keyboard input, mouse move, and wheel input. This dependency structure may change in the future.

* Hammer.js unsafely references `window` and `document`, and so will fail in environments without these constructs (e.g. Node). To mitigate this, Hammer.js modules are conditionally `require()`d, and replaced with mocks in non-browser environments.
