# Controller

The `Controller` class provides event handling enabling deck.gl applications to let the user update its 'ViewState' instance(s) by interacting with inpurt devices, typically the mouse and the touchscreen.

A specific `Controller` instance defines a certain event interaction model, and handles events within a rectangular area of the screen (both the interaction model and the region would normally correspond to a `Viewport`).

The `Controller` class abstracts event handling on three levels:

1. At the bottom, it leverages the `EventManager` class from the `mjolnir.js` module. This class provides a layer of basic browser-independent event and touch gesture handling.
2. On top of that it defines a set of (redefinable) basic  handlers, that map the events and gestures from mjolnir's EventManager into more visualization-interaction focused "actions" like zoom, pan, rotate etc.
3. Finally it calls a `ViewState` reducers for each "action".

The system is quite configurable:
* Multiple `Controller` subclasses are available to match different `Viewport` and interaction models.
* Custom `Controllers` subclasses can be created from scratch (with more effort)
* An existing `Controller` sublass can be subclassed and refined further.
* Configuring a `Controller` instance.

There are also some options for how to configure the basic `EventManager` using pass-through options.


## Usage

## Properties

##### viewportState (Class Constructor)

#####  state: PropTypes.object (instance)

##### onViewportChange: PropTypes.func,

`onViewportChange` callback is fired when the user interacted with the
map. The object passed to the callback contains viewport properties
such as `longitude`, `latitude`, `zoom` etc.

##### getCursor: PropTypes.func,

Accessor that returns a cursor style to show interactive state


##### controls: PropTypes.shape

A map control instance to replace the default map controls

The object must expose one property: `events` as an array of subscribed

event names; and two methods: `setState(state)` and `handle(event)`


### Event Handling Controls

##### scrollZoom: PropTypes.bool,

Scroll to zoom

##### dragPan: PropTypes.bool,

Drag to pan

##### dragRotate: PropTypes.bool,

Drag to rotate

##### doubleClickZoom: PropTypes.bool,

Double click to zoom

##### touchZoomRotate: PropTypes.bool,

Pinch to zoom / rotate


### Viewport constraints

##### maxZoom: PropTypes.number,

Max zoom level

##### minZoom: PropTypes.number,

Min zoom level

##### maxPitch: PropTypes.number,

Max pitch in degrees

##### minPitch: PropTypes.number,

Min pitch in degrees


## Source

[src/react/viewport-controller.js](https://github.com/uber/deck.gl/blob/4.1-release/src/viewports/viewport.js)
