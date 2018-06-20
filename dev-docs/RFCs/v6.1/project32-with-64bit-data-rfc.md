# RFC: Projection Mode Improvements

* **Authors**: Ib Green and Georgios Karnas
* **Date**: June 2019
* **Status**: Draft

Notes:

## Summary

This RFC proposes adding a new LNG/LAT projection mode that consumes 64bit input data but then uses 32 bit linearized calculations for 90% of 32 bit performance with 90% of 64 bit precision.


## Motivation

Cartographic Projections are a core functionality of deck.gl and projection performance is key to most applications. As we know, naive 32 bit projections fail at high zoom levels. Today we can get good performance in 32 bit projections if we use LNGLAT_OFFSET or METER_OFFSET modes.

This will lead to improved performance for cartographic projection in street level views, without app having to preprocess lng/lat coordinates to offsets or meters, or recalculating deltas on CPU.


## Proposals


### Calculate 64 bit position attributes in 32 bit mode

The idea is not to do full 64 bit shader processing (matrix multiplication). 64 bits will only be used only for an initial center subtraction, the remaining processing can be done in 32 bits.


### Automatic Offset Mode

* The big precision advantages comes when using offset modes, especially if subtractions are local. Could we allow the app to specify a center point and auto calculate offsets? Especially effective combined with previous proposal.

* Center point will need to be communicated to shader as 64 bits.


## Open Issues

* Center Point Selection - should we let the user decide using `coordinateOrigin`. Should we have it default to viewport center. Or both?

* Always calculate 64bit attributes? - We have a fair bit of ugly logic in layers pertaining to conditional calculation of 64 bit attributes. It has improved with the ability to set the low part to 0, but perhaps we should always calculate positions in 64 bit mode?

* Support `Float64Array`? - An interesting side investigation would be looking at JavaScript's native `Float64Array`, to understand how these values break down into 32 bit pieces and how they can be accessed from shaders.
