# EventManager

Provides a unified API for subscribing to events about both basic input events (e.g. 'mousemove', 'touchstart', 'wheel') and gestural input (e.g. 'click', 'tap', 'panstart').

## Usage

TBA


## Methods

### constructor

Creates a new `EventManager` instance.

`new EventManager(element, {events, recognizers})`

*  `element` {DOM Element} - DOM element on which event handlers will be registered, it is common to pass a canvas element.
*  `options` {Object} -  Options
*  `options.events` {Object} -  Map of {event name: handler} to register on init.
*  `options.recognizers` - {Object}  Gesture recognizers from Hammer.js to register, as an Array in [Hammer.Recognizer format](http://hammerjs.github.io/api/#hammermanager)


### destroy

Tears down internal event management implementations.

`eventManager.destroy()`

Note: It is important to call `destroy` when done since `EventManager` and hammer add event listeners to `window`.


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

TBA


## Remarks

* Current implementation delegates touch event registration and handling to Hammer.js. This may change in the future.
