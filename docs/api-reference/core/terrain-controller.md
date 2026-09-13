# TerrainController

Inherits from [MapController](./map-controller.md).

The `TerrainController` extends `MapController` with terrain-aware navigation. As the user pans and zooms, the controller automatically adjusts the camera's elevation to follow the terrain, providing a natural navigation experience over 3D tilesets and elevated terrain.

## Requirements

`TerrainController` works by picking the terrain elevation at the center of the viewport. For this to work, at least one layer in the scene must use the `pickable: '3d'` option. For example:

```js
import {Tile3DLayer} from '@deck.gl/geo-layers';

new Tile3DLayer({
  // ...
  pickable: '3d'
});
```

Without a `pickable: '3d'` layer, the controller has no elevation data and will behave like a standard `MapController`.

## Usage

Use with the default view:

```js
import {Deck, TerrainController} from '@deck.gl/core';

new Deck({
  controller: {type: TerrainController},
  initialViewState: viewState
});
```

is equivalent to:

```js
import {Deck, MapView, TerrainController} from '@deck.gl/core';

new Deck({
  views: new MapView({
    controller: {type: TerrainController}
  }),
  initialViewState: viewState
});
```

## Options

Supports all [MapController options](./map-controller.md#options) with the following defaults:

- `rotationPivot` - default `'3d'` (rotate around the picked object under the pointer)

## Source

[modules/core/src/controllers/terrain-controller.ts](https://github.com/visgl/deck.gl/blob/master/modules/core/src/controllers/terrain-controller.ts)
