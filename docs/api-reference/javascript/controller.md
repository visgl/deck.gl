# Controller (React Component)

`Controller` is a class that wraps the deck.gl `Controls` class.


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

[src/react/viewport-controller.js](https://github.com/uber/deck.gl/blob/5.0-release/src/core/viewports/viewport.js)
