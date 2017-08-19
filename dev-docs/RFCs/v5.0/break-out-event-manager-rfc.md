# RFC: Break out Event Manager

* **Author**: Ib Green & ?
* **Date**: Aug, 2017
* **Status**: Draft


## Motivation

The [Event Handling RFC]() that led to the development of the `EventManager` class starts with describing the duplicated event handling we have in deck.gl and react-map-gl, and in an extended sense in luma.gl.

It is obvious that `EventManager` is of general interest (a solid extension of Hammerjs that handles touch AND pointer gestures, as well as other events in a unified, cross-browser architecture). So `event-manager` could clearly get its own repository and module.


## Proposal: break out event-manager into separate module

WORK
* Create module
* Document
* Create web-site
* Update deck.gl
* Update react-map-gl


## Proposal: Replace luma.gl event handling with EventManager

The legacy event handling in luma.gl duplicates most of `EventManager`'s functionality. At a time when we are facing concerns about the size of our framework stack, duplicated functionality is something we want to avoid.

Open Questions:
* Could luma.gl's event handling be replaced with `EventManager`?
* Maybe luma has no event handling, and examples include EventManager directly?
* Or should we integrate EventManager with AnimationLoop, for the ultimate convenience?
* Should we write a simple wrapper that emulates `addEvents` interface - at least until we make a major luma.gl version bump?
* Should we just bump luma.gl to 5.0? It doesn't have that many non-deck.gl users.


## Open Issues

These issues should be sorted before this RFC is approved

### Should MapControllers or related components be broken out, and how?

The open question is how to handle the map controller pieces that are shared between deck.gl and react-map-gl. Having to regularly add fixes in two places is frustraing. But they are much more special purpose than `EventManager`.

- They don't really fit into an event-manager repo.
- Putting them in viewport-mercator-project is also
- Creating its own repo for them feels like going a little too far into the micro-repo world
- What is the practical cost of keeping duplication.

