# Deck.gl Auto Controls RFC

## Summary

Extend the Deck and DeckGL component APIs with a new prop that provides a stateful alternative to the normal stateless `viewState` handling in deck.gl. The intention is that no callback should need to be specified when using deck.gl in simple apps.

## References
* [PR #1662](https://github.com/visgl/deck.gl/pull/1662/files) - Auto Controls: Automatic Event Handling if no callback is specified

## Design Goals
This RFC shoulds NOT change semantics of existing API or apps.
* The auto controls feature is intended for simple applications. The intention is not to make this handle every complication.
* It should always be possible to start using an `onViewStateChange` callback for more advanced use cases, such as using multiple view states or applying custom view state constraints etc.

## Proposed API Changes

* NEW PROP: `Deck.initialViewState` (Object)
* NEW PROP: `DeckGL.initialViewState` (Object)

If initialViewState is provided, the Deck component will track view state changes from any attached controllerusing internal state, with initialViewState as its initial view state.

In simple applications, use of the initialViewState prop can avoid the need track the view state in the application .

Notes:
* The props.onViewStateChange callback will always be called, if provided.
* If props.viewState is supplied by the application, the supplied viewState will always be used, "shadowing" the Deck component's internal viewState.


## Technical Issues

### Notifying React Component of Changes

Currently, when the viewState changes the react component needs to update. This is mainly related to the fact that the React component is doing auto positioning of sub components like submaps. 

#### Long Term Solutions

Port sub component auto positioning to pure JS.

#### Short Term Solutions

Until we have ported sub component auto positioning to pure JS, we need to be able to trigger a react component update:

The open PR takes a slightly hacky approach. It calls the existing onResize callback which triggers a react forceUpdate
The Deck component could simply provide an onUpdate callback for React, that lets react call forceUpdate(). This callback could be used both for this feature and for resize handling.
Alternatively this can be handled inside DeckGL. The React component can provide a onViewStateChangewrapper that calls the user callback and invokes a rerender.
A possible concern is that the forced update is only needed in the auto viewport case. Maybe always doing it doesn't hqve

## Open Issues/Concerns

### Does this RFC Change Semantic Model: Intercept vs Notify?

Xiaoji: This design switches the viewport change callback from an "intercept" model to a "notify" model. It makes applying custom viewport constraints more difficult, such as uber/react-map-gl#442.

Comments:

* The existing viewState, if applied, takes precedence over the internally managed view state. In this sense there is no change to existing model.


Xiaoji: My preference would be using this callback to intercept a view state change, modify state or even cancel the event if needed.

* The intention was that `initialViewState` is for simple use cases only. If the application needs to apply custom constraints, it should absolutely use `viewState` and `onViewStateChange` directly with current semantics. If those props can do the above, then yes.


### Prop naming, How to activate the feature?

Xiaoji: The difference in naming between initialViewState and viewState is not explicit that one makes the map interactive. I'd prefer not to complicate usage by adding yet one more prop if possible.

* Open to suggestions. The initialViewState naming is consistent with a number of stateful/stateless React components developed in the early React days. Unless we add another prop, maybe clearer if we call this one `autoTrackedViewState` instead of `initialViewState`?


## Alternatives

In pure JS, adding a `deck` parameter to `onViewStateChange` and just setting the default `onViewStateChange` value as

`onViewStateChange: ({viewState, deck}) => deck.setProps({viewState})`

should work, however this doesn't work in the React case (violating the "one API" principle).
