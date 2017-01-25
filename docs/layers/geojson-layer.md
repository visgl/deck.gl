# GeoJsonLayer

The GeoJson Layer takes in [GeoJson](http://geojson.org/) formatted data and
renders it as interactive polygons, lines and points.

    import {GeoJsonLayer} from 'deck.gl';

## Base-Layer Properties

Inherits from all [Base Layer properties](/docs/layers/base-layer.md):

#### `data`

* By supplying a GeoJson `FeatureCollection` you can render multiple polygons
  and lines.
* Each Feature has an optional "properties" object. The layer will look
  for an optional property `color`, which is expected to be a 4 element
  array of values between 0 and 255, representing the rgba values for
  the color of that `Feature`.

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

#### `onHovered` (Function, optional)

Provides selected feature (and properties) along with mouse event when a
GeoJson feature is hovered.

#### `onClicked` (Function, optional)

Provides selected feature (and properties) along with mouse event when a
GeoJson feature is clicked.


## Layer-specific Accessors

### `getStrokeColor`
### `getStrokeWidth`

### `getFillColor`

### `getPointColor`
### `getPointRadius`

## Layer-specific Properties

#### `strokeColor` (Boolean, optional)

- Default: `false`

Each object can have a `color`. strokeColor is the default.


#### `extruded` (Boolean, optional)

Draw choropleth contour if true, else fill choropleth area.
