# RFC: Property Animation

* **Authors**: Ib Green
* **Date**: Aug 2017
* **Status**: Early draft, not ready for formal review.

Notes:


## Motivation

Some applications will load data and display it multiple times, perhaps as part of an animation loop. If they keep feeding in the original data arrays to the layer in the loop, the layer will keep regenerating vertex attributes again and again.

Some application may also just want to front-load the attribute generation cost, or perhaps wire up a worker to generate the attributes.


## Proposal

The deck.gl `AttributeManager` already has a well-defined [public API]() By making each layer's `AttributeManager` accessible to the application, so that it can run data arrays through the attribute manager and "harvest" and store the resulting typed arrays for quick animation later


## Questions