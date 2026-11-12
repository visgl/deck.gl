# Using with Arrow

ArcLayer, ColumnLayer, IconLayer, LineLayer, PointCloudLayer, ScatterplotLayer, and
SimpleMeshLayer accept Apache Arrow vectors through column props. Use columns to
provide attributes directly from Arrow data.

Install `apache-arrow` alongside `@deck.gl/layers`. The layer loads its converter when needed;
no converter registration or separate layer class is required.

## Input modes

These are usage patterns, not values of a `mode` prop. Supplying any column enables column
processing; omitting all columns uses the normal accessor path.

| Pattern | Inputs | Use when |
| --- | --- | --- |
| Row accessors | `data` and accessors | Your application has row objects. |
| Arrow columns | `positions`, styling columns, constant accessors | Your attributes are columnar. |
| Mixed inputs | Columns plus row data or binary attributes | Some attributes or metadata remain in rows. |

The [tabbed API examples](../api-reference/layers/scatterplot-layer.md#arrow-columns) show
equivalent row and Arrow inputs.

## Column layouts

For an existing Arrow table, `table.getChild('radius')` returns a vector suitable for `radii`
when the field is numeric. ScatterplotLayer can also discover compatible fields by their exact
column prop names from a table passed as `data`:

```ts
new ScatterplotLayer({id: 'points', data: table}); // table has a positions field
```

Explicit column props take precedence. Missing or incompatible fields use the existing accessors,
which receive Arrow rows. This also works with a promise that resolves to a table.
Other layers still require explicit column props. Combine separate longitude and latitude fields
into fixed-size lists before supplying positions.

| Column | Shape | Overrides |
| --- | --- | --- |
| `positions` | Numeric XY or XYZ fixed-size lists | `getPosition` |
| `radii` | Numeric scalars | `getRadius` |
| `elevations` | Numeric scalars | `getElevation` |
| `fillColors` | RGB or RGBA fixed-size lists | `getFillColor` |
| `lineColors` | RGB or RGBA fixed-size lists | `getLineColor` |
| `lineWidths` | Numeric scalars | `getLineWidth` |

Available column props depend on the layer; see its API reference.

Floating-point colors use 0–1; integer colors use 0–255. Columns must have equal lengths and
must not contain nulls. Layer settings such as `radiusUnits`, `radiusScale`, `stroked`, and
`coordinateSystem` still apply.

## Mixed inputs

A supplied column overrides its accessor; omitted columns use accessor or binary fallbacks.
Keep row metadata in the same order as the columns when you need labels or other application
fields. Nonempty `data` must have the same length as the columns.

```js
import {Field, FixedSizeList, Float32, vectorFromArray} from 'apache-arrow';
import {ScatterplotLayer} from '@deck.gl/layers';

const positions = vectorFromArray(
  [[-122.4, 37.74], [-122.41, 37.75]],
  new FixedSizeList(2, new Field('value', new Float32(), false))
);
const data = [{name: 'First', radius: 100}, {name: 'Second', radius: 200}];
const layer = new ScatterplotLayer({
  data,
  positions,
  getRadius: d => d.radius,
  getFillColor: [255, 140, 0],
  pickable: true,
  onClick: info => {
    if (info.index >= 0) console.log(data[info.index].name);
  }
});
```


With columns alone, use constant fallback accessors for omitted attributes. A row accessor
cannot read fields from absent row objects. Existing `data.attributes` binary attributes can
also supply omitted attributes, including constant descriptors.

## Loading and updates

Conversion is asynchronous. Pending row data must load before fallback accessors can read it.
`layer.isLoaded` includes conversion state, but is not a GPU-completion notification.
Deck's `onAfterRender` runs after a frame, not specifically after an Arrow conversion.
Conversion errors are reported through the layer's `onError` callback.

Keep vectors stable between renders and supply new vectors when their contents change.
Chunked columns must have identical chunk lengths and draw in aligned ranges, preserving logical row indexes for picking.
Arrow data still requires conversion and GPU upload; this is not a zero-copy rendering promise.
The layer manages GPU buffers it creates during conversion and releases them when replaced or removed.
`numInstances` can limit rendering to a prefix of the columns.

## Limitations

Column mode rejects nulls, mismatched lengths or chunk structures, attribute transitions, and layer extensions.
Use the normal accessor path when you need those features. See the
[ScatterplotLayer API](../api-reference/layers/scatterplot-layer.md#arrow-columns) and
[loading data guide](./loading-data.md) for more details.

## Schema validation

Column inputs must use the following Arrow types.

- Positions require numeric fixed-size lists with two or three components.
- Scalars accept integer or floating-point fields.
- Colors accept numeric RGB or RGBA fixed-size lists.
- Numeric vectors use their fixed-size list width.

Dictionary, string, and variable-size list inputs are unsupported. Null values and invalid
transformed values raise conversion errors, even when the schema is compatible.

### Selecting fields with a query

ScatterplotLayer can project a loaded Arrow table before resolving column inputs. Use
`columnsQuery.select` to keep fields by name, rename them, or compute fields with SQL strings or math.gl expression ASTs.
Use `where` and `limit` to restrict the rows before evaluating expressions.

```ts
import {sqlParser} from '@deck.gl/core/sql';

new Deck({
  sqlParser,
  layers: [
    new ScatterplotLayer({
      id: 'points',
      data: tablePromise,
      columnsQuery: `SELECT ARRAY[longitude, latitude]::DOUBLE PRECISION[2] AS positions,
        size AS radii`
    })
  ]
});
```

The loaded `data` table is the implicit source. `FROM data` is optional.

Column queries require Apache Arrow 21.2 or later with the current loaders.gl evaluator.
Structured selections can pass expression and predicate ASTs directly. To use strings inside
a structured selection, provide `sqlParser.parseExpression` for an expression or
`sqlParser.parsePredicate` for a `where` clause.
The query runs after `dataTransform`. Accessor fallbacks see the selected fields. Picking returns the original source row,
including fields omitted by the query. Explicit column props take precedence.

### Streaming query output

For an asynchronous iterable of Arrow `RecordBatch` objects, `queryOutput` controls how
successive batches become the layer's `data` table:

```ts
new ScatterplotLayer({
  id: 'live-points',
  data: recordBatchStream,
  columnsQuery: {select: ['positions', 'radii']},
  queryOutput: 'snapshots'
});
```

- `queryOutput: 'batches'` (default) appends each Arrow record batch to the accumulated table.
- `queryOutput: 'snapshots'` replaces the prior table with each complete result batch.

The stream yields plain Apache Arrow `RecordBatch` objects, without metadata wrappers. The
layer interprets them according to its declared `queryOutput`. This prop controls streamed
data consumption, not SQL execution; `columnsQuery` projects each current table.


### Per-column SQL expressions

For row-preserving attribute generation, `columnsQuery` accepts a mapping from output column
names to SQL expression strings (or portable expression ASTs). Each expression evaluates over
**every input row in the original order**; it does not accept a `SELECT` statement or
`WHERE`, `LIMIT`, `OFFSET`, `GROUP BY`, or `ORDER BY`.

```ts
new ScatterplotLayer({
  id: 'points',
  data: arrowTable,
  columnsQuery: {
    positions: 'FLOAT32x2(longitude, latitude)',
    radii: 'SQRT(population)::REAL',
    fillColors: 'RGBA8(red, green, blue, 1.0)'
  }
});
```

Pass `sqlParser` to `Deck` when using expression strings, as in the full-query example above.
The output name comes from the object property, so `SELECT` and `AS` are unnecessary.

deck.gl temporarily implements typed vector constructors locally:
`FLOAT32x2/x3/x4`, `FLOAT64x2/x3/x4`, `RGBA8`, `RGBA16`,
`RGBA16F`, and `RGBA32F`.
Each constructs a fixed-size Arrow list. `RGBA8` and `RGBA16` accept floating-point
channels, clamp to [0, 1], then round to [0, 255] or [0, 65535].
Other constructors retain floating-point components without color normalization.
Null in any component nulls the entire output vector; non-finite component values error.
These local functions are currently supported as top-level column expressions.

Use the existing `SELECT` query form for table-level filtering or projection;
per-column expression mappings deliberately do not alter row cardinality.
