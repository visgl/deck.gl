# Tile3DLayer (Experimental)

The `Tile3DLayer` renders 3d tiles data formatted according to the [3D Tiles Specification](https://www.opengeospatial.org/standards/3DTiles) and [`ESRI I3S`](https://github.com/Esri/i3s-spec) ,
which is supported by the [Tiles3DLoader](https://loaders.gl/modules/3d-tiles/docs/api-reference/tiles-3d-loader).

Tile3DLayer is a [CompositeLayer](/docs/api-reference/composite-layer.md). Base on each tile type, it uses a [PointCloudLayer](/docs/layers/point-cloud-layer.md), a [ScenegraphLayer](/docs/layers/scenegraph-layer.md) or [SimpleMeshLayer](/docs/layers/simple-mesh-layer.md) to render.

References
- [3D Tiles](https://github.com/AnalyticalGraphicsInc/3d-tiles/tree/master/specification).
- [ESRI I3S](https://github.com/Esri/i3s-spec)

**Load a 3D tiles dataset from ION server. [Set up Ion account](https://cesium.com/docs/tutorials/getting-started/#your-first-app);**

```js
import React, {Component} from 'react';
import DeckGL from '@deck.gl/react';
import {CesiumIonLoader} from '@loaders.gl/3d-tiles';
import {Tile3DLayer} from '@deck.gl/geo-layers';

export default class App extends Component {
  render() {
    const layer = new Tile3DLayer({
      id: 'tile-3d-layer',
      // tileset json file url 
      data: 'https://assets.cesium.com/43978/tileset.json',
      loader: CesiumIonLoader,
      // https://cesium.com/docs/rest-api/
      loadOptions: {
        'cesium-ion': {accessToken: '<ion_access_token_for_your_asset>'}
      },
      onTilesetLoad: (tileset) => {
        // Recenter to cover the tileset
        const {cartographicCenter, zoom} = tileset;
        this.setState({
           viewState: {
             ...this.state.viewState,
             longitude: cartographicCenter[0],
             latitude: cartographicCenter[1],
             zoom
           }
        });
      },
      // override scenegraph subLayer prop
      _subLayerProps: {
        scenegraph: {_lighting: 'flat'}
      }
    });
     
    return (<DeckGL {...viewport} layers={[layer]} />);
  }
}
```

**Load I3S Tiles**
```js
import React, {Component} from 'react';
import DeckGL from '@deck.gl/react';
import {I3SLoader} from '@loaders.gl/i3s';
import {Tile3DLayer} from '@deck.gl/geo-layers';

export default class App extends Component {
  render() {
    const layer = new Tile3DLayer({
      id: 'tile-3d-layer',
      // Tileset entry point: Indexed 3D layer file url 
      data: 'https://tiles.arcgis.com/tiles/z2tnIkrLQ2BRzr6P/arcgis/rest/services/SanFrancisco_Bldgs/SceneServer/layers/0',
      loader: I3SLoader
    });
     
    return (<DeckGL {...viewport} layers={[layer]} />);
  }
}
```

## Installation

To install the dependencies:

```bash
npm install deck.gl
# or
npm install @deck.gl/core @deck.gl/geo-layers
```

```js
import {Tile3DLayer} from '@deck.gl/geo-layers';
new Tile3DLayer({});
```

To use pre-bundled scripts:

```html
<script src="https://unpkg.com/deck.gl@^8.0.0/dist.min.js"></script>
<!-- or -->
<script src="https://unpkg.com/@deck.gl/core@^8.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/layers@^8.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/geo-layers@^8.0.0/dist.min.js"></script>
```

```js
new deck.Tile3DLayer({});
```

## Properties

Inherits from all [Base Layer](/docs/api-reference/layer.md) and [CompositeLayer](/docs/api-reference/composite-layer.md) properties.

Along with other options as below,

### Render Options

##### `opacity` (Number, Optional)

- Default `1.0`

The opacity of the layer. The same as defined in [layer](/docs/api-reference/layer.md).

##### `pointSize` (Number, Optional)

- Default `1.0`

Global radius of all points, in units specified by `sizeUnits` (default pixels).
This value is only applied when [tile format](https://github.com/AnalyticalGraphicsInc/3d-tiles/tree/master/specification#introduction) is `pnts`.

### Data Properties

##### `data` (String)

- A URL to fetch tiles entry point of `3D Tiles` [Tileset JSON](https://github.com/AnalyticalGraphicsInc/3d-tiles/tree/master/specification#tileset-json) file or `Indexed 3D Scene Layer` file [I3S](https://github.com/Esri/i3s-spec).

##### `loader` (Object)

- Default [`Tiles3DLoader`](https://loaders.gl/modules/3d-tiles/docs/api-reference/tile-3d-loader)

A loader which is used to decode the fetched tiles. Available options are [`CesiumIonLoader`,`Tiles3DLoader`](https://loaders.gl/modules/3d-tiles/docs/api-reference/tile-3d-loader), [`I3SLoader`](https://loaders.gl/modules/i3s/docs/api-reference/i3s-loader).

##### `loadOptions` (Object, Optional)

- Default: `{}`

`Tile3DLayer` uses [`load`](https://loaders.gl/modules/core/docs/api-reference/load) provided by `@loaders.gl/core` to load a tileset and then constructs a [`Tileset3D`](https://loaders.gl/modules/3d-tiles/docs/api-reference/tileset-3d) object after fetching the tileset entry file.
`loadOptions` is an experimental nested prop to forward options to the loaders and tileset object, 

- `loadOptions[loader.id]` is used for passing any options available to the `loader`.
- If you need forward options to [`Tileset3D`](https://loaders.gl/modules/tiles/docs/api-reference/tileset-3d#constructor-1), use`loadOptions.tileset`. Among these options, `onTileLoad`, `onTileUnload` and `onTileError` should be passed as layer props.

```js
import {CesiumIonLoader} from '@loaders.gl/3d-tiles';
import {Tile3DLayer} from '@deck.gl/geo-layers';

const layer = new Tile3DLayer({
  id: 'tile-3d-layer',
  // tileset json file url 
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

##### `pickable` (Boolean, Optional)

- Default: false

When [`picking`](/docs/developer-guide/custom-layers/picking.md) is enabled, `info.object` will be a [Tile3DHeader](https://loaders.gl/docs/specifications/category-3d-tiles#tileheader-fields) object.

### Data Accessors

##### `getPointColor` (Function|Array, Optional)

- Default `[0, 0, 0, 255]`
  
  The rgba color at the target, in `r, g, b, [a]`. Each component is in the 0-255 range.
  This value is only applied when [tile format](https://github.com/AnalyticalGraphicsInc/3d-tiles/tree/master/specification#introduction) is `pnts` and no [color properties](https://github.com/AnalyticalGraphicsInc/3d-tiles/blob/master/specification/TileFormats/PointCloud/README.md#point-colors) are defined in point cloud tile file. 

### Callbacks 

##### `onTilesetLoad` (Function, optional)
`onTilesetLoad` is a function that is called when Tileset JSON file is loaded. [Tileset](https://github.com/AnalyticalGraphicsInc/3d-tiles/tree/master/specification#tileset-json) object is passed in the callback.

- Default: `onTilesetLoad: (tileset) => {}`

##### `onTileLoad` (Function, optional)

`onTileLoad` is a function that is called when a tile in the tileset hierarchy is loaded. [Tile3D](https://github.com/uber-web/loaders.gl/blob/master/docs/api-reference/tiles/tile-3d.md) object is passed in the callback.

- Default: `onTileLoad: (tileHeader) => {}`

##### `onTileUnload` (Function, optional)

`onTileUnload` is a function that is called when a tile is unloaded. [Tile3D](https://github.com/uber-web/loaders.gl/blob/master/docs/api-reference/tiles/tileset-3d.md#root--tile3dheader) object is passed in the callback.

- Default: `onTileUnload: (tileHeader) => {}`

##### `onTileError` (Function, optional)

`onTileError` is a function that is called when a tile failed to load.

- Default: `onTileError: (tileHeader, url, message) => {}`
  - `url`: the url of the failed tile.
  - `message`: the error message.

## Sub Layers

The Tile3DLayer renders the following sublayers based on tile [format](https://github.com/AnalyticalGraphicsInc/3d-tiles/tree/master/specification#introduction):

* `scenegraph` - a [ScenegraphLayer](/docs/layers/scenegraph-layer.md) rendering all the tiles with Batched 3D Model format (`b3dm`) or Instanced 3D Model format (`i3dm`).
  - `_lighting` is default to `pbr`.
* `pointcloud` - a [PointCloudLayer](/docs/layers/point-cloud-layer.md) rendering all the tiles with Point Cloud format (`pnts`).
* `mesh` - a [SimpleMeshLayer](/docs/layers/simple-mesh-layer.md) rendering all the tiles ESRI `MeshPyramids` data.

Follow [CompositeLayer](/docs/api-reference/composite-layer.md#_subLayerProp) and example in this layer doc to see how to override sub layer props.

## Source

[modules/geo-layers/src/tile-3d-layer](https://github.com/uber/deck.gl/tree/master/modules/geo-layers/src/tile-3d-layer)
