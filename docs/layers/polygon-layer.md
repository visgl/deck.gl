<!-- INJECT:"PolygonLayerDemo" -->

<p class="badges">
  <img src="https://img.shields.io/badge/@deck.gl/layers-lightgrey.svg?style=flat-square" alt="@deck.gl/layers" />
  <img src="https://img.shields.io/badge/lighting-yes-blue.svg?style=flat-square" alt="lighting" />
</p>

# PolygonLayer

The Polygon Layer renders filled and/or stroked polygons.

PolygonLayer is a [CompositeLayer](/docs/api-reference/composite-layer.md).

```js
import DeckGL from '@deck.gl/react';
import {PolygonLayer} from '@deck.gl/layers';

const App = ({data, viewport}) => {

  /**
   * Data format:
   * [
   *   {
   *     // Simple polygon (array of coords)
   *     contour: [[-122.4, 37.7], [-122.4, 37.8], [-122.5, 37.8], [-122.5, 37.7], [-122.4, 37.7]],
   *     zipcode: 94107,
   *     population: 26599,
   *     area: 6.11
   *   },
   *   {
   *     // Complex polygon with holes (array of rings)
   *     contour: [
   *       [[-122.4, 37.7], [-122.4, 37.8], [-122.5, 37.8], [-122.5, 37.7], [-122.4, 37.7]],
   *       [[-122.45, 37.73], [-122.47, 37.76], [-122.47, 37.71], [-122.45, 37.73]]
   *     ],
   *     zipcode: 94107,
   *     population: 26599,
   *     area: 6.11
   *   },
   *   ...
   * ]
   */
  const layer = new PolygonLayer({
    id: 'polygon-layer',
    data,
    pickable: true,
    stroked: true,
    filled: true,
    wireframe: true,
    lineWidthMinPixels: 1,
    getPolygon: d => d.contour,
    getElevation: d => d.population / d.area / 10,
    getFillColor: d => [d.population / d.area / 60, 140, 0],
    getLineColor: [80, 80, 80],
    getLineWidth: 1,
    onHover: ({object, x, y}) => {
      const tooltip = `${object.zipcode}\nPopulation: ${object.population}`;
      /* Update tooltip
         http://deck.gl/#/documentation/developer-guide/adding-interactivity?section=example-display-a-tooltip-for-hovered-object
      */
    }
  });

  return (<DeckGL {...viewport} layers={[layer]} />);
};
```

## Installation

To install the dependencies from NPM:

```bash
npm install deck.gl
# or
npm install @deck.gl/core @deck.gl/layers
```

```js
import {PolygonLayer} from '@deck.gl/layers';
new PolygonLayer({});
```

To use pre-bundled scripts:

```html
<script src="https://unpkg.com/deck.gl@^7.0.0/dist.min.js"></script>
<!-- or -->
<script src="https://unpkg.com/@deck.gl/core@^7.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/layers@^7.0.0/dist.min.js"></script>
```

```js
new deck.PolygonLayer({});
```

## Properties

Inherits from all [Base Layer](/docs/api-reference/layer.md) and [CompositeLayer](/docs/api-reference/composite-layer.md) properties.

### Render Options

##### `filled` (Boolean, optional)

* Default: `true`

Whether to draw a filled polygon (solid fill). Note that only
the area between the outer polygon and any holes will be filled.

##### `stroked` (Boolean, optional)

* Default: `false`

Whether to draw an outline around the polygon (solid fill). Note that
both the outer polygon as well the outlines of any holes will be drawn.

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

Requires the `extruded` prop to be true.

##### `elevationScale` (Number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `1`

Elevation multiplier. The final elevation is calculated by
  `elevationScale * getElevation(d)`. `elevationScale` is a handy property to scale
all elevation without updating the data.

##### `lineWidthUnits` (String, optional)

* Default: `'meters'`

The units of the line width, one of `'meters'`, `'pixels'`. When zooming in and out, meter sizes scale with the base map, and pixel sizes remain the same on screen.

##### `lineWidthScale` (Boolean, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `1`

The line width multiplier that multiplied to all outlines of `Polygon` and `MultiPolygon`
features if the `stroked` attribute is true.

##### `lineWidthMinPixels` (Number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `0`

The minimum line width in pixels.

##### `lineWidthMaxPixels` (Number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: Number.MAX_SAFE_INTEGER

The maximum line width in pixels.

##### `lineJointRounded` (Boolean, optional)

* Default: `false`

Type of joint. If `true`, draw round joints. Otherwise draw miter joints.

##### `lineMiterLimit` (Number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `4`

The maximum extent of a joint in ratio to the stroke width.
Only works if `lineJointRounded` is `false`.

##### `lineDashJustified` (Boolean, optional)

* Default: `false`

Justify dashes together.
Only works if `getLineDashArray` is specified.

##### `material` (Object, optional)

* Default: `new PhongMaterial()`

