# Using GPUTable

The `GPUTable` manages GPU buffer(s) representing a table of binary columns, where "table" implies that the columns have the same number of "rows" (though not necessarily the same byte length).

The `GPUTable` class carefully designed to support Apache Arrow formatted tables:
- Supports initialization from arrow tables, building GPU buffer(s) from the chunked columns)
- Supports incremental initialization from RecordBatches (growing as tables are loaded
- Attempts to cover a large subset of the data types that can be represented as columns in Arrow tables.
- Defines mapping between Arrow data types and GLSL
- Defines transformations

## References

This guide describes basic usage of `GPUTable`, see separate article for more advanced use cases, including:
- Variable Length Rows
- Constant columns...
- Index column...

It can be useful to understand how `GPUTable` compares with other similar APIs:
- The Apache Arrow `Table` class.
- The Python pandas [`DataFrame`](https://pandas.pydata.org/pandas-docs/stable/reference/frame.html) class.
- The [GPU Data Frame](http://gpuopenanalytics.com/#/PROJECTS) in the [GoAi](http://gpuopenanalytics.com/#/) GPU Open Analytics Initiative.


## Creating `GPUTable` Instances

Initializing from Arrow

```js
const gpuTable = new GPUTable(arrowTable);
gpuTable.setTable(arrowTable);
```

## Column Selection and Metadata

When a table is loaded, not all the columns may need to be replicated on the GPU.

The unnecessary columns could be dropped before creating the GPU table using JS

```js
import {Table} from 'apache-arrow';
let arrowTable = ...;

// Create a new Arrow table filtering out columns...
arrowTable = Table.from(...); // TBA

const gpuTable = new GPUTable(arrowTable);
```

Or the `GPUTable` can accept a columns list:

```js
const gpuTable = new GPUTable(arrowTable, {
  columns: ['longitude', 'latitude', 'height']
});
```

TBD:
- Does the columns filter remain when table is updated? If new column is added to table, does it get filtered out?
- Does the column filter represent 'required' columns? Is an exception thrown if columns are not present?

The way the columns get uploaded to the GPU matters.

## Extracting binary data from the GPU table.

- `gpuTable.getAttributes()`
- `gpuTable.getTextures()`

Returns an array of attributes. Some table colums may be mapped to multiple attributes.

## DataFrames

Columnar Tables can be treated like data frames (see Python Pandas).

Arrow DataFrames:

```js
import {ArrowLoader} from `@loaders.gl/arrow`;
const table = parse(..., ArrowLoader, {});
const gpuTable = new GPUTable(table);
table = table.slice(1000, 3000); // can drop chunks
gpuTable.setTable(table);
table = table.removeColumn('price'); // drops chunks
gpuTable.setTable(table);
```

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

Preparation of vec2, vec3, vec4s from individual columns into an interleaved column.

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


## Arrow to GLSL Type Map

Key Features
- Preparation of vec2, vec3, vec4s from individual columns into an interleaved column.


| GLSL Type   | Arrow Type           | Attributes | Data Texture | Comment  |
| ---         | ---                  | ---        | ---          | ---      |
| `float`     | Float32              |            |              |          |
| `vec2`      | Fixed size binary    |            |              |          |
| `vec3`      | Fixed size binary    |            |              |          |
| `vec4`      | Fixed size binary    |            |              |          |
| `double`    | Float64              |            |              |          |
| `dvec2`     | Fixed size binary    |            |              |          |
| `dvec3`     | Fixed size binary    |            |              |          |
| `dvec4`     | Fixed size binary    |            |              |          |
| `int`       | Int32 (Int16, Int8)  |            |              |          |
| `ivec2`     | Fixed size binary    |            |              |          |
| `ivec3`     | Fixed size binary    |            |              |          |
| `ivec4`     | Fixed size binary    |            |              |          |
| `unsigned`  | Int32 (Int16, Int8)  |            |              |          |
| `uvec2`     | Fixed size binary    |            |              |          |
| `uvec3`     | Fixed size binary    |            |              |          |
| `uvec4`     | Fixed size binary    |            |              |          |
| `bool`      | ?                    |            |              |          |
| `bvec2`     | N/A                  |            |              |          |
| `bvec3`     | N/A                  |            |              |          |
| `bvec4`     | N/A                  |            |              |          |
| `mat2`      | Fixed size binary    |            |              |          |
| `mat3`      | Fixed size binary    |            |              |          |
| `mat4`      | Fixed size binary    |            |              |          |
| `mat`n`x`m  | Fixed size binary    |            |              |          |
| `dmat2`     | Fixed size binary    |            |              |          |
| `dmat3`     | Fixed size binary    |            |              |          |
| `dmat4`     | Fixed size binary    |            |              |          |
| `dmat`n`x`m | Fixed size binary    |            |              |          |

- GPU allows integer columns to be exposed as floats
- GPU allows integer columns exposed as floats to be normalized

### Handling of 64 bit data

On GLSL versions that do not support `double` and `dvec*` data types, double data types are split into two sets of attributes, one with the high 32 bit float and one with the suffix `_64low`.

Note that the splitting of `Float64` into two `Float32` values is done on the CPU as the attribute is uploaded to the GPU. The two values for each float are interleaved in memory are exposed as two separate attributes using `stride`.

## GPU Memory Management

A `GPUTable` will create contiguous GPU memory for its chunks.

On initial creation, this just involves calculating the total length of all the chunks in each column, and uploading these.

### Incremental Loading (P1)

Apache Arrow comes with built-in support for streaming in Apache Arrow data, and loaders.gl is providing a growing set of streaming table loaders that convert textual tabular formats to binary columnar / Apache Arrow formats on the fly.

In both cases, ES2018 async iterators are returned that yield successive batches of rows from the table, containing equal-length chunks of the table's columns.

A GPU Table can efficiently accommodate updates resulting from a table growing through additional batches. Buffers get "topped off" (possibly being reinitialized).

TBD
-  Is it better for the GPU Table to create new GPU `Buffer` instances when reallocating (which would require apps to rebind buffers), or is it better to keep the same buffers and reinitialize them internally (requiring two CPU copies, first into temporary buffer and then back into the original, resized buffer).

