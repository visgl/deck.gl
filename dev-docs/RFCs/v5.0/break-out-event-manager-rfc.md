# RFC: Break out Event Manager

* **Author**: Ib Green & Xiaoji Chen
* **Date**: Aug, 2017
* **Status**: **Imlemented**


## Motivation

The [Event Handling RFC]() that led to the development of the `EventManager` class starts with describing the duplicated event handling we have in deck.gl and react-map-gl, and in an extended sense in luma.gl.

It is obvious that `EventManager` could be of general interest (being a solid extension of Hammer.js that handles both touch gestures and pointer events, as well as other events in a unified, cross-browser architecture). So it seems reasonable that `event-manager` could deserve its own repository and module.


## Step 1: break out deck.gl EventManager into separate module

**Naming**: Proposal `mjolnir.js` - a kind of indirect homage to `hammer.js`.

**Tests**: already has a strong test suite
**Documentation**: Use `ocular`. Reference documentation partly in place. Some Usage docs would be good.
**Examples**: At least one example would be valuable that works on desktop and mobile.


Detailed scope: The initial breakout covers:
* the event-manager and its internal classes (key-input, wheel-input etc)
* test cases
* documentation.
It does not include any controller related code (see below).


## Step 2: Replace react-map-gl event handling with new module

This should happen as soon as the new module is published.


## Appendix: What should be included in event-manager

Not formally a part of this RFC: Should MapControllers or related components be broken out, and how?

The biggest open question is perhaps how to handle the map controller pieces that are shared between deck.gl and react-map-gl. Having to regularly add fixes in two places is frustraing. But they are more special purpose than `EventManager`.

- They don't really fit into an event-manager repo.
- Putting them in viewport-mercator-project is also
- Creating its own repo for them feels like going a little too far into the micro-repo world
- What is the practical cost of keep these duplicated?


## Appendix: Replace luma.gl event handling with EventManager?

Not formally a part of this RFC: luma.gl could also use the new module.

The legacy event handling in luma.gl duplicates most of `EventManager`'s functionality. At a time when we are facing concerns about the size of our framework stack, duplicated functionality is something we want to avoid.

Open Questions:
* Could luma.gl's event handling be replaced entirely with `EventManager`?
* Maybe luma has no event handling, and examples include EventManager directly?
* Or should we integrate EventManager with AnimationLoop, for the ultimate convenience?
* Should we write a simple wrapper that emulates `addEvents` interface - at least until we make a major luma.gl version bump?
* API compatibility? Should we just bump luma.gl to 5.0? It doesn't have that many non-deck.gl users.
