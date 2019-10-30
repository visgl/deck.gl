# GPUTable Roadmap

The `GPUTable` class is a new addition to deck.gl v8 that is envisioned to be represent a central theme for the evolution of the framework

## Apache Arrow Support

A primary design goal of the `GPUTable` class was to support direct transfer of Apache Arrow formatted tables to the GPU.

Arrow support can be built gradually over the course of deck.gl 8.x releases:

- Support initialization from arrow tables, building GPU buffer(s) from the chunked columns
- Support incremental initialization from RecordBatches (growing columns as additional chunks are loaded)
- Cover a large subset of the data types that can be present as columns in Arrow tables.
- Define a mapping between Arrow data types and GL data types
- Handle Arrow data types that require multiple attributes (doubles, etc)
- Define Arrow metadata conventions to let applications work with GL friendly columns
- Define transformations that convert individual columns to shader friendly attributes

Some more advanced additions
- Variable Length Columns: Define methods to work with variable-length data types (polygons...)
- Constant columns - Add support for constants to GPU Table
- Index column? For filteringg


## Filtering

TBD:
- Does the columns filter remain when table is updated? If new column is added to table, does it get filtered out?
- Does the column filter represent 'required' columns? Is an exception thrown if columns are not present?


## Data Textures for Random Access

The GPUTable class should make it easy to do GPGPU programming. An important tool in the GPGPU programmer's arsenal is to be able to use data textures for random access. Thus, making selected columns available as readable (or writeable) data textures should be valuable, e.g:

- `gpuTable.getAttributes()`
- `gpuTable.getTextures(...columnNames)`?


## Aggregation as a `GPUTable -> GPUTable` transform

Currently, we have a set of aggregating layers in deck.gl that are somewhat ad-hoc in terms of each layer having special props and methods to handle the aggregations. Each layer defines props and shaders for their aggregations, and this means that a learning curve can be required for a new programmer to start modifying these layers.

If we could represent the aggregations at the core of these layers as `GPUTable -> GPUTable` operations, then we might be able to:
- make it easier to reason about aggregation
- simplify the implementation of the aggregating layers
- reuse aggregators between layers
- and unlock additional innovation in terms of new aggregators/aggregation options etc.

## CPU DataFrame Support

Columnar Tables can be treated like data frames (e.g. Python Pandas). One approach is to enable `GPUTable`s to work as efficient "GPU-side shadows" of CPU-side Arrow DataFrames, mirroring the arrow table after CPU data frame operations:

```js
import {ArrowLoader} from `@loaders.gl/arrow`;
const table = parse(..., ArrowLoader, {});
const gpuTable = new GPUTable(table);
table = table.slice(1000, 3000); // can drop chunks
gpuTable.setTable(table);
table = table.removeColumn('price'); // drops chunks
gpuTable.setTable(table);
```

Depending on what operations are performed on CPU, this might benefit from a more advanced GPU memory management system (e.g. data frame operations may drop only certain chunks, so reuploading all data might not be needed).

## GPU DataFrame Support

The `GPUTable` class could also support a set of "data frame" type methods and these could be implemented directly on GPU.

- dropping and adding columns should be automatically supported
- `table.slice()` can be supported by controlling first and last index of draw call
- ...

## Transformations

`GPUTable`s are perfect sources for `TransformFeedback` operations. New tables (new columns) can be generated from existing tables by composing or processing existing columns.

```js
const gpuTable = GPUTransform(gpuTable, {
  columns: {
    'positions': {
      type: GL.DOUBLE, // Creates a `Float64` array (i.e. two interleaved Float32Arrays with high-low values)
      size: 3, // 3 values (6 Float32s) per element.
      operation: 'interleave',
      components: ['longitude', 'latitude', 'height'] // Takes components from these columns and interleaves them
    },
    // Remove the input columns
    'longitude': 'drop',
    'latitude': 'drop',
    'height': 'drop'
  },
  // Drop the input columns
  columnFilter:
  excludeColumns: ['longitude', 'latitude', 'height']
})
```

### Type Changes

GPU attributes are to some degrees flexible and accept a range of data types (meaning that often no transformation may be necessary), and the `getAttributes()` method of the `GPUTable` sets the required flags (e.g. ) it is sometimes valuable to transform data types to achieve better memory characteristics.

- Colors: When rendering, colors are most efficiently represented as triples or quadruples of `Uint8` rather than `Float32`s.
- Normals: Normals are sufficiently represented as triples of `Uint8` - they could even be oct-encoded on the fly though this seems like overkill.
- Positions can be quantized and well represented by Int16 or Int32.

```js
const gpuTable = GPUTransform(gpuTable, {
  columns: {
    'positions': {
      type: GL.BYTE,
      size: 4,
      normalized
      'colors'
    }
  }
})
```


Perhaps a library of support functions, based on transform feedback, could provide such conversions.

### Interleaving (of individual attributes) - P0

Preparation of `vec2` , vec3, vec4s from individual columns into an interleaved column.

### Interleaving (of entire GPUTable) - P2

Interleaving of all attributes could be handled internally by the `GPUTable` class, which means the `GPUTable` would just manage a single GPU `Buffer`.

Interleaving means that more cache locality and anecdotally, this leads to better performance, although the improvement seem to be fairly small (5%) and also not always seen on modern GPUs.

Interleaving of all attributes does make the table harder to work with, as adding columns requires regenerating the entire buffer, although it should be possible to do this using transform feedback.

### Variable size colums

Columns can also be variable length:
- While a table can contain multiple variable length columns, only one multiple variable length layout can be used at a time. This is defined by the _primary colum_
- If other variable length columns have the same "layout", i.e the same length for each row as the primary column, they can also be active.

When working with variable length columns:
- remaining columns are expanded on the GPU to match the length of the primary column(s)

