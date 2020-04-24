# RFC: Event Handling

* **Author**: Ib Green, Xiaoji Chen, Eric Socolofski, Shaojing Li and others
* **Date**: April 2017
* **Status**: **Approved And Implemented**

Notes:
* Approved as a general direction for development
* Implemented in parts, used internally by deck.gl 4.1
* Available to apps as "experimental" exports in deck.gl 4.1
* Expected to be part of official API in deck.gl v4.2 or v5.


Note: This was copy pasted from a google doc, so formatting needs some work.

## Summary

We are currently building up about 4 or 5 different almost identical event handling systems (luma.gl, react-map-gl’s new InteractiveMap and StaticMap, deck.gl viewport controllers and main component).

Some of this event handling is for viewport interaction (essentially manipulating the view matrix) and some event handling is for model interaction (hovering/clicking/dragging) features.

These event handling solutions will all eventually need the same features and bug fixes (touch event support, support screen offset relative coordinates, etc), so duplicating code in so many places is an issue.

The user will want to compose and customize these event handlers in flexible ways. If we have 5 different implementations with subtly different APIs and behaviours, this will not help.

How will these event handlers interact? If a user embeds a model interaction handler that supports dragging data in a viewport controller that also supports dragging (but for panning or rotating), will (should?) the model interaction handler still get called?

This RFC was created because there now seems to be an opportunity to come up with a clean event handling architecture that covers all cases and shares code and principles.

The alternative is that we keep making incremental improvements in all of these places and end up with a patchwork of slightly different APIs with different capabilities and bugs.


### Efforts that could be Unified

For deck.gl v5 etc, there are a number of development tracks that relate to event handling for our mapping/infovis framework stack.
* In deck.gl v4 (based on the now implemented Viewport Support for Infovis RFC) we added a set of interchangeable viewports in deck.gl, that extends deck.gl to support non-geospatial use cases.
* To support event handling for these new Viewports, we have started to create controller classes/components (e.g. OrbitController).
react-map-gl v3 (currently in alpha) now separates event handling from the map component. The event handling is completely implemented by us, and is based on
* A generic DOM event layer
* An Event control component in React (that could be split into an ES6 controller and a trivial react component)
* luma.gl has long supported generic event handling (inherited from PhiloGL), that was recently improved by a community PR.
* A PR on deck.gl

### Desired Features

* Strong support for event handling in our frameworks
    * Intuitive classes (React, ES6), easy to understand and use with little configuration
    * Composable: easy to combine event handling from different frameworks/components.
    * Extensible solution, easy to customize for apps
    * Overridable, in cases where the default event handling is not desired
* Shared code and architecture
    * To ensure that features (e.g. touch gesture support) and bug fixes (e.g. event coordinate relative offsets) need to be implemented only once.
* Independent of external components (i.e. no dependency on mapbox-gl’s internal event handling)
    * removing the base map from an app should not remove event handling.
    * Move a codebase from geospatial to infovis should not cause a redesign of the application.

### Problems with Current Solutions

* interaction between controllers handling the same events
* touch vs mouse
* deck.gl is supposed to be react independent - should we keep building event handling on the React layer or work directly on the DOM (the later is intended direction for new viewport controllers).

## Proposal: Divide event handling into three "layers"

1. **DOM Event Handling** - Registration of DOM events, touch handling+gestures, scroll wheel/touchpad
1. **Viewport Event Handling** - A family of controllers that listen to events and update viewport parameters
1. **Model Event Handling** - Objects that listen to events and allow selection/interaction of model data

All of the above should be completely reusable ES6 classes. On top of this we’d provide:
* React wrappers for viewport controllers (Maybe a single wrapper can handle any controller)?
* React wrappers for model event handling (DeckGL component, StaticMap component etc)

### Chaining
Note that the event model must support chaining:
* ReactController -> Viewport Event Controller -> DeckGL Model Events -> Map Model Events


### Proposal: DOM Event Handling via EventManager class

Event registration class:
* Contains logic of wiring up events with the DOM (react independent).
* Makes touch and mouse events work the same way (single callback)
* Implements basic touch gestures (zoom and rotate) and calls same callbacks as for mouse
* Implements support for scroll wheel and distinguishes touch pad and scroll wheel.
* Normalizes event parameters
* Any browser/platform specific hacks

Event handler registration code is currently duplicated in luma.gl, deck.gl and react-map-gl, and keeps getting duplicated in new efforts.

This is the event manager from `react-map-gl`

```js
export default class EventManager {
  constructor(canvas, {
    onMouseMove = noop,
    onMouseClick = noop,
    onMouseDown = noop,
    onMouseUp = noop,
    onMouseRotate = noop,
    onMouseDrag = noop,
    onTouchStart = noop,
    onTouchRotate = noop,
    onTouchDrag = noop,
    onTouchEnd = noop,
    onTouchTap = noop,
    onZoom = noop,
    onZoomEnd = noop,
    mapTouchToMouse = true,
    pressKeyToRotate = false
  } = {}) {
    ...
  }
}
```

