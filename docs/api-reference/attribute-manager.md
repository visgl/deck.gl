# The AttributeManager Class

The `AttributeManager` class automated attribute allocation and updates.

Summary:
- keeps track of valid state for each attribute
- auto reallocates attributes when needed
- auto updates attributes with registered updater functions
- allows overriding with application supplied buffers

Limitations:
- The AttributeManager always reinitializes the entire typed array.
  There are currently no provisions for only invalidating a range of
  indices in an attribute.

## Methods

### Constructor

* opts (Object) - named parameters
* opts.id (String, not required) - identifier (for debugging)

### AttributeManager.add

Adds attribute descriptions to the AttributeManager that describe
the attributes that should be auto-calculated.

Takes a map of attribute descriptor objects
- keys are attribute names
- values are objects with attribute fields

* attribute.size - number of elements per object
* attribute.updater - number of elements
* attribute.instanced=0 - is this is an instanced attribute (a.k.a. divisor)
* attribute.noAlloc=false - if this attribute should not be allocated

    attributeManager.add({
      positions: {size: 2, update: calculatePositions}
      colors: {
        size: 4,
        type: GL.UNSIGNED_BYTE,
        update: calculateColors
      }
    });

### AttributeManager.setLogFunctions

Sets log functions to help trace or time attribute updates.
Default logging uses the luma.gl logger.

Note that the app may not be in control of when update is called,
so hooks are provided for update start and end.

* opts (Object) - named parameters
* opts.onLog (Function) - callback, called to print
* opts.onUpdateStart= (Function) - callback, called before update() starts
* opts.onUpdateEnd= (Function) - callback, called after update() ends
