## Choropleth Layer

The Choropleth Layer takes in [GeoJson](http://geojson.org/) formatted data and
renders it as interactive choropleths.

By supplying a GeoJson `FeatureCollection` you can add multiple polygons.
Each Feature has an optional "properties" object. The layer will look for an
optional property "color", which is expected to be a 3 element array of values
between 0 and 255, representing the RGB values for the color of that `Feature`

```
  { "type": "FeatureCollection",
    "features": [
      { "type": "Feature",
        "geometry": {"type": "Point", "coordinates": [102.0, 0.5]},
        "properties": {"prop0": "value0"}
        },
      { "type": "Feature",
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
      { "type": "Feature",
         "geometry": {
           "type": "Polygon",
           "coordinates": [
             [ [100.0, 0.0], [101.0, 0.0], [101.0, 1.0],
               [100.0, 1.0], [100.0, 0.0] ]
             ]
         },
         "properties": {
           "color": [255, 255, 0],
           "prop1": {"application": "defined"}
           }
         }
       ]
     }
``


  **Common Parameters**

  * `id` (string, required): layer ID
  * `width` (number, required) width of the layer
  * `height` (number, required) height of the layer
  * `longitude` (number, required) longitude of the map center
  * `latitude` (number, required) latitude of the map center
  * `zoom` (number, required) zoom level of the map
  * `opacity` (number, required) opacity of the layer
  * `isPickable` [bool, optional, default=false] whether layer responses to
  mouse events

  **Layer-specific Parameters**

  * `data` (object, required) input data in GeoJson format
  * `drawContour` [bool, optional, default=false] draw choropleth contour if
  true, else fill choropleth area

  **Callbacks**

  * `onChoroplethHovered` [function, optional] bubbles choropleth properties
  when mouse hovering
  * `onChoroplethClicked` [function, optional] bubbles choropleth properties
  when mouse clicking