If Touch handlers not provided, touch events will call Mouse event handlers, simplifying app.

### Observations

* 90% users want event handling for free so we need good default event handling setup.
* 5% of users won’t be happy whatever we do so good if we can make our system replaceable with reasonable effort.
* Browser compatibility can be significant work -- and hard to test outside of our regular dev environment (especially IE and Android).
* Using some existing supported DOM event registration system (even just React’s synthetic events) will free us from chasing down endless bugs on other platforms.
* If we implement DOM event handling this should absolutely be shared code - no reason to implement (and fix bugs twice). Either as a separate repo, or just as a separate module from a future “monorepo” version of luma.gl.
* Existing DOM Event Handlers


## Remarks

* It is possible that there is an existing npm event handling module on just the right abstraction level that we could use. But we seem to already have implemented what we need several times over so maybe we should just keep ownership of this important piece of the stack, unless integrating with the module in question has a value to developers (familiarity etc)...
* An experiment replacing our EventManager with hammer.js: https://github.com/visgl/react-map-gl/compare/hammer?expand=1
* hammer.js handles pointer events perfectly but is missing wheel and keyboard input. In the above code I extended the built-in PointerEventInput class to add mouse wheel event handler.
* EventManager should use the Factory pattern. Note that neither of the following conditions may end up as requirements, but implementing EventManager as a factory rather than just instantiating each use directly gives us flexibility to handle these and other cases:
* It can maintain a Singleton if necessary, e.g. to manage conflicts that might arise from multiple EventManager instances each attaching handlers to Window for some event types (mousemove, keydown, etc)
* It can manage multiple instances if necessary, e.g. negotiating between EventManager instances created by deck.gl and react-map-gl within a single application, multiple registrants on the same DOM element
* EventManager will instantiate a Hammer.Manager as shown in Xiaoji’s example above. However, extending PointerEventInput will break some cross-browser / cross-input device support; createInputInstance intelligently chooses an input based on device/browser support, so we need to find a way to leverage that. * Maybe we mix in wheel support instead of extending directly. Note also that we probably don’t have to implement our own init()/destroy()/handler() methods, we just add to this.evEl and let Hammer manage event bindings.

## Viewport Event Handling

Based on the Viewport Support for Infovis RFC we have now implemented) a set of interchangeable viewports in deck.gl, that extends deck.gl to support non-geospatial use cases. 

There are different controllers:
* An orbit controller allows the user to rotate around a sphere.
* A panning controller
* As an example THREE.js supports the following controllers: keyscontrols / deviceorientationcontrols / flycontrols / orbitcontrols / pointerlockcontrols / trackballcontrols

All controllers should be able to generate a basic Viewport and can be used for infovis
* Some controllers can spit out mercator parameters and a MercatorViewport and can be used for geospatial

## Proposal: ES6 Controller Classes (Viewport Event Handling)

Controllers work with the state roundtrip paradigm (they take a couple of parameters, listen to events, call a callback with updated parameters). These classes should not deal directly with user input events, but handle semantic transforms of the viewports.  Because the controllers are so generic (React independent) they could potentially be moved to luma.gl. (luma.gl/src/controllers, deck.gl could add some in deck.gl/src/controllers).

```js
export default class MercatorControlState {

  static propTypes = {
    width: PropTypes.number.isRequired, // The width of the map
    height: PropTypes.number.isRequired, // The height of the map
    latitude: PropTypes.number.isRequired, // The latitude of the center of the map.
    longitude: PropTypes.number.isRequired,  // The longitude of the center of the map.
    zoom: PropTypes.number.isRequired, // The tile zoom level of the map.
    bearing: PropTypes.number, // Specify the bearing of the viewport
    pitch: PropTypes.number, // Specify the pitch of the viewport
    altitude: PropTypes.number, // Altitude of viewport camera. Unit: map heights, default 1.5

    maxZoom: PropTypes.number,
    minZoom:
    maxPitch:
    minPitch:

    startDragLngLat: PropTypes.arrayOf(PropTypes.number), // Position when current drag started
    startBearing: PropTypes.number, // Bearing when current perspective drag started
    startPitch: PropTypes.number, // Pitch when current perspective drag operation started
  };

  // Returns an Viewport instance
  getViewport() {}

  // Returns a new state object for chaining
  panStart() {}
  pan() {}
  panEnd() {}
  rotateStart() {}
  rotate() {}
  rotateEnd() {}
  zoomStart() {}
  zoom() {}
  zoomEnd() {}
}
```

