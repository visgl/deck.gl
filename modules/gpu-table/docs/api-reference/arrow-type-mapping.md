# Arrow Mapping

The Apache Arrow type system, does not directly support some key columns types that are commonly used in GPUs, most notably short fixed-size vectors of numbers (mapped to `vec2`, `vec3`, `vec4` etc in GLSL).

The missing information can be provided using Arrow column metadata, through the `schema` that is part of every Arrow table.

- as vertex array attributes in shaders.

Key Features
- Preparation of from individual columns into an interleaved column.

Options for handling short arrays:
- Use arrow metadata?
- Use arrow structs?


## Mapping Primitive Types between Arrow and GL

| Arrow Type | GL Type  | values |
| ---   | ---    |
| Int8 | BYTE  | 0x1400 |
| Uint8 | UNSIGNED_BYTE | 0x1401 |
| Int16 | SHORT | 0x1402 |
| Uint16 | UNSIGNED_SHORT | 0x1403 |
| Int32 | INT | 0x1404 |
| Uint32 | UNSIGNED_INT | 0x1405 |
| Float32 | FLOAT | 0x1406 |
| Float64 | DOUBLE | 0x140a |

- Should we define the metadata fields as GL constants (`0x1406`) or GL type strings (`FLOAT`) or arrow type names (`Float32`)?
- Should we optimize for table generation. Folks who will be adding this metadata to table on the server side may have no eperience with GL constants?



## Arrow Metadata for Fixed-Size Numeric Array Types

| Metadata Type | Arrow Type             | Arrow Metadata               | Data Texture | Comment  |
| ---           | ---                    | ---                          | ---          | ---      |
| `Float32[1]`   | `Float32`             | Not required                 |              |          |
| `Float32[2]`  | `FixedSizeBinary(8)`   | type: `GL.FLOAT`, size: 2    |              |          |
| `Float32[3]`  | `FixedSizeBinary(12)`  | type: `GL.FLOAT`, size: 3    |              |          |
| `Float32[4]`  | `FixedSizeBinary(16)`  | type: `GL.FLOAT`, size: 4    |              |          |
| `Float64[1]`  | `Float64`              |                              |          |
| `Float64[2]`  | `FixedSizeBinary(16)`  | type: `GL.DOUBLE`, size: 2   |              |          |
| `Float64[3]`  | `FixedSizeBinary(24)`  | type: `GL.DOUBLE`, size: 3   |              |          |
| `Float64[4]`  | `FixedSizeBinary(32)`  | type: `GL.DOUBLE`, size: 4   |              |          |
| `Int32[1]`  | `Int32`                  |  Not required          |              |          |
| `Int32[1]`  | `FixedSizeBinary(8)`     |  type: `GL.INT`, size: 2          |              |          |
| `Int32[1]`  | `FixedSizeBinary(12)`    |  type: `GL.INT`, size: 3          |              |          |
| `Int32[1]`  | `FixedSizeBinary(16)`    |  type: `GL.INT`, size: 4          |              |          |




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


| GLSL Type   | Arrow Types            | Attributes | Data Texture | Comment  |
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

