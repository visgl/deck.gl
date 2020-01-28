# RFC: View State RFC

* **Authors**: Ib Green, ...
* **Date**: Sep 2017
* **Status**: Placeholder

Notes:
* This is a highly controversial RFC, not yet clear that there would be a consensus for such a major API change

## Motivation

Enabling applications to easily compose, and switch between, multiple viewports and multiple controllers by making them allow work on a common view state representation.

## Terminology

Discussions around this RFC have been challenged by a confusion around the concepts involved so a brief terminology has been added.

* **View state** - In this discussion, a "view state" is a (currently controller specific) "bundle" or set of parameters that describe the current viewpoint for a specific controller/view pair. It can be lng/lat/etc for a web mercator viewport, or rotationX/rotationY/etc for an orbit controller.

* **ViewState class** - The `ViewState` class is a proposed class that unifies storage of a set of view state parameters so that all controllers and viewports can be used together.


## Idea

The ability to have all `Controller` (and `Viewport`) classes take a common `ViewState` class, defining different interaction modes.

```
  MapController          \              /  WebMercatorViewport
                          \            /
  FirstPersonController ---  ViewState --- FirstPersonViewport   => Viewport => uniforms
                          /            \
  OrbitController        /              \  ThirdPersonViewport
```

This can be seen as the "inverse" of the recently introduced ability to feed of various viewports off the same "map" state.


## Background

A critical step in recent deck.gl development was the Viewport unification resulting from [geospatially enabling all viewports](first-person-mercator-viewport-rfc.md). This unifies the API and capabilities of the various `Viewport` subclasses to a significant extent, in that they can all accept (optionally) a geospatial "anchor" or reference point, and on top of that a "meter" offset linear coordinate system.

This proposal wants to do a similar unification for `Controllers`


# Proposal - a new `ViewState` class

* Unify the "map state"/"controller state" requirements so that all controllers can take all states as parameters (just like with viewports, some controllers may not be able to interpret all `ViewState` data, but it will still be able to control something "reasonable").

TBD exact properties:
* geospatial anchor: lng/lat + zoom... (optional)
* position (meter offsets)
* direction (angles and distance/vector)

ViewState will need to offer different interfaces (bearing/pitch, and direction - already supported by math.gl classes).


### Switching Controllers

One could imagine the application to switch both controllers and viewport classes when switching between "modes". This will become trivially easy once we have a common `ViewState` class.


### Multiple Controllers

In a scenario where the application has multiple viewports, it would be nice to be able to mouse/touch interact with each viewport separately.

* mouse capture - should be handled by mjolnir.js...
* keyboard input - do we allow more than one? do we offer a prop to set focus?

Controller input areas can be matched to viewports in the same way that the deck.gl component resizes its children using `viewId` props.


### Multiple View States


### Animation Integration

* Viewport animation control. The controller architecture needs to be unified with the animation support that is currently in development.


### React Controllers

Per the direction to make deck.gl usable without React, React controllers will be minimal wrappers over ES6


### Interface

To keep the API simple, we want to keep the interface as props to the DeckGL component
```
constructor(props) {
  ...
  this.state = {
  	viewState1: new ViewState(...),
   	viewState2: new ViewState(...),
  }
}

onViewStateChanged(viewState) {
  if (viewState.id === 'firstPerson') {
  	this.setState(state1: viewState);
  } ...
}

render() {
  const {viewState1, viewState2} = this.props;

  const controllers = {
    new MapController(viewState1),
    new FirstPersonController(viewState1), // Controls same view as above
    new FirstPersonController(viewState2)  // Controls a different view
  };
  const Viewports = {
    new WebMercatorViewport(viewState1),
    new FirstPersonViewport(viewState1), // Controls same view as above
    new FirstPersonViewport(viewState2)  // Controls a different view
  }

  <DeckGL controllers={controllers} viewports={viewports} layers={[]}>
    <StaticMap />
  </DeckGL>
}
```


Remarks:
* A limitation of putting the controllers inside the DeckGL component is animation, as it only affects react components that are children of deck.gl. If some part of the UI outside of DeckGL wanted to update by animation, it would either not work, or a flash would be visible as the DeckGL component fails to intercept the first changed value.



### Remaining Work

The separation between Viewports / State / Controls / React Controllers is very demanding. A long line of preparatory PRs have reduced the amount of duplicated code, to simplify work in this area.
