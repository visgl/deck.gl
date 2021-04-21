# RFC: Loader Worker Triangulation

* **Author**: Felix Palmer
* **Date**: Apr, 2021
* **Status**: **Conceptual Draft**

## Summary

This RFC proposes shifting the triangulation that is performed by the `earcut`
library on solid polygons in the MVTLayer in deck.gl to a web worker,
allowing the costly operation to be performed off the UI thread.

## Motivation

For layers with a large number of polygons performance suffers
as the triangulation operation performed as part of the `updateState`
method. As this is invoked on the main thread, the UI is unresponsive while
this operation is performed.

## Observations prior to design proposal

### Cannot invoke web worker from within `updateState`

Passing off computation to a web worker is an inherently async operation and thus we can't just create a worker within the implementation of the Layer component (e.g. somewhere as part of the implementation of updateState) as it would mean an async operation - which is at odds with the reactive model of Layers

Thus, the invocation of the web worker to triangulate the polygon layer should happen before passing the data to the layer. This is in line with the recommendation in https://deck.gl/docs/developer-guide/performance regarding passing attribute buffer directly to Layers

### Preprojection

Deep within the solid polygon layer we find the call out to earcut, including an optional preprojection [layers/src/solid-polygon-layer/polygon.js]. The preprojection is invoked for LNGLAT coordinate system and thus whether it occurs is coupled to the layer and potentially viewport configuration

When invoking the triangulation in the worker we need to specify whether to project or not. This is a bit messy as we are essentially duplicating the internal logic of the Layer, but I don't see a way around it. In practice most MVTLayers will likely be LNGLAT so having this as the default should mean that in practice most people will not be tripped up.

### Earcut removal from deck.gl

A number of different Layers (not just MVTLayer) draw polygons (and thus invoke earcut) and they pass their data in different formats, e.g. MVT/geoJSON. As such we cannot remove earcut from the deck.gl codebase and keep compatibility with all the loaders. Especially as the scope of this work being restricted to the MVTLoader. In other words even if the new approach moves earcut to the worker for the MVTLayer, it cannot be removed from deck.gl entirely.

## Design

At a high level the loading routhines for the MVTLayer (binary version) are modified so that they also perform the triangulation, passing through the indices corresponding to the triangles to deck.gl. If present, deck.gl then applies these directly to buffers, rather than doing the triangulation again.

Changes are required both in loaders.gl and deck.gl

### loaders.gl

MVTLoader is modified to accept two new options:
- triangulate : a Boolean, false by default which will invoke the earcut triangulation as part of the loading process
- preprojectTriangulation: function or false, a function to perform the preprojection, or false to disable it

When triangulate is enabled, the MVTLoader will invoke earcut as part of the worker process and then return as part of the arrays it produces two addition arrays:

- `triangles`, which will be a set of indices into the positions array. 


