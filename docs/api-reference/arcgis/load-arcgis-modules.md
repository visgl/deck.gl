# loadArcGISModules

This utility function initializes the classes in this module by loading ArcGIS dependencies. Optionally, it can also load additional dependencies from the `esri` namespace.

## Usage

```js
import {loadArcGISModules} from '@deck.gl/arcgis';

loadArcGISModules(['esri/Map', 'esri/views/MapView'], {version: '4.21'})
  .then(({DeckLayer, DeckRenderer, modules}) => {
    const [ArcGISMap, MapView] = modules;

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
  });
```

Arguments:

```js
loadArcGISModules(modules, loadScriptOptions);
```

- `modules` (string[], optional) - Array of esri modules to load, passed to [esri-loader](https://github.com/Esri/esri-loader)'s `loadModules`
- `loadScriptOptions` (object, optional) - [esri-loader options](https://github.com/Esri/esri-loader#configuring-esri-loader)

Returns: a promise that resolves to an object with the following fields:

- [DeckLayer](./deck-layer.md)
- [DeckRenderer](./deck-renderer.md)
- `modules` (object[]) - if the `modules` argument was specified, will represent an array of the resolved objects
