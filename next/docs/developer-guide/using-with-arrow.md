# Using with Arrow

Columnar data stores each attribute, such as position or color, in a separate column. Layers that support Apache Arrow vectors can convert these columns into rendering attributes without requiring an application to construct a JavaScript object for each row.

Each layer's prop descriptions specify which accessors accept Arrow vectors. This guide covers their shared input, conversion, and update rules.

Install `apache-arrow` alongside the deck.gl package that exports your layer.

## Supplying columns[​](#supplying-columns "Direct link to Supplying columns")

An Arrow vector represents one value per object. Obtain a vector from a table with `table.getChild('fieldName')`, or construct one with `vectorFromArray`.

Pass the vector to an accessor that accepts Arrow. Each accessor can take a row callback, an Arrow vector, or a constant where the prop supports one.

For example, these ScatterplotLayer inputs draw the same two circles:

```
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

Use `table.getChild(...)` to select the field for each accessor. Separate longitude and latitude fields must first be combined into fixed-size lists when supplying a position column.

## Column layouts and conversion[​](#column-layouts-and-conversion "Direct link to Column layouts and conversion")

The accessor determines the required layout and how deck.gl converts the values for rendering.

### Scalars[​](#scalars "Direct link to Scalars")

Numeric scalar columns accept Arrow integer and floating-point types and convert to Float32. Each prop defines its units and scaling. Scatterplot radii use `radiusUnits` and `radiusScale`. Conversion can lose precision for values not representable in Float32.

### Colors[​](#colors "Direct link to Colors")

Color columns accept numeric `FixedSizeList` values with three (RGB) or four (RGBA) components. Integer channels use 0–255. Floating-point channels use 0–1. Conversion clamps and rounds channels to RGBA8 (`unorm8x4`). RGB inputs receive opaque alpha.

Constant arrays and callback results typically use 0–255 for all channels.

### Positions and other vectors[​](#positions-and-other-vectors "Direct link to Positions and other vectors")

Position columns require numeric fixed-size lists with two (XY) or three (XYZ) components. Other numeric vector columns use the width specified by their prop. Layer coordinate-system settings determine how the layer interprets positions.

Dictionary, string, and variable-size list inputs are unsupported by these numeric conversions. Null values and invalid transformed values raise conversion errors, even when the schema is compatible.

## Cell identifiers[​](#cell-identifiers "Direct link to Cell identifiers")

Cell layers accept Arrow vectors through their identifier accessors, such as `getHexagon`, `getS2Token`, and `getQuadkey`. A row can contain one identifier or a list of identifiers for one source feature. Arrow decodes dictionary-encoded identifiers before geometry generation. H3, S2, and A5 accept Int64 and Uint64 identifiers without losing precision; signed values are interpreted as unsigned 64-bit identifiers. Geohash and quadkey identifiers must be strings.

Picking reports the source feature index, while `highlightedObjectIndex` selects an expanded cell row. H3Cluster uses each row's identifiers as one cluster.

### Cell styling[​](#cell-styling "Direct link to Cell styling")

Style columns follow source-feature order. A value applies to all cells belonging to that feature. Fill and outline colors follow the shared [Arrow color convention](#colors). Width and elevation columns contain numeric scalars. Nonempty `data` and style columns must match the identifier column's row count. Null identifiers and styles are unsupported.

## Mixed inputs[​](#mixed-inputs "Direct link to Mixed inputs")

Supplying an Arrow vector to a supported accessor enables column processing. Other accessors can use constants or row callbacks. Binary inputs in `data.attributes` can supply attributes omitted by Arrow accessors.

Keep row metadata in the same order as the columns when you need labels or other application fields. Nonempty `data` must have the same length as the columns. Picking indexes refer to these logical rows, including when the columns have multiple chunks.

With columns alone, use constant fallback accessors for omitted attributes. A row callback cannot read fields from absent row objects. Binary attributes can also supply omitted attributes, including constant descriptors.

## Loading and updates[​](#loading-and-updates "Direct link to Loading and updates")

GPU attribute conversion is asynchronous. Pending row data must load before fallback accessors can read it. `layer.isLoaded` includes Arrow conversion. Deck calls `onAfterRender` after each frame. Conversion errors are reported through the layer's `onError` callback.

Keep vectors stable between renders and supply new vectors when their contents change. Chunked columns must have identical chunk lengths and draw in aligned ranges. The layer uploads converted Arrow values to GPU buffers and releases those buffers when it replaces the data or is removed. `numInstances` can limit rendering to a prefix of the columns.

## Limitations[​](#limitations "Direct link to Limitations")

Rendering columns must have equal lengths and matching chunk structures, and must not contain nulls. Direct column bindings do not support attribute transitions or layer extensions. ScatterplotLayer uses row-based attributes for Arrow and SQL accessors when extensions are active.

See each layer's prop descriptions for supported inputs and the [loading data guide](https://deck.gl/next/docs/developer-guide/loading-data.md) for other ways to provide data.

## Direct GPUVector inputs[​](#direct-gpuvector-inputs "Direct link to Direct GPUVector inputs")

Some layers expose optional props for caller-owned luma.gl `GPUVector` buffers. These unstable props follow the layer's GPU layout and can change at any time. Check the layer reference for supported formats and the meaning and order of rows.

Arc, Line, Column, and GridCell can bind caller-owned packed `float32x2` position vectors directly. Vertex fetch supplies zero elevation. Arc and Line accept XY and XYZ independently for each endpoint.

Instanced rendering layers take values in rendered instance order. Supplied vectors must agree on row count and chunk boundaries. For GPU positions, choose a coordinate system that the rendering path can use directly. Layers that require CPU preprojection for the supplied coordinate system reject GPU position vectors. Provide row data for attributes that use callback accessors and for picking metadata.

Layers that process features, tessellate geometry, or aggregate inputs can require different buffers from the values their public accessors return. An accessor can describe a source feature. A direct GPU input can represent prepared vertices, instances, or aggregator inputs. Follow the specific prop's contract when building those buffers.

Keep the vectors and their buffers alive while the layer uses them. The layer borrows those buffers and releases its own conversion allocations.

## Streaming Arrow data[​](#streaming-arrow-data "Direct link to Streaming Arrow data")

Layers can consume an async iterable of Apache Arrow `RecordBatch` objects or Arrow `Table` objects. Promises resolving to these iterables are also supported. Arrow remains an optional dependency and is loaded only when an Arrow chunk arrives.

```
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

