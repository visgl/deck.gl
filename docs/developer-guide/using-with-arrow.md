# Using with Arrow

Columnar data stores each attribute, such as position or color, in a separate column.
Layers that support Apache Arrow vectors can convert these columns into rendering attributes
without requiring an application to construct a JavaScript object for each row.

Each layer's prop descriptions specify which accessors accept Arrow vectors.
This guide covers their shared input, conversion, and update rules.

Install `apache-arrow` alongside the deck.gl package that exports your layer.

## Supplying columns

An Arrow vector represents one value per object. Obtain a vector from a table with
`table.getChild('fieldName')`, or construct one with `vectorFromArray`.

Pass the vector to an accessor that accepts Arrow. Each accessor can take a row callback,
an Arrow vector, or a constant where the prop supports one.

For example, these ScatterplotLayer inputs draw the same two circles:

```js
import {Field, FixedSizeList, Float32, vectorFromArray} from 'apache-arrow';
import {ScatterplotLayer} from '@deck.gl/layers';

const data = [
  {position: [-122.4, 37.74], radius: 100},
  {position: [-122.41, 37.75], radius: 200}
];
const radii = vectorFromArray([100, 200], new Float32());
const positions = vectorFromArray(
  data.map(row => row.position),
  new FixedSizeList(2, new Field('value', new Float32(), false))
);

// Row callbacks
const rowsLayer = new ScatterplotLayer({
  data,
  getPosition: row => row.position,
  getRadius: row => row.radius
});

// An Arrow accessor alongside row data
const mixedLayer = new ScatterplotLayer({data, getRadius: radii});

// Arrow accessors, without row data
const columnsLayer = new ScatterplotLayer({getPosition: positions, getRadius: radii});
```

Use `table.getChild(...)` to select the field for each accessor. Separate longitude and latitude fields must first be
combined into fixed-size lists when supplying a position column.

## Column layouts and conversion

The accessor determines the required layout and how deck.gl converts the values for rendering.

### Scalars

Numeric scalar columns accept Arrow integer and floating-point types and convert to Float32.
Each prop defines its units and scaling. Scatterplot radii use `radiusUnits` and `radiusScale`. Conversion can lose precision for values not representable in Float32.

### Colors

Color columns accept numeric `FixedSizeList` values with three (RGB) or four (RGBA) components.
Integer channels use 0–255. Floating-point channels use 0–1. Conversion clamps and rounds
channels to RGBA8 (`unorm8x4`). RGB inputs receive opaque alpha.

Constant arrays and callback results typically use 0–255 for all channels.

### Positions and other vectors

Position columns require numeric fixed-size lists with two (XY) or three (XYZ) components.
Other numeric vector columns use the width specified by their prop. Layer coordinate-system
settings determine how the layer interprets positions.

Dictionary, string, and variable-size list inputs are unsupported by these numeric conversions.
Null values and invalid transformed values raise conversion errors, even when the schema is compatible.

## Cell identifiers

Cell layers accept Arrow vectors through their identifier accessors, such as `getHexagon`,
`getS2Token`, and `getQuadkey`. A row can contain one identifier or a list of identifiers for
one source feature. Arrow decodes dictionary-encoded identifiers before geometry generation.
H3, S2, and A5 accept Int64 and Uint64 identifiers without losing precision; signed values are
interpreted as unsigned 64-bit identifiers. Geohash and quadkey identifiers must be strings.

Picking reports the source feature index, while `highlightedObjectIndex` selects an expanded
cell row. H3Cluster uses each row's identifiers as one cluster.

### Cell styling

