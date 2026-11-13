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
when the field is numeric. Passing a table as `data` alone does not bind its fields to column
props. Separate longitude and latitude fields must first be combined into fixed-size lists.

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

## Streaming Arrow data

Layers can consume an async iterable of Apache Arrow `RecordBatch` objects or loaders.gl
`{shape: 'arrow-table', data: table}` batches. Promises resolving to these iterables are also
supported. Arrow remains an optional dependency and is loaded only when an Arrow chunk arrives.

```ts
new ScatterplotLayer({
  id: 'streamed-points',
  data: recordBatchStream,
  _dataLoadingMode: 'batched',
  getPosition: row => [row.longitude, row.latitude],
  getRadius: row => row.radius,
  _onDataProgress: table => console.log(table.numRows)
});
```

The experimental `_dataLoadingMode` prop controls loading and accumulation:

- `'auto'` (default) loads URLs completely and appends chunks from application-supplied streams.
- `'batched'` loads URLs with loaders.gl `loadInBatches` and appends each batch to the current table.
- `'snapshots'` also loads URLs in batches, but replaces the entire table with each Arrow result.
  Each yield contains all rows to display at that point. It can be one record batch or a
  loaders.gl Arrow table batch containing multiple record batches.

Set `loaders` and `loadOptions` as usual when streaming a URL. The selected loader must produce
supported batches. Metadata batches are discarded and table wrappers are unwrapped. Arrow batches
retain their columnar storage; they are not converted to row objects. Do not mix Arrow and row
chunks in one stream. An empty Arrow snapshot clears the table while retaining its schema.

`_onDataProgress` receives the current accumulated or replacement table after each accepted batch.
`onDataLoad` runs once when the stream finishes. An empty stream completes with an empty array
and no progress callback. Replaced or finalized streams cannot publish further callbacks.

`dataTransform` retains its existing behavior for row-array streams; it is not applied to Arrow
chunks. Transform Arrow data in the producer before yielding it. This loading feature does not
select fields or execute SQL; use accessors or explicit column props as with other Arrow inputs.
