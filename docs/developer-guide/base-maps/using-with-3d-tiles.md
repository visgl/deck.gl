# Using with 3D Tiles

deck.gl has excellent support for visualizing [3D Tiles](https://www.ogc.org/standard/3dtiles/) tilesets, such as photogrammetric city models from Google Maps or Cesium ion. This guide explains how to set up an application with [Tile3DLayer](../../api-reference/geo-layers/tile-3d-layer.md), use the [TerrainController](../../api-reference/core/terrain-controller.md) for terrain-aware navigation, and overlay your own data layers on top of the 3D surface.

## Basic Setup

The minimal setup involves a `Tile3DLayer` to load the 3D tileset and a `TerrainController` for camera interaction that follows the terrain:

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs groupId="language">
  <TabItem value="ts" label="TypeScript">

```ts
import {Deck, TerrainController} from '@deck.gl/core';
import {Tile3DLayer} from '@deck.gl/geo-layers';

const deckgl = new Deck({
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

  </TabItem>
  <TabItem value="react" label="React">

```tsx
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

  </TabItem>
</Tabs>

There are two key props to note:

- **`pickable: '3d'`** - This enables depth picking on the tileset, which is required for the `TerrainController` to determine the terrain elevation under the camera and pointer.
- **`operation: 'terrain+draw'`** - This tells deck.gl to both render the tiles visually _and_ use them as a terrain surface that other layers can be draped on to.

## TerrainController

The [TerrainController](../../api-reference/core/terrain-controller.md) extends `MapController` with terrain-aware navigation. As the user pans and zooms, the camera's elevation automatically adjusts to follow the terrain surface. It also defaults to `rotationPivot: '3d'`, which means the camera rotates around the 3D point under the pointer rather than the map center - providing natural interaction with elevated terrain.

The controller works by picking the terrain elevation at the center of the viewport. For this to work, the layer used as the elevation data source (e.g. `Tile3DLayer`) must be marked with `pickable: '3d'`. Without a `pickable: '3d'` layer in the scene, the controller has no elevation data and will behave like a standard `MapController`.

Without `TerrainController`, the camera will orbit around the sea-level plane, which can cause it to clip through the terrain.

## Integrating Layers with the Terrain

A common use case is overlaying your own 2D data on top of the 3D surface. The [TerrainExtension](../../api-reference/extensions/terrain-extension.md) re-projects 2D layers onto the terrain on the GPU.

To drape a layer:

1. Set `operation: 'terrain+draw'` on the `Tile3DLayer` (so it acts as both a visual layer and a terrain source)
2. Add `TerrainExtension` to the `extensions` prop of any layer that should follow the terrain

```ts
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

- **`'drape'`** - Overlays the layer as a texture onto the terrain surface. Altitude and extrusion are ignored. Best for flat data like polygons and paths.
- **`'offset'`** - Translates each object vertically by the terrain elevation at its anchor point. Best for 3D objects like icons and scatterplots.

The draw mode is automatically determined from the layer type if not specified.

## Overlaid Layers (non-draped)

Not all layers need to conform to the terrain. Layers without the `TerrainExtension` will render in their own coordinate space as usual. This is useful for UI-like layers (e.g. text labels at fixed altitudes) or data that has its own elevation values.

## Load Options

For large tilesets, tuning the load options can significantly affect performance and visual quality:

```ts
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

- **`maximumScreenSpaceError`** - Controls level of detail. Lower values load more detail (at the cost of more tiles).
- **`maximumMemoryUsage`** - Limits GPU memory consumption in MB.
- **`memoryAdjustedScreenSpaceError`** - Dynamically adjusts LOD when approaching the memory limit.

## Displaying Credits

Many 3D tile providers (including Google) require that copyright information embedded in the tiles is displayed to the user. The `onTraversalComplete` callback on the `Tile3DLayer` load options can be used to extract this information from the currently visible tiles:

```ts
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

## Examples

- [Google 3D Tiles](https://deck.gl/examples/google-3d-tiles) - Photogrammetric city model with draped GeoJSON buildings
