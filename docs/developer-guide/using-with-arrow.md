# Using with Arrow

ScatterplotLayer accepts Apache Arrow vectors through column props, avoiding the need to
construct a JavaScript object for every point. These props currently apply to ScatterplotLayer,
not every layer in the catalog.

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
| `fillColors` | RGB or RGBA fixed-size lists | `getFillColor` |
| `lineColors` | RGB or RGBA fixed-size lists | `getLineColor` |
| `lineWidths` | Numeric scalars | `getLineWidth` |

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
Chunked columns draw in aligned ranges, preserving logical row indexes for picking.
Arrow data still requires conversion and GPU upload; this is not a zero-copy rendering promise.
The layer manages GPU buffers it creates during conversion.

## Limitations

Column mode rejects nulls, mismatched lengths, attribute transitions, and layer extensions.
Use the normal accessor path when you need those features. See the
[ScatterplotLayer API](../api-reference/layers/scatterplot-layer.md#arrow-columns) and
[loading data guide](./loading-data.md) for more details.
