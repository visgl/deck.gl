# loadArcGISModules

This utility function initializes the classes in this module by loading ArcGIS dependencies. Optionally, it can also load additional dependencies from the `esri` namespace.

## Usage

```js
import {loadArcGISModules} from '@deck.gl/arcgis';

loadArcGISModules(['esri/Map', 'esri/views/MapView'], {version: '4.14'})
  .then(({ArcGISDeckLayer, modules}) => {
    const [ArcGISMap, MapView] = modules;
    ...
  });
```

Arguments:

- `modules` (Array, optional) - Array of esri modules to load, passed to [esri-loader](https://github.com/Esri/esri-loader)'s `loadModules`
- `loadScriptOptions` (Object, optional) - [esri-loader options](https://github.com/Esri/esri-loader#configuring-esri-loader)

Returns: a promise that resolves to an object with the following fields:

- [ArcGISDeckLayer](/docs/api-reference/arcgis/arcgis-deck-layer.md)
- modules (Array) - if the `modules` argument was specified, will represent the resolved result from `esri-loader`'s `loadModules`
