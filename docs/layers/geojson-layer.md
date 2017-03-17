<p align="right">
  <img src="https://img.shields.io/badge/extruded-yes-blue.svg?style=flat-square" alt="64-bit" />
</p>

# GeoJsonLayer

The GeoJson Layer takes in [GeoJson](http://geojson.org/) formatted data and
renders it as interactive polygons, lines and points.

<div align="center">
  <img height="300" src="/demo/src/static/images/demo-thumb-geojson.jpg" />
</div>

    import {GeoJsonLayer} from 'deck.gl';

## Properties

Inherits from all [Base Layer properties](/docs/layers/base-layer.md),
however, the `data` prop is interpreted slightly more flexibly to accommodate
pure GeoJson "payloads".

Also note that the `GeoJsonLayer` is a **composite** layer, that renders points, lines and polygons with its outlines with different "underlying" layers, so developers can sometimes achieve additional control of rendering by controlling
the props of the underlying layers directly.

#### `data` (Object, Array or iterable)

A GeoJson `FeatureCollection` object, or a list of GeoJson `Feature` objects.
For more information on how the GeoJson is interpreted see the introduction.

#### `filled` (Boolean, optional)

- Default: `true`

Whether to draw filled polygons (solid fill). Note that for each polygon,
only the area between the outer polygon and any holes will be filled. This
prop is effective only when the polygon is NOT extruded.

#### `stroked` (Boolean, optional)

- Default: `false`

Whether to draw an outline around polygons (solid fill). Note that
for complex polygons, both the outer polygon as well the outlines of
any holes will be drawn.

#### `extruded` (Boolean, optional)

Extrude Polygon and MultiPolygon features along the z-axis if set to
true. The height of the drawn features is obtained using the `getElevation` accessor.

- Default: `false`

#### `wireframe` (Boolean, optional)

- Default: `false`

Whether to generate a line wireframe of the hexagon. The outline will have
"horizontal" lines closing the top and bottom polygons and a vertical line
(a "strut") for each vertex on the polygon.

Remarks:
* These lines are rendered with `GL.LINE` and will thus always be 1 pixel wide.
* Wireframe and solid extrusions are exclusive, you'll need to create two layers
  with the same data if you want a combined rendering effect.
* This is only effective if the `extruded` prop is set to true.

#### `fp64` (Boolean, optional)

- Default: `false`

Whether the layer should be rendered in high-precision 64-bit mode

#### `lightSettings` (Object, optional) **EXPERIMENTAL**

This is an object that contains light settings for extruded polygons.
Be aware that this prop will likely be changed in the future versions of
deck.gl.

## Accessors

#### `getColor`

- Default: `object => object.strokeColor || [0, 0, 0, 255]`

Called to retrieve the point or line color for a GeoJson feature, depending
on its type.

#### `getFillColor` (Function, optional)

- Default: `object => object.fillColor || [0, 0, 0, 25]`

Called to retrieve the polygon fill color for a GeoJson feature.

Note: This accessor is only called for `Polygon` and `MultiPolygon` features.

#### `getRadius`

- Default: `object => object.radius || object => object.size || 1`

Called to retrieve the radius of `Point` and `MultiPoint` feature.

#### `getWidth`

- Default: `object => object.strokeWidth || 1`

Called to retrieve the line width for a GeoJson feature.

Note: This accessor is called for `LineString` and `MultiLineString`
features. It is called for `Polygon` and `MultiPolygon` features if the
`stroked` attribute is true.

#### `getElevation` (Function, optional)

- Default: `object => object.elevation || 1000`

Called to retrieve the elevation of a polygon feature (when `extruded` is true).

If a cartographic projection mode is used, height will be interpreted as meters,
otherwise will be in unit coordinates.

Note: This accessor is only called for `Polygon` and `MultiPolygon` features.

## Remarks

```
new GeoJsonLayer({
  data: {
    "type": "FeatureCollection",
      "features": [
        {
          "type": "Feature",
          "geometry": {
            "type": "Point",
            "coordinates": [102.0, 0.5]
          },
          "properties": {
            "color": [255, 0, 0, 255],
            "prop1": {"application": "defined"}
          }
        },
        ...
      ]
    }
  }
});
```

* By supplying a GeoJson `FeatureCollection` you can render multiple polygons,
  lines and points.
* Each Feature has an optional "properties" object. The layer will look
  for an optional property `color`, which is expected to be a 4 element
  array of values between 0 and 255, representing the rgba values for
  the color of that `Feature`.
