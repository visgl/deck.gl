# Binary Data


##  Tables

deck.gl layers are designed to accept "tables" of data as input (the `data` prop). Tables can be organized in different ways with different.


### Row-Based Tables

In general, tables can be row oriented or column oriented. Row oriented tables are generally the easiest to work with (each row is typically a JavaScript object with fields representing the values of various columns at that row).

```js
new Layer({
  data: [
    {value: 1, time: 1.00},
    {value: 2, time: 1.10},
  ]
})
```

## Columnar Tables

Organizing values by column leads to a columnar table. Columnar tables can be significantly more efficient. In particular, because each value is of the same type, columnar tables can be stored as binary data.

To use a columnar table as layer data, provide a bundle of typed arrays (a "vector bundle"?) as your `data` prop:

```js
new Layer({
  data: {
    value: new Int32Array([1, 2]),
    time: new Float32Array([1.00, 1.10])
  }
});
```


## Chunked Columnar Tables

A disadvantage of columnar tables is that columns can get very long, blocking incremental reads/writes of tables and even exceeding platform's allocation limits.

Advanced binary columnar table formats like Apache Arrow solves this by breaking logical arrays into chunks. In addition, chunked arrays can support remarkably efficient data-frame operations (slicing/dicing and filtering multigigabyte data set with "zero cost").

Another complication when using binary columnar tables is that it may not be possible to represent e.g. the lack of a value. In some libraries (e.g. Apache Arrow) this is solved through an additional `null map`.

Thus, a downside of chunked arrays is that they are complex to work with that they typically require an API (such as Apache Arrow).

Chunked Arrow Arrays follows a more complicated relationship with `Vector` instances representing chunks:

`Table ---* Column (Chunked) ---* Vector`

These cannot currently be used in deck.gl without pre-concatenating the chunks.


> There is an RFC (chunked-data-rfc) that would enable chunked data tables (data frames) to be directly consumed by deck.gl (and then sliced and diced at zero cost).


## Binary Data Representations

JavaScript has a number of different ways to represent binary data (Browser `Blob`, Node.js Buffers, base64 etc), however deck.gl accepts typed arrays only.

> Ideally deck.gl should accept GPU buffers (`WebGLBuffer` or luma.gl `Buffer` instances).


## Using Binary Data

It is sometimes desirable for applications to work directly with binary data and to be able to pass such binary data directly to layers. The motivation is often performance-related but it could just be that the application is able to load data directly in a binary format.

* **Using typed arrays as layer input data** - Using The input data is in binary form, perhaps it is delivered this way from the back-end, and it would be preferable to not have to unpack it.
* **Using typed arrays or GPU buffers directly as layer attributes** - The input data is already formatted in the memory format expected by the GPU and deck.gl's shaders.


## Using Binary Data directly in GPU

The simplest way to supply binary data to deck.gl layers is to override normal attribute calculation and feed in a binary typed array to be used directly as the attribute.

This requires that the binary data columns are formatted in exactly the way that the layer expects. This is often fairly straight forward for _fixed primitive layers_ but not often practical for _variable primitive layers_, as the number of vertices per primitive depends on the details of the tesselation algorithm which can be hard for the data provided to anticipate.


## Using Binary Data to Calculate Attributes in GPU/GLSL

This would mean passing binary data into the vertex shader and there use it to calculate the values the layer needs (colors, elevations etc). This use case would involve writing custom accessor functions. It is currently not directly supported in deck.gl, but could be achieved by creating a custom layer.

> There are RFCs (glsl accessors, texture attributes) that if implemented, would dramatically improve deck.gl's ability to use provided binary data attributes without pre-processing them in JavaScript.


## Use Binary Data to generate Attributes in CPU/JavaScript




## Using Flattened Data (Typed Arrays) as layer input data

In some cases the application may receive all or parts of a layer's geometry in the form of binary typed arrays instead of Javascript arrays. When communicating with a server or web workers, typed arrays can be transported more efficiently in binary form than classic arrays that tend to be JSON stringified and then parsed. For example, a ScatterplotLayer may receive input data like this:

```js
// lon1, lat1, radius1, red1, green1, blue1, lon2, lat2, ...
const binaryData = new Float32Array([-122.4, 37.78, 1000, 255, 200, 0, -122.41, 37.775, 500, 200, 0, 0, -122.39, 37.8, 500, 0, 40, 200]);
```

Upon receiving the typed arrays, the application can of course re-construct a classic JavaScript array:

