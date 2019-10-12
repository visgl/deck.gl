# GPUColumn (Internal)

> This class is internal and not intended to be directly used by applications.

This class helps deck.gl manage attributes. It integrates into the luma.gl `Model.setGPUColumns()` method by implementing the `GPUColumn.getValue()` method. luma.gl checks for the presence of this method on any attribute passed in.


## Usage

Create a `GPUColumn` and initialize it with data
```js
import {GPUColumn} from '@deck.gl/gpu-table';

const positions = new GPUColumn({
  value: new Float32Array([0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 0, 0]),
  accessors: [{
    size: 3,
  }]
});
```

## Member Fields

### buffer : Buffer

### handle : WebGLBuffer

The actual WebGL buffer handle.

### accessors : Object[]

list of accessors

## Methods

### constructor

The constructor for the GPUColumn class. Use this to create a new GPUColumn.

`new GPUColumn(gl, options);`

* `gl` - WebGL context.
* `size` (*number*) - The number of components in each element the buffer (1-4).
* `id` (*string*, optional) - Identifier of the attribute. Cannot be updated.
* `type` (*GLenum*, optional) - Type of the attribute. If not supplied will be inferred from `value`. Cannot be updated.
* `isIndexed` (*bool*, optional) - If the attribute is element index. Default `false`. Cannot be updated.
* `constant` (*bool*, optional) - If the attribute is a constant. Default `false`.
* `isInstanced` (*bool*, optional) - Whether buffer contains instance data. Default `false`.
* `normalized` (*boolean*, optional) - Default `false`
* `integer` (*boolean*, optional) - Default `false`
* `offset` (*number*, optional) - where the data starts in the buffer. Default `0`.
* `stride` (*number*, optional) - an additional offset between each element in the buffer. Default `0`.
* `value` (*TypedArray*) - value of the attribute.
    - If `constant` is `true`, the length of `value` should match `size`
    - If `constant` is `false`, the length of `value` should be `size` multiplies the number of vertices.
* `buffer` (*Buffer*) - an external buffer for the attribute.
  - `accessors` (Object, optional) - If this attribute maps to multiple
    attributes in the vertex shader, that mapping can be defined here. All
    `accessors` will reference interleave attributes in a single buffer, using `stride` and `offset`. This can be used to . Each shader accessor object may contain any of the [accessor parameters](https://luma.gl/#/documentation/api-reference/webgl-2-classes/accessor) to override the parent attribute's with.


### delete

Free WebGL resources associated with this attribute.
