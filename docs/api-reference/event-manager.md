# EventManager

Provides a unified API for subscribing to events about both basic input events (e.g. 'mousemove', 'touchstart', 'wheel') and gestural input (e.g. 'click', 'tap', 'panstart').

Delegates gesture-related event registration and handling to Hammer.js. Includes shims for handling event not supported by Hammer.js, such as keyboard input, mouse move, and wheel input.

## Usage

TBA

(What is the intent of this section? Install/import instructions?)



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

Note: It is important to call `destroy` when done since `EventManager` and Hammer.js add event listeners to `window`.


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



## Supported Events and Gestures

As of the time of this writing, the following event and gesture names are supported. Refer to [`constants.js`](../../src/controls/events/event-manager.js) for the most current support.

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

Hammer.js does not support all event types out of the box. Therefore, `EventManager` employs the following modules to shim the missing functionality:


### KeyInput

Handles keyboard events.


### MoveInput

Handles pointer/touch/mouse move events while no button pressed, and leave events (for when the cursor leaves the DOM element registered with `EventManager`).


### WheelInput

Handles mouse wheel events and trackpad events that emulate mouse wheel events. Note that this module is stateful: it tracks time elapsed between events in order to determine the magnitude/scroll distance of an event.



## Remarks

* Current implementation delegates touch and gesture event registration and handling to Hammer.js. This may change in the future.

* Hammer.js unsafely references `window` and `document`, and so will fail in environments without these constructs (e.g. Node). To mitigate this, Hammer.js modules are conditionally `require()`d, and replaced with mocks in non-browser environments.
