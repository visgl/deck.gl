# Using with 3D Tiles

deck.gl has excellent support for visualizing [3D Tiles](https://www.ogc.org/standard/3dtiles/) tilesets, such as photogrammetric city models from Google Maps or Cesium ion. This guide explains how to set up an application with [Tile3DLayer](https://deck.gl/next/docs/api-reference/geo-layers/tile-3d-layer.md), use the [TerrainController](https://deck.gl/next/docs/api-reference/core/terrain-controller.md) for terrain-aware navigation, and overlay your own data layers on top of the 3D surface.

## Basic Setup[​](#basic-setup "Direct link to Basic Setup")

The minimal setup involves a `Tile3DLayer` to load the 3D tileset and a `TerrainController` for camera interaction that follows the terrain:

<!-- -->

* TypeScript
* React

```
import {Deck, MapView, TerrainController} from '@deck.gl/core';

import {Tile3DLayer} from '@deck.gl/geo-layers';



const deckgl = new Deck({

  views: new MapView({minimumElevation: -500}),

  initialViewState: {

    latitude: 50.089,

    longitude: 14.42,

    zoom: 16,

    pitch: 60,

    bearing: 90

  },

  controller: {type: TerrainController},

  layers: [

    new Tile3DLayer({

      id: 'google-3d-tiles',

      data: 'https://tile.googleapis.com/v1/3dtiles/root.json',

      loadOptions: {

        fetch: {headers: {'X-GOOG-API-KEY': YOUR_API_KEY}}

      },

      pickable: '3d',

      operation: 'terrain+draw'

    })

  ]

});
```

```
import {DeckGL} from '@deck.gl/react';

import {TerrainController} from '@deck.gl/core';

import {Tile3DLayer} from '@deck.gl/geo-layers';



function App() {

  const layers = [

    new Tile3DLayer({

      id: 'google-3d-tiles',

      data: 'https://tile.googleapis.com/v1/3dtiles/root.json',

      loadOptions: {

        fetch: {headers: {'X-GOOG-API-KEY': YOUR_API_KEY}}

      },

      pickable: '3d',

      operation: 'terrain+draw'

    })

  ];



  return (

    <DeckGL

      initialViewState={{

        latitude: 50.089,

        longitude: 14.42,

        zoom: 16,

        pitch: 60,

        bearing: 90

      }}

      controller={{type: TerrainController}}

      layers={layers}

    />

  );

}
```

There are two key props to note:

* **`pickable: '3d'`** - This enables depth picking on the tileset, which is required for the `TerrainController` to determine the terrain elevation under the camera and pointer.
* **`operation: 'terrain+draw'`** - This tells deck.gl to both render the tiles visually *and* use them as a terrain surface that other layers can be draped on to.

## TerrainController[​](#terraincontroller "Direct link to TerrainController")

The [TerrainController](https://deck.gl/next/docs/api-reference/core/terrain-controller.md) extends `MapController` with terrain-aware navigation. As the user pans and zooms, the camera's elevation automatically adjusts to follow the terrain surface. It also defaults to `rotationPivot: '3d'`, which means the camera rotates around the 3D point under the pointer rather than the map center - providing natural interaction with elevated terrain.

The controller works by picking the terrain elevation at the center of the viewport. For this to work, the layer used as the elevation data source (e.g. `Tile3DLayer`) must be marked with `pickable: '3d'`. Without a `pickable: '3d'` layer in the scene, the controller has no elevation data and will behave like a standard `MapController`.

Without `TerrainController`, the camera will orbit around the sea-level plane, which can cause it to clip through the terrain.

## Below-ellipsoid terrain and clipping[​](#below-ellipsoid-terrain-and-clipping "Direct link to Below-ellipsoid terrain and clipping")

3D Tiles heights are measured from the WGS84 ellipsoid and can be negative, for example along coasts. When the camera looks straight down at high zoom, terrain below elevation 0 can disappear while a slightly tilted camera still shows it. Set `minimumElevation` on the `MapView` to the lowest height in your data, as the example above does with -500 m. A deeper value than needed reduces depth precision.

![Top-down synthetic scene. The cyan surface at −300 m is clipped with the default 0 m floor and visible with a −500 m floor.](data:image/png;base64,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)

With an interleaved Mapbox or MapLibre overlay, the base map controls clipping, so configure its camera instead.

## Integrating Layers with the Terrain[​](#integrating-layers-with-the-terrain "Direct link to Integrating Layers with the Terrain")

A common use case is overlaying your own 2D data on top of the 3D surface. The [TerrainExtension](https://deck.gl/next/docs/api-reference/extensions/terrain-extension.md) re-projects 2D layers onto the terrain on the GPU.

To drape a layer:

1. Set `operation: 'terrain+draw'` on the `Tile3DLayer` (so it acts as both a visual layer and a terrain source)
2. Add `TerrainExtension` to the `extensions` prop of any layer that should follow the terrain

```
import {GeoJsonLayer} from '@deck.gl/layers';

import {_TerrainExtension as TerrainExtension} from '@deck.gl/extensions';



const layers = [

  // Terrain source

  new Tile3DLayer({

    id: 'google-3d-tiles',

    data: 'https://tile.googleapis.com/v1/3dtiles/root.json',

    loadOptions: {

      fetch: {headers: {'X-GOOG-API-KEY': YOUR_API_KEY}}

    },

    pickable: '3d',

    operation: 'terrain+draw'

  }),



  // Draped layer

  new GeoJsonLayer({

    id: 'buildings',

    data: BUILDINGS_GEOJSON_URL,

    stroked: false,

    filled: true,

    getFillColor: [0, 160, 180, 200],

    extensions: [new TerrainExtension()]

  })

];
```

The `TerrainExtension` supports two draw modes via the `terrainDrawMode` prop:

* **`'drape'`** - Overlays the layer as a texture onto the terrain surface. Altitude and extrusion are ignored. Best for flat data like polygons and paths.
* **`'offset'`** - Translates each object vertically by the terrain elevation at its anchor point. Best for 3D objects like icons and scatterplots.

The draw mode is automatically determined from the layer type if not specified.

## Overlaid Layers (non-draped)[​](#overlaid-layers-non-draped "Direct link to Overlaid Layers (non-draped)")

Not all layers need to conform to the terrain. Layers without the `TerrainExtension` will render in their own coordinate space as usual. This is useful for UI-like layers (e.g. text labels at fixed altitudes) or data that has its own elevation values.

## Load Options[​](#load-options "Direct link to Load Options")

For large tilesets, tuning the load options can significantly affect performance and visual quality:

```
new Tile3DLayer({

  // ...

  loadOptions: {

    fetch: {headers: {'X-GOOG-API-KEY': YOUR_API_KEY}},

    tileset: {

      maximumScreenSpaceError: 20,

      maximumMemoryUsage: 512,

      memoryAdjustedScreenSpaceError: true

    }

  }

})
```

* **`maximumScreenSpaceError`** - Controls level of detail. Lower values load more detail (at the cost of more tiles).
* **`maximumMemoryUsage`** - Limits GPU memory consumption in MB.
* **`memoryAdjustedScreenSpaceError`** - Dynamically adjusts LOD when approaching the memory limit.

## Displaying Credits[​](#displaying-credits "Direct link to Displaying Credits")

Many 3D tile providers (including Google) require that copyright information embedded in the tiles is displayed to the user. The `onTraversalComplete` callback on the `Tile3DLayer` load options can be used to extract this information from the currently visible tiles:

```
const [credits, setCredits] = useState('');



const onTraversalComplete = (selectedTiles) => {

  const uniqueCredits = new Set();

  selectedTiles.forEach(tile => {

    const {copyright} = tile.content.gltf.asset;

    copyright.split(';').forEach(uniqueCredits.add, uniqueCredits);

  });

  setCredits([...uniqueCredits].join('; '));

  return selectedTiles;

};



new Tile3DLayer({

  // ...

  loadOptions: {

    tileset: {onTraversalComplete}

  }

})
```

The credits string updates as the user navigates and new tiles become visible. Render it in a corner of the viewport to comply with the provider's attribution requirements.

## Examples[​](#examples "Direct link to Examples")

* [Google 3D Tiles](https://deck.gl/examples/google-3d-tiles) - Photogrammetric city model with draped GeoJSON buildings
