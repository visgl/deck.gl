# Tile3DLayer (Experimental)

The `Tile3DLayer` renders tileset data formatted according to the [3D Tiles Category](https://loaders.gl/docs/api-reference/3d-tiles),
which is supported by the [Tileset3DLoader](https://loaders.gl/docs/api-reference/3d-tiles/tileset-3d-loader).

Tile3DLayer is a [CompositeLayer](/docs/api-reference/composite-layer.md). Base on each tile content [format](https://github.com/AnalyticalGraphicsInc/3d-tiles/tree/master/specification#introduction), it uses either a [PointCloudLayer](/docs/layers/point-cloud-layer.md) or [ScenegraphLayer](/docs/layers/scenegraph-layer.md) to render.

References
- [3D Tiles](https://github.com/AnalyticalGraphicsInc/3d-tiles/tree/master/specification).

```js
import React, {Component} from 'react';
import DeckGL from '@deck.gl/react';
import {Tile3DLayer} from '@deck.gl/tile-layers';

export default class App extends Component {

  render() {
    const layer = new Tile3DLayer({
      id: 'tile-3d-layer',
      data: '<path-to-your-tileset json file>',
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

## Installation

To install the dependencies:

```bash
npm install deck.gl
# or
npm install @deck.gl/core @deck.gl/tile-layers
```

```js
import {Tile3DLayer} from '@deck.gl/tile-layers';
new Tile3DLayer({});
```

To use pre-bundled scripts:

```html
<script src="https://unpkg.com/deck.gl@~7.3.0/dist.min.js"></script>
<!-- or -->
<script src="https://unpkg.com/@deck.gl/core@~7.3.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/layers@~7.3.0/dist.min.js"></script>
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

##### `data` (String, optional)

* Default: null

- A URL to fetch tiles entry point [Tileset JSON](https://github.com/AnalyticalGraphicsInc/3d-tiles/tree/master/specification#tileset-json) file or json object of tileset.

##### `_ionAssetId` (Number|String, Optional)
##### `_ionAccessToken` (String, Optional)

- `_ionAssetId` and `_ionAccessToken` are used to fetch ion dataset. They are experimental properties, may change in next releases. 

[Set up Ion account](https://cesium.com/docs/tutorials/getting-started/#your-first-app);

##### `loadOptions` (Object, Optional)

- Default: `{throttleRequests: true}`

Tile3DLayer constructs a [`Tileset3D`](https://loaders.gl/modules/3d-tiles/docs/api-reference/tileset-3d) object after fetching tilset json file. `loadOptions` is an experimental prop to provide Tileset options [Tileset3D options](https://loaders.gl/modules/3d-tiles/docs/api-reference/tileset-3d#options). Among these options, `onTileLoad`, `onTileUnload` and `onTileLoadFail` should be passed as layer props.

```js
const layer = new Tile3DLayer({
  data: '<path-to-your-tileset json file>',
  loadOptions: {
    throttleRequests: false
  }
})
```

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

`onTileLoad` is a function that is called when a tile in the tileset hierarchy is loaded. [Tile3DHeader](https://github.com/uber-web/loaders.gl/blob/master/docs/api-reference/3d-tiles/tileset-3d.md#root--tile3dheader) object is passed in the callback.

- Default: `onTileLoad: (tileHeader) => {}`

##### `onTileUnload` (Function, optional)

`onTileUnload` is a function that is called when a tile is unloaded. [Tile3DHeader](https://github.com/uber-web/loaders.gl/blob/master/docs/api-reference/3d-tiles/tileset-3d.md#root--tile3dheader) object is passed in the callback.

- Default: `onTileUnload: (tileHeader) => {}`

##### `onTileLoadFail` (Function, optional)

`onTileLoadFail` is a function that is called when a tile failed to load.

- Default: `onTileLoadFail: (tileHeader, url, message) => {}`
  - `url`: the url of the failed tile.
  - `message`: the error message.

## Sub Layers

The Tile3DLayer renders the following sublayers based on tile [format](https://github.com/AnalyticalGraphicsInc/3d-tiles/tree/master/specification#introduction):

* `scenegraph` - a [ScenegraphLayer](/docs/layers/scenegraph-layer.md) rendering all the tiles with Batched 3D Model format (`b3dm`) or Instanced 3D Model format (`i3dm`).
  - `_lighting` is default to `pbr`.
* `pointcloud` - a [PointCloudLayer](/docs/layers/point-cloud-layer.md) rendering all the tiles with Point Cloud format (`pnts`).

Follow [CompositeLayer](/docs/layers/composite-layer.md#_subLayerProp) and example in this layer doc to see how to override sub layer props.

## Source

[modules/tile-layers/src/tile-3d-layer](https://github.com/uber/deck.gl/tree/master/modules/geo-layers/src/tile-3d-layer)
