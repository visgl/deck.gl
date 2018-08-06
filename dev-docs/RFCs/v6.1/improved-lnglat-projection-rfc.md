# RFC: Improved 32-bit LNGLAT projection mode

* **Authors**: Ib Green and Georgios Karnas
* **Date**: June 2018
* **Status**: **Implemented**

Notes:

## Summary

This RFC proposes enhancing the "32-bit" `COORDINATE_SYSTEM.LNGLAT` projection mode so that it automatically switches to offset based polynomial approximation at higher zoom levels. The required changes are: 1) calculation of 64bit "low" `position` attributes even in 32 bit mode, and 2) the introduction of auto offset calculation in the shader using 64 bit subtraction and normalization. The expected result is to get (close to) 32 bit performance with (close to) 64 bit precision at all zoom levels.


## Motivation/Background

Cartographic Projections are a core functionality of deck.gl and projection performance is key to most applications.
* As we know, naive 32 bit projections fail at high zoom levels.
* Workaround 1: `fp64` has a major performance impact, both on shader execution and shader compilation times.
* Workaround 2: `LNGLAT_OFFSETS` solves the `fp64` perf issues, but at a cost: It can pose a major inconvenience (and recurring perf hit) for the application as it has to calculate (and may have to keep recalcuating) the lnglat offsets depending on center point.

So the goal is improved performance for cartographic projection of LNGLAT coordinates in e.g. street level views, without app having to preprocess lng/lat coordinates to offsets or meters, or recalculating deltas on CPU.


## Proposed Changes

The changes concern projection of layers with `props.coordinateSystem=COORDINATE_SYSTEM.LNGLAT`, in **non-fp64** mode:

* Calculate 64 bit position attributes even when using 32 bit shader.
* If zoom level is less than a threshold (12), use current 32-bit web mercator projection.
* If zoom level is above the threshold, switch to using polynomial approximation as currently used by `COORDINATE_SYSTEM.LNGLAT_OFFSETS`, however automatically calculate the delta using 64 bit subtraction from a center point (see below).


### 64 bit position attributes

* **64bit posititon attributes** - Always calculate 64bit position attributes when `coordinateSystem` is `COORDINATE_SYSTEM.LNG_LAT` (i.e. regardless of `fp64` flag. - We have a fair bit of ugly logic in layers pertaining to conditional calculation of 64 bit attributes. It has improved with the ability to set the low part to 0, but perhaps we should always calculate positions in 64 bit mode?



### Center Point and Automatic Offset Mode

The big precision advantages comes when using linear approximation based on offsets. But it is only good if the precision of the offsets are good. So, the offset subtraction should be done in fp64 mode and converted back to a single fp32 number. Could we allow the app to specify a center point and auto calculate offsets? Especially effective combined with previous proposal.

The center point will likely not need to be provided as 64 bit uniform. It just needs to be padded to 64 bits for subtraction.


### Converting small fp64 deltas into fp32 values

Need to investigate if we have the right function available in fp64...

**Use fp64-arithmetic module only** - Perhaps the subtraction can be performed on the high-order fp64 value without any fp64 library. If not, the full `fp64` shader module is enormous and can slow down shader compilation. There is a small `fp64-arithmetic` core module containing the required subtraction method, make sure it is exported from luma.gl.


## Open Issues

* Always calculate 64bit attributes in LNGLAT mode? - For LNGLAT layer that don't need to zoom a bit of attribute generation speed could be gained by disabling 64 bit attribute generation. Is it worth offering the option to disable this?

** Offer 64bit attribute calculation in non LNGLAT modes? - The use cases are a little hard to imagine, but technically it would be easy to support. It is just a meter of API/prop choices.

* An "extreme" alternative is to auto generate these only when zoom levels break the limit. Extra logic, but is elegant in the sense that "user will only pay for what he uses".

* Center Point Selection - should we let the user decide using `coordinateOrigin`. Should we have it default to viewport center. Or both?

* Support `Float64Array`? - An interesting side investigation would be looking at JavaScript's native `Float64Array`, to understand how these values break down into 32 bit pieces and how they can be accessed from shaders.

* Consider Deprecating `COORDINATE_SYSTEM.LNGLAT_OFFSETS`. Seems this mode is not very useful other than for performance benefits. Not aware of any data sets that are natively encoded in lnglat offsets. Might as well drop this mode to clean up both code as well as our coordinate system concepts.

