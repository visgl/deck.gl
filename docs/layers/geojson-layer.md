<p align="right">
  <img src="https://img.shields.io/badge/extruded-yes-blue.svg?style=flat-square" alt="64-bit" />
</p>

# GeoJsonLayer

The GeoJson Layer takes in [GeoJson](http://geojson.org/) formatted data and
renders it as interactive polygons, lines and points.

  <div align="center">
    <img height="300" src="/demo/src/static/images/demo-thumb-geojson.jpg" />
  </div>

```
import {GeoJsonLayer} from 'deck.gl';

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

Remarks:
* By supplying a GeoJson `FeatureCollection` you can render multiple polygons,
  lines and points.
* Each Feature has an optional "properties" object. The layer will look
  for an optional property `color`, which is expected to be a 4 element
  array of values between 0 and 255, representing the rgba values for
  the color of that `Feature`.


## Properties

Inherits from all [Base Layer properties](/docs/layers/base-layer.md),
however, the `data` prop is interpreted slightly more flexibly to accommodate
puree GeoJson "payloads".

Also note that the `GeoJsonLayer` is a **composite** layer, that renders points
using `ScatterplotLayer`, lines and polygon outlines (`stroked` polygons)
using `PathLayer`, and `filled` polygons using a primitive polygon layer.
The `GeoJsonLayer` passes through most of its props to these underlying layers
so you can sometimes achieve additional control of rendering by studying
the props of the generated layers.

#### `data` (Object, Array or iterable)

A GeoJson `FeatureCollection` object, or a list of GeoJson `Feature` objects.
For more information on how the GeoJson is interpreted see the introduction.


#### `filled` (Boolean, optional)

- Default: `true`

Whether to draw filled polygons (solid fill). Note that for each polygon,
only the area between the outer polygon and any holes will be filled.


#### `stroked` (Boolean, optional)

- Default: `false`

Whether to draw an outline around polygons (solid fill). Note that
for complex polygons, both the outer polygon as well the outlines of
any holes will be drawn.


#### `extruded` (Boolean, optional)

Extrude Polygon and MultiPolygon features in 3D if true, using the
`getElevation` accessor.


#### `lightSettings` (Object, optional) **EXPERIMENTAL**

This is an object that contains light settings for extruded polygons.
Be aware that this prop will likely be changed in a future version of deck.gl.


## Callbacks

#### `onHover` (Function, optional)

Provides selected feature (and properties) along with mouse event when a
GeoJson feature is hovered.


#### `onClick` (Function, optional)

Provides selected feature (and properties) along with mouse event when a
GeoJson feature is clicked.


## Accessors

#### `getColor`

Called to retrieve the point or line color for a GeoJson feature, depending
on its type.


#### `getRadius`

Note: This accessor is only called for `Point` and `MultiPoint` features.


#### `getStrokeWidth`

Called to retrieve the line width for a GeoJson feature.

Note: This accessor is called for `LineString` and `MultiLineString`
features. It is called for `Polygon` and `MultiPolygon` features if the
`stroked` attribute is true.


#### `getFillColor` (Function, optional)

Called to retrieve the polygon fill color for a GeoJson feature.

Note: This accessor is only called for `Polygon` and `MultiPolygon` features.


#### `getElevation` (Function, optional)

- Default: `object => object.elevation`

Called to retrieve the elevation of a polygon feature (when `extruded` is true).

If a cartographic projection mode is used, height will be interpreted as meters,
otherwise will be in unit coordinates.

Note: This accessor is only called for `Polygon` and `MultiPolygon` features.
