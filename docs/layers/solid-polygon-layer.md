<p class="badges">
  <img src="https://img.shields.io/badge/@deck.gl/layers-lightgrey.svg?style=flat-square" alt="@deck.gl/layers" />
  <img src="https://img.shields.io/badge/lighting-yes-blue.svg?style=flat-square" alt="lighting" />
</p>

# SolidPolygonLayer

The SolidPolygon Layer renders filled polygons.

```js
import DeckGL from '@deck.gl/react';
import {SolidPolygonLayer} from '@deck.gl/layers';

new SolidPolygonLayer({
  data: [
    [[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]],   // Simple polygon (array of coords)
    [                                           // Complex polygon with one hole
      [[0, 0], [0, 2], [2, 2], [2, 0], [0, 0]], // (array of array of coords)
      [[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]]
    ]
  ],
  getPolygon: d => d,
  getColor: [255, 0, 0],
  extruded: false
});
```


## Installation

To install the dependencies from NPM:

```bash
npm install deck.gl
# or
npm install @deck.gl/core @deck.gl/layers
```

```js
import {SolidPolygonLayer} from '@deck.gl/layers';
new SolidPolygonLayer({});
```

To use pre-bundled scripts:

```html
<script src="https://unpkg.com/deck.gl@^8.0.0/dist.min.js"></script>
<!-- or -->
<script src="https://unpkg.com/@deck.gl/core@^8.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/layers@^8.0.0/dist.min.js"></script>
```

```js
new deck.SolidPolygonLayer({});
```

## Properties

Inherits from all [Base Layer](/docs/api-reference/layer.md) properties.

### Render Options

##### `filled` (Boolean, optional)

* Default: `true`

