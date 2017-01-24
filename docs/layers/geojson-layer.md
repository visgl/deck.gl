# GeoJsonLayer

The GeoJson Layer takes in [GeoJson](http://geojson.org/) formatted data and
renders it as interactive polygons, lines and points.

    import {GeoJsonLayer} from 'deck.gl';

Inherits from all [Base Layer properties](/docs/layers/base-layer.md).

## Layer-specific Properties

#### `strokeColor` (Boolean, optional)

- Default: `false`

Each object can have a `color`. strokeColor is the default.


#### `drawContour` (Boolean, optional)

Draw choropleth contour if true, else fill choropleth area.


#### `onHovered` (Function, optional)

Provides selected feature and properties along with mouse event when the choropleth is hovered.

#### `onClicked` (Function, optional)

Provides selected feature and properties along with mouse event when the choropleth is clicked.


## Additional notes

By supplying a GeoJson `FeatureCollection` you can render multiple polygons
and lines.

Each Feature has an optional "properties" object. The layer will look
for an optional property `color`, which is expected to be a 4 element
array of values between 0 and 255, representing the rgba values for
the color of that `Feature`.

If not provided, the default rgba will be `[0, 0, 255, 255]`.


    {
      "type": "FeatureCollection",
        "features": [
        {
          "type": "Feature",
          "geometry": {"type": "Point", "coordinates": [102.0, 0.5]},
          "properties": {"prop0": "value0"}
        },
        {
          "type": "Feature",
          "geometry": {
            "type": "LineString",
            "coordinates": [
              [102.0, 0.0], [103.0, 1.0], [104.0, 0.0], [105.0, 1.0]
            ]
          },
          "properties": {
            "color": [255, 0, 0, 255],
            "prop1": 0.0
          }
        },
        {
          "type": "Feature",
          "geometry": {
            "type": "Polygon",
            "coordinates": [
              [[100.0, 0.0], [101.0, 0.0], [101.0, 1.0], [100.0, 1.0], [100.0, 0.0]]
            ]
          },
          "properties": {
            "color": [255, 255, 0, 255],
            "prop1": {"application": "defined"}
          }
        }
      ]
    }
