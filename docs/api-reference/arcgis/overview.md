# @deck.gl/arcgis

Use deck.gl layers with the ArcGIS API for JavaScript.

The functionality exported by this module must be loaded asynchronously using the loader function `loadArcGISModules`.
This function can be used to load any module that ships with the ArcGIS API for JavaScript, plus an additional `arcGIS` module
that acts as an interface between deck.gl and ArcGIS.

2D integration with `MapView` is supported by the [DeckLayer](./deck-layer.md) class.

3D integration with `SceneView` is experimental: see the [DeckRenderer](./deck-renderer.md) class.

## Installation

### Include the Standalone Bundle

```html
<script src="https://unpkg.com/deck.gl@^9.0.0/dist.min.js"></script>
<!-- or -->
<script src="https://unpkg.com/@deck.gl/core@^9.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/arcgis@^1.0.0/dist.min.js"></script>
<!-- usage -->
<script type="text/javascript">
  deck.loadArcGISModules();
</script>
```

Note that only [loadArcGISModules](./load-arcgis-modules.md#usage) is expoted by the standalone bundle. `DeckLayer` and `DeckRenderer` are avalaible when `loadArcGISModule()` is resolved.

### Install from NPM

```bash
npm install deck.gl @arcgis/core
# or
npm install @deck.gl/core @deck.gl/arcgis @arcgis/core
```

```js
// if using with esri-loader
import {loadArcGISModules} from '@deck.gl/arcgis';
// if using with @arcgis/core
import {DeckLayer} from '@deck.gl/arcgis';
```

The integration classes (`DeckLayer` and `DeckRenderer`) extend ArcGIS core classes, therefore they are only available when ArcGIS is available. To load ArcGIS, applications have [two options](https://developers.arcgis.com/javascript/latest/install-and-set-up/): from AMD modules on CDN or from locally installed ES modules. It is important that the Deck classes are imported in the same way as the ArcGIS dependency.

If the application is importing the ArcGIS Map via AMD modules (`esri-loader`), then the Deck classes should be accessed by calling `loadArcGISModules`. This is the case if you are using `@esri/react-arcgis`, which utilizes `esri-loader` under the hood.

If the application is importing the ArcGIS Map from locally installed ES modules (`@arcgis/core`), then the Deck classes should be imported directly from `@deck.gl/arcgis`.


## Supported Features and Limitations

Supported deck.gl features:

- Layers
- Effects
- Attribute transitions
- Auto-highlighting
- `onHover` and `onClick` callbacks

Not supported features:

- Multiple views
- Controller
- React integration
