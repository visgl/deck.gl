# ArcGISDeckLayer

This class inherits from the ArcGIS [Layer](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-Layer.html) class and can be added to maps created with the ArcGIS API for JavaScript. Its content is defined by the `deckLayers` property, which is a collection of deck.gl layers.

`ArcGISDeckLayer` is only available when `loadArcGISModules()` is resolved.

## Usage

```js
import {loadArcGISModules} from '@deck.gl/arcgis';
import {GeoJsonLayer} from '@deck.gl/layers';

loadArcGISModules().then(({ArcGISDeckLayer}) => {
  const layer = new ArcGISDeckLayer({
    'deck.layers': [],
    'deck.onError': errorHandler
  });

  layer.set('deck.layers', [
    new GeoJsonLayer({
      id: 'geojson',
      data: 'mydata.geojson'
    })
  ]);
});
```


## Constructor

```js
const layer = new ArcGISDeckLayer(props)
```

Property names that start with `deck.` are forwarded to a `Deck` instance. The following [Deck](/docs/api-reference/deck.md) props are supported:

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

## Methods

##### `set(propName, value)`

Update a prop to a new value.
