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
   *     polygon: [[-122.4, 37.7], [-122.4, 37.8], [-122.5, 37.8], [-122.5, 37.7], [-122.4, 37.7]],
   *     fillColor: [128, 128, 140],
   *     elevation: 100
   *   },
   *   {
   *     // Complex polygon with holes (array of coords)
   *     polygon: [
   *       [[-122.4, 37.7], [-122.4, 37.8], [-122.5, 37.8], [-122.5, 37.7], [-122.4, 37.7]],
   *       [[-122.45, 37.73], [-122.47, 37.76], [-122.47, 37.71], [-122.45, 37.73]]
   *     ],
   *     fillColor: [128, 128, 140],
   *     elevation: 250
   *   },
   *   ...
   * ]
   */
  const layer = new PolygonLayer({
    id: 'polygon-layer',
    data,
    filled: true,
    stroked: false,
    extruded: true
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

Inherits from all [Base Layer](/docs/api-reference/base-layer.md) properties.

### Render Options

##### `filled` (Boolean, optional)

- Default: `true`

Whether to draw a filled polygon (solid fill). Note that only
the area between the outer polygon and any holes will be filled.

##### `stroked` (Boolean, optional)

- Default: `false`

Whether to draw an outline around the polygon (solid fill). Note that
both the outer polygon as well the outlines of any holes will be drawn.

##### `extruded` (Boolean, optional)

- Default: `false`

Whether to extrude the polygons (based on the elevations provided by the
`getElevation` accessor. If set to false, all polygons will be flat, this
generates less geometry and is faster than simply returning `0` from `getElevation`.

##### `wireframe` (Boolean, optional)

- Default: `false`

Whether to generate a line wireframe of the hexagon. The outline will have
"horizontal" lines closing the top and bottom polygons and a vertical line
(a "strut") for each vertex on the polygon.

Requires the `extruded` prop to be true.

##### `elevationScale` (Number, optional)

- Default: `1`

Elevation multiplier. The final elevation is calculated by
  `elevationScale * getElevation(d)`. `elevationScale` is a handy property to scale
all elevation without updating the data.

##### `lineWidthScale` (Boolean, optional)

- Default: `1`

The line width multiplier that multiplied to all outlines of `Polygon` and `MultiPolygon`
features if the `stroked` attribute is true.

##### `lineWidthMinPixels` (Number, optional)

- Default: `0`

The minimum line width in pixels.

##### `lineWidthMaxPixels` (Number, optional)

- Default: Number.MAX_SAFE_INTEGER

The maximum line width in pixels.

##### `lineJointRounded` (Boolean, optional)

- Default: `false`

Type of joint. If `true`, draw round joints. Otherwise draw miter joints.

##### `lineMiterLimit` (Number, optional)

- Default: `4`

The maximum extent of a joint in ratio to the stroke width.
Only works if `lineJointRounded` is `false`.

##### `lineDashJustified` (Boolean, optional)

- Default: `false`

Justify dashes together.
Only works if `getLineDashArray` is specified.

##### `fp64` (Boolean, optional)

- Default: `false`

Whether the layer should be rendered in high-precision 64-bit mode

##### `lightSettings` (Object, optional)

**EXPERIMENTAL**

This is an object that contains light settings for extruded polygons.
Be aware that this prop will likely be changed in a future version of deck.gl.

### Data Accessors

##### `getPolygon` (Function, optional)

- default: `object => object.polygon`

Like any deck.gl layer, the polygon accepts a data prop which is expected to
be an iterable container of objects, and an accessor
that extracts a polygon (simple or complex) from each object.

This accessor returns the polygon corresponding to an object in the `data` stream.

##### `getFillColor` (Function, optional)

- Default: `object => object.fillColor || [0, 0, 0, 255]`

The fill color for the polygon

##### `getColor` (Function, optional)

- Default: `object => object.color || object => object.strokeColor || [0, 0, 0, 255]`

The outline color for the polygon, if drawn in the outline mode

##### `getWidth` (Function, optional)

- Default: `object => object.strokeWidth || 1`

The width of the outline of the polygon, in meters

##### `getElevation` (Function, optional)

- Default: `object => object.elevation || 1000`

##### `getLineDashArray` (Function, optional)

- Default: `null`

Method called to get the dash array to draw each outline with. (See Path Layer)

### Remarks

* Polygons are always closed, i.e. there is an implicit line segment between
  the first and last vertices, when those vertices are not equal.
* The specification of complex polygons intentionally follows the GeoJson
  conventions for representing polygons with holes.
* Wireframe lines are rendered with `GL.LINE` and thus will always be 1 pixel wide.
* Wireframe and solid extrusions are exclusive, you'll need to create two layers
  with the same data if you want a combined rendering effect.

## Source

[src/layers/core/polygon-layer](https://github.com/uber/deck.gl/tree/4.1-release/src/layers/core/polygon-layer)