Style columns follow source-feature order. A value applies to all cells belonging to that
feature. Fill and outline colors follow the shared [Arrow color convention](#colors). Width and elevation columns contain numeric scalars. Nonempty `data` and style
columns must match the identifier column's row count. Null identifiers and styles are unsupported.

## Mixed inputs

Supplying an Arrow vector to a supported accessor enables column processing. Other accessors
can use constants or row callbacks. Binary inputs in `data.attributes` can supply
attributes omitted by Arrow accessors.

Keep row metadata in the same order as the columns when you need labels or other application
fields. Nonempty `data` must have the same length as the columns. Picking indexes refer to
these logical rows, including when the columns have multiple chunks.

With columns alone, use constant fallback accessors for omitted attributes. A row callback
cannot read fields from absent row objects. Binary attributes can also supply omitted
attributes, including constant descriptors.

## Loading and updates

GPU attribute conversion is asynchronous. Pending row data must load before fallback accessors can read it.
`layer.isLoaded` includes Arrow conversion. Deck calls `onAfterRender` after each frame.
Conversion errors are reported through the layer's `onError` callback.

Keep vectors stable between renders and supply new vectors when their contents change.
Chunked columns must have identical chunk lengths and draw in aligned ranges.
The layer uploads converted Arrow values to GPU buffers and releases those buffers when it
replaces the data or is removed.
`numInstances` can limit rendering to a prefix of the columns.

## Limitations

Rendering columns must have equal lengths and matching chunk structures, and must not contain nulls.
Arrow rendering accessors do not support attribute transitions or layer extensions. Use row accessors when you need those features.

See each layer's prop descriptions for supported inputs and the [loading data guide](./loading-data.md)
for other ways to provide data.


## Querying Arrow data

[Deck's `sqlParser`](../api-reference/core/deck.md#sqlparser) enables two ways to
use SQL with an Arrow table. The layer's [`query`](../api-reference/core/layer.md#query)
runs on the input data and can filter, rename, or select fields. An Arrow-enabled
accessor with `{sql: string}` evaluates an expression over the loaded rows.

```ts
import {Deck} from '@deck.gl/core';
import {sqlParser} from '@deck.gl/core/sql';
import {ScatterplotLayer} from '@deck.gl/layers';

new Deck({
  sqlParser,
  layers: [
    new ScatterplotLayer({
      id: 'points',
      data: tablePromise,
      query: 'SELECT * WHERE longitude IS NOT NULL AND latitude IS NOT NULL',
      getPosition: {sql: 'FLOAT64x2(longitude, latitude)'},
      getRadius: {sql: 'FLOAT32(SQRT(population))'},
      getFillColor: {sql: 'RGBA8(red, green, blue, 1.0)'}
    })
  ]
});
```

The layer's data is the implicit source. `FROM data` is optional.
For a URL, a source-capable loaders.gl loader can push down parts of the query.
Each accessor expression returns one value per loaded row in order. Picking
returns the row from the loaded table. Direct GPUVector props take precedence
over SQL or Arrow accessors for the same input.

Use `FLOAT32(expression)` to cast a numeric value to a 32-bit float. The typed
constructors `FLOAT32x2/x3/x4`, `FLOAT64x2/x3/x4`, `RGBA8`, `RGBA16`,
`RGBA16F`, and `RGBA32F` build fixed-size lists. `RGBA8` and `RGBA16` clamp
channels to [0, 1] and scale them to their integer ranges. A null component
makes the output value null. Use typed vector constructors at the top level
of an accessor expression.

For async iterables of Arrow record batches, `queryOutput: 'batches'` appends
each batch to the layer's data. `queryOutput: 'snapshots'` replaces the current
table with each incoming batch.

## Matching table fields to accessors

ScatterplotLayer uses matching, compatible Arrow table fields when an explicit
Arrow accessor or GPUVector is absent. Use the exact accessor name, such as
`getPosition` or `getRadius`. The table can be passed directly or resolved
asynchronously. Accessors and picking can still read other fields on the row.

## Direct GPUVector inputs

Some layers expose optional props for caller-owned luma.gl `GPUVector` buffers.
These unstable props follow the layer's GPU layout and can change at any time.
Check the layer reference for supported formats and the meaning and order of rows.

Instanced rendering layers take values in rendered instance order. Supplied
vectors must agree on row count and chunk boundaries. For GPU positions, choose a coordinate system that the rendering path can
use directly. Layers that require CPU preprojection for the supplied
coordinate system reject GPU position vectors. Provide row data for attributes
that use callback accessors and for picking metadata.

Layers that process features, tessellate geometry, or aggregate inputs can
require different buffers from the values their public accessors return. An
accessor can describe a source feature. A direct GPU input can represent
prepared vertices, instances, or aggregator inputs. Follow the specific prop's
contract when building those buffers.

Keep the vectors and their buffers alive while the layer uses them. The layer
borrows those buffers and releases its own conversion allocations.

## Streaming Arrow data

Layers can consume an async iterable of Apache Arrow `RecordBatch` objects or
Arrow `Table` objects. Promises resolving to these iterables are also
supported. Arrow remains an optional dependency and is loaded only when an Arrow chunk arrives.

```ts
new ScatterplotLayer({
  id: 'streamed-points',
  data: recordBatchStream,
  _dataLoadOptions: 'batched',
  getPosition: row => [row.longitude, row.latitude],
  getRadius: row => row.radius,
  onDataProgress: table => console.log(table.numRows)
});
```

The experimental `_dataLoadOptions` prop controls loading and accumulation:

- `'auto'` (default) loads URLs completely and appends chunks from application-supplied streams.
- `'batched'` loads URLs with loaders.gl `loadInBatches` and appends each batch to the current table.
- `'snapshots'` also loads URLs in batches, but replaces the entire table with each Arrow result.
  Each yield contains all rows to display at that point. It can be one record batch or a
  table containing multiple record batches.

Set `loaders` and `loadOptions` as usual when streaming a URL. The selected loader must produce
supported batches. Deck discards loader metadata and exposes Arrow tables to apps. Arrow batches
retain their columnar storage; they are not converted to row objects. Do not mix Arrow and row
chunks in one stream. An empty Arrow snapshot clears the table while retaining its schema.

`onDataProgress` receives the current accumulated or replacement table after each accepted batch.
`onDataLoad` runs once when the stream finishes. An empty stream completes with an empty array
and no progress callback. Replaced or finalized streams cannot publish further callbacks.

`dataTransform` retains its existing behavior for row-array streams; it is not applied to Arrow
chunks. Transform Arrow data in the producer before yielding it. This loading feature does not
select fields or execute SQL; use accessors or explicit column props as with other Arrow inputs.