Whether to fill the polygons (based on the color provided by the
`getFillColor` accessor.

##### `extruded` (Boolean, optional)

* Default: `false`

Whether to extrude the polygons (based on the elevations provided by the
`getElevation` accessor. If set to false, all polygons will be flat, this
generates less geometry and is faster than simply returning `0` from `getElevation`.

##### `wireframe` (Boolean, optional)

* Default: `false`

Whether to generate a line wireframe of the hexagon. The outline will have
"horizontal" lines closing the top and bottom polygons and a vertical line
(a "strut") for each vertex on the polygon.

##### `elevationScale` (Number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `1`

Elevation multiplier. The final elevation is calculated by
  `elevationScale * getElevation(d)`. `elevationScale` is a handy property to scale
all elevation without updating the data.

**Remarks:**

* These lines are rendered with `GL.LINE` and will thus always be 1 pixel wide.
* Wireframe and solid extrusions are exclusive, you'll need to create two layers
  with the same data if you want a combined rendering effect.

##### `material` (Object, optional)

* Default: `true`

This is an object that contains material props for [lighting effect](/docs/effects/lighting-effect.md) applied on extruded polygons.
Check [the lighting guide](/docs/developer-guide/using-lighting.md#constructing-a-material-instance) for configurable settings.

##### `_normalize` (Object, optional)

* Default: `true`

> Note: This prop is experimental

If `false`, will skip normalizing the coordinates returned by `getPolygon`. Disabling normalization improves performance during data update, but makes the layer prone to error in case the data is malformed. It is only recommended when you use this layer with preprocessed static data or validation on the backend.

When normalization is disabled, polygons must be specified in the format of flat array or `{positions, holeIndices}`. Rings must be closed (i.e. the first and last vertices must be identical). See `getPolygon` below for details.

### Data Accessors

##### `getPolygon` ([Function](/docs/developer-guide/using-layers.md#accessors), optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `object => object.polygon`

This accessor returns the polygon corresponding to an object in the `data` stream.

A polygon can be one of the following formats:

* An array of points (`[x, y, z]`) - a.k.a. a "ring".
* An array of rings. The first ring is the exterior boundary and the following rings are the holes. Compatible with the GeoJSON [Polygon](https://tools.ietf.org/html/rfc7946#section-3.1.6) specification.
* A flat array or [TypedArray](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) of numbers, in the shape of `[x0, y0, z0, x1, y1, z1, ...]`, is equivalent to a single ring. By default, each coordinate is assumed to contain 3 consecutive numbers. If each coordinate contains only two numbers (x, y), set the `positionFormat` prop of the layer to `XY`.
* An object of shape `{positions, holeIndices}`.
  - `positions` (Array|TypedArray) - a flat array of coordinates. By default, each coordinate is assumed to contain 3 consecutive numbers. If each coordinate contains only two numbers (x, y), set the `positionFormat` prop of the layer to `XY`.
  - `holeIndices` (Array) - the starting index of each hole in the `positions` array. The first ring is the exterior boundary and the successive rings are the holes.


##### `getFillColor` ([Function](/docs/developer-guide/using-layers.md#accessors)|Array, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `[0, 0, 0, 255]`

The rgba color is in the format of `[r, g, b, [a]]`. Each channel is a number between 0-255 and `a` is 255 if not supplied.

* If an array is provided, it is used as the fill color for all polygons.
* If a function is provided, it is called on each polygon to retrieve its fill color.

##### `getLineColor` ([Function](/docs/developer-guide/using-layers.md#accessors)|Array, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `[0, 0, 0, 255]`

The rgba color is in the format of `[r, g, b, [a]]`. Each channel is a number between 0-255 and `a` is 255 if not supplied.
Only applies if `extruded: true`.

* If an array is provided, it is used as the stroke color for all polygons.
* If a function is provided, it is called on each object to retrieve its stroke color.

##### `getElevation` ([Function](/docs/developer-guide/using-layers.md#accessors)|Number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `1000`

The elevation to extrude each polygon with.
If a cartographic projection mode is used, height will be interpreted as meters,
otherwise will be in unit coordinates.
Only applies if `extruded: true`.

* If a number is provided, it is used as the elevation for all polygons.
* If a function is provided, it is called on each object to retrieve its elevation.


## Use binary attributes

This section is about the special requirements when [supplying attributes directly](/docs/developer-guide/performance.md#supply-attributes-directly) to a `SolidPolygonLayer`.

Because each polygon has a different number of vertices, when `data.attributes.getPolygon` is supplied, the layer also requires an array `data.startIndices` that describes the vertex index at the start of each polygon. For example, if there are 3 polygons of 3, 4, and 5 vertices each (including the end vertex that overlaps with the first vertex to close the loop), `startIndices` should be `[0, 3, 7, 12]`. *Polygons with holes are not supported when using precalculated attributes.*

Additionally, all other attributes (`getFillColor`, `getElevation`, etc.), if supplied, must contain the same layout (number of vertices) as the `getPolygon` buffer.

To truly realize the performance gain from using binary data, the app likely wants to skip all data processing in this layer. Specify the `_normalize` prop to skip normalization.

Example use case:

```js
// USE PLAIN JSON OBJECTS
const POLYGON_DATA = [
  {
     contour: [[-122.4, 37.7], [-122.4, 37.8], [-122.5, 37.8], [-122.5, 37.7], [-122.4, 37.7]],
     population: 26599
  },
  ...
];

new SolidPolygonLayer({
  data: POLYGON_DATA,
  getPolygon: d => d.contour,
  getElevation: d => d.population,
  getFillColor: [0, 100, 60, 160]
})
```

Convert to using binary attributes:

```js
// USE BINARY
// Flatten the polygon vertices
// [-122.4, 37.7, -122.4, 37.8, -122.5, 37.8, -122.5, 37.7, -122.4, 37.7, ...]
const positions = new Float64Array(POLYGON_DATA.map(d => d.contour).flat(2));
// The color attribute must supply one color for each vertex
// [255, 0, 0, 255, 0, 0, 255, 0, 0, ...]
const elevations = new Uint8Array(POLYGON_DATA.map(d => d.contour.map(_ => d.population)).flat());
// The "layout" that tells PathLayer where each path starts
const startIndices = new Uint16Array(POLYGON_DATA.reduce((acc, d) => {
  const lastIndex = acc[acc.length - 1];
  acc.push(lastIndex + d.contour.length);
  return acc;
}, [0]));

new SolidPolygonLayer({
  data: {
    length: POLYGON_DATA.length,
    startIndices: startIndices, // this is required to render the paths correctly!
    attributes: {
      getPolygon: {value: positions, size: 2},
      getElevation: {value: elevations, size: 1}
    }
  },
  _normalize: false, // this instructs the layer to skip normalization and use the binary as-is
  getFillColor: [0, 100, 60, 160]
})
```


## Remarks

* This layer only renders filled polygons. If you need to render polygon
  outlines, use the [`PathLayer`](/docs/layers/path-layer.md)
* Polygons are always closed, i.e. there is an implicit line segment between
  the first and last vertices, when those vertices are not equal.
* The specification of complex polygons intentionally follows the GeoJson
  conventions for representing polygons with holes.

## Source

[modules/layers/src/solid-polygon-layer](https://github.com/uber/deck.gl/tree/master/modules/layers/src/solid-polygon-layer)
