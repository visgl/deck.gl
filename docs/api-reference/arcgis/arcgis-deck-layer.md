# ArcGISDeckLayer

This class inherits from the ArcGIS [Layer](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-Layer.html) class and can be added to maps created with the ArcGIS API for JavaScript. Its content is defined by the `deckLayers` property, which is a collection of deck.gl layers.

## Usage

```js
import {loadArcGISModules} from '@deck.gl/arcgis';
import {GeoJsonLayer, ArcLayer} from '@deck.gl/layers';

loadArcGISModules([
  "esri/Map",
  "esri/views/MapView"
]).then(([
  arcGIS,
  ArcGISMap,
  MapView
]) => {
  const layer = new arcGIS.ArcGISDeckLayer({
    deckLayers: [
      new GeoJsonLayer({
        ...
      }),
      new ArcLayer({
        ...
      })
    ]
  });
  
  const mapView = new MapView({
    container: "viewDiv",
    map: new ArcGISMap({
      basemap: "dark-gray-vector",
      layers: [layer]
    }),
    center: [0.119167, 52.205276],
    zoom: 5
  });
});
```


## Constructor

```js
const layer = new arcGIS.ArcGISDeckLayer(props)
```

`props` are forwarded to a `Deck` instance. The following [Deck](/docs/api-reference/deck.md) props are supported:

- `deckLayers` is forwarded to `layers`
- `effects`
- `parameters`