TBD:
- what happens when multiple, non-aligned variable size columns are in the table:
    - throw an error when generating GPU buffers
    - cut/pad the remaining columns?
    - use the column selection mechanism

### Dictionary Columns

> There are potential issues with how arrow encodes dictionary columns in record batches that may make it impractical to create dictionary columns before all `RecordBatches` have arrived.

Enumerations are

### Tesselation

When dealing with variable length columns, tesselation is often needed before rendering.

For instance, a variable length binary column can represent polygons to either be tesselated as outlines or perhaps as extruded blocks.

Tesselation generally happens on the CPU.

Possible conventions for storing polygons:

- first value: number of polygons
  - first value in each polygon: number of vertices in that polygon
    - vertices: either in 2 or 3 components per vertex

Tesselation generates one or more variable size columns.

### Generating Attributes From a GPUTable

The `GPUAttributes` class specifies information about the attributes that are used by (i.e. defined in) a shader. It can be automatically extraced during shader compilation or generated programmatically.

```js
  new GPUAttributes({
    instancePositions: {
      size: 4,
      type: GL.DOUBLE,
      accessor: ['getSourcePosition', 'getTargetPosition'],
      update: this.calculateInstancePositions
    },
    instanceSourceColors: {
      size: this.props.colorFormat.length,
      type: GL.UNSIGNED_BYTE,
      normalized: true,
      accessor: 'getSourceColor',
      defaultValue: DEFAULT_COLOR
    },
    instanceTargetColors: {
      size: this.props.colorFormat.length,
      type: GL.UNSIGNED_BYTE,
      normalized: true,
      accessor: 'getTargetColor',
      defaultValue: DEFAULT_COLOR
    },
    instanceWidths: {
      size: 1,
      accessor: 'getWidth',
      defaultValue: 1
    },
    instanceHeights: {
      size: 1,
      accessor: 'getHeight',
      defaultValue: 1
    },
    instanceTilts: {
      size: 1,
      accessor: 'getTilt',
      defaultValue: 0
    }
  });
```

## Filtering

GPUTables can be filtered. Standard arrow predicates are interpreted and transpiled into GLSL filter functions. Filtering can be done by adjusting the start-end indices for rendering, and by discarding fragments from filtered rows

- `gpuTable.getFilterModule()`: Returns a `shadertools` GLSL module that implements the filter set by the current predicates.

`module.vs` - the vertex shader block
`module.fs` - the fragment shader block
`module.getUniforms(options)` - generates uniforms from column values
`module.uniforms` - a list of uniform values in the query (can e.g. be used to autopopulate a UI with sliders etc)

### Handling of 64 bit data

On GLSL versions that do not support `double` and `dvec*` data types, double data types are split into two sets of attributes, one with the high 32 bit float and one with the suffix `_64low`.

Note that the splitting of `Float64` into two `Float32` values is done on the CPU as the attribute is uploaded to the GPU. The two values for each float are interleaved in memory are exposed as two separate attributes using `stride`.

## GPU Memory Management

A `GPUTable` will create contiguous GPU memory for its chunks.

On initial creation, this just involves calculating the total length of all the chunks in each column, and uploading these.

### GPU Limits

- Unless unified GPU memory architecture, do we have a 2-6GB typical limit? Is there any paging?
- For random access we are limited by the size of a GPU texture (e.g 16MB = 4Kx4K).
- Do we provide some configuration object to let apps control GPU memory usage?
- Is any detection possible in WebGL or via user agent sniffing?
- Do we detect allocation errors and adapt dynamically?
- Is there a risk we knock out rendering code (which is typically less resilient to allocation failures) by filling up GPU memory?

### Incremental Loading (P1)

Apache Arrow comes with built-in support for streaming in Apache Arrow data, and loaders.gl is providing a growing set of streaming table loaders that convert textual tabular formats to binary columnar / Apache Arrow formats on the fly.

In both cases, ES2018 async iterators are returned that yield successive batches of rows from the table, containing equal-length chunks of the table's columns.

A GPU Table can efficiently accommodate updates resulting from a table growing through additional batches. Buffers get "topped off" (possibly being reinitialized).

TBD
-  Is it better for the GPU Table to create new GPU `Buffer` instances when reallocating (which would require apps to rebind buffers), or is it better to keep the same buffers and reinitialize them internally (requiring two CPU copies, first into temporary buffer and then back into the original, resized buffer).


### Optimized DataFrame Style Table Updates (P2)

Columnar Tables can be treated like data frames (see Python Pandas), e.g. using Apache Arrow DataFrames, where operations can be done very efficiently on the chunked memory by just dropping or adding chunks.

To support this, a function `gpuTable.setTable(table)` could update the GPU buffers associated with the table.

```js
import {ArrowLoader} from `@loaders.gl/arrow`;
const table = parse(..., ArrowLoader, {});
const gpuTable = new GPUTable(table);
table = table.slice(1000, 3000); // can drop chunks
gpuTable.setTable(table);
table = table.removeColumn('price'); // drops chunks
gpuTable.setTable(table);
```

Since tables are chunked, and many data frame operations just drop or add a subset of chunks, only a subset of memory would need to be re-uploaded to the GPU.

Assuming we want to keep each column in a single buffer, so that we can process the table in a single draw call, this would require a more sophisticated memory management system on the GPU which can handle holes can be added as a refinement based on the strength of the JS data frame use case and the performance impact of reuploading the full table after each operation.

However: **change detection to assess if anything needs to be uploaded should be implemented in the first version**

TBD
- Performing operations an Arrow table while still loading (adding record batches), what is the impact?
- Approaches for GPU Buffer memory management? How to handle "holes": Use `DRAW_ELEMENTS` extension to draw subsets.
