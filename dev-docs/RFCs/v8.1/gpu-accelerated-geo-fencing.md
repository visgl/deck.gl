# RFC: GPU Accelerated GeoFencing.

* Authors: Ravi Akkenapally
* Date: January 14, 2020
* Status: **Draft**
* POC: TODO

## Overview

This RFC proposes GPU Accelerated GeoFencing (filtering data to one or more polygons) technique and also explores ways to expose the functionality to deck.gl based applications.


## Background

The main problem this RFC is trying to solve is, filtering data to a polygon, and it is also referred as PIP (Point In Polygon) test. There has been lot of research work recently, to accelerate the PIP test using GPU.

### Existing Research Work

Following is the list of papers I was able to find and explored :

1. Speeding up Large-Scale Point-in-Polygon Test Based Spatial Join on GPUs ([Paper](http://www-cs.ccny.cuny.edu/~jzhang/papers/bigspaital_cr.pdf))

2. A cell-based point-in-polygon algorithm suitable for large sets of points ([Paper](https://www.sciencedirect.com/science/article/pii/S0098300401000371?via%3Dihub))

3. GPU Rasterization for Real-Time Spatial Aggregation over Arbitrary Polygons ([Paper](http://www.vldb.org/pvldb/vol11/p352-zacharatou.pdf))

4. A Simple and fast hardware-accelerated point-in-polygon test ([Paper](https://pdfs.semanticscholar.org/04a4/7b99d57cdf81bbd58a8dc21c2d15ac528855.pdf))

All of above work uses more advanced Graphics APIs (such as OpenGL Compute Shaders, CUDA, SSBO, etc) and or not supported either by WebGL1 or WebGL2. For deck.gl, we have to implement this with in WebGL1/WebGL2 limitations.

## Proposed Approach

A texture based filtering can be implemented to perform PIP test on GPU. The idea is, user provided polygon or polygons are triangulated and rendered to a offline frame buffer. During actual rendering step it is used as a texture to perform PIP test. The texture size can be configured to control precession/speed. Bigger texture size has better precession while smaller texture size will have better speed.

### PolygonTexture

Axis aligned bounding box of polygons is first computed. A Framebuffer is created that has same aspect reatio as bounding box and it is cleared with a custom clear color (can be black). User provided polygons are triangulated and their positions are normalized to bounding box and are rendered to above offline Framebuffer using a custom color (we can just use one of RGB channels).

### Filtering

When rendering user provided data, for each data element, its positions is transformed into same space that above texture is generated and it position (XY) is normalized to a [0, 1] range and then we first perform trivial check agains bounding box (for range [0, 1]) to clip agains bounding box and then perform texture sample from above texture. The result gives whether the object is in the polygon or not.

## Problem Classifications and proposed API

### Filtering points

Performing polygon filtering point is straight forward. This can be done in Vertex shader, based on the result if possible objects size can be set to 0 (to reduce number of fragment shader executions) and eventually all resulted fragments can be discarded.

* API : Layer extension.

(TODO: `uniforms` and `shader hooks`)

Example: ScatterPlotLayer, HexagonLayer, etc.

### Filtering non point primitives

When filtering non point primitive, such as `lines`, `arcs` and `polygons` etc, filtering can be done at fragment shader. For each vertex, a varying can be define to propagated its texture coordinate to the fragment shader, and texture sampling can be performed in fragment shader to either render or discard each fragment.

* API : Layer extension.

(TODO: `uniforms` and `shader hooks`)

Examples: `PathLayer`, `PolygonLayer`, etc

### Giving filtering results to applications

Above two solutions, perform filtering and render the data, but do not give filtering results to applications. In most cases, when performing geofencing, application would also like to access filtered data, to perform other calculations or process it further. We can support that by developing module, which performs filtering as above, but uses `Transform Feedback` to provide results back to the application. This result will be a `Buffer`, with same size as number of objects, and for each object it will contain 0 or 1, to indicate whether the object is filtered or not. This way application can only pass, filtered data back to the deck.gl and also use it for further processing.

* NOTE: This approach would require support for `WebGL2`.

* API: A module, built using `Transform` class, that takes object position values and polygons, and output being a `Buffer` containing a value for each object, indicating if it is filtered or not. We can also provide a reduced list of indices that are filtered out, which can be used as index buffer (to avoid filtering of objects on CPU and re uploading data to GPU).

## Performance

CPU filtering is expensive as it performs filtering of each individual object in a serial fashion and it's complexity is O(N*E), where `N` is number of objects and `E` is number of polygon edges.

Above proposed GPU Filtering runs in parallel and the number polygons or polygon edges has no impact on time as everything is combined to same texture.

Texture sampling is not cheap and it comes with some overhead. But when number of points to be clipped and there are multiple polygons, the overhead could much smaller than the gains.

Here are the performance numbers for clipping randomly generated points (same set of points are used for both CPU and GPU) to a 10 side convex polygon. For CPU clipping, I used [@turf/boolean-within](https://www.npmjs.com/package/@turf/boolean-within)

|#Points| CPU #Iterations/Second | GPU #Iterations/Second | GPU is faster by |
|-|-|-|-|
|10K|411|6900| <b style="color:green">16X</b> |
|1M|4|4200| <b style="color:green">1000X</b> |
|10M|0.378|3120| <b style="color:green">8000X</b> |

Above number are taken on a 'MacbookPro' with '2.6 GHz Intel Core i7' CPU and 'Radeon Pro 560X 4 GB' GPU.
