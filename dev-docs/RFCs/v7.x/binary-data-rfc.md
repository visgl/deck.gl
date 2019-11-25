# RFC: Using Binary Data

* Authors: Ib Green, Xiaoji Chen
* Date: December 19, 2018
* Status: **Implemented**

> This RFC was written as an article for the deck.gl Developer's Guide, rather than in the standard format. The intention was to copy some of this text to the developer's guide once it matures.


## Overview

> This documents references some in-progress or hypothetical functionality, not everything is implemented yet. The intent is to show a "complete story" that will help us understand how each piece fits in to the big picture.


While all deck.gl layers are designed to work with classic JavaScript arrays of objects as `data`, it is sometimes desirable for applications to work directly with binary data and to be able to pass such binary data to layers. The motivation is often performance-related but it could just be that the application happens to have data in a binary format.

This article focused on the following use cases:

* **Using typed arrays as layer input data** - Using The input data is in binary form, perhaps it is delivered this way from the back-end, and it would be preferable to not have to unpack it.
* **Using typed arrays or GPU buffers directly as layer attributes** - The input data is already formatted in the memory format expected by the GPU and deck.gl's shaders.


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