```js
const data = [];
for (let i = 0; i < binaryData.length; i += 6) {
  data.push({
    position: binaryData.subarray(i, i + 2),
    radius: binaryData[i + 2],
    color: binaryData.subarray(i + 3, i + 6)
  });
}

new ScatterplotLayer({
  data,
  getPosition: d => d.position,
  getRadius: d => d.radius,
  getFillColor: d => d.color
});
```

However, in addition to requiring custom repacking code, this array will take valuable CPU time to create, and significantly more memory to store than its binary form. In performance-sensitive applications that constantly push a large volumn of data (e.g. animations), this method will not be efficient enough.

Alternatively, one may supply a non-iterable object (not Array or TypedArray) to the `data` object. In this case, it must contain a `length` field that specifies the total number of objects. Since `data` is not iterable, each accessor will not receive a valid `object` argument, and therefore responsible of interpreting the input data's buffer layout:

```js
const data = {src: binaryData, length: 3}

new ScatterplotLayer({
  data,
  getPosition: (object, {index, data, target}) => {
    target[0] = data.src[index * 6];
    target[1] = data.src[index * 6 + 1];
    target[2] = 0;
    return target;
  },
  getRadius: (object, {index, data}) => {
    return data.src[index * 6 + 2];
  },
  getFillColor: (object, {index, data, target}) => {
    target[0] = data.src[index * 6 + 3];
    target[1] = data.src[index * 6 + 4];
    target[2] = data.src[index * 6 + 5];
    target[3] = 255;
    return target;
  }
})
```

When non-iterable data is used, to populate the picking event with a valid `object` value, one may optionally specify a `getPickingInfo` callback:

```js
new ScatterplotLayer({
  ...
  getPickingInfo: ({info, data}) => {
    const i = info.index * 6;
    info.object = {
      position: data.src.subarray(i, i + 2),
      radius: data.src[i + 2],
      color: data.src.subarray(i + 3, i + 6)
    };
    return info;
  }
})
```

A binary data buffer may be sliced into messages with variable sizes:

```js
// lon1, lat1, alt1, lon2, lat2, alt2, ...
const positions = new Float32Array([-122.426942, 37.801537, 0, -122.425942, 37.711537, 0, ...]);
// path1_start_index, path2_start_index, ...
const pathStartIndices = new Uint16Array([0, 36, 72, 147]);

const data = {positions, pathStartIndices, length: 4};

new PathLayer({
  data,
  getPath: (object, {index, data}) => {
    const {positions, pathStartIndices} = data;
    const startIndex = pathStartIndices[index];
    const endIndex = pathStartIndices[index + 1] || positions.length / 3;
    return positions.subarray(startIndex * 3, endIndex * 3);
  },
  getWidth: 10,
  getColor: [255, 0, 0]
})
```


## Passing Typed Arrays directly to layer attributes

deck.gl layers will look for each attribute name in the `props` and use a provided typed array (and upload it to a GPU Buffer) instead of attempting to build its own buffer from data.

## Passing GPU Buffers directly to layer attributes

deck.gl layers will look for each attribute name in the `props` and use a provided GPU Buffer instead of attempting to build its own buffer from data.


## Binary Layer Formats

deck.gl provides the ability to supply binary data directly to layers.

This is an overview of the binary formats of layers in the core deck.gl layer catalog. This is not intended to cover all layers. Ultimately, each layer needs to specify its own binary format. When in doubt, consult the layer source code.

> Note that directly feeding in binary data is considered "experimental" in the sense that the binary format is not guaranteed to stay unchanged between minor releases. While changes to the binary format will generally be avoided, it is sometimes necessary for e.g. optimization reasons or to implement a new feature in the best way.


### One-to-one, instanced layers

These layers have very straight-forward binary representations and it is very easy to generate the required attributes, even on a server and send pre-formatted data to the client application which can then be uploaded to GPU and passed in as attributes.

| `Layer`            | `Type`     | Accessors |
| ---                | ---        | --- |
| `PointCloudLayer`  | 1-to-1     | `instancePositions` `instanceColors`, ... |
| `ScatterPlotLayer` | 1-to-1     | `instancePositions` `instanceColors`, ... |
| `LineLayer`        | 1-to-1     | `instancePositions` `instanceColors`, ... |
| `ArcLayer`         | 1-to-1     | |
| `GridCellLayer`    | 1-to-1     | |
| `HexagonCellLayer` | 1-to-1     | |
| `IconLayer`        | 1-to-1     | |
| `TextLayer`        | 1-to-1     | |


