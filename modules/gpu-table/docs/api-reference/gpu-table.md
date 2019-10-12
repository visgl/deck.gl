# GPUTable Class

A `GPUTable` manages an array of GPU buffers representing a columnar table of binary columns of the same length.

See the [GPUTable Guide]().

Remarks:
- `GPUTable` columns are instances of `GPUColumn`, each of which hold a GPU buffer.
- `GPUTable` API is intentionally similar

## Usage

`Table.new()` accepts an `Object` of `Columns` or `Vectors`, where the keys will be used as the field names for the `Schema`:

```js
const i32s = new Int32Array([1, 2, 3]);
const f32s = new Float32Array([.1, .2, .3]);
const table = new GPUTable(gl, {
  columns: {i32: i32s, f32: f32s }
});
assert(table.schema.fields[0].name === 'i32');
```

It also accepts a a list of Vectors with an optional list of names or
Fields for the resulting Schema. If the list is omitted or a name is
missing, the numeric index of each Vector will be used as the name:

```js
const i32s = new Int32Array([1, 2, 3]);
const f32s = new Float32Array([.1, .2, .3]);
const table = new GPUTable(gl, {
  columns: [i32s, f32s],
  columnNames: ['i32']
});
assert(table.schema.fields[0].name === 'i32');
assert(table.schema.fields[1].name === '1');
```

If the supplied arguments are `GPUColumn` instances, `GPUTable` will infer the `Schema` from the `Column`s:

```js
const i32s = new GPUColumn(gl, 'i32', Int32Vector.from([1, 2, 3]));
const f32s = new GPUColumn(gl, 'f32', Float32Vector.from([.1, .2, .3]));
const table = new GPUTable(gl, i32s, f32s);
assert(table.schema.fields[0].name === 'i32');
assert(table.schema.fields[1].name === 'f32');
```

## Members

### schema (readonly)

The `Schema` of this table.

### length : Number (readonly)

The number of rows in this table.

TBD: this does not consider filters

### gpuMemory : Number (readonly)

An estimate of the GPU memory used by this table.


## Methods

## constructor(gl : WebGLRenderingContext, options? : Object)

### constructor(...args: any[])

```js
const gpuTable = new GPUTable(gl, {id: 'gpu-table'});
```

Parameters:

- `options.id`=`'gpu-table-...'` (String, optional) - identifier (for debugging)
- `options.rows`=`0` (Number, optional) - request allocation of certain number of rows
- `options.batched`=`false` (Boolean, optional)
- `options.columns`=`{}` (Object | Array , optional)
- `options.columnNames`=`[]` (Object, optional)
- `options.schema`=`[]`

### destroy()

Deletes the GPU Buffer objects associated with this table.

### addColumns(columns : Object, schema? : Object)

Adds attribute descriptions to the `GPUTable` that describe the attributes that should be auto-calculated.

```js
gpuTable.addColumns({
  positions: {size: 2, accessor: 'getPosition', update: calculatePositions},
  colors: {size: 4, type: GL.UNSIGNED_BYTE, accessor: 'getColor', update: calculateColors}
});
```

Takes a single parameter as a map of attribute descriptor objects:

* keys are attribute names
* values are objects with attribute definitions:

luma.gl [accessor parameters](https://luma.gl/#/documentation/api-reference/webgl-2-classes/accessor):
- `type` (Enum, optional) - data type of the attribute, see "Remarks" section below.
- `size` (Number) - number of elements per object
- `offset` (Number) - default `0`
- `stride` (Number) - default `0`
- `normalized` (Boolean) - default `false`
- `integer` (Boolean) - WebGL2 only, default `false`
- `divisor` (Boolean, optional) - `1` if this is an instanced attribute (a.k.a. divisor). Default to `0`.


### selectColumns(columnNames: string[]) : GPUTable

Updates the table to include only the specified subset of columns. The GPU memory for any removed columns will be released.

### removeColumns(columnNames: string[]) : GPUTable

Removes the specified columns from the table. The GPU memory for any removed columns will be released.

Parameters:

* `columnNames` (Array) - Array of column names to be removed

### clone() : GPUTable

Returns a new copy of this table.

### filter(predicate: Predicate) : FilteredDataFrame

TBD - Sets a filter predicate on this table.

Note that this operation just registers filter predicates and is this very cheap to call. No actual filtering is done until iteration starts.

### countBy(columnName : String) : Table

Returns a new Table that contains two columns (`values` and `counts`).

## Attribute Type

The following `type` values are supported for attribute definitions:

| type        | value array type | notes |
| ----        | ---------------- | ----- |
| `GL.FLOAT`  | `Float32Array` | |
| `GL.BYTE`   | `Int8Array` | |
| `GL.SHORT`  | `Int16Array` | |
| `GL.INT`    | `Int32Array` | |
| `GL.UNSIGNED_BYTE`  | `Uint8ClampedArray` | |
| `GL.UNSIGNED_SHORT` | `Uint16Array` | |
| `GL.UNSIGNED_INT`   | `Uint32Array` | |
| `GL.DOUBLE` | `Float64Array` | Because 64-bit floats are not supported by WebGL, the value is converted to an interleaved `Float32Array` before uploading to the GPU. It is exposed to the vertex shader as two attributes, `<attribute_name>` and `<attribute_name>64low`, the sum of which is the 64-bit value. |

### Attribute Type Auto-Inference

Columnar data can be auto-inferred from javascript typed array types as follows:

| Typed Array    | type             | notes |
| ----           | ---------------- | ----- |
| `Float32Array` | `GL.FLOAT` | |
| `Int8Array`    | `GL.BYTE` | |
| `Int16Array`   | `GL.SHORT` | |
| `Int32Array`   | `GL.INT` | |
| `Uint8Array`   | `GL.UNSIGNED_BYTE` | |
| `Uint8ClampedArray` | `GL.UNSIGNED_BYTE` | |
| `Uint16Array`  | `GL.UNSIGNED_SHORT` | |
| `Uint32Array`  | `GL.UNSIGNED_INT` | |
| `Float64Array` | `GL.DOUBLE` | two attributes: `Float32Array` `<attribute_name>` and `<attribute_name>64low`. |

Notes:
 - Because 64-bit floats are not supported by WebGL, the value is converted to an interleaved `Float32Array` before uploading to the GPU. It is exposed to the vertex shader as two attributes, `<attribute_name>` and `<attribute_name>64low`, the 64-bit sum of the high value times ? and the low value is the 64-bit value.

## Remarks

If the supplied column lengths are unequal, `new GPUTable()` will extend the lengths of the shorter Columns, allocating additional bytes to represent the additional null slots. The memory required to allocate
these additional bitmaps can be computed as:

```js
let additionalBytes = 0;
for (let vec in shorter_vectors) {
 additionalBytes += (((longestLength - vec.length) + 63) & ~63) >> 3;
}
```

For example, an additional null bitmap for one million null values would require `125,000` bytes (`((1e6 + 63) & ~63) >> 3`), or approx. `0.11MiB`

## Source

[modules/gpu-table/src/lib/gpu-table.js](https://github.com/uber/deck.gl/blob/master/modules/gpu-table/src/lib/gpu-table.js)
