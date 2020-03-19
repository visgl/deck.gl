# DeckRenderer

This class is an experimental implementation of the ArcGIS [ExternalRenderer](https://developers.arcgis.com/javascript/latest/api-reference/esri-views-3d-externalRenderers.html#ExternalRenderer) interface and can be added to 3D views of maps created with the ArcGIS
API for JavaScript.

`DeckRenderer` is only available when `loadArcGISModules()` is resolved.

## Usage

```js
import {loadArcGISModules} from '@deck.gl/arcgis';
import {GeoJsonLayer} from '@deck.gl/layers';

loadArcGISModules([
  'esri/views/SceneView',
  'esri/views/3d/externalRenderers'
]).then(({DeckRenderer, modules}) => {
  const [SceneView, externalRenderers] = modules;

  const sceneView = new SceneView({
    container: 'viewDiv',
    map: new ArcGISMap({
      basemap: 'dark-gray-vector'
    }),
    camera: {
      position: {x: -74, y: 40.65, z: 5000},
      heading: 180,
      tilt: 30
    },
    viewingMode: 'local'
  });

  const renderer = new DeckRenderer(sceneView, {
    layers: [
      // deck.gl layers
    ]
  });

  externalRenderers.add(sceneView, renderer);
});
```


## Constructor

```js
new DeckRenderer(sceneView, props)
```

- `sceneView` ([SceneView](https://developers.arcgis.com/javascript/latest/api-reference/esri-views-SceneView.html)) - the view to use this renderer with. `viewingMode` must be set to `'local'`.
- `props` (Object) - forwarded to a `Deck` instance. The following [Deck](/docs/api-reference/deck.md) props are supported:

- `layers`
- `layerFilter`
- `parameters`
- `effects`
- `pickingRadius`
- `onBeforeRender`
- `onAfterRender`
- `onClick`
- `onHover`
- `onDragStart`
- `onDrag`
- `onDragEnd`
- `onError`
- `debug`
- `drawPickingColors`


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

