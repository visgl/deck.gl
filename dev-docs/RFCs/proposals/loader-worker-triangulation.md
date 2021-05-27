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

### Preprojection

Deep within the solid polygon layer we find the call out to earcut, including an optional preprojection [layers/src/solid-polygon-layer/polygon.js]. The preprojection is invoked for LNGLAT coordinate system and thus whether it occurs is coupled to the layer and potentially viewport configuration

When invoking the triangulation in the worker we need to specify whether to project or not. The MVTLayer is a geospatial layer and as such only needs to support either LOCAL or LNGLAT projections. Which of these to use, is already specified in the MVTLoader options.

### Moving earcut to loaders.gl

While I was hesitant about putting the triangulation within loaders.gl, the advantage of doing the work there (rather than in a worker launched within deck.gl) is that we only have to transfer the data to-and-from the worker once. If the worker was launched from the deck.gl code it would lead to two workers being used, adding latency.

### Earcut (non)removal from deck.gl

A number of different Layers (not just MVTLayer) draw polygons (and thus invoke earcut) and they pass their data in different formats, e.g. MVT/GeoJSON. Additionaly SolidPolygonLayer is designed to be a general-purpose layer and should support the consumer of the library in accepting just polygons (for example GeoJSON) as data, and thus the triangulation capability must be retained.

## Design

At a high level the loading routhines for the MVTLayer (binary version) are modified so that they also perform the triangulation, passing through the indices corresponding to the triangles to deck.gl. If present, deck.gl then applies these directly to buffers, rather than doing the triangulation again.

Changes are required both in loaders.gl and deck.gl

### loaders.gl

MVTLoader is modified to automatically triangulate polygons when `binary` is set to true.

The MVTLoader will then invoke earcut as part of the worker process and then return as part of the arrays it produces an additional array:

- `triangles`, a set of indices into the positions array. 

### deck.gl

The PolygonTesselator already supports external indices. Thus the triangle data from loaders.gl will be passed through, and deck.gl will not needlessly recompute the triangles on the main thread. 

## Future expansion

The scope of this change is limited to the binary version of the MVTLoader & MVTLayer, but in principle other loaders could also supply the triangulation and be picked up by the Tesselator in deck.gl with minimal changes required. This should not be done without careful benchmarking, as the cost of passing the data to a worker may exceed the performance gains. In the case of the MVTLoader where the parsing already happens in a worker, this overhead is avoided.
