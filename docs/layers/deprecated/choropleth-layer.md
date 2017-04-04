
<p class="badges">
  <img src="https://img.shields.io/badge/-deprecated-red.svg?style=flat-square" alt="64-bit" />
</p>

# Choropleth Layer

Note: The `ChoroplethLayer` has been deprecated in deck.gl v4 in favor
of the new `GeoJsonLayer` and `PolygonLayer`. It will likely be removed in the
next major release of deck.gl.

The Choropleth Layer takes in [GeoJson](http://geojson.org/) formatted data and
renders it as interactive choropleths.

<div align="center">
  <img height="300" src="/demo/src/static/images/demo-thumb-choropleth.jpg" />
</div>

    import {ChoroplethLayer} from 'deck.gl';

Inherits from all [Base Layer](/docs/api-reference/base-layer.md) properties.

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
optional property `color`, which is expected to be a 4 element array of values
between 0 and 255, representing the rgba values for the color of that `Feature`.

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
