<!-- INJECT:"TerrainLayerDemo" -->

<p class="badges">
  <img src="https://img.shields.io/badge/@deck.gl/geo--layers-lightgrey.svg?style=flat-square" alt="@deck.gl/geo-layers" />
  <img src="https://img.shields.io/badge/lighting-yes-blue.svg?style=flat-square" alt="lighting" />
</p>

# TerrainLayer

The `TerrainLayer` reconstructs mesh surfaces from height map images, e.g. [Mapzen Terrain Tiles](https://github.com/tilezen/joerd/blob/master/docs/formats.md), which encodes elevation into R,G,B values.

When `elevationData` is supplied with a URL template, i.e. a string containing `'{x}'` and `'{y}'`, it loads terrain tiles on demand using a `TileLayer` and renders a mesh for each tile. If `elevationData` is an absolute URL, a single mesh is used, and the `bounds` prop is required to position it into the world space.

```js
import DeckGL from '@deck.gl/react';
import {TerrainLayer} from '@deck.gl/geo-layers';

export const App = ({viewport}) => {

  const layer = new TerrainLayer({
    elevationDecoder: {
      rScaler: 2,
      gScaler: 0,
      bScaler: 0,
      offset: 0
    },
    // Digital elevation model from https://www.usgs.gov/
    elevationData: 'https://raw.githubusercontent.com/uber-common/deck.gl-data/master/website/terrain.png',
    texture: 'https://raw.githubusercontent.com/uber-common/deck.gl-data/master/website/terrain-mask.png',
    bounds: [-122.5233, 37.6493, -122.3566, 37.8159],
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

##### `elevationData` (String|Array, required)

Image URL that encodes height data.

- If the value is a valid URL, this layer will render a single mesh.
- If the value is a string, and contains substrings `{x}` and `{y}`, it is considered a URL template. This layer will render a `TileLayer` of meshes. `{x}` `{y}` and `{z}` will be replaced with a tile's actual index when it is requested.
- If the value is an array: multiple URL templates. See `TileLayer`'s `data` prop documentation for use cases.


##### `texture` (String|Null, optional)

Image URL to use as the surface texture. Same schema as `elevationData`.

- Default: `null`


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

Bounds of the image to fit x,y coordinates into. In `[left, bottom, right, top]`. 
`left` and `right` refers to the world longitude/x at the corresponding side of the image.
`top` and `bottom` refers to the world latitude/y at the corresponding side of the image.

Must be supplied when using non-tiled elevation data.

- Default: `null`


##### `workerUrl` (String, optional)

**Advanced** Supply url to local terrain worker bundle. By default, it points to the latest published `@loaders.gl/terrain` NPM module on [unpkg.com](unpkg.com). Custom `workerUrl` may be desirable if the application wishes to serve the worker code itself without relying on the CDN. The worker bundle can be located locally in `"node_modules/@loaders.gl/terrain/dist/terrain-loader.worker.js"`.

Set `workerUrl` to an empty string to disable worker during debugging (improves error messages).

- Default: `null`

### Render Options

##### `color` (Color, optional)

Color to use if `texture` is unavailable. Forwarded to `SimpleMeshLayer`'s `getColor` prop.

- Default: `[255, 255, 255]`

##### `wireframe` (Boolean, optional)

Forwarded to `SimpleMeshLayer`'s `wireframe` prop.

- Default: `false`

##### `material` (Object, optional)

Forwarded to `SimpleMeshLayer`'s `material` prop.

- Default: `true`


## Sub Layers

The `TerrainLayer` renders the following sublayers:

* `tiles` - a [TileLayer](/docs/layers/tile-layer.md). Only rendered if `elevationData` is a URL template.
* `mesh` - a [SimpleMeshLayer](/docs/layers/simple-mesh-layer.md) rendering the terrain mesh.



# Source

[modules/geo-layers/src/terrain-layer](https://github.com/uber/deck.gl/tree/master/modules/geo-layers/src/terrain-layer)