### Custom Geometry layers

* Main geometry (positions and supplementary attributes) - for some layers, this layout is more complicated and described here.
* Per-vertex copies of values: A number of attributes are per-vertex copies of some per-object value (color, elevation, etc) and can be generated in an automated way.
* May use custom number of vertices per object, or custom number of instances per object.

| `Layer`            | `Type`     | Accessors |
| ---                | ---        | --- |
| `PathLayer`        |            | |
| `PolygonLayer`     |            | |
| `SolidPolygonLayer`|            | |
| `GeoJsonLayer`     |            | |


### Aggregating Layers

TBD: Binary data for aggregating layers is not currently considered, but would focus on providing the input data in binary form and extending the aggregation algorithms to work on flattened data.

| `Layer`            | `Type`      | Accessors |
| ---                | ---         | --- |
| `HexagonLayer`     | aggregating | See `HexagonCellLayer` |
| `GridLayer`        | aggregating | See `GridCellLayer` |
| `ScreenGridLayer`  | aggregating | ... |


## One Value Per-Instance Layers

Layers like scatterplot layer, point cloud layer, line layer have very simple data structures.


##  PathLayer

| `startPos`   | v0.x | v0.y | v0.z | v1.x | v1.y | v1.z | ... | vn-2.x | vn-2.y | vn-2.z |
| `endPos`     | v1.x | v1.y | v1.z | v2.x | v2.y | v2.z | ... | vn-1.x | vn-1.y | vn-1.z |
| `leftDelta`  |    v0 - vn-2       |      v1 - v0       | ... | vn-2 - vn-3 |
| `rightDelta` |    v1 - v0         |      v2 - v1       | ... | vn-2 - vn-3 |



## Background Information

If you plan to work with binary data, you will want to make sure you are up to speed on JavaScript typed arrays as well as GPU buffers, both in terms of general concepts as well as a basic graps of the API.


### CPU vs GPU memory

Ultimately all deck.gl rendering is done on the GPU, and all memory must be available to the GPU by being "uploaded" into GPU memory `Buffers`. By pre-creating GPU buffers and passing these to deck.gl layers you exercise the maximum amount of control of memory management.

```js
import {Buffer} from 'luma.gl';
const buffer = new Buffer(gl, {data: });
```

Note that GPU buffers have many advanced features. They can be interleaved etc. The luma.gl `Accessor` class lets you describe how GPU Buffers should be accessed.


## Binary array manipulation utilities

luma.gl offers a suite of array manipulation utilities

* `copyArray`
* `fillArray`
* `flattenArray`


### Ways to pack, transport and unpack binary data

A standard that can be of interest when working with binary data is glTF (or more specifically, the GLB container part of glTF).


# GLB Binary Container Protocol Format

TBA: luma.gl comes with parsing support for the glTF / GLB binary container format. In this format, each message is packaged in a binary container or "envelope", that contains two "chunks":
* a JSON chunk containing the JSON encoding of semantic parts of the data
* a BIN chunk containing compact, back-to-back binary representations of large numeric arrays, images etc.

An intended benefit of the binary format is that large segments of data such as encoded images or raw buffers can be sent and processed natively rather than via JSON. Also Typed Array views can be created directly into the loaded data, minimizing copying.


# Parsing Support

GLB parsing functions will decode the binary container, parse the JSON and resolve binary references. The application will get a "patched" JSON structure, with the difference from the basic JSON protocol format being that certain arrays will be compact typed arrays instead of classic JavaScript arrays.

Typed arrays do not support nesting so all numbers will be laid out flat and the application needs to know how many values represent one element, for instance 3 values represent the `x, y, z` coordinates of a point.


## Details on Binary Container Format

The container format is an implementation of the GLB binary container format defined in the glTF specification. However the `accessor`/`bufferView` tables specified by `glTF` are quite verbose in the case where many small arrays (buffers) are used and apps may want to consider use custom tables for more compact messages.

References:
* [glTF 2 Poster](https://raw.githubusercontent.com/KhronosGroup/glTF/master/specification/2.0/figures/gltfOverview-2.0.0a.png)
* [glTF 2 Spec](https://github.com/KhronosGroup/glTF/tree/master/specification/2.0)


## Endianness

In most cases, when working with binary data, care must be taken to properly define and respect "endianness" which essentially deswc
* glTF is little endian: GLB header is little endian. glTF Buffer contents are specified to be little endian.
* Essentially all of the current web is little endian, so potential big-endian issues are igored for now.