This is an object that contains material props for [lighting effect](/docs/effects/lighting-effect.md) applied on extruded polygons.
Check [PhongMaterial](https://github.com/uber/luma.gl/tree/7.0-release/docs/api-reference/core/materials/phong-material.md) for more details.

### Data Accessors

##### `getPolygon` ([Function](/docs/developer-guide/using-layers.md#accessors), optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* default: `object => object.polygon`

Called on each object in the `data` stream to retrieve its corresponding polygon.

A polygon can be one of the following formats:

* An array of points (`[x, y, z]`) - a.k.a. a "ring".
* An array of rings. The first ring is the exterior boundary and the successive rings are the holes. Compatible with the GeoJSON [Polygon](https://tools.ietf.org/html/rfc7946#section-3.1.6) specification.
* A flat array or [TypedArray](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) of coordinates, in the shape of `[x0, y0, z0, x1, y1, z1, ...]`, is equivalent to a single ring. By default, each coordinate is assumed to contain 3 consecutive numbers. If each coordinate contains only two numbers (x, y), set the `positionFormat` prop of the layer to `XY`.
* An object of shape `{positions, holeIndices}`.
  - `positions` (Array|TypedArray) - a flat array of coordinates. By default, each coordinate is assumed to contain 3 consecutive numbers. If each coordinate contains only two numbers (x, y), set the `positionFormat` prop of the layer to `XY`.
  - `holeIndices` (Array) - the starting index of each hole in the `positions` array. The first ring is the exterior boundary and the successive rings are the holes.

```js
// All of the following are valid polygons
const polygons = [
  // Simple polygon (array of points)
  [[-122.4, 37.7, 0], [-122.4, 37.8, 5], [-122.5, 37.8, 10], [-122.5, 37.7, 5], [-122.4, 37.7, 0]],
  // Polygon with holes (array of rings)
  [
    [[-122.4, 37.7], [-122.4, 37.8], [-122.5, 37.8], [-122.5, 37.7], [-122.4, 37.7]],
    [[-122.45, 37.73], [-122.47, 37.76], [-122.47, 37.71], [-122.45, 37.73]]
  ],
  // Flat simple polygon
  [-122.4, 37.7, 0, -122.4, 37.8, 5, -122.5, 37.8, 10, -122.5, 37.7, 5, -122.4, 37.7, 0],
  // Flat polygon with holes
  {
    positions: [-122.4, 37.7, 0, -122.4, 37.8, 0, -122.5, 37.8, 0, -122.5, 37.7, 0, -122.4, 37.7, 0, -122.45, 37.73, 0, -122.47, 37.76, 0, -122.47, 37.71, 0, -122.45, 37.73, 0],
    holeIndices: [15]
  }
]
```

If the optional third component `z` is supplied for a position, it specifies the altitude of the vertex:

<div>
  <img src="https://user-images.githubusercontent.com/18344164/48512983-cca32e80-e8ae-11e8-9107-c380925cf861.gif" />
  <p><i>Polygons with 3D positions, courtesy of <a href="https://github.com/SymbolixAU">@SymbolixAU</a> and <a href="https://github.com/mdsumner">@mdsumner</a></i></p>
</div>

##### `getFillColor` ([Function](/docs/developer-guide/using-layers.md#accessors)|Array, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `[0, 0, 0, 255]`

The rgba fill color of each polygon, in `r, g, b, [a]`. Each component is in the 0-255 range.

* If an array is provided, it is used as the fill color for all polygons.
* If a function is provided, it is called on each polygon to retrieve its fill color.

##### `getLineColor` ([Function](/docs/developer-guide/using-layers.md#accessors)|Array, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `[0, 0, 0, 255]`

The rgba outline color of each polygon, in `r, g, b, [a]`. Each component is in the 0-255 range.

* If an array is provided, it is used as the outline color for all polygons.
* If a function is provided, it is called on each polygon to retrieve its outline color.


##### `getLineWidth` ([Function](/docs/developer-guide/using-layers.md#accessors)|Number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `1`

The width of the outline of the polygon, in units specified by `lineWidthUnits` (default meters). Only applies if `extruded: false`.

* If a number is provided, it is used as the outline width for all polygons.
* If a function is provided, it is called on each polygon to retrieve its outline width.

##### `getElevation` ([Function](/docs/developer-guide/using-layers.md#accessors)|Number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `1000`

The elevation to extrude each polygon with. 
If a cartographic projection mode is used, height will be interpreted as meters,
otherwise will be in unit coordinates.
Only applies if `extruded: true`.

* If a number is provided, it is used as the elevation for all polygons.
* If a function is provided, it is called on each polygon to retrieve its elevation.

**Note:** If 3D positions are returned by `getPolygon`, the extrusion returned by `getElevation` is added to the base altitude of each vertex.

##### `getLineDashArray` ([Function](/docs/developer-guide/using-layers.md#accessors)|Array, optional)

* Default: `null`

The dash array to draw each outline path with: `[dashSize, gapSize]` relative to the width of the line. (See PathLayer)

* If an array is provided, it is used as the dash array for all paths.
* If a function is provided, it is called on each path to retrieve its dash array. Return `[0, 0]` to draw the path in solid line.
* If this accessor is not specified, all paths are drawn as solid lines.

## Sub Layers

The PolygonLayer renders the following sublayers:

* `fill` - a [SolidPolygonLayer](/docs/layers/solid-polygon-layer.md) rendering the surface of all polygons.
* `stroke` - a [PathLayer](/docs/layers/path-layer.md) rendering the outline of all polygons. Only rendered if `stroked: true` and `extruded: false`.


## Remarks

* Polygons are always closed, i.e. there is an implicit line segment between
  the first and last vertices, when those vertices are not equal.
* The specification of complex polygons intentionally follows the GeoJson
  conventions for representing polygons with holes.
* Wireframe lines are rendered with `GL.LINE` and thus will always be 1 pixel wide.
* Wireframe and solid extrusions are exclusive, you'll need to create two layers
  with the same data if you want a combined rendering effect.

## Source

[modules/layers/src/polygon-layer](https://github.com/uber/deck.gl/tree/master/modules/layers/src/polygon-layer)

