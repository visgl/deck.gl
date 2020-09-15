
# DataFilterExtension

The `DataFilterExtension` adds GPU-based data filtering functionalities to layers. It allows the layer to show/hide objects based on user-defined properties. This extension provides a significantly more performant alternative to filtering the data array on the CPU.

> Note: This extension does not work with all deck.gl layers. See "limitations" below.

```js
import {GeoJsonLayer} from '@deck.gl/layers';
import {DataFilterExtension} from '@deck.gl/extensions';

const layer = new GeoJsonLayer({
  id: 'geojson-layer',
  data: GEOJSON,

  // props from GeoJsonLayer
  getFillColor: [160, 160, 180],
  getLineColor: [0, 0, 0],
  getLineWidth: 10,

  // props added by DataFilterExtension
  getFilterValue: f => f.properties.timeOfDay,  // in seconds
  filterRange: [43200, 46800],  // 12:00 - 13:00

  // Define extensions
  extensions: [new DataFilterExtension({filterSize: 1})]
});
```

## Installation

To install the dependencies from NPM:

```bash
npm install deck.gl
# or
npm install @deck.gl/core @deck.gl/layers @deck.gl/extensions
```

```js
import {DataFilterExtension} from '@deck.gl/extensions';
new DataFilterExtension({});
```

To use pre-bundled scripts:

```html
<script src="https://unpkg.com/deck.gl@^7.0.0/dist.min.js"></script>
<!-- or -->
<script src="https://unpkg.com/@deck.gl/core@^7.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/layers@^7.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/extensions@^7.0.0/dist.min.js"></script>
```

```js
new deck.DataFilterExtension({});
```

## Constructor

```js
new DataFilterExtension({filterSize, fp64});
```

* `filterSize` (Number) - the size of the filter (number of columns to filter by). The data filter can show/hide data based on 1-4 numeric properties of each object. Default `1`.
* `fp64` (Boolean) - if `true`, use 64-bit precision instead of 32-bit. Default `false`. See the "remarks" section below for use cases and limitations.
* `countItems` (Boolean) - if `true`, reports the number of filtered objects with the `onFilteredItemsChange` callback. Default `false`.


## Layer Properties

When added to a layer via the `extensions` prop, the `DataFilterExtension` adds the following properties to the layer:

##### `getFilterValue` ([Function](/docs/developer-guide/using-layers.md#accessors))

Called to retrieve the value for each object that it will be filtered by. Returns either a number (if `filterSize: 1`) or an array.

For example, consider data in the following format:

```json
[
  {"timestamp": 0.1, "coordinates": [-122.45, 37.78], "speed": 13.3},
  ...
]
```

To filter by timestamp:

```js
new ScatterplotLayer({
  data,
  getPosition: d => d.coordinates,
  getFilterValue: d => d.timestamp,
  filterRange: [0, 1],
  extensions: [new DataFilterExtension({filterSize: 1})]
})
```

To filter by both timestamp and speed:

```js
new ScatterplotLayer({
  data,
  getPosition: d => d.coordinates,
  getFilterValue: d => [d.timestamp, d.speed],
  filterRange: [[0, 1], [10, 20]],
  extensions: [new DataFilterExtension({filterSize: 2})]
})
```

Note that all filtered values are uploaded as 32-bit floating numbers, so certain values e.g. raw unix epoch time may not be accurately represented. You may test the validity of a timestamp by calling `Math.fround(t)` to check if there would be any loss of precision.


##### `filterRange` (Array)

The bounds which defines whether an object should be rendered. If an object's filtered value is within the bounds, the object will be rendered; otherwise it will be hidden. This prop can be updated on user input or animation with very little cost.

Format:

* If `filterSize` is `1`: `[min, max]`
* If `filterSize` is `2` to `4`: `[[min0, max0], [min1, max1], ...]` for each filtered property, respectively.


##### `filterSoftRange` (Array, optional)

* Default: `null`

If specified, objects will be faded in/out instead of abruptly shown/hiden. When the filtered value is outside of the bounds defined by `filterSoftRange` but still within the bounds defined by `filterRange`, the object will be rendered as "faded." See `filterTransformSize` and `filterTransformColor` for additional control over this behavior.

```js
new ScatterplotLayer({
  data,
  getPosition: d => d.coordinates,
  getFilterValue: d => d.timestamp,
  filterRange: [0, 1],
  filterSoftRange: [0.2, 0.8],
  filterTransformSize: true,
  filterTransformColor: true,
  extensions: [new DataFilterExtension({filterSize: 1})]
})
```

Format:

* If `filterSize` is `1`: `[softMin, softMax]`
* If `filterSize` is `2` to `4`: `[[softMin0, softMax0], [softMin1, softMax1], ...]` for each filtered property, respectively.


##### `filterTransformSize` (Boolean, optional)

* Default: `true`

When an object is "faded", manipulate its size so that it appears smaller or thinner. Only works if `filterSoftRange` is specified.


##### `filterTransformColor` (Boolean, optional)

* Default: `true`

When an object is "faded", manipulate its opacity so that it appears more translucent. Only works if `filterSoftRange` is specified.


##### `filterEnabled` (Boolean, optional)

* Default: `true`

Enable/disable the data filter. If the data filter is disabled, all objects are rendered.

##### `onFilteredItemsChange` (Function, optional)

Only used if the `countItems` option is enabled. Called with the following arguments when the filter changes:

- `event` (Object)
  + `id` (String) - the id of the source layer. Note when this prop is specified on a [CompositeLayer](/docs/api-reference/composite-layer.md), such as `GeoJsonLayer`, the callback is called once by each sub layer.
  + `count` (Number) - the number of data objects that pass the filter.

## Remarks

### Filter precision

By default, both the filter values and the filter range are uploaded to the GPU as 32-bit floats. When using very large filter values, most commonly Epoch timestamps, 32-bit float representation could lead to an error margin of >1 minute. Enabling 64-bit precision by setting `fp64: true` would allow the filter range to be evaluated more accurately. However, 64-bit support requires one extra attribute slot, which increases the risk of exceeding the hardware limit on vertex attributes. Depending on the layer that the `DataFilterExtension` is used with, it may interfere with the layer's ability to use other extensions.

If this becomes an issue, an alternative technique is to transform each filter value by subtracting a fixed "origin" value, thus making the numbers smaller:

```js
getFilterValue: d => d.timestamp - ORIGIN_TS,
filterRange: [rangeStart - ORIGIN_TS, rangeEnd - ORIGIN_TS]
```

32-bit floats can accurately represent each second within ~190 days (`2^24`). Unless the filter values require both a large span and fine granularity, 32-bit floats should be sufficient.


## Limitations

Given data filtering happens on GPU, not all layers of `@deck.gl/aggregation-layers` module, support this feature.

### Always supported:
* `HeatMapLayer`
* `GPUGridLayer`

### Supported only when aggregation is performed on GPU:
* `ScreenGridlayer`
* `ContourLayer`
* `GridLayer`

### Not supported:
* `CPUGridLayer`
* `HexagonLayer`


## Source

[modules/extensions/src/data-filter](https://github.com/visgl/deck.gl/tree/master/modules/extensions/src/data-filter)
