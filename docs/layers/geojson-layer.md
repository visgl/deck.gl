<!-- INJECT:"GeoJsonLayerDemo" -->

<p class="badges">
  <img src="https://img.shields.io/badge/64--bit-support-blue.svg?style=flat-square" alt="64-bit" />
  <img src="https://img.shields.io/badge/extruded-yes-blue.svg?style=flat-square" alt="extruded" />
</p>

# GeoJsonLayer

The GeoJson Layer takes in [GeoJson](http://geojson.org) formatted data and
renders it as interactive polygons, lines and points.

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
    filled: true,
    stroked: false,
    extruded: true
  });

  return (<DeckGL {...viewport} layers={[layer]} />);
};
```

## Properties

Inherits from all [Base Layer](/docs/api-reference/base-layer.md) properties.

### Render Options

Inherits from all [Base Layer properties](/docs/api-reference/base-layer.md),
however, the `data` prop is interpreted slightly more flexibly to accommodate
pure GeoJson "payloads".

##### `filled` (Boolean, optional)

- Default: `true`

Whether to draw filled polygons (solid fill). Note that for each polygon,
only the area between the outer polygon and any holes will be filled. This
prop is effective only when the polygon is NOT extruded.

##### `stroked` (Boolean, optional)

- Default: `false`

Whether to draw an outline around polygons (solid fill). Note that
for complex polygons, both the outer polygon as well the outlines of
any holes will be drawn.

##### `extruded` (Boolean, optional)

Extrude Polygon and MultiPolygon features along the z-axis if set to
true. The height of the drawn features is obtained using the `getElevation` accessor.

- Default: `false`

##### `wireframe` (Boolean, optional)

- Default: `false`

Whether to generate a line wireframe of the hexagon. The outline will have
"horizontal" lines closing the top and bottom polygons and a vertical line
(a "strut") for each vertex on the polygon.

Remarks:
* These lines are rendered with `GL.LINE` and will thus always be 1 pixel wide.
* Wireframe and solid extrusions are exclusive, you'll need to create two layers
  with the same data if you want a combined rendering effect.
* This is only effective if the `extruded` prop is set to true.

##### `lineWidthScale` (Boolean, optional)

- Default: `1`

The line width multiplier that multiplied to all lines, including the `LineString`
and `MultiLineString` features and also the outline for `Polygon` and `MultiPolygon`
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

##### `elevationScale` (Number, optional)

- Default: `1`

Elevation multiplier. The final elevation is calculated by
  `elevationScale * getElevation(d)`. `elevationScale` is a handy property to scale
all polygon elevation without updating the data.

##### `pointRadiusScale` (Number, optional)

- Default: `1`

A global radius multiplier for all points.

##### `pointRadiusMinPixels` (Number, optional)

- Default: `0`

The minimum radius in pixels.

##### `pointRadiusMaxPixels` (Number, optional)

- Default: `Number.MAX_SAFE_INTEGER`

The maximum radius in pixels.

##### `fp64` (Boolean, optional)

- Default: `false`

Whether the layer should be rendered in high-precision 64-bit mode

##### `lightSettings` (Object, optional) **EXPERIMENTAL**

This is an object that contains light settings for extruded polygons.
Be aware that this prop will likely be changed in the future versions of
deck.gl.

### Data Accessors

##### `getLineColor`

- Default: `f => f.properties.lineColor || [0, 0, 0, 255]`

Called to retrieve the color of line and/or the outline of polygon color for a GeoJson feature, depending
on its type.

##### `getFillColor` (Function, optional)

- Default: `f => f.properties.fillColor || [0, 0, 0, 25]`

Called to retrieve the solid color of the polygon and point features of a GeoJson.

Note: This accessor is only called for `Polygon` and `MultiPolygon` and `Point` features.

##### `getRadius`

- Default: `f => f.properties.radius || f => f.properties.size || 1`

Called to retrieve the radius of `Point` and `MultiPoint` feature.

##### `getLineWidth`

- Default: `f => f.properties.lineWidth || 1`

Called to retrieve the line width in meters for a GeoJson feature.

Note: This accessor is called for `LineString` and `MultiLineString`
features. It is called for `Polygon` and `MultiPolygon` features if the
`stroked` attribute is true.

##### `getElevation` (Function, optional)

- Default: `f => f.properties.elevation || 1000`

Called to retrieve the elevation of a polygon feature (when `extruded` is true).

If a cartographic projection mode is used, height will be interpreted as meters,
otherwise will be in unit coordinates.

Note: This accessor is only called for `Polygon` and `MultiPolygon` features.

### Remarks

* By supplying a GeoJson `FeatureCollection` you can render multiple polygons,
  lines and points.
* Each Feature has an optional "properties" object. The layer will look
  for an optional property `color`, which is expected to be a 4 element
  array of values between 0 and 255, representing the rgba values for
  the color of that `Feature`.

## Source
[src/layers/core/geojson-layer](https://github.com/uber/deck.gl/tree/4.1-release/src/layers/core/geojson-layer)

