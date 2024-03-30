# Tile3DLayer

The `Tile3DLayer` renders 3d tiles data formatted according to the [3D Tiles Specification](https://www.opengeospatial.org/standards/3DTiles) and [ESRI I3S](https://github.com/Esri/i3s-spec), supported by the [Tiles3DLoader](https://loaders.gl/modules/3d-tiles/docs/api-reference/tiles-3d-loader).

Tile3DLayer is a [CompositeLayer](../core/composite-layer.md). Base on each tile type, it uses a [PointCloudLayer](../layers/point-cloud-layer.md), a [ScenegraphLayer](../mesh-layers/scenegraph-layer.md) or [SimpleMeshLayer](../mesh-layers/simple-mesh-layer.md) to render the geometries.

References
- [3D Tiles](https://github.com/AnalyticalGraphicsInc/3d-tiles/tree/master/specification)
- [ESRI I3S](https://github.com/Esri/i3s-spec)

## Example

### Load 3D Tiles from Cesium ION


import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs groupId="language">
  <TabItem value="js" label="JavaScript">

```js
import {Deck} from '@deck.gl/core';
import {Tile3DLayer} from '@deck.gl/geo-layers';
import {CesiumIonLoader} from '@loaders.gl/3d-tiles';

const layer = new Tile3DLayer({
  id: 'tile-3d-layer',
  // Tileset json file url
  data: 'https://assets.cesium.com/43978/tileset.json',
  loader: CesiumIonLoader,
  loadOptions: {
    // Set up Ion account: https://cesium.com/docs/tutorials/getting-started/#your-first-app
    'cesium-ion': {accessToken: '<ion_access_token_for_your_asset>'}
  },
  onTilesetLoad: tileset => {
    // Recenter to cover the tileset
    const {cartographicCenter, zoom} = tileset;
    deckInstance.setProps({
      initialViewState: {
        longitude: cartographicCenter[0],
        latitude: cartographicCenter[1],
        zoom
      }
    });
  },
  pointSize: 2
});

const deckInstance = new Deck({
  initialViewState: {
    longitude: 10,
    latitude: 50,
    zoom: 2
  },
  controller: true,
  layers: [layer]
});
```

  </TabItem>
  <TabItem value="ts" label="TypeScript">

```ts
import {Deck} from '@deck.gl/core';
import {Tile3DLayer} from '@deck.gl/geo-layers';
import {CesiumIonLoader} from '@loaders.gl/3d-tiles';
import type {Tileset3D} from '@loaders.gl/tiles';

const layer = new Tile3DLayer({
  id: 'tile-3d-layer',
  // Tileset json file url
  data: 'https://assets.cesium.com/43978/tileset.json',
  loader: CesiumIonLoader,
  loadOptions: {
    // Set up Ion account: https://cesium.com/docs/tutorials/getting-started/#your-first-app
    'cesium-ion': {accessToken: '<ion_access_token_for_your_asset>'}
  },
  onTilesetLoad: (tileset: Tileset3D) => {
    // Recenter to cover the tileset
    const {cartographicCenter, zoom} = tileset;
    deckInstance.setProps({
      initialViewState: {
        longitude: cartographicCenter[0],
        latitude: cartographicCenter[1],
        zoom
      }
    });
  },
  pointSize: 2
});

const deckInstance = new Deck({
  initialViewState: {
    longitude: 10,
    latitude: 50,
    zoom: 2
  },
  controller: true,
  layers: [layer]
});
```

  </TabItem>
  <TabItem value="react" label="React">

```tsx
import React, {useState} from 'react';
import DeckGL from '@deck.gl/react';
import {Tile3DLayer} from '@deck.gl/geo-layers';
import {CesiumIonLoader} from '@loaders.gl/3d-tiles';
import type {MapViewState} from '@deck.gl/core';
import type {Tileset3D} from '@loaders.gl/tiles';

function App() {
  const [initialViewState, setInitialViewState] = useState<MapViewState>({
    longitude: 10,
    latitude: 50,
    zoom: 2
  });

  const layer = new Tile3DLayer({
    id: 'tile-3d-layer',
    // Tileset json file url
    data: 'https://assets.cesium.com/43978/tileset.json',
    loader: CesiumIonLoader,
    loadOptions: {
      // Set up Ion account: https://cesium.com/docs/tutorials/getting-started/#your-first-app
      'cesium-ion': {accessToken: '<ion_access_token_for_your_asset>'}
    },
    onTilesetLoad: (tileset: Tileset3D) => {
      // Recenter to cover the tileset
      const {cartographicCenter, zoom} = tileset;
      setInitialViewState({
        longitude: cartographicCenter[0],
        latitude: cartographicCenter[1],
        zoom
      });
    },
    pointSize: 2
  });

  return <DeckGL
    initialViewState={initialViewState}
    controller
    layers={[layer]}
  />;
}
```

  </TabItem>
</Tabs>


### Load I3S Tiles from ArcGIS

```ts
import {Tile3DLayer} from '@deck.gl/geo-layers';
import {I3SLoader} from '@loaders.gl/i3s';

const layer = new Tile3DLayer({
  id: 'tile-3d-layer',
  // Tileset entry point: Indexed 3D layer file url
  data: 'https://tiles.arcgis.com/tiles/z2tnIkrLQ2BRzr6P/arcgis/rest/services/SanFrancisco_Bldgs/SceneServer/layers/0',
  loader: I3SLoader
});
```

### Load 3D Tiles from Google Maps

```ts
import {Tile3DLayer} from '@deck.gl/geo-layers';

const layer = new Tile3DLayer({
  id: 'tile-3d-layer',
  data: 'https://tile.googleapis.com/v1/3dtiles/root.json',
  loadOptions: {
    // https://developers.google.com/maps/documentation/tile/3d-tiles
    fetch: {headers: {'X-GOOG-API-KEY': '<google_maps_api_key>'}}
  }
});
```


## Installation

To install the dependencies:

```bash
npm install deck.gl
# or
npm install @deck.gl/core @deck.gl/layers @deck.gl/mesh-layers @deck.gl/geo-layers
```

```ts
import {Tile3DLayer} from '@deck.gl/geo-layers';
import type {Tile3DLayerProps} from '@deck.gl/geo-layers';

new Tile3DLayer<TileDataT>(...props: Tile3DLayerProps<TileDataT>[]);
```

To use pre-bundled scripts:

```html
<script src="https://unpkg.com/deck.gl@^9.0.0/dist.min.js"></script>
<!-- or -->
<script src="https://unpkg.com/@deck.gl/core@^9.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/layers@^9.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/mesh-layers@^9.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/geo-layers@^9.0.0/dist.min.js"></script>
```

```js
new deck.Tile3DLayer({});
```

## Properties

Inherits from all [Base Layer](../core/layer.md) and [CompositeLayer](../core/composite-layer.md) properties.

Along with other options as below,

### Render Options

##### `opacity` (number, Optional) {#opacity}

- Default `1.0`

The opacity of the layer. The same as defined in [layer](../core/layer.md).

##### `pointSize` (number, Optional) {#pointsize}

- Default `1.0`

Global radius of all points in pixels.
This value is only applied when [tile format](https://github.com/AnalyticalGraphicsInc/3d-tiles/tree/master/specification#introduction) is `pnts`.

### Data Properties

##### `data` (string) {#data}

- A URL to fetch tiles entry point of `3D Tiles` [Tileset JSON](https://github.com/AnalyticalGraphicsInc/3d-tiles/tree/master/specification#tileset-json) file or `Indexed 3D Scene Layer` file [I3S](https://github.com/Esri/i3s-spec).

##### `loader` (object) {#loader}

Default [`Tiles3DLoader`](https://loaders.gl/modules/3d-tiles/docs/api-reference/tiles-3d-loader)

A loader which is used to decode the fetched tiles. Available options are [`CesiumIonLoader`](https://loaders.gl/docs/modules/3d-tiles/api-reference/cesium-ion-loader), [`Tiles3DLoader`](https://loaders.gl/modules/3d-tiles/docs/api-reference/tiles-3d-loader), [`I3SLoader`](https://loaders.gl/modules/i3s/docs/api-reference/i3s-loader).

##### `loadOptions` (object, Optional) {#loadoptions}

On top of the [default options](../core/layer.md#loadoptions), also support the following keys:

- `cesium-ion`: options for the `CesiumIonLoader`
- `3d-tiles`: options for the `Tiles3DLoader`
- `i3s`: options for the `I3SLoader`.
- `tileset`: Forward parameters to the [`Tileset3D`](https://loaders.gl/modules/tiles/docs/api-reference/tileset-3d#constructor-1) instance after fetching the tileset metadata.

```ts
import {CesiumIonLoader} from '@loaders.gl/3d-tiles';
import {Tile3DLayer} from '@deck.gl/geo-layers';

const layer = new Tile3DLayer({
  id: 'tile-3d-layer',
  data: 'https://assets.cesium.com/43978/tileset.json',
  loader: CesiumIonLoader,
  loadOptions: {
    tileset: {
      throttleRequests: false,
    },
    'cesium-ion': {accessToken: '<ion_access_token_for_your_asset>'}
  }
})
```

##### `pickable` (boolean, Optional) {#pickable}

- Default: false

When [`picking`](../../developer-guide/custom-layers/picking.md) is enabled, `info.object` will be a [Tile3DHeader](https://loaders.gl/docs/specifications/category-3d-tiles#tileheader-fields) object.

### Data Accessors

##### `getPointColor` ([Accessor&lt;Color&gt;](../../developer-guide/using-layers.md#accessors), Optional) {#getpointcolor}

- Default `[0, 0, 0, 255]`

The rgba color at the target, in `r, g, b, [a]`. Each component is in the 0-255 range.
This value is only applied when [tile format](https://github.com/AnalyticalGraphicsInc/3d-tiles/tree/master/specification#introduction) is `pnts` and no [color properties](https://github.com/AnalyticalGraphicsInc/3d-tiles/blob/master/specification/TileFormats/PointCloud/README.md#point-colors) are defined in point cloud tile file.

### Callbacks

##### `onTilesetLoad` (Function, optional) {#ontilesetload}
`onTilesetLoad` is a function that is called when Tileset JSON file is loaded. [Tileset](https://github.com/AnalyticalGraphicsInc/3d-tiles/tree/master/specification#tileset-json) object is passed in the callback.

- Default: `onTilesetLoad: (tileset) => {}`

##### `onTileLoad` (Function, optional) {#ontileload}

`onTileLoad` is a function that is called when a tile in the tileset hierarchy is loaded. [Tile3D](https://loaders.gl/modules/3d-tiles/modules/3d-tiles/docs/api-reference/tile-3d) object is passed in the callback.

- Default: `onTileLoad: (tileHeader) => {}`

##### `onTileUnload` (Function, optional) {#ontileunload}

`onTileUnload` is a function that is called when a tile is unloaded. [Tile3D](https://loaders.gl/modules/3d-tiles/modules/3d-tiles/docs/api-reference/tile-3d) object is passed in the callback.

- Default: `onTileUnload: (tileHeader) => {}`

##### `onTileError` (Function, optional) {#ontileerror}

`onTileError` is a function that is called when a tile failed to load.

- Default: `onTileError: (tileHeader, url, message) => {}`
  - `url`: the url of the failed tile.
  - `message`: the error message.

##### `_getMeshColor` (Function, optional) {#_getmeshcolor}
`_getMeshColor` is a function which allows to change color of mesh based on properties of [tileHeader](https://loaders.gl/docs/specifications/category-3d-tiles#tileheader-fields) object.
It recieves `tileHeader` object as argument and return type is array of [r, g, b] values in the 0-255 range.
This value is only applied when tile format is `mesh`.
Can be used only for I3S debugging purposes.

- Default: `_getMeshColor: (tileHeader) => [255, 255, 255]`

## Sub Layers

The Tile3DLayer renders the following sublayers based on tile [format](https://github.com/AnalyticalGraphicsInc/3d-tiles/tree/master/specification#introduction):

* `scenegraph` - a [ScenegraphLayer](../mesh-layers/scenegraph-layer.md) rendering all the tiles with Batched 3D Model format (`b3dm`) or Instanced 3D Model format (`i3dm`).
  - `_lighting` is default to `pbr`.
* `pointcloud` - a [PointCloudLayer](../layers/point-cloud-layer.md) rendering all the tiles with Point Cloud format (`pnts`).
* `mesh` - a [SimpleMeshLayer](../mesh-layers/simple-mesh-layer.md) rendering all the tiles ESRI `MeshPyramids` data.

Follow [CompositeLayer](../core/composite-layer.md#_subLayerProp) and example in this layer doc to see how to override sub layer props.

## Remarks

- The `Tile3DLayer` can be rendered in multiple views. A tile is loaded if it is required by any of the viewports, and shared across all views via a single cache system.

## Source

[modules/geo-layers/src/tile-3d-layer](https://github.com/visgl/deck.gl/tree/master/modules/geo-layers/src/tile-3d-layer)
