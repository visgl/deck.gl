# AttributeManager

> The `AttributeManager` is used internally by deck.gl layers. Unless you are writing custom deck.gl layers, or you are working with some very narrow advanced performance optimization use cases, you do not need to use this class.

The `AttributeManager` class provides automated attribute allocations and updates.

Summary:

* keeps track of valid state for each attribute
* auto reallocates attributes when needed
* auto updates attributes with registered updater functions
* allows overriding with application supplied buffers
* can publish logical attributes through one shared or implicit single-attribute vertex buffer group

For more information consult the [Attribute Management](../../developer-guide/custom-layers/attribute-management.md) article.


## Static Methods

#### `setDefaultLogFunctions` {#setdefaultlogfunctions}

Sets log functions to help trace or time attribute updates.
Default logging uses the deck.gl logger.

Note that the app may not be in control of when update is called,
so hooks are provided for update start and end.

Parameters:

* `opts.onUpdateStart` (Function) - callback, called before an attribute starts updating
* `opts.onUpdate` (Function) - callback, called when update is performed. Receives an argument `message` detailing the update operation.
* `opts.onUpdateEnd` (Function) - callback, called after an attribute is updated. Receives an argument `message` detailing the update operation.


## Constructor

```js
new AttributeManager({id: 'attribute-manager'});
```

Parameters:

* `id` (string, optional) - identifier (for debugging)


## Methods

#### `add` {#add}

Adds attribute descriptions to the AttributeManager that describe
the attributes that should be auto-calculated.

```js
attributeManager.add({
  positions: {size: 2, accessor: 'getPosition', update: calculatePositions},
  colors: {size: 4, type: 'unorm8', accessor: 'getColor', update: calculateColors}
});
```

Takes a single parameter as a map of attribute descriptor objects:

