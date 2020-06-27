# loadArcGISModules

This utility function initializes the classes in this module by loading ArcGIS dependencies. Optionally, it can also load additional dependencies from the `esri` namespace.

## Usage

```js
import {loadArcGISModules} from '@deck.gl/arcgis';

loadArcGISModules(['esri/Map', 'esri/views/MapView'], {version: '4.14'})
  .then(({DeckLayer, DeckRenderer, modules}) => {
    const [ArcGISMap, MapView] = modules;

    // Create map
  });
```

Arguments:

```js
loadArcGISModules(modules, loadScriptOptions);
```

- `modules` (Array, optional) - Array of esri modules to load, passed to [esri-loader](https://github.com/Esri/esri-loader)'s `loadModules`
- `loadScriptOptions` (Object, optional) - [esri-loader options](https://github.com/Esri/esri-loader#configuring-esri-loader)

Returns: a promise that resolves to an object with the following fields:

- [DeckLayer](/docs/api-reference/arcgis/deck-layer.md)
- [DeckRenderer](/docs/api-reference/core/deck-renderer.md)
- `modules` (Array) - if the `modules` argument was specified, will represent an array of the resolved objects
