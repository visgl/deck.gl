<!-- INJECT:"TerrainLayerDemo" -->

<p class="badges">
  <img src="https://img.shields.io/badge/@deck.gl/geo--layers-lightgrey.svg?style=flat-square" alt="@deck.gl/geo-layers" />
  <img src="https://img.shields.io/badge/lighting-yes-blue.svg?style=flat-square" alt="lighting" />
</p>

# TerrainLayer

This TerrainLayer reconstructs mesh surfaces from height map images, e.g. [Mapzen Terrain Tiles](https://github.com/tilezen/joerd/blob/master/docs/formats.md), which encodes elevation into R,G,B values.

When `terrainImage` is supplied with a templated tile server URL, e.g. URL containing "{x}", it renders terrain tiles globally using the TileLayer and SimpleMeshLayer. Otherwise, supply an absolute URL to `terrainImage` and a `bounds` prop to render a any terrain image (e.g. non-Slippy map tiles) with a SimpleMeshLayer.

```js
import DeckGL from '@deck.gl/react';
import {TerrainLayer} from '@deck.gl/geo-layers';

export const App = ({viewport}) => {

  const layer = new TerrainLayer({
    minZoom: 0,
    maxZoom: 23,
    strategy: 'no-overlap',
    elevationDecoder: {
      rScaler: 256,
      gScaler: 1,
      bScaler: 1/256,
      offset: -32768
    },
    terrainImage: 'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png',
    surfaceImage: 'https://wms.chartbundle.com/tms/1.0.0/sec/{z}/{x}/{y}.png?origin=nw'
  });
  return <DeckGL {...viewport} layers={[layer]} />;
};
```

## Installation

To install the dependencies from NPM:

```bash
npm install deck.gl
# or
npm install @deck.gl/core @deck.gl/layers @deck.gl/geo-layers
```

```js
import {TerrainLayer} from '@deck.gl/geo-layers';
new TerrainLayer({});
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
new deck.TerrainLayer({});
```

## Properties

When in Tiled Mode, inherits from all [TileLayer](/docs/api-reference/tile-layer.md) properties. Forwards `wireframe` property to [SimpleMeshLayer](/docs/api-reference/simple-mesh-layer.md).



### Data Options

##### `terrainImage` (String)

Image url that encodes height data.

- Default: `null`

Depending on the `terrainImage` string, this layer renders as a tiled layer composed of a TileLayer of SimpleMeshLayers, or as a single mesh rendered as a SimpleMeshLayer.

* Tiled `terrainImage`: https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png

* Non-Tiled `terrainImage`: https://s3.amazonaws.com/elevation-tiles-prod/terrarium/1/1/0.png

##### `surfaceImage` (String|Null, optional)

Image url to use as surface texture. Same URL parsing as `terrainImage`.

- Default: `0`

### Mesh Options

##### `meshMaxError` (Number, optional)

Martini error tolerance in meters, smaller number results in more detailed mesh..

- Default: `4.0`

##### `elevationDecoder` (Object)

Parameters used to convert a pixel to elevation in meters.
An object containing the following fields:

- `rScale`: Multiplier of the red channel.
- `gScale`: Multiplier of the green channel.
- `bScale`: Multiplier of the blue channel.
- `offset`: Translation of the sum.

Each color channel (r, g, and b) is a number between `[0, 255]`.

For example, the Mapbox terrain service's elevation is [encoded as follows](https://docs.mapbox.com/help/troubleshooting/access-elevation-data/#decode-data):

```
height = -10000 + ((R * 256 * 256 + G * 256 + B) * 0.1)
```

The corresponding `elevationDecoder` is:

```
{
  "rScale": 6553.6,
  "gScale": 25.6,
  "bScale": 0.1,
  "offset": -10000
}
```

The default value of `elevationDecoder` decodes a grayscale image:

```
{
  "rScale": 1,
  "gScale": 0,
  "bScale": 0,
  "offset": 0
}
```


##### `bounds` (Array, optional)

Bounds of the image to fit x,y coordinates into. In [minX, minY, maxX, maxY] world coordinates. Must be supplied when using as a Non-Tiled terrain, otherwise optional.

- Default: `null`

The pixel coordinates start from the top left corner.

##### `workerUrl` (String, optional)

**Advanced** Supply url to local terrain worker bundle. Custom `workerUrl` may be desirable if the application wishes to serve the worker code itself without relying on `unpkg.com`. The worker bundle can be located in `"node_modules/@loaders.gl/terrain/dist/terrain-loader.worker.js"`.

Set `workerUrl` to empty string to disable worker (improves error messages).

- Default: `null`

### Render Options

##### `color` (Color, optional)

Color to use before `surfaceImage` is loaded or if `surfaceImage` is unavailable. Equivalent to setting SimpleMeshLayer `getColor` prop to `d => prop.color`.

- Default: `[255, 255, 255]`

##### `wireframe` (Boolean, optional)

Forwarded to SimpleMeshLayer `wireframe` prop.

- Default: `false`

# Source

[modules/geo-layers/src/terrain-layer](https://github.com/uber/deck.gl/tree/master/modules/geo-layers/src/terrain-layer)
