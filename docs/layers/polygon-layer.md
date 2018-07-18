<!-- INJECT:"PolygonLayerDemo" -->

<p class="badges">
  <img src="https://img.shields.io/badge/64--bit-support-blue.svg?style=flat-square" alt="64-bit" />
  <img src="https://img.shields.io/badge/extruded-yes-blue.svg?style=flat-square" alt="extruded" />
</p>

# PolygonLayer

The Polygon Layer renders filled and/or stroked polygons.

```js
import DeckGL, {PolygonLayer} from 'deck.gl';

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
   *     // Complex polygon with holes (array of coords)
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
    onHover: ({object}) => setTooltip(`${object.zipcode}\nPopulation: ${object.population}`)
  });

  return (<DeckGL {...viewport} layers={[layer]} />);
};
```

If a cartographic projection mode is used, height will be interpreted as meters,
otherwise will be in unit coordinates.

* The polypgons can be simple or complex (complex polygons are polygons with holes).
* A simple polygon specified as an array of vertices, each vertice being an array of two or three numbers
* A complex polygon is specified as an array of simple polygons, the first polygon
  representing the outer outline, and the remaining polygons representing holes. These polygons are expected to not intersect.

## Properties

Inherits from all [Base Layer](/docs/api-reference/layer.md) properties.

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

##### `elevationScale` (Number, optional)

* Default: `1`

Elevation multiplier. The final elevation is calculated by
  `elevationScale * getElevation(d)`. `elevationScale` is a handy property to scale
all elevation without updating the data.

##### `lineWidthScale` (Boolean, optional)

* Default: `1`

The line width multiplier that multiplied to all outlines of `Polygon` and `MultiPolygon`
features if the `stroked` attribute is true.

##### `lineWidthMinPixels` (Number, optional)

* Default: `0`

The minimum line width in pixels.

##### `lineWidthMaxPixels` (Number, optional)

* Default: Number.MAX_SAFE_INTEGER

The maximum line width in pixels.

##### `lineJointRounded` (Boolean, optional)

* Default: `false`

Type of joint. If `true`, draw round joints. Otherwise draw miter joints.

##### `lineMiterLimit` (Number, optional)

* Default: `4`

The maximum extent of a joint in ratio to the stroke width.
Only works if `lineJointRounded` is `false`.

##### `lineDashJustified` (Boolean, optional)

* Default: `false`

Justify dashes together.
Only works if `getLineDashArray` is specified.

##### `fp64` (Boolean, optional)

* Default: `false`

Whether the layer should be rendered in high-precision 64-bit mode

##### `lightSettings` (Object, optional) **EXPERIMENTAL**

This is an object that contains light settings for extruded polygons.
Be aware that this prop will likely be changed in a future version of deck.gl.

### Data Accessors

##### `getPolygon` (Function, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* default: `object => object.polygon`

Like any deck.gl layer, the polygon accepts a data prop which is expected to
be an iterable container of objects, and an accessor
that extracts a polygon (simple or complex) from each object.

This accessor returns the polygon corresponding to an object in the `data` stream.

##### `getFillColor` (Function|Array, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `[0, 0, 0, 255]`

The rgba fill color of each polygon, in `r, g, b, [a]`. Each component is in the 0-255 range.

* If an array is provided, it is used as the fill color for all polygons.
* If a function is provided, it is called on each polygon to retrieve its fill color.

##### `getLineColor` (Function|Array, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `[0, 0, 0, 255]`

The rgba outline color of each polygon, in `r, g, b, [a]`. Each component is in the 0-255 range.

* If an array is provided, it is used as the outline color for all polygons.
* If a function is provided, it is called on each polygon to retrieve its outline color.


##### `getLineWidth` (Function|Number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `1`

The width of the outline of the polygon, in meters. Only applies if `extruded: false`.

* If a number is provided, it is used as the outline width for all polygons.
* If a function is provided, it is called on each polygon to retrieve its outline width.

##### `getElevation` (Function|Number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `1000`

The elevation to extrude each polygon with, in meters. Only applies if `extruded: true`.

* If a number is provided, it is used as the elevation for all polygons.
* If a function is provided, it is called on each polygon to retrieve its elevation.

##### `getLineDashArray` (Function|Array, optional)

* Default: `null`

The dash array to draw each outline path with: `[dashSize, gapSize]` relative to the width of the line. (See PathLayer)

* If an array is provided, it is used as the dash array for all paths.
* If a function is provided, it is called on each path to retrieve its dash array. Return `[0, 0]` to draw the path in solid line.
* If this accessor is not specified, all paths are drawn as solid lines.

## Remarks

* Polygons are always closed, i.e. there is an implicit line segment between
  the first and last vertices, when those vertices are not equal.
* The specification of complex polygons intentionally follows the GeoJson
  conventions for representing polygons with holes.
* Wireframe lines are rendered with `GL.LINE` and thus will always be 1 pixel wide.
* Wireframe and solid extrusions are exclusive, you'll need to create two layers
  with the same data if you want a combined rendering effect.

## Source

[modules/core/src/core-layers/polygon-layer](https://github.com/uber/deck.gl/tree/master/modules/layers/src/polygon-layer)

