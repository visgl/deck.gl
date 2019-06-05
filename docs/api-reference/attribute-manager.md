# AttributeManager Class (Advanced)

> The `AttributeManager` is used internally by deck.gl layers. Unless you are writing custom deck.gl layers, or you are working with some very narrow advanced performance optimization use cases, you do not need to use this class.

The `AttributeManager` class provides automated attribute allocations and updates.

Summary:

* keeps track of valid state for each attribute
* auto reallocates attributes when needed
* auto updates attributes with registered updater functions
* allows overriding with application supplied buffers

For more information consult the [Attribute Management](/docs/developer-guide/custom-layers/attribute-management.md) article.


## Static Methods

##### `setDefaultLogFunctions`

Sets log functions to help trace or time attribute updates.
Default logging uses the luma.gl logger.

Note that the app may not be in control of when update is called,
so hooks are provided for update start and end.

Parameters:

* `opts.onLog` (Function) - callback, called to print
* `opts.onUpdateStart` (Function) - callback, called before update() starts
* `opts.onUpdateEnd` (Function) - callback, called after update() ends


## Constructor

```js
new AttributeManager({id: 'attribute-manager'});
```

Parameters:

* `id` (String, optional) - identifier (for debugging)


## Methods

##### `add`

Adds attribute descriptions to the AttributeManager that describe
the attributes that should be auto-calculated.

```js
attributeManager.add({
  positions: {size: 2, accessor: 'getPosition', update: calculatePositions},
  colors: {size: 4, type: GL.UNSIGNED_BYTE, accessor: 'getColor', update: calculateColors}
});
```

Takes a single parameter as a map of attribute descriptor objects:

* keys are attribute names
* values are objects with attribute definitions:
  + `size` (Number) - number of elements per object
  + `accessor` (String | Array of strings | Function) - accessor name(s) that will
    trigger an update of this attribute when changed. Used with
    [`updateTriggers`](/docs/api-reference/layer.md#-updatetriggers-object-optional-).
  + `update` (Function) - the function to be called when data changes
  + `instanced` (Boolean, optional) - if this is an instanced attribute
    (a.k.a. divisor). Default to `false`.
  + `isIndexed` (Boolean, optional) - if this is an index attribute
    (a.k.a. indices). Default to `false`.
  + `constant` (Boolean, optional) - if this is a generic attribute
    (same value applied to every vertex). Default to `false`.
  + `noAlloc` (Boolean, optional) - if this attribute should not be
    automatically allocated. Default to `false`.
  + `shaderAttributes` (Object, optional) - If this attribute maps to multiple
    attributes in the vertex shader, that mapping can be defined here. All
    `shaderAttributes` will share a single buffer created based on the `size`
    parameter. This can be used to interleave attributes. Shader attribute properties are:
    * `size` (Number) - Number of elements per object.
    * `offset` (Number) - Offset of the initial element.
    * `stride` (Number) - Stride between elements.

##### `addInstanced`

Shorthand for `add()` in which all attributes `instanced` field are set to `true`.


##### `remove`

Removes defined attributes.

Parameters:

* `attributeNames` (Array) - Array of attribute names to be removed


##### `invalidate`

Mark an attribute as need update.

Parameters:

* `name` (String) - Either the name of the attribute, or the name of an accessor. If an name of accessor is provided, all attributes with that accessor are invalidated.
* `dataRange` (Object, optional) - A partial range of the attribute to invalidate, in the shape of `{startRow, endRow}`. Start (included) and end (excluded) are indices into the data array. If not provided, recalculate the  attribute for all data.


##### `invalidateAll`

Mark all attributes as need update.

Parameters:

* `dataRange` (Object, optional) - A partial range of the attributes to invalidate, in the shape of `{startRow, endRow}`. Start (included) and end (excluded) are indices into the data array. If not provided, recalculate the  attributes for all data.


##### `update`

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

* `data` (Object) - data (iterable object)
* `numInstances` (Number) - count of data
* `buffers` (Object) - pre-allocated buffers
* `props` (Object) - passed to updaters
* `context` (Object) - Used as "this" context for updaters

Notes:

* Any preallocated buffers in "buffers" matching registered attribute names will be used. No update will happen in this case.
* Calls onUpdateStart and onUpdateEnd log callbacks before and after.


## Source

[modules/core/src/lib/attribute-manager.js](https://github.com/uber/deck.gl/tree/7.1-release/modules/core/src/lib/attribute-manager.js)
