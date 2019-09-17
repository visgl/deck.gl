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
<script src="https://unpkg.com/deck.gl@^7.0.0/dist.min.js"></script>
<!-- or -->
<script src="https://unpkg.com/@deck.gl/core@^7.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/layers@^7.0.0/dist.min.js"></script>
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

* Default: `new PhongMaterial()`

This is an object that contains material props for [lighting effect](/docs/effects/lighting-effect.md) applied on extruded polygons.
Check [PhongMaterial](https://github.com/uber/luma.gl/tree/7.0-release/docs/api-reference/core/materials/phong-material.md) for more details.

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

The rgba fill color of each object's polygon, in `r, g, b, [a]`. Each component is in the 0-255 range.

* If an array is provided, it is used as the fill color for all polygons.
* If a function is provided, it is called on each polygon to retrieve its fill color.

##### `getLineColor` ([Function](/docs/developer-guide/using-layers.md#accessors)|Array, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `[0, 0, 0, 255]`

The rgba wireframe color of each object's polygon, in `r, g, b, [a]`. Each component is in the 0-255 range.
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

## Remarks

* This layer only renders filled polygons. If you need to render polygon
  outlines, use the [`PathLayer`](/docs/layers/path-layer.md)
* Polygons are always closed, i.e. there is an implicit line segment between
  the first and last vertices, when those vertices are not equal.
* The specification of complex polygons intentionally follows the GeoJson
  conventions for representing polygons with holes.

## Source

[modules/layers/src/solid-polygon-layer](https://github.com/uber/deck.gl/tree/master/modules/layers/src/solid-polygon-layer)

