# RFC - Per-View Controllers for Multiple Views

* **Author**: Ib Green
* **Date**: January 5, 2018
* **Status**: **Implemented**


## Abstract

deck.gl needs an official API for its controller functionality


## Proposed Features

### Restrict Controller Event Handling to match View Size

Controllers need to be able to be restricted to a certain view's area (in terms of event handling). The mouse handling of some controllers might be unrelated to the rendered image in the view (e.g. just detect general gestures like drag up/down). However, e.g. when working with a map controller, the point under the mouse represents a grab point or a reference for the operation especially panning and zooming). It is important that the controller sees events that are relative to its viewport and constrained by its viewport.

Accordingly, mapping event coordinates correctly is imporant for the experience:
* Controllers might not be designed to receive coordinates from outside their viewports, at least not for starting gestures
* On the other hand we likely want to allow gestures that started inside the controller to continue outside the viewport and even the window.

Example:

If the map backing a `MapView` doesn't fill the entire canvas, and the application wants to use a MapController that matches that view, it would simply specify a `viewId`
```js
const deck = new Deck({
  ...,
  views: [new MapView({id: 'map', height: '50%'})],
  controller: [new MapController({viewId: 'map'})],
  viewState: ...
});
```
Remarks:
* Controller size (if no `viewId` could default to first viewport, or full screen.
* Explicit sizing of controllers could be implemented with percentages but is not planned.


### Adjust Controller Event Handling to match View Location

When the origin of the target viewport is not at the origin, the controller should be able to handle this
```js
const deck = new Deck({
  ...,
  views: [new MapView({id: 'map', y: '50%', height: '50%'})],
  controller: [new MapController({viewId: 'map'})],
  viewState: ...
});
```

## Future Features

### Support Multiple Controllers

An application having multiple viewports might want to use different interaction in each viewport - this has a couple of complications but essentially we could support a `Deck.controllers` prop.
```js
const deck = new Deck({
  ...,
  views: [
  	new MapView({id: 'map', height: '50%'})],
  	new FirstPersonView({id: 'firstPerson', y: '50%', height: '50%'})
  ],
  controllers: [new MapController({viewId: 'map'}), FirstPersonView({id: 'first-person'})],
  viewStates: {map: {}, firstPerson: {}} // TBD conceptual - might not be a map
});
```
Remarks:
* `viewState`s must be compatible.


### Switching Between Controllers

An application that wants to switch between Viewports might want to switch between controllers, the main complication is to either pick viewports and controllers that support the same shaope `viewState`, or provide a conversion function, or maintain multiple `viewState`s.


## Concerns

### Transitions

Transitions are handled partially by the `ViewportController` and its React wrapper. Folding the code from the React piece into the `Deck` JS component could be a first step to "port" the transitions.

### react-map-gl Alignment

Backporting of bugs in controllers will be signficantly hard the more deck.gl diverges from react-map-gl. The mjolnir.js repo shares the basic event handling, but the higher level pieces are still duplicated. Any controller change should be accepted by both repository maintainers.


# Possible Plan

- Phase 1: Deck.controller API using existing ViewState classes. handles transitions, make `Deck.controller` temporarily compatible with `ViewState` classes.
- Phase 2: Support new controller classes

Phase 1 `Deck.controller` API using existing ViewState classes.
* Fold `ViewportController` (the React wrapper) into `Deck` (JS Component).
* Get transitions working.
* Let apps use `Deck.controller` props to select (old) `ViewState` subclass.

Phase 2
* Merge the new `Controller` hierarchy classes.
