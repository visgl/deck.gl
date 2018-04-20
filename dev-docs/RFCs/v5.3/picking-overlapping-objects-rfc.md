# RFC: Picking Overlapping Objects in deck.gl

* **Author**: Ib Green and Georgios Karnas
* **Status**: Draft
* **Date**: April 20, 2018


## Summary

This RFC adds support for picking "occluded objects under the mouse". It proposes extending the current color based picking mechanism with a multipass option, where items picked in the previous passes are not rendered in the next pass. This allows the picking operation to "see" occluded objects and return a list of all objects at the given coordinate instead of just the "top" object.


## Problem/Opportunity

From [luma.gl issue #432](https://github.com/uber/luma.gl/issues/432) - Support for picking overlapping objects:

It's useful to be able to click on (or hover over) objects in a scene. Sometimes there will be multiple objects under the cursor. The current picking system, while performant, does not handle this situation.

Because detecting multiple objects would be more compute intensive (likely some form of CPU iteration over objects instead of the current elegant color picking), I would propose exposing this as a setting for each specific pick action. For example, it might be ok to offer the fast checking on hovering / cursor moves, but when a user clicks, you might want to do the more expensive CPU search to return a list of all the objects under the cursor (fuzzy results would also be fine if it's faster or easier - all the objects under the cursor + some that might not be under the exact pixel, but are very nearby).


## Idea

The basic idea is that:

We add support for temporarily disabling an item from being drawn, e.g. by temporarily setting its picking color to 0,0,0,0 using a "partial update" of Buffer.

* we then do multiple picking operations
* After each operation we clear the picked item.
* We iterate, either until there are no more matches, or we reach an upper limit of matches (e.g. 5), or some predefined time limit is exceeded.

Due to the successive read backs, this will not be super performant, but if limited to say 5 matches and only done on a click (not mouse move), it should be fast enough, and would allow most applications to avoid having to implement additional CPU based picking.



## Proposed Features

New Function: `pickMultipleObjects()`

Returns a list of objects under the point, optionally stopping after a maximum number of matches.

```js
const pickInfos = layerManager.pickMultipleObjects({x, y, matches: 5});
```

Parameters
* `matches`=`-1` - If set to a positive number, limits the number of matches.


## Picking Module

* Needs to recognize null picking color and `discard` to avoid touching Z buffer.


## Attribute Manager

Needs to manager `Buffer` objects directly (instead of calculating typed arrays and relying on luma.gl to create Buffers). This allows the picking module to use `buffer.subData` on the pickingBuffer to efficiently update one object at a time.


## Identifying Index Ranges

For basic instanced layers (like ScatterplotLayer) the mapping between object indices and attribute indices is trivial (the index is the same), but for "custom geometry" layers like a PolygonLayer, each object is represented by a range of vertices, all of which need to be disabled/enabled at the same time.

One could do a binary search in the typed array to locate the right picking color, or one could ask each layer to maintain an index range array. The latter feature would also be helpful for partial updates and more advanced dynamic tesselation.


## Technical Considerations

The picking shader module is defined in luma.gl. If the design resulting from this RFC is generic enough, it would be good to consider whether some code could be moved back to luma.gl as part of a generic set of picking utilities.

Also whether the pickModels code in luma could be further integrated with deck.gl's pickObjects, e.g. as part of a scenegraph layer or similar.


## Alternatives

### CPU based picking

Adding a raycasting mechanism, e.g. to math.gl.

CPU based picking is straightforward in a simple primitive mesh geometry model (think THREE.js) but does not extend immediately to instanced rendering, as the final geometry is defined in the vertex shader. Thus, supporting raycasting could be an "open ended" task (each layer potentially requiring custom code)

risk having different picking semantics based on whether we use GPU or CPU based picking.

> This RFC is not arguing against adding e.g. ray casting and other CPU based picking techniques to luma.gl (or maybe math.gl), however GPU based picking has been serving us very well and it makes sense to keep improving the feature.
