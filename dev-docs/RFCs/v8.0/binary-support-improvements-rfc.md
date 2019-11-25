# RFC: Binary Support Improvements

* **Authors**: Xiaoji Chen
* **Date**: November 2019
* **Status**: **Draft**


## Summary

This proposal is intended to be an intermediate step towards full Arrow (or generic binary data frame) support in v8.x.

The purpose is to introduce necessary user-facing API changes in the 8.0 release, that will be compatible with the eventual Arrow support.

## Background

During a layer update, there are three main bottle necks in terms of performance:

1. Downloading and parsing the source data
2. Packing the attributes on CPU
3. Uploading the attributes to GPU

For performance-sensitive applications that deal with a large amount of data or high-frequency updates, it is typical to transfer binary format between the server and the client.

Before v7, once the data is downloaded, the application is still required to construct a JavaScript array from the binary, adding memor & CPU time tolls on the client side. In v7.x ([Binary Data RFC](v7.x-binary/binary-data-rfc.md)), we added two ways to use binary data that completely circumvent this step, hence eliminating the performance hit in step 1.

* index-based accessor:

    ```js
    // binaryData is packed on the server, in the format of [x, y, r, g, b, a]
    const DATA = {src: binaryData, length: binaryData.length / 6};

    new ScatterplotLayer({
      data: DATA,
      getPosition: (object, {index, data, target}) => {
        target[0] = data.src[index * 6];
        target[1] = data.src[index * 6 + 1];
        target[2] = 0;
        return target;
      },
      getColor: (object, {index, data, target}) => {
        target[0] = data.src[index * 6 + 2] * 255;
        target[1] = data.src[index * 6 + 3] * 255;
        target[2] = data.src[index * 6 + 4] * 255;
        target[3] = data.src[index * 6 + 5] * 255;
        return target;
      },
      ...
    })
    ```

    This method involves writing an accessor that reads relevant information out of the binary blob at each object index. During attribute update, an internal buffer is allocated, and the accessor is called `numInstance` times to populate it. Hence the performance is comparable to using plain JavaScript array data at step 2 and 3.

* supplying external buffers directly:

    ```js
    // binaryData is packed on the server, in the format of [x, y, r, g, b, a]
    const DATA = {
      length: binaryData.length / 6,
      attributes: {
        instancePositions: {value: binaryData, size: 2, stride: 4 * 6, offset: 0},
        instanceColors: {value: binaryData, size: 4, stride: 4 * 6, offset: 4 * 2, normalized: true}
      }
    };

    new PointCloudLayer({
      data: DATA,
      getNormal: [0, 0, 0]
    });
    ```

    This method skips step 2 entirely, and is possibly the most performant we'll ever get. However, it requires the application (BE and FE) to have knowledge of the internal implementation of a layer, including attribute names, array types and layouts, which is not documented and prone to breakage between minor releases.

## Terms

- **Logical attribute** - the attribute provided by the user, in the format from the layer documentation.
- **Deck attribute** - the attribute created by the `AttributeManager`, by applying a pre-defined transform to the logical attribute(s). The Deck attribute is mapped 1:1 with a WebGL buffer.
- **Shader attribute** - the attribute seen by the vertex shader. A Deck attribute may map to multiple shader attributes using the same WebGL buffer and different accessors.

For example, for scatterplot positions, the logical attribute is a `Float64Array` in the format of  `x0, y0, z0, x1, y1, z1, ...`. The Deck attribute is an interleved `Float32Array` in the format of `x0, y0, z0, x0Low, y0Low, z0Low, ...`. Two shader attributes are created from the Deck attribute: `instancePositions` and `instancePositions64Low`.

Example2: for polygon positions, the logical attribute is an array that flattens all polygon vertices. The Deck attribute include a normalized `positions` array (vertices may be added to close loops) and an `indices` array from triangulation.

## Goals

Moving into v8.x, we want to make binary data a first-class citizen, in the following ways:

* All core layers accept binary data inputs as logical attributes.
* Binary data are directly uploaded to the GPU if possible, and basic packing operations (e.g. position interleving, transform matrix construction) are performed on the GPU instead of CPU


## Proposal

