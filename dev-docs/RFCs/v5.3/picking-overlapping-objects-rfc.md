# RFC: Picking Overlapping Objects in deck.gl

* **Author**: Ib Green and Georgios Karnas
* **Status**: Draft
* **Date**: April 20, 2018

References:
* [luma.gl issue #432](https://github.com/uber/luma.gl/issues/432) - Support for picking overlapping objects.
* [luma.gl PR #509](https://github.com/uber/luma.gl/pull/509) - Add discard to `picking` module fragment shader
* [deck.gl PR #1730](https://github.com/uber/deck.gl/pull/1730) - Picking overlapping objects RFC implementation


## Summary

This RFC adds support for picking "occluded objects under the mouse". It proposes extending the current color based picking mechanism with a multipass option, where items picked in the previous passes are not rendered in the next pass. This allows the picking operation to "see" occluded objects and return a list of all objects at the given coordinate instead of just the "top" object.


## Problem/Opportunity

It's useful to be able to click on (or hover over) objects in a scene. Sometimes there will be multiple objects under the cursor. The current picking system, while performant, does not handle this situation as it only samples the final pixel in the picking buffer, representing the picking color of the "top" object.

Since multiple objects are rendered in a single draw call, it is necessary to do multiple draw calls, successively not drawing the previous match, to find deeper matches using GPU based picking.


## Idea

The basic idea is that:

We add support for temporarily disabling an item from being drawn, e.g. by temporarily setting its picking color to 0,0,0,0 using a "partial update" of Buffer.

* we then do multiple picking operations
* After each operation we clear the picked item.
* We iterate, either until there are no more matches, or we reach an upper limit of matches (e.g. 5), or some predefined time limit is exceeded.

Due to the successive read backs, this will not be super performant, but if limited to say 5 matches and only done on a click (not mouse move), it should be fast enough, and would allow most applications to avoid having to implement additional CPU based picking.



## Proposed Features


### New Function: `Deck.pickMultipleObjects()`

Returns a list of objects under the point, optionally stopping after a maximum number of matches.

```js
const pickInfos = layerManager.pickMultipleObjects({x, y, depth: 5});
```

Parameters
* `depth`=`10` - Limits the number of matches.


### Improvement: luma.gl Picking Module

Needs to recognize null picking color and `discard` to avoid touching Z buffer.



## Solution: Attribute-based Object Exclusion

> See "Alternatives" section below for comparison with CPU based picking and Uniform-based Object Exclusion.


## Identifying Index Ranges

For basic instanced layers (like ScatterplotLayer) the mapping between object indices and attribute indices is trivial (the index is the same), but for "custom geometry" layers like a PolygonLayer, each object is represented by a range of vertices, all of which need to be disabled/enabled at the same time.

One could do a binary search in the typed array to locate the right picking color, or one could ask each layer to maintain an index range array. The latter feature would also be helpful for partial updates and more advanced dynamic tesselation.


## Performance

## Performance Impact

The extra attribute updates should only happen when using `Deck.pickMultipleObjects` (and not `Deck.pickObject` or `Deck.pickObjects` or built in hover click picking), to ensure that the perf impact is zero in other picking cases. Comments in the code should call this out to make sure this behavior is maintained in future maintenance.

In particular the attribute updates must not be applied during automatic picking, including pointer move events.

At the very least, if we do share code path between picking functions, any attribute updates should only happen when `depth` > 1.


## Performance Improvements

### buffer.subData

The idea (for a second PR) is to use `buffer.subData` to only update the affected bytes in the attribute.
In WebGL2 we should be able to do the buffer updates (copying in zeros into a buffer range) completely as GPU memory to GPU memory (`buffer.copyData`), should be very performant and involve no GPU pipeline stalls or CPU to GPU transfers.

Possible concerns with the uniform approach (apart from depth limit).

The `AttributeManager` would needs to manage `Buffer` objects directly (instead of calculating typed arrays and relying on luma.gl to create Buffers). This allows the picking module to use `buffer.subData` on the pickingBuffer to efficiently update one object at a time.

It would make sense to return to this optimization once additional work has been done on the `AttributeManager`, e.g. when the "partial attribute updates" RFC has been implemented.


### Parallel Picking across Layers

Deep picking is only an issue when the matches are in the same layer. If the layers are separate, then picking could be parallel.

The operation that is expected to dominate performance is the pixel readback after each render, which cannot be asynchronous as it affects the next draw.

But different layers could be rendered into the same framebuffer. We would render just the area around the picking coordinates, so we could render many such areas with small offsets into the same framebuffer.

The total number of readbacks would be only 1 more than the maximum number of matches in any given layer.

The performance gains would be very application dependent.


## Additional Considerations

The `picking` shader module is defined in luma.gl. If the design resulting from this RFC is generic enough, it would be good to consider whether some code (such as attribute updater code) could be moved back to luma.gl as part of a generic set of picking utilities.

Also whether the `pickModels` code in luma could be further integrated with deck.gl's `pickObjects`, e.g. as part of a scenegraph layer or similar.



## Alternative Solutions

### CPU-based Picking

Adding a raycasting mechanism, e.g. to math.gl.

CPU based picking is straightforward in a simple primitive mesh geometry model (think THREE.Mesh in three.js) but does not extend immediately to instanced rendering, as the final geometry of instanced layers is typically defined in the vertex shader and not a priori "known" to the CPU.

* Thus, supporting raycasting could be an "open ended" task (each layer potentially requiring custom JS code to match vertex shader).
* Also we risk having different picking semantics based on whether we use GPU or CPU based picking, if the GLSL and JS code got out of sync.

Note: This RFC is not arguing against adding ray casting and other CPU based picking techniques to deck.gl, luma.gl, or math.gl.

However given the fact that GPU based picking requires no additional layer code and has been serving us very well, it makes sense to keep improving the GPU based picking feature.


### Uniform-based Object Exlusion

Updating attributes for every picking pass has a cost. If we were ok with limited depth (does not make sense to pick too deeply anyways), we could send the excluded picking color as uniforms and handle this in the picking module's `picking_filterPickingColor` function.


The downsides:

* Uniforms put a hard limit on picking `depth`.
* Extending a basic module like `picking` with a bank of uniforms affects every fragment shader, increasing shader compilation time if not execution time.
* We'd want to double check that fragment shader performance impact is zero when deep picking is not enabled. If conditional to a uniform (`picking_uDeepPickingEnabled`) the perf impact might be very small when not enabled.
* However, currently the `WEBGL_disjoint_timer_query` extension is well-known to be broken in Chrome, so hard to test this at the moment :(
* Uniforms are a limited resource, the exact number is GPU dependent. Not a big concern, but as our number of shader modules grows...

Ultimately:

Whether we use uniform or attribute based object exclusion, we need to run multiple picking passes and do multiple read backs whichis almost certainly going to dominate the performance cost. Once the `buffer.subData` piece is in place, the performance difference between these two approaches would not be perceptible. Both choices are viable, it might be down to a matter of taste.
