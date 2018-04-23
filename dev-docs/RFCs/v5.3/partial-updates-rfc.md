# RFC: Partial Data Updates in deck.gl

* **Author**: Ib Green and Georgios Karnas
* **Status**: For Review


## Summary

This RFC proposes a system where if only a single or a few data items have changed, deck.gl can do partial updates of one or more vertex attributes, avoiding iterating over potentially hundreds of thousands of JavaScript elements and updating multiple megabytes of vertex attribute data. The pilot use case is to allow "visual dragging" of a few items in a 100K segment layer to happen at 60PFS.


## Problem/Opportunity

* deck.gl is today exceptionally performant when it comes to rendering of large static data sets, often staying close to 60FPS even when rendering 1-10 million data items using basic layers (e.g. the ScatterplotLayer). This is the traditional “big data visualization” use case that deck.gl was originally designed for.
* deck.gl is also reasonably performant (compared to other similar frameworks) when completely updating data sets. While the required vertex attribute updates are done on CPU in JavaScript in linear time (proportional to the number of data items), the update code in most layers has gone through rounds of optimization and the performance is not trivially matched, and is in fact good enough for many basic data update use cases.
* There are however use cases where it is desirable to make very frequent modifications to small subsets of large data sets and have the visualization smoothly reflect this (ideally updating at 30-60Hz without freezing or loading the main thread).
* **Editing** - A particular use case where this is needed is when implementing editing of single data items in large data sets (e.g. editing/dragging a road single road segment in a large city map).


## Idea

Today deck.gl can only do a complete update of an entire vertex attribute. We do have the very useful updateTriggers and invalidateAttribute mechanisms that control which attributes get refreshed, but each attribute always gets a complete rebuild when data changes.

Adding support for partial data updates here means that existing vertex arrays and buffer are preserved and memory would be updated/recalculated only for certain objects in the data array.

## Assumptions

These are possible assumptions that can be made that simplify the discussion and implementation.

* Partial updates are to a single contiguous range of indices into data array (start-end).
* Specifying multiple non-overlapping ranges is not possible.
* Specifying a list of indices is not possible (unless they are used to generated the smallest contiguous range that covers all of them).
* During a partial update, the shallow identity of the data array must not change from last render - i.e. this feature supports mutation of the data container. If the container does change, fall back to complete update and warn once.
* During an partial update, the length of the data array (numInstances) must not change from last render - if it does, fall back to complete update and warn once.

Note that while only updating an attribute for a single object is quite straightforward to implement for instanced attributes where each data object corresponds to exactly one vertex, there is a complication for non-instanced attributes in that the size of objects (i.e. number of vertices per object) can change, and this is likely important to support. There is more details about how this could be handled below.

Note about limitations: We can certainly expand this system to handle multiple points or multiple non-overlapping ranges. The limitations in the assumptions are not fundamental, but intended to simplify discussions around an initial implementation.

## Proposed Features

Layers take new properties that limit the range of data being updated

* **Proposal 1**: `dataRange` prop - Update a range [start, end] of items from start to end. Activates partial update if supplied.
* **Proposal 2**: `dataStart`, `dataEnd` props - Update a range [start, end] of items from start to end. Activate partial update if supplied.
* `AttributeManager.update` supplies additional parameters, `start` and `end`.
Layer attribute updaters should be updated to iterate from `start` to `end` only and not over the entire range.

For instanced layers the change is fairly small.
See the current code in ScatterplotLayer:
```js
  calculateInstancePositions({value}) {
    const {data, getPosition} = this.props;
    let i = 0;
    for (const point of data) {
      const position = getPosition(point);
      value[i++] = get(position, 0);
      value[i++] = get(position, 1);
      value[i++] = get(position, 2) || 0;
    }
  }
```
New code:
```js
  calculateInstancePositions({value, start, end}) {
    const {data, getPosition} = this.props;
    for (let i = start; i < end; i++) {
      const position = getPosition(data[i]);
      value[i++] = get(position, 0);
      value[i++] = get(position, 1);
      value[i++] = get(position, 2) || 0;
    }
  }
```

Note that this function (and the proposed changes to it), could potentially be completely replaced by “auto attribute updating”  as the metadata provided to `AttributeManager.add` already contains essentially all the information needed (it may need a defaultValue as well).

Current code (PathLayer)
```js
  calculateInstancePositions(attribute) {
    const {data, getPosition} = this.props;
    const {value} = attribute;
    let i = 0;
    for (const point of data) {
      const position = getPosition(point);
      value[i++] = get(position, 0);
      value[i++] = get(position, 1);
      value[i++] = get(position, 2) || 0;
    }
  }
```

Which could be changed to

```js
calculateStartPositions( {value, start, end}) {
    const {paths} = this.state;
    for (let i = start; < end; ++i) {
         const path = this.state.paths[i]
         const numSegments = path.length - 1;
      for (let ptIndex = 0; ptIndex < numSegments; ptIndex++) {
        const point = path[ptIndex];
        value[i++] = point[0];
        value[i++] = point[1];
        value[i++] = point[2] || 0;
      }
    });
  }
```


