# RFC: Attribute Buffer Handling

* **Authors**: Xiaoji Chen
* **Date**: Mar 21, 2018
* **Status**: **Pending Review**

Related discussions:
[#1527](https://github.com/uber/deck.gl/pull/1527)


## Background

Since v4, applications are allowed to calculate attributes outside of a layer and then pass in the attribute value as a layer prop. AttributeManager skips the default updating procedure if an external buffer prop is found for an attribute.

Currently, `AttributeManager` requires the external buffer to be a typed array. The typed array is later used to construct a luma.gl Buffer object when calling `model.setAttribute`.

The current approach places some limitations on applications:
- **GPGPU**: If the app is using transform feedback to calculate an attribute, the attribute value is not accessible to the CPU. It will be more efficient to just use the target Buffer of the transform feedback for the attribute, and avoiding the GPU-CPU-GPU roundtrip.
- **Partial attribute updates**: If the layer only wants to modify a small part of the attribute value, it is more efficient to call `buffer.subData` than uploading the entire attribute array (e.g. editing with Nebula.gl)
- **Multi-model**: For layers that reuse attributes cross models, a new buffer is constructed for each attribute and each model.
- **Resource management**: `model.delete()` does not remove existing buffers as they might be in use by other models. Therefore adding/removing layers leave behind orphan buffers which are no longer used and whose resources are never released.


## Proposal: add Attribute class to luma.gl and deck.gl

Attribute descriptors are currently treated as plain objects. We should formalize the API by creating Attribute classes before further extending the interface.

### luma.gl's Attribute class

Properties from the current implementation:
- `value` (TypedArray)
- `isIndexed` (Bool, optional) - default `false`
- `isGeneric` (Bool, optional) - default `false`
- `layout` (BufferLayout, optional) - if not supplied, constructed from the following
    - `type` (Enum) - default `GL.FLOAT`
    - `size` (Number, optional) - default `1`
    - `offset` (Number, optional) - default `0`
    - `stride` (Number, optional) - default `0`
    - `normalized` (Bool, optional) - default `false`
    - `integer` (Bool, optional) - default `false`
    - `instanced` (Number, optional) - default `0`

New property proposed:
- `buffer` (Buffer, optional) - if not supplied, construct new Buffer object during `model.setAttributes`


### deck.gl's Attribute class

Extends luma.gl's Attribute class, with additional properties:
- `update` (Function)
- `accessor` (String|Array)
- `noAlloc` (Bool, optional) - default `false`
- `auto` (Bool, optional) - default `false`
- `elements` - *not sure what this does*

Private properties:
- `target`
- `userData` (Object)
- `isExternalBuffer` (Bool)
- `needsAlloc` (Bool)
- `needsUpdate` (Bool)
- `changed` (Bool)

Methods:
- `clone(props)` - clone attribute with overriding props (multi-model use case)
- `getUpdateTriggerNames()` - parses `accessor` and returns an array of updateTrigger names
- `alloc({numInstances})` - auto create a typed array for `value`
- `validate({values, buffer})` - check if externally supplied `values` or `buffer` satisfy attribute requirements (type, length, sample elements etc.)


## Proposal: create and update buffers in AttributeManager

- After an attribute is updated, `AttributeManager` checks if `attribute.buffer` is empty. Creates a new buffer if necessary.
- `attributeManager.getAttributes` and `attributeManager.getChangedAttributes` always return a map from attribute names to `Attribute` instances
- Delete `attribute.buffer` in `attributeManager.remove`.
- Add `attributeManager.updateBuffers` method for layers to supply buffers internally (GPGPU use case).
- Add `attributeManager.finalize` method, in which delete all Buffer objects in attributes. Call `attributeManager.finalize` in `layer._finalize`.
- During transition updates, instead of directly returning a map of buffers, `attributeTransitionManager` should update the attributes in its parent `attributeManager` and mark them as `changed`. They will then be exposed via `attributeManager.getChangedAttributes`.

