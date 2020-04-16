# RFC: Attribute Buffer Handling

* **Authors**: Xiaoji Chen
* **Date**: Mar 21, 2018
* **Status**: **Implemnted**

## OverView

This RFC proposes to move Buffer creation from luma.gl into AttributeManager.

Related discussions:
[#1527](https://github.com/visgl/deck.gl/pull/1527)


## Background

Since v4, applications are allowed to calculate attributes outside of a layer and then pass in the attribute value as a layer prop. AttributeManager skips the default updating procedure if an external buffer prop is found for an attribute.

Currently, `AttributeManager` requires the external buffer to be a typed array. The typed array is later used to construct a luma.gl Buffer object when calling `model.setAttribute`.

The current approach places some limitations on applications:
- **GPGPU**: If the app is using transform feedback to calculate an attribute, the attribute value is not accessible to the CPU. It will be more efficient to just use the target Buffer of the transform feedback for the attribute, and avoiding the GPU-CPU-GPU roundtrip.
- **Partial attribute updates**: If the layer only wants to modify a small part of the attribute value, it is more efficient to call `buffer.subData` than uploading the entire attribute array (e.g. editing with Nebula.gl)
- **Multi-model**: For layers that reuse attributes cross models, a new buffer is constructed for each attribute and each model.
- **Resource management**: `model.delete()` does not remove existing buffers as they might be in use by other models. Therefore adding/removing layers leave behind orphan buffers which are no longer used and whose resources are never released.

## Proposal: add Attribute class to luma.gl

Selectively port the existing `Attribute` class in deck.gl to luma.gl.

Props:

* `id` (String)
* `type` (Enum)
* `size` (Number)
* `value` (TypedArray)
* `offset` (Number, optional)
* `stride` (Number, optional)
* `normalized` (Bool, optional)
* `integer` (Bool, optional)
* `isGeneric` (Bool, optional)
* `isIndexed` (Bool, optional)
* `instanced` (Bool, optional)

Methods:

- `getBuffer()` - if an attribute is not generic and does not contain a buffer object already, create a new buffer from attribute descriptors.
- `finalize()` - destroy any buffer object created by itself.


## Proposal: modify deck.gl's Attribute class

- Extend luma.gl's `Attribute` class with deck.gl specific props/methods.
- Rename to `LayerAttribute`


## Proposal: create and update buffers in AttributeManager

- Call `attribute.finalize` in `attributeManager.remove`.
- Add `attributeManager.finalize` method, in which delete all Buffer objects in attributes. Call `attributeManager.finalize` in `layer._finalize`.
- Add `attributeManager.setBuffers` method, for layers to set attribute buffers internally (GPGPU use case).
