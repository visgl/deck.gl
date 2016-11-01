# Choropleth Layer

The Choropleth Layer takes in [GeoJson](http://geojson.org/) formatted data and
renders it as interactive choropleths.

Inherits from all [Base Layer properties](/docs/layers/base-layer.md).

    import {ChoroplethLayer} from 'deck.gl';

## Layer-specific Properties

##### `drawContour` (Boolean, optional)

- Default: `false`

Draw choropleth contour if true, else fill choropleth area.

##### `onChoroplethHovered` (Function, optional)

Provides selected choropleth properties along with mouse event when the choropleth is hovered.

##### `onChoroplethClicked` (Function, optional)

Provides selected choropleth properties along with mouse event when the choropleth is clicked.

#### Additional notes

By supplying a GeoJson `FeatureCollection` you can add multiple polygons.
Each Feature has an optional "properties" object. The layer will look for an
optional property "color", which is expected to be a 3 element array of values
between 0 and 255, representing the RGB values for the color of that `Feature`


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
            "color": [255, 0, 0],
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
            "color": [255, 255, 0],
            "prop1": {"application": "defined"}
          }
        }
      ]
    }
