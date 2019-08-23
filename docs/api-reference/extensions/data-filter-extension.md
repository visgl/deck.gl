
# DataFilterExtension (experimental)

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
new DataFilterExtension({filterSize});
```

* `filterSize` (Number) - the size of the filter (number of columns to filter by). The data filter can show/hide data based on 1-4 numeric properties of each object. Default `1`.


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


## Limitations

The `DataFilterExtension` does not work with any layer from the `@deck.gl/aggregation-layers` module.


## Source

[modules/extensions/src/data-filter](https://github.com/uber/deck.gl/tree/master/modules/extensions/src/data-filter)
