# RFC: Viewport Animation

* **Authors**: Ravi Akkenapally
* **Date**: Aug 2017
* **Status**: Placeholder


## Proposal: Viewport View Matrix Decomposition support

Extract traditional camera parameters from any Viewport? We have the `viewMatrix`, which can be decomposed using standard 4x4 matrix techniques.

Possible methods:
* `WebMercatorViewport.getCameraPosition`
* `WebMercatorViewport.getCameraLookAt`
* `WebMercatorViewport.getCameraUp`
* `WebMercatorViewport.getFov`
* `WebMercatorViewport.getClippingPlanes` -> [near, far]