### AttributeManager - support auto updates of non-instanced attributes

To support non-instanced attributes we could add two new parameters to
* `AttributeManager.add`
* `getVertexCount` - This returns the number of vertices in a specific object. During an incremental update this can be called to discover how many vertices are needed for a particular datum. By calling `getVertices` - We could potentially support a function that injected the vertices for the object directly

With additions to automatic attribute updating this could be changed to something like (note that these are functions that are called once per object, not the entire array)
```js
   // Called on each object to “size up” array before allocation
   // Normally only called when new data is supplied, but is also
   // called every time a data range is provided
   getVertexCount(index, object) {
        return this.state.paths[index].length;
   }
   // Called on each object to fill in the verts for that object
   // for one attribute
   // Will be called for all objects or just for some
   getStartPositions({index, object, value, offset}) {
      const numSegments = object.length - 1;
      for (let ptIndex = 0; ptIndex < numSegments; ptIndex++) {
        const point = path[ptIndex];
        value[offset++] = point[0];
        value[offset++] = point[1];
        value[offset++] = point[2] || 0;
      }
 }
 … /// etc for other attributes...
```

### Modify layers to use automatic instances updaters

The attribute manager already supports “automatic updaters” (these would work for most of our instanced layers).
We could mitigate a lot of the need to change layer attribute updater code by moving to automatic instance updaters. It would make our layer code shorter.
To date we have been resisting this because of concerns of adding too much magic to the layers, but it may not be practical to resits

Considerations

* Interaction with updateTriggers and invalidateAttribute - deck.gl already has strong mechanisms for controlling that only a subset of the attributes are updated to avoid unnecessary work.
* Doing a partial update with only certain attributes should be possible and work as expected.

### Interaction with pickingColors attribute

If the size of non-instanced objects change during partial update, the pickingColors attribute will also be updated to ensure the new subranges refer to the right picking color.
* What happens with old Layers that can’t handle partial updates?
Layers that don’t support partial updates will just continue to update the entire buffer, so will render correctly but without performance benefits from restricting updates to the supplied dataRange.
These layers may possibly see a performance loss if the attribute manager pre-shuffles data to leave a “hole” of the right size/vertex count for the updated elements), but this would only happen if they were used with a data range.
Layer Updater functions will become more complicated.
Attribute manager will pass in start and end indices, and updater function must now handle this.

This will somewhat complicate the updaters.  This is partly an issue because we pride ourselves on how easy it is to read and understand deck.gl layer source code.

Obviously, if non-instanced attributes are to be supported, we may need to add additional library support for this, as the amount of code needed to manage a variable amount of vertices and indices per object will certainly be too complicated to implement in each attribute updater function.

### Handling non-instanced attributes

While instanced attributes have a fixed size per instance (datum), non-instanced attributes can have a variable number of vertices per datum (think paths and polygons).
Non-instanced layers are some of the most interesting for editing, containing paths and polygons and can not be excluded from this proposal.
Updating a range of non-instanced elements can require a reallocation of all attributes, or just a series of memory copies within the attributes to compact the data
A memory compacting/memory expansion/data copying helper library will be helpful.
Such a library should have solid benchmark tests to ensure it is truly performant.

### WebGL aspects

A change sub range of memory in a GPU buffer can be updated using `gl.bufferSubData`
Shrinking WebGL Buffers should not be reallocated. We just need to track bytes allocated and bytes used separately, and we can shrink and grow inside the existing buffer as long we have enough bytes.
Under WebGL2 the copying of data when reallocating buffers to handle expansion can be done on GPU. (WebGL buffers cannot be exapanded once initialized, that requires recreating or reinitializing them)


## Open Issues

### Composite Layers

Partial data updates could also benefit composite layers such as the GeoJson layer.
These do not typically use the AttributeManager and can not benefit from any support here.
Pass through of start/end indices to the rendered layers can be non-trivial, but not doing so would defeat the value of partial updates for composite layers
Solutions could involve a support library for CompositeLayers, or left for a second iteration, stating that in this version, apps should use primitive layers if they need partial updates.


## Alternatives

Naturally there are techniques to get around the performance limitations related to monolithic data updates without implementing support for incremental updates

* Splitting data into multiple layers
* Removing data from the main layer, redrawing it, creating a new layer with only the data being edited etc.

These all require complications on the application side that are desirable to avoid

## Impact on Stakehold
Since this is expected to be implemented as a backward compatible  “improvement” feature, no significant efforts are needed from the existing users.

## Related work
Considerable effort has been made to improve deck.gl in the areas of
* Picking Interactivity
* Event Handling
Adding support for incremental updates builds on and leverages the investments done in these areas, opening deck.gl to a new set of use cases.
