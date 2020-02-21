# ArcGISDeckLayer

This class inherits from the ArcGIS [Layer](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-Layer.html) class and can be added to maps created with the ArcGIS API for JavaScript. Its content is defined by the `deckLayers` property, which is a collection of deck.gl layers.

`ArcGISDeckLayer` is only available when `loadArcGISModules()` is resolved.

## Usage

```js
import {loadArcGISModules} from '@deck.gl/arcgis';
import {GeoJsonLayer, ArcLayer} from '@deck.gl/layers';

loadArcGISModules().then(({ArcGISDeckLayer}) => {
  const layer = new ArcGISDeckLayer({
    deckLayers: [
      new GeoJsonLayer({
        ...
      }),
      new ArcLayer({
        ...
      })
    ]
  });
});
```


## Constructor

```js
const layer = new ArcGISDeckLayer(props)
```

`props` are forwarded to a `Deck` instance. The following [Deck](/docs/api-reference/deck.md) props are supported:

- `deckLayers` is forwarded to `layers`
- `effects`
- `parameters`
