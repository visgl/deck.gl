# Using Binary Data

> Binary data support in deck.gl is actively being developed. This article provides information on current state and some hints about what may come.


## Binary Data

If you plan to work with binary data, you will want to make sure you are up to speed on JavaScript typed arrays as well as GPU buffers, both in terms of general concepts as well as a basic graps of the API.

JavaScript has a number of different ways to represent binary data (Browser `Blob`, Node.js Buffers, base64 etc), however deck.gl primarily accepts typed arrays. deck.gl should accept GPU buffers (`WebGLBuffer` or luma.gl `Buffer` instances).


### CPU vs GPU memory

Ultimately all deck.gl rendering is done on the GPU, and all memory must be available to the GPU by being "uploaded" into GPU memory `Buffers`. By pre-creating GPU buffers and passing these to deck.gl layers you exercise the maximum amount of control of memory management.

```js
import {Buffer} from 'luma.gl';
const buffer = new Buffer(gl, {data: });
```

Note that GPU buffers have many advanced features. They can be interleaved etc. The luma.gl `Accessor` class lets you describe how GPU Buffers should be accessed.


### Endianness

In most cases, when working with binary data, care must be taken to properly define and respect "endianness" which essentially describes the order of bytes when larger numbers are stored in memory. However, essentially all of the current web is little endian, so potential big-endian issues are ignored for now.


### Flattened vs. Nested Data

Binary data is flat, whereas JavaScript Arrays can have structure


### Interleaved Data

Binary data can be interleaved. Working directly with interleaved data requires working with  luma.gl `Buffer` instances and attribute accessor objects and is considered an advanced topic.

```js
// lon1, lat1, radius1, red1, green1, blue1, lon2, lat2, ...
const binaryData = new Float32Array([-122.4, 37.78, 1000, 255, 200, 0, -122.41, 37.775, 500, 200, 0, 0, -122.39, 37.8, 500, 0, 40, 200]);
```


## Binary Table Formats

deck.gl layers are designed to accept "tables" of data as input (the `data` prop). Tables can be organized in several different ways. For binary data you will be working with columnar tables.


### Row-Based Tables (non-Binary)

Row-based tables are the most common and generally the easiest to work with (each row is typically a JavaScript object with fields representing the values of various columns at that row).

```js
new Layer({
  data: [
    {value: 1, time: 1.00},
    {value: 2, time: 1.10},
  ]
})
```

## Columnar Tables

Organizing values by column instead of row creates a columnar table. Columnar tables can be significantly more efficient. In particular, because each value is of the same type, columnar tables can be stored as binary data.

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

More advanced binary columnar table formats like Apache Arrow solves this by breaking logical arrays into chunks. An additional benefit of chunked arrays can support remarkably efficient data-frame operations (slicing/dicing and filtering multigigabyte data set with "zero cost").

Another complication when using binary columnar tables is that it may not be possible to represent e.g. the lack of a value. In some libraries (e.g. Apache Arrow) this is solved through an additional `null map`.

Thus, a downside of chunked arrays is that they are complex to work with that they typically require an API (such as Apache Arrow).

Chunked Arrow Arrays follows a more complicated relationship with `Vector` instances representing chunks:

`Table ---* Column (Chunked) ---* Vector`

Note: These cannot currently be used in deck.gl without pre-concatenating the chunks.


> There is an RFC (chunked-data-rfc) that would enable chunked data tables (data frames) to be directly consumed by deck.gl (and then sliced and diced at zero cost).


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


## Use Binary Data to Generate Attributes in CPU/JavaScript

> JavaScript iteration approaches for binary data bundles are under development for v7
