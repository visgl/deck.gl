# Tile3DLayer (Experimental)

The `Tile3DLayer` renders tileset data formatted according to the [3D Tiles Category](docs/specifications/3d-tiles),
which is supported by the [Tileset3DLoader](docs/api-reference/3d-tiles/tileset-3d-loader).

Tile3DLayer is a [CompositeLayer](/docs/api-reference/composite-layer.md). Base on each tile content [format](https://github.com/AnalyticalGraphicsInc/3d-tiles/tree/master/specification#introduction), it uses either a [PointCloudLayer](/docs/api-reference/point-cloud-layer.md) or [ScenegraphLayer](/docs/api-reference/scenegraph-layer.md) to render.

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
      tilesetUrl: '<path-to-your-tileset json file>',
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
      onTileLoad: (tile) => {
        // force update rendering
        this.forceUpdate();
      },
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
<script src="https://unpkg.com/deck.gl@~7.0.0/dist.min.js"></script>
<!-- or -->
<script src="https://unpkg.com/@deck.gl/core@~7.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/layers@~7.0.0/dist.min.js"></script>
```

```js
new deck.Tile3DLayer({});
```

## Properties

Inherits from all [Base Layer](/docs/api-reference/layer.md) and [CompositeLayer](/docs/api-reference/composite-layer.md) properties.

Also based on tile format,
- for Point Cloud (`pnts`) tiles, inherits from all [Point Cloud Layer](/docs/api-reference/point-cloud-layer.md) 
- for Batched 3D Model (`b3dm`) and Instanced 3D Model (`i3dm`) tiles, inherits from all [ScenegraphLayer](/docs/api-reference/scenegraph-layer.md) properties.

Along with other options as below,

##### `tilesetUrl` (String, Optional)

- url to fetch tiles entry point [Tileset JSON](https://github.com/AnalyticalGraphicsInc/3d-tiles/tree/master/specification#tileset-json) file.

##### `ionAssetId` (Number|String, Optional)
##### `ionAccessToken` (String, Optional)

- `ionAssetId` and `ionAccessToken` are used to fetch ion dataset. 

[Set up Ion account](https://cesium.com/docs/tutorials/getting-started/#your-first-app);

### Render Options

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

## Source

[modules/tile-layers/src/tile-3d-layer](https://github.com/uber/deck.gl/tree/master/modules/tile-layers/src/tile-3d-layer)
