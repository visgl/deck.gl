<!-- INJECT:"GeoJsonLayerDemo" -->

<p class="badges">
  <img src="https://img.shields.io/badge/64--bit-support-blue.svg?style=flat-square" alt="64-bit" />
  <img src="https://img.shields.io/badge/extruded-yes-blue.svg?style=flat-square" alt="extruded" />
</p>

# GeoJsonLayer

The GeoJson Layer takes in [GeoJson](http://geojson.org) formatted data and
renders it as interactive polygons, lines and points.

GeoJsonLayer is a [CompositeLayer](/docs/api-reference/composite-layer.md).

```js
import DeckGL, {GeoJsonLayer} from 'deck.gl';

const App = ({data, viewport}) => {
  const {data, viewport} = this.props;

  /**
   * Data format:
   * Valid GeoJSON object
   */
  const layer = new GeoJsonLayer({
    id: 'geojson-layer',
    data,
    pickable: true,
    stroked: false,
    filled: true,
    extruded: true,
    lineWidthScale: 20,
    lineWidthMinPixels: 2,
    getFillColor: [160, 160, 180, 200],
    getLineColor: d => colorToRGBArray(d.properties.color),
    getRadius: 100,
    getLineWidth: 1,
    getElevation: 30,
    onHover: ({object, x, y}) => {
      const tooltip = object.properties.name || object.properties.station;
      /* Update tooltip
         http://deck.gl/#/documentation/developer-guide/adding-interactivity?section=example-display-a-tooltip-for-hovered-object
      */
    }
  });

  return (<DeckGL {...viewport} layers={[layer]} />);
};
```

## Properties

Inherits from all [Base Layer](/docs/api-reference/layer.md) and [CompositeLayer](/docs/api-reference/composite-layer.md) properties.

### Render Options

Inherits from all [Base Layer properties](/docs/api-reference/layer.md),
however, the `data` prop is interpreted slightly more flexibly to accommodate
pure GeoJson "payloads".

##### `filled` (Boolean, optional)

* Default: `true`

Whether to draw filled polygons (solid fill). Note that for each polygon,
only the area between the outer polygon and any holes will be filled. This
prop is effective only when the polygon is NOT extruded.

##### `stroked` (Boolean, optional)

* Default: `false`

Whether to draw an outline around polygons (solid fill). Note that
for complex polygons, both the outer polygon as well the outlines of
any holes will be drawn.

##### `extruded` (Boolean, optional)

Extrude Polygon and MultiPolygon features along the z-axis if set to
true. The height of the drawn features is obtained using the `getElevation` accessor.

* Default: `false`

##### `wireframe` (Boolean, optional)

* Default: `false`

Whether to generate a line wireframe of the hexagon. The outline will have
"horizontal" lines closing the top and bottom polygons and a vertical line
(a "strut") for each vertex on the polygon.

Remarks:

* These lines are rendered with `GL.LINE` and will thus always be 1 pixel wide.
* Wireframe and solid extrusions are exclusive, you'll need to create two layers
  with the same data if you want a combined rendering effect.
* This is only effective if the `extruded` prop is set to true.

##### `lineWidthScale` (Boolean, optional)

* Default: `1`

The line width multiplier that multiplied to all lines, including the `LineString`
and `MultiLineString` features and also the outline for `Polygon` and `MultiPolygon`
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

##### `elevationScale` (Number, optional)

* Default: `1`

Elevation multiplier. The final elevation is calculated by
  `elevationScale * getElevation(d)`. `elevationScale` is a handy property to scale
all polygon elevation without updating the data.

##### `pointRadiusScale` (Number, optional)

* Default: `1`

A global radius multiplier for all points.

##### `pointRadiusMinPixels` (Number, optional)

* Default: `0`

The minimum radius in pixels.

##### `pointRadiusMaxPixels` (Number, optional)

* Default: `Number.MAX_SAFE_INTEGER`

The maximum radius in pixels.

##### `lineDashJustified` (Boolean, optional)

* Default: `false`

Justify dashes together.
Only works if `getLineDashArray` is specified.

##### `fp64` (Boolean, optional)

* Default: `false`

Whether the layer should be rendered in high-precision 64-bit mode. Note that since deck.gl v6.1, the default 32-bit projection uses a hybrid mode that matches 64-bit precision with significantly better performance.

##### `lightSettings` (Object, optional) **EXPERIMENTAL**

This is an object that contains light settings for extruded polygons.
Be aware that this prop will likely be changed in the future versions of
deck.gl.

### Data Accessors

##### `getLineColor` (Function|Array, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `[0, 0, 0, 255]`

The rgba color of line string and/or the outline of polygon for a GeoJson feature, depending on its type.
Format is `r, g, b, [a]`. Each component is in the 0-255 range.

* If an array is provided, it is used as the line color for all features.
* If a function is provided, it is called on each feature to retrieve its line color.

##### `getFillColor` (Function|Array, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `[0, 0, 0, 255]`

The solid color of the polygon and point features of a GeoJson.
Format is `r, g, b, [a]`. Each component is in the 0-255 range.

* If an array is provided, it is used as the fill color for all features.
* If a function is provided, it is called on each feature to retrieve its fill color.

Note: This accessor is only called for `Polygon` and `MultiPolygon` and `Point` features.

##### `getRadius` (Function|Number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `1`

The radius of `Point` and `MultiPoint` feature, in meters.

* If a number is provided, it is used as the radius for all point features.
* If a function is provided, it is called on each point feature to retrieve its radius.

##### `getLineWidth` (Function|Number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `1`

The width of line string and/or the outline of polygon for a GeoJson feature, depending on its type. Unit is meters.

* If a number is provided, it is used as the line width for all features.
* If a function is provided, it is called on each feature to retrieve its line width.

Note: This accessor is called for `LineString` and `MultiLineString`
features. It is called for `Polygon` and `MultiPolygon` features if the
`stroked` attribute is true.

##### `getElevation` (Function|Number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `1000`

The elevation of a polygon feature (when `extruded` is true).

If a cartographic projection mode is used, height will be interpreted as meters,
otherwise will be in unit coordinates.

* If a number is provided, it is used as the elevation for all polygon features.
* If a function is provided, it is called on each polygon feature to retrieve its elevation.

Note: This accessor is only called for `Polygon` and `MultiPolygon` features.

##### `getLineDashArray` (Function|Array, optional)

* Default: `null`

The dash array to draw each outline path with: `[dashSize, gapSize]` relative to the width of the line. (See PathLayer)

* If an array is provided, it is used as the dash array for all paths.
* If a function is provided, it is called on each path to retrieve its dash array. Return `[0, 0]` to draw the path in solid line.
* If this accessor is not specified, all paths are drawn as solid lines.

## Sub Layers

The GeoJsonLayer renders the following sublayers:

* `polygons-fill` - a [SolidPolygonLayer](/docs/layers/solid-polygon-layer.md) rendering all the `Polygon` and `MultiPolygon` features.
* `polygons-stroke` - a [PathLayer](/docs/layers/path-layer.md) rendering the outline of all the `Polygon` and `MultiPolygon` features. Only rendered if `stroked: true` and `extruded: false`.
* `linestrings` - a [PathLayer](/docs/layers/path-layer.md) rendering all the `LineString` and `MultiLineString` features.
* `points` - a [ScatterplotLayer](/docs/layers/scatterplot-layer.md) rendering all the `Point` and `MultiPoint` features.


## Remarks

* Geometry transition can be enabled with `props.transitions: {geometry: <transition_settings>}`.
* By supplying a GeoJson `FeatureCollection` you can render multiple polygons,
  lines and points.
* Each Feature has an optional "properties" object. The layer will look
  for an optional property `color`, which is expected to be a 4 element
  array of values between 0 and 255, representing the rgba values for
  the color of that `Feature`.

## Source

[modules/layers/src/geojson-layer](https://github.com/uber/deck.gl/tree/master/modules/layers/src/geojson-layer)

