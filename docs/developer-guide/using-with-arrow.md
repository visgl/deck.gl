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
