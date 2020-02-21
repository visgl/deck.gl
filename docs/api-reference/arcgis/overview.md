# @deck.gl/arcgis

Use deck.gl layers with the ArcGIS API for JavaScript.

The functionality exported by this module must be loaded asynchronously using the loader function `loadArcGISModules`.
This function can be used to load any module that ships with the ArcGIS API for JavaScript, plus an additional `arcGIS` module
that acts as an interface between deck.gl and ArcGIS.

At the moment only 2D integration with `MapView` is supported; it is provided by the `ArcGISDeckLayer` class.

## Installation

### Include the Standalone Bundle

```html
<script src="https://unpkg.com/deck.gl@^8.0.0/dist.min.js"></script>
<!-- or -->
<script src="https://unpkg.com/@deck.gl/core@^8.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/arcgis@^1.0.0/dist.min.js"></script>
<!-- usage -->
<script type="text/javascript">
  const {loadArcGISModules} = deck;
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
  'esri/Map',
  'esri/views/MapView'
]).then(({ArcGISDeckLayer, modules}) => {
  const [ArcGISMap, MapView] = modules;

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

  const mapView = new MapView({
    container: "viewDiv",
    map: new ArcGISMap({
      basemap: "dark-gray-vector",
      layers: [layer]
    }),
    center: [0.119167, 52.205276],
    zoom: 5
  });
});
```

## Supported Features and Limitations

Supported deck.gl features:

- Layers
- Effects
- Attribute transitions
- Auto-highlighting
- `onHover` and `onClick` callbacks

Not supported features:

- Tilting
- Views
- Controller
- React integration