Allow `data.attributes` use an accessor name as the key that map to a loaders.gl-compatible "attribute descriptor" object.
We shall explain this in the [binary data developer guide](/docs/developer-guide/performance.md#on-using-binary-data) as follows:

Each key-value pair in `data.attributes` maps from an accessor prop name (e.g. `getPosition`) to one of the following formats:

  - luma.gl `Buffer` instance
  - A typed array
  - An object containing the following optional fields. For more information, see [WebGL vertex attribute API](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/vertexAttribPointer).
    + `buffer` (Buffer)
    + `value` ([TypedArray](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/TypedArray))
    + `size` (Number) - the number of elements per vertex attribute.
    + `offset` (Number) - offset of the first vertex attribute into the buffer, in bytes
    + `stride` (Number) - the offset between the beginning of consecutive vertex attributes, in bytes

The `value` array represents a flat buffer that contains the value for each object that would otherwise be returned by a function accessor. For example, `getPosition: d => [d.x, d.y, d.z]` is equivalent to `getPosition: {value: new Float64Array([x0, y0, z0, x1, y1, z1, ...])}`. This buffer can be constructed by something like `data.flatMap(d => [d.x, d.y, d.z])`.

Additionally, `data.startIndices` must be specified if the attributes contain variable-width data, for example paths and polygons. `startIndices` is an array that contains the index of the first vertex in each object. For most layers, it is assumed to be `[0, 1, 2, 3, ...]` as in one vertex per object.

```js
// EXAMPLE 1 - PointCloudLayer
/*
   binaryData is packed on the server:
   original data: [
     {x, y, r, g, b}, // d0
     {x, y, r, g, b}, // d1
     ...
   ]
   binary data: {
     positionsAndColors: [d0x, d0y, d0r, d0g, d0b, d0a, d1x, d1y, ...]
   }
*/
new PointCloudLayer({
  data: {
    length: binaryData.length / 6,
    attributes: {
      getPosition: {value: binaryData, size: 2, stride: 24, offset: 0},
      getColor: {value: binaryData, size: 4, stride: 24, offset: 8, normalized: true},
      getNormal: {value: [0, 0, 0], constant: true}
    }
  }
});
```

```js
// EXAMPLE 2 - PathLayer
/*
   binaryData is packed on the server:
   original data: [
     {path: [[x, y], [x, y], [x, y]]}, // p0
     {path: [[x, y], [x, y]]}, // p1
     ...
   ]
   binary data: {
     positions: [p00x, p00y, p01x, p01y, p02x, p02y, p10x, p10y, ...],
     colors: [p00r, p00g, p00b, p01r, p01g, p01b, p02r, p02g, p02b, p10r, p10g, p10b, ...],
     startingIndices: [0, 3, 5, ...]
   }
*/
new PathLayer({
  data: {
    length: binaryData.positions.length / 2,
    startIndices: binaryData.startingIndices,
    attributes: {
      getPath: {value: binaryData.positions, size: 2},
      getColor: {value: binaryData.colors, size: 3}
    }
  }
});
```

Implementation notes:

* If an accessor name appears in `data.attributes`, the `AttributeManager` will pass it to the `Attribute` instance as a "logical attribute".
* For auto-updated attributes (most common), the attribute will directly upload the buffer to GPU, skipping the local packing step.
* For attributes that require CPU-based processing (e.g. polygon normalization, path tesselation, icon mapping), the buffer will be treated as a source from which the auto updater draws values from, similar to calling an accessor function for each object.

The advantages of this new API include:

* There are no conflicts with existing use cases.
* No dependency on undocumented information. To switch to using binary, the user can simply "flatten" their data with `data.flatMap(accessor)`, where `accessor` is a function that already works in the traditional use case. If tesselation/transform is required, the `Attribute` class will do it under the hood, hiding the implementation detail from applications.
* loaders.gl friendly. When loading from an URL with e.g. a CSV or Arrow loader, the binaries will be accessible by specifying a "path" into the parsed data.
* Future extensibility. This new API will allow users to prepare data and structure applications in a way that may naturally transition into custom GPU-based data processing, e.g.

Relevant RFCs for full data frame support:

- [**GLSL Accessor RFC**](/dev-docs/v7.x-binary/glsl-accessor-rfc.md)
- [**Texture Attribute RFC**](/dev-docs/v7.x-binary/texture-attribute-rfc.md)
- [**GPU Data Frame Support**](/dev-docs/v7.x-binary/gpu-data-frame-rfc.md)

## Open Questions

### How do composite layers support binary data?

Currenly, composite layers support index-based accessors, but not external attribute buffers. They will not support this new feature initially.

### Buffer sharing between attributes?

If the user opts to use an interleved buffer, it should not be uploaded to the GPU once for each attribute. This may require a global data manager (similar to `TypedArrayManager`) that creates, tracks and destroys GL resources.

This can be implemented as a performance improvement after the initial release.
