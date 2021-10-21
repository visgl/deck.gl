# @deck.gl/arcgis

Use deck.gl layers with the ArcGIS API for JavaScript.

The functionality exported by this module must be loaded asynchronously using the loader function `loadArcGISModules`.
This function can be used to load any module that ships with the ArcGIS API for JavaScript, plus an additional `arcGIS` module
that acts as an interface between deck.gl and ArcGIS.

2D integration with `MapView` is supported by the [DeckLayer](/docs/api-reference/arcgis/deck-layer.md) class.

3D integration with `SceneView` is experimental: see the [DeckRenderer](/docs/api-reference/arcgis/deck-renderer.md) class.

## Installation

### Include the Standalone Bundle

```html
<script src="https://unpkg.com/deck.gl@^8.0.0/dist.min.js"></script>
<!-- or -->
<script src="https://unpkg.com/@deck.gl/core@^8.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/arcgis@^1.0.0/dist.min.js"></script>
<!-- usage -->
<script type="text/javascript">
  deck.loadArcGISModules();
</script>
```

Note that only `loadArcGISModules` is avalable in the standalone bundle because it does not include code from ESRI. `DeckLayer` and `DeckRenderer` only available when `loadArcGISModules()` is resolved. See example in [loadArcGISModules](/docs/api-reference/arcgis/load-arcgis-modules.md#usage).

### Install from NPM

```bash
npm install deck.gl @arcgis/core
# or
npm install @deck.gl/core @deck.gl/arcgis @arcgis/core
```

```js
import {DeckLayer, DeckRenderer} from '@deck.gl/arcgis';
```

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
