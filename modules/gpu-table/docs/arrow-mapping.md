# Storing GPU Attributes in Arrow Tables

Columnar tables typically have columns one value per row (say `longitude`, `latitude` and `height`) while GPU shaders typically work on columns (i.e. vertex attributes) with one short vector (`[longitude, latitude, height]`) per row.

While it is possible to efficiently combine the invidual columns to a new column after loading, to maximize efficiency and to avoid using memory to store the temporary, throw-away individual columns, it can be desirable to generate the table with a pre-interleaved column with a short fixed-size array in each row.

Thus, to represent typical GPU attributes as Arrow table columns, we need columns that contains short fixed-size arrays of numbers, e.g. three 32-bit floats per row (representing positions) or four 8-bit unsigned integers per row (representing colors).

The Apache Arrow type system currently does not directly support short fixed-size typed arrays, but this is easily remedied using the `FixedSizeBinary(N)` column type together with some Arrow column metadata (which can be provided through the `schema` object that is part of every Arrow table).

## Schemas

Arrow supports simple schemas, along the lines of

```js
const schema = [
  {name: 'position', type: ..., metadata: {type: `Float32Array`}},
];

const arrowTable = new Table(schema);
```

Apache Arrow specification itself does not define the names or semantics of any actual metadata fields. Instead, it is the `GPUTable` class that assigns semantics to a selection of metadata fields, to describe how various columns should be mapped to attributes.

| Field | Type | Default | Description |
| ---   | ---  | ---     | ---         |
| | | | |


The fact that the `metadata` object is an official part of the Apache Arrow format gives applications the ability to annotate Arrow tables either:
- server-side, at generation time, before tables are written to disk or streamed to the client
- client side, just after reading them but before passing them to the `GPUTable` class.

Key Features
- Preparation of vec2, vec3, vec4s from individual columns into an interleaved column.

Options for handling short arrays:
- Use arrow metadata?
- Use arrow structs?

## Arrow to GLSL Type Map

| Metadata Type | Arrow Type             | Metadata                     | Data Texture | Comment  |
| ---           | ---                    | ---                          | ---          | ---      |
| `Float32`     | `Float32`              |                              |              |          |
| `Float32[2]`  | `FixedSizeBinary(8)`   | type: `GL.FLOAT`, size: 2    |              |          |
| `Float32[3]`  | `FixedSizeBinary(12)`  | type: `GL.FLOAT`, size: 3    |              |          |
| `Float32[4]`  | `FixedSizeBinary(16)`  | type: `GL.FLOAT`, size: 4    |              |          |
| `Float64`     | `Float64`              |                              |          |
| `Float64`[2]  | FixedSizeBinary(16)    | type: `GL.DOUBLE`, size: 2   |              |          |
| `Float64`[3]  | FixedSizeBinary(24)    | type: `GL.DOUBLE`, size: 3   |              |          |
| `Float64`[4]  | FixedSizeBinary(32)    | type: `GL.DOUBLE`, size: 4   |              |          |
| `int`       | Int32 (Int16, Int8)    |            |              |          |
| `ivec2`     | FixedSizeBinary(8)     |            |              |          |
| `ivec3`     | FixedSizeBinary(12)    |            |              |          |
| `ivec4`     | FixedSizeBinary(16)    |            |              |          |
| `unsigned`  | Uint32 (Uint16, Uint8) |            |              |          |
| `uvec2`     | FixedSizeBinary(8)     |            |              |          |
| `uvec3`     | FixedSizeBinary(12)    |            |              |          |
| `uvec4`     | FixedSizeBinary(16)    |            |              |          |
| `bool`      | TBD                    |            |              |          |
| `bvec2`     | TBD                    |            |              |          |
| `bvec3`     | TBD                    |            |              |          |
| `bvec4`     | TBD                    |            |              |          |
| `mat2`      | FixedSizeBinary(16)    | `vec4`     |              |          |
| `mat3`      | FixedSizeBinary(36)    | `vec4`* 3  |              |          |
| `mat4`      | FixedSizeBinary(64)    | `vec4`* 4  |              |          |
| `dmat2`     | FixedSizeBinary(32)    | `vec4`* 2  |              |          |
| `dmat3`     | FixedSizeBinary(72)    | `vec4`* 6  |              | TBD - Would take a huge chunk of attribute bank |
| `dmat4`     | FixedSizeBinary(128)   | `vec4`* 8  |              | TBD - Would take a huge chunk of attribute bank |


| `mat`n`x`m  | FixedSizeBinary(n*m*4) | TBD        |              |          |
| `dmat`n`x`m | FixedSizeBinary(n*m*8) | TBD        |              |          |

## Arrow to GLSL Type Map


| GLSL Type   | Arrow Type             | Attributes | Data Texture | Comment  |
| ---         | ---                    | ---        | ---          | ---      |
| `float`     | Float32                |            |              |          |
| `vec2`      | FixedSizeBinary(8)     |            |              |          |
| `vec3`      | FixedSizeBinary(12)    |            |              |          |
| `vec4`      | FixedSizeBinary(16)    |            |              |          |
| `double`    | Float64                |            |              |          |
| `dvec2`     | FixedSizeBinary(16)    |            |              |          |
| `dvec3`     | FixedSizeBinary(24)    |            |              |          |
| `dvec4`     | FixedSizeBinary(32)    |            |              |          |
| `int`       | Int32 (Int16, Int8)    |            |              |          |
| `ivec2`     | FixedSizeBinary(8)     |            |              |          |
| `ivec3`     | FixedSizeBinary(12)    |            |              |          |
| `ivec4`     | FixedSizeBinary(16)    |            |              |          |
| `unsigned`  | Uint32 (Uint16, Uint8) |            |              |          |
| `uvec2`     | FixedSizeBinary(8)     |            |              |          |
| `uvec3`     | FixedSizeBinary(12)    |            |              |          |
| `uvec4`     | FixedSizeBinary(16)    |            |              |          |
| `bool`      | TBD                    |            |              |          |
| `bvec2`     | TBD                    |            |              |          |
| `bvec3`     | TBD                    |            |              |          |
| `bvec4`     | TBD                    |            |              |          |
| `mat2`      | FixedSizeBinary(16)    | `vec4`     |              |          |
| `mat3`      | FixedSizeBinary(36)    | `vec4`* 3  |              |          |
| `mat4`      | FixedSizeBinary(64)    | `vec4`* 4  |              |          |
| `dmat2`     | FixedSizeBinary(32)    | `vec4`* 2  |              |          |
| `dmat3`     | FixedSizeBinary(72)    | `vec4`* 6  |              | TBD - Would take a huge chunk of attribute bank |
| `dmat4`     | FixedSizeBinary(128)   | `vec4`* 8  |              | TBD - Would take a huge chunk of attribute bank |
| `mat`n`x`m  | FixedSizeBinary(n*m*4) | TBD        |              |          |
| `dmat`n`x`m | FixedSizeBinary(n*m*8) | TBD        |              |          |

- GPU allows integer columns to be exposed as floats
- GPU allows integer columns exposed as floats to be normalized

### Handling of 64 bit data

On GLSL versions that do not support `double` and `dvec*` data types, double data types are split into two sets of attributes, one with the high 32 bit float and one with the suffix `_64low`.

Note that the splitting of `Float64` into two `Float32` values is done on the CPU as the attribute is uploaded to the GPU. The two values for each float are interleaved in memory are exposed as two separate attributes using `stride`.