```js
export default class OrbitControllerState {

  static propTypes = {
    // target position
    lookAt: PropTypes.arrayOf(PropTypes.number),
    // camera distance
    distance: PropTypes.number.isRequired,
    minDistance: PropTypes.number,
    maxDistance: PropTypes.number,
    // rotation
    rotationX: PropTypes.number,
    rotationY: PropTypes.number,
    // field of view
    fov: PropTypes.number,
    // viewport width in pixels
    width: PropTypes.number.isRequired,
    // viewport height in pixels
    height: PropTypes.number.isRequired
  };

  // Returns an Viewport instance
  getViewport() {}

  // Returns a new state object for chaining
  panStart() {}
  pan() {}
  panEnd() {}
  rotateStart() {}
  rotate() {}
  rotateEnd() {}
  zoomStart() {}
  zoom() {}
  zoomEnd() {}
}
```


## Proposal: React Controller Components (Viewport Event Handling)

These are built as trivial wrappers over the ES6 controllers. They just create a transparent div and pass it to the controller component which installs events using a DOM API. Almost all the logic go into the ES6 class, and the React component is rather small. These components render the dom element and translate DOM events (emitted from EventManager) to viewport events (transform calculated by ControllerState classes), and invoke user callbacks. This allows us to build components that can be easily extended for scenarios like:
* Toggle features on/off (scroll to zoom, rotate, etc)
* Change key mappings (swap left/right drag, press key to rotate, keyboard navigation, etc)
* Use a custom event manager
* Add custom callbacks

```js
export default class MercatorController {
  static propTypes = {
    controllerState: PropTypes.instanceOf(MercatorControllerState).isRequired,

    /** event handling toggles, parity of Mapbox */
    dragPanEnabled: PropTypes.bool,
    dragRotateEnabled: PropTypes.bool,
    scrollZoomEnabled: PropTypes.bool,
    keyboardEnabled: PropTypes.bool,
    doubleClickZoomEnabled: PropTypes.bool,

    /**
      * `onChangeViewport` callback is fired when the user interacted with the
      * map. The object passed to the callback contains `latitude`,
      * `longitude` and `zoom` and additional state information.
      */
    onChangeViewport: PropTypes.func,

    /**
      * Is the component currently being dragged. This is used to show/hide the
      * drag cursor. Also used as an optimization in some overlays by preventing
      * rendering while dragging.
      */
    isHovering: PropTypes.bool,
    isDragging: PropTypes.bool
  };

  componentDidMount() {
    // Register event handlers on the canvas using the EventManager helper class

    this._eventManager = new EventManager(...);
  }

  _onDragStart(event) {
    const newMapState = this.props.controllerState.panStart({pos}).zoomStart({pos});
    this._updateViewport(newMapState);
  }

  _onDrag(event) {}
  _onPinch(event) {}
  _onWheel(event) {}
  ...

}
```

Most of these components would go into deck.gl/src/react. One would go into react-map-gl/src/components. They should be very compatible and based on the same luma.gl EventManager class.

### Questions

* Should the React component create a deck.gl Viewport or should the controller do it?

## Model Event Handling

In react-map-gl we have StaticMap which handles mapbox interaction events (still passing the click events to mapbox, even though we no longer pass in viewport events).

In deck.gl we have the DeckGL React component which handles the events but this makes it harder to do non-react integrations with deck.gl

Consider implementing the event handling in the LayerManager and have the React component pass in its canvas for event registration.

Base event handling registration - build on same click handlers as the Viewport Event Handling to make things simple?


### Work Breakdown
* luma.gl 4.0 - Propose a common event handling solution- evaluate our own solutions vs. Hammer.js etc
* luma.gl 4.0 - Decide where to put the core event handling solution: luma.gl monorepo, new separate repo, new utils monorepo.
* react-map-gl 3.0 Solve event forwarding / event separation
* react-map-gl 3.0 Update with all fixes from deck.gl
* deck.gl-4.1 - update OrbitController to use new core event handling
* deck.gl-4.1 - copy MercatorController from react-map-gl
* deck.gl-4.1 - separate controllers from React - new React component to wrap ES6 controllers.
( deck.gl-4.1 -  separate model event handling from DeckGL React component and move it to the new core event handler.
* Start writing docs for the various classes
* Settle on a test strategy for event handling


## Event Handling User’s Guide (Proposal)

Note: Ultimately we will need to document everything we discuss in this RFC so we might as well write down the proposal in a form that can be used as a user’s guide


* ReactController -> Viewport Event Controller -> DeckGL Model ( * Events -> Map Model Events
* DOM Event Handling



## From May 5 2017

recap of action items:
* ES: add queryRenderedFeatures-style functionality to layer-managerto allow applications to handle events themselves and run picking on an arbitrary point/bbox. deck.gl will (later) use this feature for event-based picking under the hood.
* XC: implement event-manager in react-map-gl to provide unified API for gesture and "basic" event handling; leverage hammer.js' Recognizers for gestural events. ES to provide proof-of-concept code for automatically managing recognizers when a subscriber registers on a given event name.
* Future: fix event handling in deck.gl. When EventManager is ready to bring over from step #2, refactor event handling from deckgl.js to layer-manager.js and use EventManager, and fix current event handling problems. ES will write up a deck.gl issue to track this.