* `'auto'` (default) loads URLs completely and appends chunks from application-supplied streams.
* `'batched'` loads URLs with loaders.gl `loadInBatches` and appends each batch to the current table.
* `'snapshots'` also loads URLs in batches, but replaces the entire table with each Arrow result. Each yield contains all rows to display at that point. It can be one record batch or a table containing multiple record batches.

Set `loaders` and `loadOptions` as usual when streaming a URL. The selected loader must produce supported batches. Deck discards loader metadata and exposes Arrow tables to apps. Arrow batches retain their columnar storage; they are not converted to row objects. Do not mix Arrow and row chunks in one stream. An empty Arrow snapshot clears the table while retaining its schema.

Arrow columns retain their GPU buffers when new batches extend the existing chunk sequence. Only new chunks are converted and uploaded, including float64 position residuals. Picking rows are read lazily. Replaced chunks, changed conversion settings, and snapshot loading rebuild the GPU columns. CPU-preprojected positions and ordinary accessor fallbacks use full conversion.

`onDataProgress` receives the current accumulated or replacement table after each accepted batch. `onDataLoad` runs once when the stream finishes. An empty stream completes with an empty array and no progress callback. Replaced or finalized streams cannot publish further callbacks.

`dataTransform` retains its existing behavior for row-array streams; it is not applied to Arrow chunks. Transform Arrow data in the producer before yielding it. This loading feature does not select fields or execute SQL; use accessors or explicit column props as with other Arrow inputs.

## Arrow accessors that use row processing[​](#arrow-accessors-that-use-row-processing "Direct link to Arrow accessors that use row processing")

Path, Trips, Polygon, SolidPolygon, Text, and the aggregation layers accept Arrow vectors and SQL expressions on their row accessors. Supply a nested list for paths and polygons, a list of numbers for trip timestamps, and a string column for text or icon selection. GeoJsonLayer accepts an Arrow table with a GeoArrow geometry field and uses the source feature order for styling. SimpleMeshLayer and ScenegraphLayer accept Arrow and SQL instance transforms.

These accessors use the same shapes and units as row callbacks. Supply the source table alongside the accessors so the layer has a row count. Passing `data: null` clears the layer and defers SQL evaluation. A zero-row Arrow table retains its schema and draws no features.
