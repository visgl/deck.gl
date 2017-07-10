# IMLEMENTATION NOTES

These are notes moved out from comment sections in the source.


## Why new layers are created on every render

The key here is to understand the declarative / functional programming nature of "reactive" applications.

- In a reactive application, the entire "UI tree" is re-rendered every time something in the application changes.
- The UI framework (such as React or deck.gl) then diffs the rendered tree of UI elements (React Elements or deck.gl Layers) against the previously tree and makes optimized changes (to the DOM or to WebGL state).
- deck.gl layers are not based on React. But it should be possible to wrap deck.gl layers in React components to enable use of JSX.

The deck.gl model that for the app creates a new set of on layers on every render. Internally, the new layers are efficiently matched against existing layers using layer ids.

All calculated state (programs, attributes etc) are stored in a state object and this state object is moved forward to the match layer on every render cycle.  The new layer ends up with the state of the old layer (and the props of the new layer), while the old layer is simply discarded for
garbage collecion.

