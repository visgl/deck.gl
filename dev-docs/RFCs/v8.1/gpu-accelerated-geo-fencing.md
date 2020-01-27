# RFC: GPU Accelerated GeoFencing.

* Authors: Ravi Akkenapally
* Date: January 14, 2020
* Status: **Draft**
* POC: TODO

## Overview

This RFC proposes GPU Accelerated GeoFencing (filtering data to one or more polygons) technique and also explores ways to expose the functionality to deck.gl based applications.

## Use Cases

- Perform filtering of input object's positions, to a geological boundary (for example boundary of US state), and use this filtered data to render a Layer.
- Perform filtering of input object's positions, to a user provided polygon(s), to highlight (render using a different color) all objects inside this polygon(s).

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

We can perform a point in polygon test of each object and discard the rendering if test fails. One are more layer can be marked to generate the filter texture and one or more layers can be marked to use this texture as a mask for filtering. In layer's vertex shader, a texture sample is performed to determine if the object is inside or outside.

Entire process of filtering can be divided into two steps, 1. Generation of filter texture and 2. performing actual filtering.

* API : Following new components will be added

#### GeoFilterEffect

This effect generates the required filter texture. Internally it creates a new render pass to render data in world space to a offline texture.

During pre render pass:
- All layers are processed, and if a layer has 'geoFilterMask' prop set, a bounding box of its data is calculated (optionally can be provided by the layer).
- All above bounding boxes are merged at each step and used to build the texture mask.
- This effect class is responsible for providing following uniforms that will be consumed by following shader module 'TextureFilterModule'

1. `textureTransform` (Array, [xTranslation, yTranslation, xScale, yScale]) : used to transform each data point into required clipping space.
2. `maskTexture` (Texture2D) : texture that is sampled to determine if a given point is inside or outside.

#### TextureFilterModule

A new shader module is added to perform sampling from the texture and filter the points, defines following shader functions:

- `geoFilter_setValue` : Takes, object's world positions, transforms it to mask texture space, performs sampling and sets `geoFilter_value` to either 0 (if outside the defined region) or to and id ( >= 1).

Also this module defined following shader injects/hooks, that can be used by layer shader to perform geo filtering.

- `vs:#main-start` : To perform sampling and set `getoFilter_value`.
- `vs:DECKGL_FILTER_SIZE` : To set object size to 0 if the object is filteredout.
- `fs:DECKGL_FILTER_COLOR` : To discard the fragments if filter value is 0. This can also be used update the color of the fragment if it is inside the region.


Sample code to perform filtering on a `ScatterplotLayer` to a `SolidPolygonLayer` that is rendering a complex polygon.

```js
import DeckGL from '@deck.gl/react';
import {GeoFilterEffect} from '@deck.gl/core';

const GEO_FILTER_ID = 'geo-filter-id-1'

const filterEffect = new GeoFilterEffect({id: GEO_FILTER_ID, precession: 0.8});

// ...

const App = (data) => (
  <DeckGL
    layers={[
      // Layer that generates the mask
      new SolidPolygonLayer({
        // Complex polygon with one hole
        data: [
              [[0, 0], [0, 2], [2, 2], [2, 0], [0, 0]],
              [[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]]
            ],
        visible: false
        geoFilterMask: GEO_FILTER_ID
        // ...
      })
      // Layer that gets filtered out
      new ScatterplotLayer({
        data,
        geoFilter: GEO_FILTER_ID
      })
    ]}
  >
  // ... map
  </DeckGL>
);

```

This type of filtering is applicable for layers such as `ScatterplotLayer`, `GridLayer`, etc

### Filtering non point primitives

When filtering non point primitive, such as `lines`, `arcs` and `polygons` etc, filtering can be done at fragment shader. API for this featue is same as above, except filtering shader instructions are injected into fragment shader instead of vertex shader. This decession is done at static time, by updating layer's fragment shader with proper shader hooks.

This type of filtering is applicable for layers such as `PathLayer`, `PolygonLayer`, etc

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
