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
]).then(({DeckLayer, modules}) => {
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
