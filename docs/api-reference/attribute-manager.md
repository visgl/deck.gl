# AttributeManager Class (Advanced)

Note: The `AttributeManager` is used internally by deck.gl layers. Unless you are writing custom deck.gl layers, or you are working with some very narrow advanced performance optimization use cases, you do not need to use this class.

The `AttributeManager` class provides automated attribute allocations and updates.

Summary:
- keeps track of valid state for each attribute
- auto reallocates attributes when needed
- auto updates attributes with registered updater functions
- allows overriding with application supplied buffers

For more information consult the [Attribute Management](/docs/advanced/attribute-management.md) article.


## Constructor

Parameters:

- `opts` (Object) - named parameters
  * `opts.id` (String, optional) - identifier (for debugging)

```js
new AttributeManager({id: 'attribute-manager'});
```

## Static Methods

##### `setDefaultLogFunctions`

Sets log functions to help trace or time attribute updates.
Default logging uses the luma.gl logger.

Note that the app may not be in control of when update is called,
so hooks are provided for update start and end.

Parameters:

- `opts` (Object) - named parameters
  * `opts.onLog` (Function) - callback, called to print
  * `opts.onUpdateStart` (Function) - callback, called before update() starts
  * `opts.onUpdateEnd` (Function) - callback, called after update() ends

## Methods

##### `add`

Adds attribute descriptions to the AttributeManager that describe
the attributes that should be auto-calculated.

Takes a single parameter as a map of attribute descriptor objects:
- keys are attribute names
- values are objects with attribute definitions
  * `attribute.size` (Number) - number of elements per object
  * `attribute.accessor` (String | Array of strings) - accessor name(s) that will
    trigger an update of this attribute when changed. Used with
    [`updateTriggers`](/docs/api-reference/base-layer.md#-updatetriggers-object-optional-).
  * `attribute.update` (Function) - the function to be called when
  * `attribute.instanced` (Boolean, optional) - if this is an instanced attribute
    (a.k.a. divisor). Default to `false`.
  * `attribute.noAlloc` (Boolean, optional) - if this attribute should not be
    automatically allocated. Default to `false`.

```js
attributeManager.add({
  positions: {
    size: 2,
    accessor: 'getPosition',
    update: calculatePositions
  }
  colors: {
    size: 4,
    type: GL.UNSIGNED_BYTE,
    accessor: 'getColor',
    update: calculateColors
  }
});
```

##### `addInstanced`

Shorthand for `add()` in which all attributes `instanced` field are set to `true`.

##### `invalidate`

Mark an attribute as need update.

Parameters:

- `name` (String) - Either the name of the attribute, or the name of an accessor.
If an name of accessor is provided, all attributes with that accessor are invalidated.

##### `invalidateAll`

Mark all attributes as need update.

##### `remove`

Removes defined attributes.

Parameters:

- `attributeNames` (Array) - Array of attribute names to be removed

## Source
[`src/lib/attribute-manager.js`](https://github.com/uber/deck.gl/blob/4.1-release/src/lib/attribute-manager.js)
