# @deck.gl/arcgis

Use deck.gl layers with the ArcGIS API for JavaScript.

The functionality exported by this module must be loaded asynchronously using the loader function `loadArcGISModules`. This function can be used to load any module that ships with the ArcGIS API for JavaScript, plus an additional `arcGIS` module that acts as an interface between deck.gl and ArcGIS.

2D integration with `MapView` is supported by the [DeckLayer](https://deck.gl/docs/api-reference/arcgis/deck-layer.md) class.

3D integration with `SceneView` is experimental and currently targets `viewingMode: 'local'`: see the [DeckRenderer](https://deck.gl/docs/api-reference/arcgis/deck-renderer.md) class.

## Installation[​](#installation "Direct link to Installation")

### Include the Standalone Bundle[​](#include-the-standalone-bundle "Direct link to Include the Standalone Bundle")

```
<script src="https://unpkg.com/deck.gl@^9.0.0/dist.min.js"></script>

<!-- or -->

<script src="https://unpkg.com/@deck.gl/core@^9.0.0/dist.min.js"></script>

<script src="https://unpkg.com/@deck.gl/arcgis@^1.0.0/dist.min.js"></script>

<!-- usage -->

<script type="text/javascript">

  deck.loadArcGISModules();

</script>
```

Note that only [loadArcGISModules](https://deck.gl/docs/api-reference/arcgis/load-arcgis-modules.md#usage) is expoted by the standalone bundle. `DeckLayer` and `DeckRenderer` are avalaible when `loadArcGISModule()` is resolved.

### Install from NPM[​](#install-from-npm "Direct link to Install from NPM")

```
npm install deck.gl @arcgis/core

# or

npm install @deck.gl/core @deck.gl/arcgis @arcgis/core
```

```
// if using with esri-loader

import {loadArcGISModules} from '@deck.gl/arcgis';

// if using with @arcgis/core

import {DeckLayer} from '@deck.gl/arcgis';
```

The integration classes (`DeckLayer` and `DeckRenderer`) extend ArcGIS core classes, therefore they are only available when ArcGIS is available. To load ArcGIS, applications have [two options](https://developers.arcgis.com/javascript/latest/install-and-set-up/): from AMD modules on CDN or from locally installed ES modules. It is important that the Deck classes are imported in the same way as the ArcGIS dependency.

If the application is importing the ArcGIS Map via AMD modules (`esri-loader`), then the Deck classes should be accessed by calling `loadArcGISModules`. This is the case if you are using `@esri/react-arcgis`, which utilizes `esri-loader` under the hood.

If the application is importing the ArcGIS Map from locally installed ES modules (`@arcgis/core`), then the Deck classes should be imported directly from `@deck.gl/arcgis`.

## Supported Features and Limitations[​](#supported-features-and-limitations "Direct link to Supported Features and Limitations")

Supported deck.gl features:

* Layers
* Effects
* Attribute transitions
* Auto-highlighting
* `onHover` and `onClick` callbacks

Not supported features:

* Multiple views
* Controller
* React integration

### Antialiasing[​](#antialiasing "Direct link to Antialiasing")

deck.gl renders into an auxiliary framebuffer here and composites the result into the ArcGIS scene. That framebuffer is not multisampled, so layers whose edges depend on MSAA — including [PathLayer](https://deck.gl/docs/api-reference/layers/path-layer.md), [LineLayer](https://deck.gl/docs/api-reference/layers/line-layer.md), [ArcLayer](https://deck.gl/docs/api-reference/layers/arc-layer.md), and [PointCloudLayer](https://deck.gl/docs/api-reference/layers/point-cloud-layer.md) — render with hard, aliased edges regardless of how the ArcGIS API created its context.

Set `antialiasing: true` on those layers to have them compute edge coverage in the shader instead. On composite layers the prop is named `lineAntialiasing` ([GeoJsonLayer](https://deck.gl/docs/api-reference/layers/geojson-layer.md#lineantialiasing), [PolygonLayer](https://deck.gl/docs/api-reference/layers/polygon-layer.md#lineantialiasing)).
