# DeckLayer

This class inherits from the ArcGIS [Layer](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-Layer.html) class and can be added to maps created with the ArcGIS API for JavaScript.

`DeckLayer` is only available when `loadArcGISModules()` is resolved. At the moment, it only supports 2D integration.

## Usage

```js
import {loadArcGISModules} from '@deck.gl/arcgis';

loadArcGISModules([
  'esri/Map',
  'esri/views/MapView'
]).then(({DeckLayer, modules}) => {
  const [ArcGISMap, MapView] = modules;

  const layer = new DeckLayer({
    'deck.layers': [
      // deck.gl layers
    ]
  });

  const mapView = new MapView({
    container: "viewDiv",
    map: new ArcGISMap({
      basemap: "dark-gray-vector",
      layers: [layer]
    }),
    center: [0.119, 52.205],
    zoom: 5
  });
});
```


## Constructor

```js
new DeckLayer(props);
```

Inherits all properties from the base [Layer](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-Layer.html#properties-summary) class.

Property names that start with `deck.` are forwarded to a `Deck` instance. The following [Deck](/docs/api-reference/core/deck.md) props are supported:

- `deck.layers`
- `deck.layerFilter`
- `deck.parameters`
- `deck.effects`
- `deck.pickingRadius`
- `deck.onBeforeRender`
- `deck.onAfterRender`
- `deck.onClick`
- `deck.onHover`
- `deck.onDragStart`
- `deck.onDrag`
- `deck.onDragEnd`
- `deck.onError`
- `deck.debug`
- `deck.drawPickingColors`
- `deck.getCursor`

## Members

##### `deck`

An ArcGIS [Accessor](https://developers.arcgis.com/javascript/latest/api-reference/esri-core-Accessor.html) that stores Deck props. The props can be updated after the layer construction:

```js
// Update deck layers
layer.deck.layers = [...]);

// Update multiple deck props
layer.deck.set({
  layers: [...],
  pickingRadius: 5,
  ...
});
```
