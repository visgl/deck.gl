# @deck.gl/arcgis

Use deck.gl layers with the ArcGIS API for JavaScript.

The functionality exported by this module must be loaded asynchronously using the loader function `loadArcGISModules`.
This function can be used to load any module that ships with the ArcGIS API for JavaScript, plus an additional `arcGIS` module
that acts as an interface between deck.gl and ArcGIS.

At the moment only 2D integration with `MapView` is supported; it is provided by the `arcGIS.ArcGISDeckLayer` class.

## Installation

### Include the Standalone Bundle

```html
<script src="https://unpkg.com/deck.gl@^8.0.0/dist.min.js"></script>
<!-- or -->
<script src="https://unpkg.com/@deck.gl/core@^8.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/arcgis@^1.0.0/dist.min.js"></script>
<!-- usage -->
<script type="text/javascript">
deck.loadArcGISModules([
  "esri/Map",
  "esri/views/MapView"
]).then(([
  arcGIS,
  ArcGISMap,
  MapView
]) => {
  const {ArcGISDeckLayer} = arcGIS;
  ...
</script>
```

### Install from NPM

```bash
npm install deck.gl
# or
npm install @deck.gl/core @deck.gl/arcgis
```

```js
import {loadArcGISModules} from '@deck.gl/arcgis';

loadArcGISModules([
  "esri/Map",
  "esri/views/MapView"
]).then(([
  arcGIS,
  ArcGISMap,
  MapView
]) => {
  const {ArcGISDeckLayer} = arcGIS;
  ...
</script>
```

## Supported Features and Limitations

Supported deck.gl features:

- Layers
- Effects
- Attribute transitions

Not supported features:

- Tilting
- Views
- Controller
- React integration
- Gesture event callbacks (e.g. `onDrag*`)
- Auto-highlighting
- `onHover` and `onClick` callbacks
