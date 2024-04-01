# DeckLayer

This class inherits from the ArcGIS [Layer](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-Layer.html) class and can be added to maps created with the ArcGIS API for JavaScript.

At the moment, `DeckLayer` only supports 2D integration.

## Usage

```js
import {DeckLayer} from '@deck.gl/arcgis';
import {ScatterplotLayer} from '@deck.gl/layers';
import ArcGISMap from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';

const layer = new DeckLayer({
  'deck.layers': [
    new ScatterplotLayer({
      data: [
        {position: [0.119, 52.205]}
      ],
      getPosition: d => d.position,
      getColor: [255, 0, 0],
      radiusMinPixels: 20
    })
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
```


## Constructor

```js
new DeckLayer(props);
```

Inherits all properties from the base [Layer](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-Layer.html#properties-summary) class.

Property names that start with `deck.` are forwarded to a `Deck` instance. The following [Deck](../core/deck.md) props are supported:

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
- `deck.getTooltip`

## Members

#### `deck` {#deck}

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
