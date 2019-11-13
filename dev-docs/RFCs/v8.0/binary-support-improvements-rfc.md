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


## Goals

Moving into v8.x, we want to make binary data a first-class citizen, in the following ways:

* All core layers accept a variety of binary data inputs, without exposing the internal layer implementation
* Binary data are directly uploaded to the GPU if possible, and basic packing operations (e.g. position interleving, transform matrix construction) are performed on the GPU instead of CPU


## Proposal

Adding an additional override to the `accessor` prop type that is a string. `props.data[accessor]` should yield a loaders.gl-compatible "attribute descriptor" object.
We shall explain this in the documentation as follows:

A layer prop of type `accessor` can optionally be a string. If a string is provided, it is used as the key to query from `data` for a JavaScript object containing the following fields:

- `value` ([TypedArray](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/TypedArray)) - a flat buffer that stacks the value for each object that would otherwise be returned by a function accessor. For example, `getPosition: d => [d.x, d.y, d.z]` is equivalent to `getPosition: {value: new Float64Array([x0, y0, z0, x1, y1, z1, ...])}`. This buffer can be constructed on the server side by something like `data.flatMap(d => [d.x, d.y, d.z])`.
- `size` (Number) - the number of elements per value in the typed array. For example, an RGB color has size 3, and an RGBA color has size 4.
- `elementStride` (Number, optional) - the length per vertex in the typed array. This is needed if the buffer contains interleved information that should not be used for this accessor. Default to `size`.
- `elementOffset` (Number, optional) - the number of elements into each vertex where the value starts. Default to `0`.
- `bufferLayout` (Array, optional) - the number of vertices per object. This is needed by various-width data sources such as `PathLayer` and `PolygonLayer`, referring to the number of points per path/polygon respectively. For most layers, it is assumed to be `[1, 1, 1, ...]`.

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
    positions: {value: binaryData, size: 2, elementStride: 6, elementOffset: 0},
    colors: {value: binaryData, size: 4, elementStride: 6, elementOffset: 2, normalized: true}
  },
  getPosition: 'positions',
  getColor: 'colors',
  getNormal: [0, 0, 0]
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
     poingCountPerPath: [3, 2, ...]
   }
*/
new PathLayer({
  data: {
    length: binaryData.poingCountPerPath.length,
    paths: {value: binaryData.positions, size: 2, bufferLayout: binaryData.pointCountPerPath},
    colors: {value: binaryData.colors, size: 3, bufferLayout: pointCountPerPath}
  },
  getPath: 'paths',
  getColor: 'colors'
});
```

Implementation notes:

* If an accessor turns out to be a string, the `AttributeManager` will attempt to retrieve the information from `data` and pass it to the `Attribute` instance.
* For auto-updated attributes (most common), the attribute will directly upload the buffer to GPU, skipping the local packing step.
* For attributes that require CPU-based processing (e.g. polygon normalization, path tesselation, icon mapping), the buffer will be treated as a source from which the auto updater draws values from, similar to calling an accessor function for each object.

The advantages of this new API include:

* There are no conflicts with existing use cases.
* No dependency on undocumented information. To switch to using binary, the user can simply "flatten" their data with `data.flatMap(accessor)`, where `accessor` is a function that already works in the traditional use case. If tesselation/transform is required, the `Attribute` class will do it under the hood, hiding the implementation detail from applications.
* loaders.gl friendly. When loading from an URL with e.g. a CSV or Arrow loader, the binaries will be accessible by specifying a "path" into the parsed data.
* Future extensibility. This new API will allow users to prepare data and structure applications in a way that may naturally transition into custom GPU-based data processing, e.g.

```js
new PointCloudLayer({
  data: {
    ...
    longitude: {value: <Float32Array>, size: 1},
    latitude: {value: <Float32Array>, size: 1}
  },
  getPosition: new GPUData({sources: ['longitude', 'latitude'], operation: 'join'})
});
```

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
