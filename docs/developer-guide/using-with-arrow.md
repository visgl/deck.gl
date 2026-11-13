# Using with Arrow

Columnar data stores each attribute, such as position or color, in a separate column.
Layers that support Apache Arrow vectors can convert these columns into rendering attributes
without requiring an application to construct a JavaScript object for each row.

Each layer's prop descriptions specify which accessors accept Arrow vectors.
This guide covers their shared input, conversion, and update rules.

Install `apache-arrow` alongside `@deck.gl/layers`. The layer loads its converter when needed;
no converter registration or separate layer class is required.

## Supplying columns

An Arrow vector represents one value per object. Obtain a vector from a table with
`table.getChild('fieldName')`, or construct one with `vectorFromArray`.

Pass a vector directly to an accessor that supports Arrow. The accessor has one input:
a constant for all objects, a callback evaluated per object, or a column with one value per object.
There is no separate CPU column prop to configure. Accessors do not accept GPUVector inputs.

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

Select table fields explicitly with `table.getChild(...)`; passing a table as `data` does not
assign its fields to accessors. Separate longitude and latitude fields must first be
combined into fixed-size lists when supplying a position column.

## Column layouts and conversion

Rendering layers select a conversion based on the meaning of the prop. Conversion uses luma.gl and
preserves the source vector. Supported shapes depend on the prop; an accessor accepting a
scalar column does not also accept a position or color column.

### Scalars

Numeric scalar columns accept Arrow integer and floating-point types and convert to Float32.
Values retain the prop's units: for example, Scatterplot radii use `radiusUnits` and are
multiplied by `radiusScale`. Conversion can lose precision for values not representable in Float32.

### Colors

Color columns accept numeric `FixedSizeList` values with three (RGB) or four (RGBA) components.
Integer channels use 0–255; floating-point channels use 0–1. Conversion clamps channels to the
valid range and rounds them to RGBA8 (`unorm8x4`). RGB inputs receive opaque alpha.

These ranges apply to Arrow columns. Constant arrays and callback results keep the layer's
usual color convention, typically 0–255 for all channels.

### Positions and other vectors

Position columns require numeric fixed-size lists with two (XY) or three (XYZ) components.
Other numeric vector columns use the width specified by their prop. Layer coordinate-system
settings continue to apply to positions.

Dictionary, string, and variable-size list inputs are unsupported by these numeric conversions.
Null values and invalid transformed values raise conversion errors, even when the schema is compatible.

## Cell identifiers

Cell layers accept Arrow vectors through their identifier accessors, such as `getHexagon`,
`getS2Token`, and `getQuadkey`. A row can contain one identifier or a list of identifiers for
one source feature. Arrow decodes dictionary-encoded identifiers before geometry generation.
H3, S2, and A5 accept Int64 and Uint64 identifiers without losing precision; signed values are
interpreted as unsigned 64-bit identifiers. Geohash and quadkey identifiers must be strings.

Cell geometry is expanded on the CPU. Style columns use source-feature order, with each value
applied to every cell in that feature. Color columns use the usual 0–255 channel convention.
Nonempty `data` and all style columns must match the identifier column's row count; null cells
and styles are unsupported. Picking reports the source feature index, while
`highlightedObjectIndex` selects an expanded cell row. H3Cluster keeps each row's identifiers
as one cluster.

## Mixed inputs

Supplying an Arrow vector to a supported accessor enables column processing. Other accessors
can remain constants or row callbacks. Existing `data.attributes` binary inputs can supply
attributes that are not provided by Arrow accessors.

Keep row metadata in the same order as the columns when you need labels or other application
fields. Nonempty `data` must have the same length as the columns. Picking indexes refer to
these logical rows, including when the columns have multiple chunks.

With columns alone, use constant fallback accessors for omitted attributes. A row callback
cannot read fields from absent row objects. Binary attributes can also supply omitted
attributes, including constant descriptors.

## Loading and updates

GPU attribute conversion is asynchronous. Pending row data must load before fallback accessors can read it.
`layer.isLoaded` includes conversion state, but is not a GPU-completion notification.
Deck's `onAfterRender` runs after a frame, not specifically after an Arrow conversion.
Conversion errors are reported through the layer's `onError` callback.

Keep vectors stable between renders and supply new vectors when their contents change.
Chunked columns must have identical chunk lengths and draw in aligned ranges.
Arrow data still requires conversion and GPU upload; this is not a zero-copy rendering promise.
The layer manages GPU buffers it creates during conversion and releases them when replaced or removed.
`numInstances` can limit rendering to a prefix of the columns.

## Limitations

Rendering columns must have equal lengths and matching chunk structures, and must not contain nulls.
The current GPU column path does not support attribute transitions or layer extensions. Use row accessors when you need those features.

See each layer's prop descriptions for supported inputs and the [loading data guide](./loading-data.md)
for other ways to provide data.