* keys are attribute names
* values are objects with attribute definitions:
  - luma.gl [accessor parameters](https://luma.gl/docs/api-reference-legacy/classes/accessor):
    * `type` (string, optional) - data type of the attribute, see "Remarks" section below. Default `'float32'`.
    * `size` (number) - number of elements per vertex
  - deck.gl attribute configurations:
    * `stepMode` (string, optional) - One of `'vertex'`, `'instance'` and `'dynamic'`. If set to `'dynamic'`, will be resolved to `'instance'` when this attribute is applied to an instanced model, and `'vertex'` otherwise. Default `'vertex'`.
    * `isIndexed` (boolean, optional) - if this is an index attribute
      (a.k.a. indices). Default to `false`.
    * `bufferGroup` (string, optional) - Places the attribute into a named shared vertex buffer group. Attributes without `bufferGroup` still participate in the same publication path using an implicit group named after the attribute id.
    * `accessor` (string | string[] | Function) - accessor name(s) that will
      trigger an update of this attribute when changed. Used with
      [`updateTriggers`](./layer.md#updatetriggers).
    * `transform` (Function, optional) - callback to process the result returned by `accessor`.
    * `update` (Function, optional) - the function to be called when data changes. If not supplied, the attribute will be auto-filled with `accessor`.
    * `defaultValue` (number | number[], optional) - Default `[0, 0, 0, 0]`.
    * `noAlloc` (boolean, optional) - if this attribute should not be
      automatically allocated. Default to `false`.
  - `shaderAttributes` (object, optional) - If this attribute maps to multiple
    attributes in the vertex shader, that mapping can be defined here. All
    `shaderAttributes` will share a single buffer created based on the `size`
    parameter. This can be used to interleave attributes. Each shader attribute object may contain any of the following:
    * `size` (number) - number of elements per vertex
    * `vertexOffset` (number) - offset of the attribute by vertex (stride). Default `0`.
    * `elementOffset` (number) - offset of the attribute by element. default `0`.

#### `addInstanced` {#addinstanced}

Shorthand for `add()` in which all attributes `stepMode` field are set to `'instance'`.


#### `remove` {#remove}

Removes defined attributes.

Parameters:

* `attributeNames` (string[]) - Array of attribute names to be removed


#### `invalidate` {#invalidate}

Mark an attribute as need update.

Parameters:

* `name` (string) - Either the name of the attribute, or the name of an accessor. If an name of accessor is provided, all attributes with that accessor are invalidated.
* `dataRange` (object, optional) - A partial range of the attribute to invalidate, in the shape of `{startRow, endRow}`. Start (included) and end (excluded) are indices into the data array. If not provided, recalculate the  attribute for all data.


#### `invalidateAll` {#invalidateall}

Mark all attributes as need update.

Parameters:

* `dataRange` (object, optional) - A partial range of the attributes to invalidate, in the shape of `{startRow, endRow}`. Start (included) and end (excluded) are indices into the data array. If not provided, recalculate the  attributes for all data.


#### `update` {#update}

Ensure all attribute buffers are updated from props or data.

```js
attributeManager.update({
    data,
    numInstances,
    transitions,
    startIndex,
    endIndex,
    props = {},
    buffers = {},
    context = {},
    ignoreUnknownAttributes = false
});
```

Parameters:

* `data` (object) - data (iterable object)
* `numInstances` (number) - count of data
* `buffers` (object) - pre-allocated buffers
* `props` (object) - passed to updaters
* `context` (object) - Used as "this" context for updaters

Notes:

* Any preallocated buffers in "buffers" matching registered attribute names will be used. No update will happen in this case.
* Calls onUpdateStart and onUpdateEnd log callbacks before and after.

#### `getBufferLayouts` {#getbufferlayouts}

Returns WebGPU-style buffer layout descriptors.

Parameters:

* `modelInfo` (object) - a luma.gl `Model` or a similarly shaped object
  + `isInstanced` (boolean) - used to resolve `stepMode: 'dynamic'`

Notes:

* Every non-indexed managed attribute is published through a buffer group.
* Attributes that share the same `bufferGroup` are collapsed into a single layout entry.
* Attributes inside a shared group are packed in lexical order by attribute name.
* Packed groups are currently intended for non-indexed attributes that do not use fp64 emulation.
* Packing is not interleaving in the traditional sense: each logical attribute occupies its own contiguous region inside the shared GPU buffer, and is addressed with byte offsets.


## Remarks

### Buffer Groups

WebGPU limits the number of vertex buffer bindings that may be used by a pipeline. Some layers, especially text and billboard-style layers, naturally accumulate many small per-instance attributes and can hit that limit before they run out of total buffer space.

`AttributeManager` can reduce binding pressure by grouping multiple logical attributes into one shared GPU buffer:

```js
attributeManager.addInstanced({
  instanceSizes: {
    size: 1,
    accessor: 'getSize',
    bufferGroup: 'label-instance-data'
  },
  instanceAngles: {
    size: 1,
    accessor: 'getAngle',
    bufferGroup: 'label-instance-data'
  },
  instanceColors: {
    size: 4,
    type: 'unorm8',
    accessor: 'getColor',
    bufferGroup: 'label-instance-data'
  }
});
```

This preserves the existing attribute update model:

* each attribute still has its own updater/accessor
* each attribute can still be invalidated independently
* `shaderAttributes` still work inside a grouped attribute

Attributes without `bufferGroup` still use the same path, but default to one implicit group per attribute. Shared groups are packed in lexical order by attribute name.

### Attribute Type

The following `type` values are supported for attribute definitions:

| type | value array type | notes |
| ---- | ---------------- | ----- |
| `float32` | `Float32Array` | |
| `float64` | `Float64Array` | Because 64-bit floats are not supported by WebGL, the value is converted to an interleaved `Float32Array` before uploading to the GPU. It is exposed to the vertex shader as two attributes, `<attribute_name>` and `<attribute_name>64Low`, the sum of which is the 64-bit value. |
| `sint8`   | `Int8Array`    | |
| `snorm8`  | `Int8Array`    | Normalized |
| `uint8`   | `Uint8ClampedArray` | |
| `unorm8`  | `Uint8ClampedArray` | Normalized |
| `sint16`  | `Int16Array`   | |
| `snorm16` | `Int16Array`   | Normalized |
| `uint16`  | `Uint16Array`  | |
| `unorm16` | `Uint16Array`  | Normalized |
| `sint32`  | `Int32Array`   | |
| `uint32`  | `Uint32Array`   | |

      
## Source

[modules/core/src/lib/attribute-manager.ts](https://github.com/visgl/deck.gl/blob/master/modules/core/src/lib/attribute/attribute-manager.ts)
