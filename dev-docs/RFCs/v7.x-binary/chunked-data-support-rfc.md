# RFC: Chunked Array Support

* Authors: Ib Green
* Date: March, 2019
* Status: **Draft**

This RFC is a component of deck.gl's "binary support roadmap".


## Summary

This RFC explores adding support for chunked arrays (`data` props) to deck.gl GPU rendering, with a focus on deep integration with the Apache Arrow data format.


## Overview

With the emergency of efficient columnar data formats like Apache Arrow it is becoming natural to work with long arrays divided into chunks (e.g. `RecordBatch` instances in Arrow). Logical tables are then composed out of sequences of such chunks conforming to the same schema.

The chunked approach has benefits, e.g:
* It enables data to be loaded incrementally without reallocation as new chunks come in.
* It overcomes allocation size limits in the browser (e.g. the long-standing 1GB per-allocation limit in Chrome).
* Chunks can be recomposed very cheaply enabling powerful data frame type use cases.

And of course some drawbacks:
* Increased code complexity to deal with chunks
* Performance overhead when splitting GPU processing into separate per-chunk draw calls.
* How to (efficiently) detect changes in chunks


### Examples of Chunked Data

Chunked data is most interesting for binary columnar arrays, but can also be useful for JS arrays.

#### Chunked JavaScript Array

```js
[
 [
   {value: 1, time: 1.00},
   {value: 2, time: 1.10},
 ],
 [
   {value: 3, time: 2.00},
   {value: 4, time: 2.10},
 ],
 ...
]
```

#### Chunked TypedArrays

```
[
  {
    value: new Int32Array([1, 2]),
    time: new Float32Array([1.00, 1.10])
  },
  {
    value: new Int32Array([3, 4]),
    ...
  }
]
```

#### Chunked Arrow Array

Follows a more complicated relationship with `Vector` instances representing chunks:

`Table ---* Column (Chunked) ---* Vector`



## Proposals

This RFC starts with proposals. To have the right context, there is significant background material in the next chapter that may be useful to read first.

> The GPU support in this RFC will push the limits of the WebGL API, in the initial version, only WebGL2 support is considered.


### Proposal: Define Mapping from Arrow Vector/Data Types to GPU Accessible Memory

* dates are 64 bit and would require `ivec2`
* string arrays data cannot be uploaded to GPU directly, however for columns that are using Dictionaries, the dictionary indices could be uploaded and used for filtering on equality.

Some layers are "row based" (or "instanced") in the sense that each vertex shader invocation deals with a specific instance (table row). In this case, each table row is associated with a fixed number of vertices (defined by the layer's primitive) and using the GPU buffers from the arrow chunks as instanced data will work very well.


## Proposal: Support for Variable-Primitive Layers

See the separate texture attribute RFC. The idea is to use textures instead of buffers to represent columns for _variable-primitive layers_.

In this case Textures should be chunked just like Buffers. The way data frame filtering works (by row) guarantees that each shader will only use data in the texture representing the data for that chunk.


### Proposal: Utils for Creating/Releasing Buffers for individual Chunks in an Arrow Table

We need GPU "shadow" buffers containing the data.

In the Arrow implementation, GPU Buffers would be associated with `Vector` instances

DataFrame -> Table ---* Column -> Chunked ---* Vector <=> GPU Buffer

As DataFrame manipulating and data slicing proceeds, new immutable DataFrames, Tables and Columns will be created, but they will all reference the underlying Vectors.

So we want to maintain a `Vector-to-GPU_Buffer` map, and we'll need to reference count/maintain a list of referencing tables≥

When do we release GPU memory for a Chunk? For a completely general system, it could be useful to have a finalization hook on vectors so that we can track their release, but this is not avaialble.

Instead, in practice, we will set a Table or a DataFrame as the `data` prop on a layer instance, and we'll hold on to the table and all its chunks as long as the `data` prop doesn't change or the layer isn't finalized (something we do get notified about), so we can manage the chunk "shadow buffer" lifetime ourselves:


`allocate-chunk-buffers.js`:

```js
const vectorToGPUBufferMap = new Map();

function allocateGPUBuffersForChunks(table) {
  for (column in table) {
    for (chunks in column) {
      let cache = vectorToGPUBufferMap.get(chunk);
      if (! cache) {
        cache = {buffer: new GPUBuffer(...), tables: []}
        vectorToGPUBufferMap.add(chunk, cache);
      }
      cache.tables.push(table);
    }
  }
}

function freeGPUBuffersForChunks(table) {
  for (columns) {
    for (chunks) {
      // if table no longer in tables, free GPUBuffer
    }
  }
}
```

Note: The above shadow chunk allocation code could be completely generic and accept functions to allocate and deallocated shadow buffers (which could e.g. be GPU buffers).


### Proposal: Improving Chunked Rendering Performance with MultiDraw Extensions

An issue with splitting an array into (many) chunks is that each contiguous chunk requires a draw call. Draw calls traditionally have a lot of overhead and have a big performance impact. However, newly released Chrome WebGL extensions should now make it possible to significantly reduce this overhead:

* [WEBGL_multi_draw Extension](https://www.khronos.org/registry/webgl/extensions/WEBGL_multi_draw/)
* [WEBGL_multi_draw_instanced Extension](https://www.khronos.org/registry/webgl/extensions/WEBGL_multi_draw_instanced/)


## Background

> THESE TOPICS ARE STILL WORK-IN-PROGRESS

### How to detect chunks?

Check if element of `data` is iterable?


## Change detection?

This section looks at the following questions:
- To what extent are chunks on the JS side immutable once created (and loaded into the GPU)?
- If not immutable, how would we detect changes in the chunks of a chunked array?
- When do we actually update GPU data?

This RFC makes the assumption that chunks are immutable and that once uploaded, change detection is not needed. This is consistent with the spirit of the Arrow Library, where in general, nearly everything is meant to be immutable from the library’s perspective.

Note: The Arrow library does have a `set` method on the `Vector` class but this is not used by the library. Maybe we can offer a manual mechanism letting a user invalidate a chunk?


## Support for chunks

### Columnar chunks can be uploaded to single buffer

### Columnar chunks can be uploaded to separate buffers



## Data Frame Operations
### Dropping Columns
### Slicing Chunks

Chunks can be sliced (this should generate new immutable chunks) and new Columns and Tables can be composed from them. This will not affect allocation.
