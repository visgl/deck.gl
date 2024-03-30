# TerrainLayer

import {TerrainLayerDemo} from '@site/src/doc-demos/geo-layers';

<TerrainLayerDemo />

The `TerrainLayer` reconstructs mesh surfaces from height map images, e.g. [Mapzen Terrain Tiles](https://github.com/tilezen/joerd/blob/master/docs/formats.md), which encodes elevation into R,G,B values.

When `elevationData` is supplied with a URL template, i.e. a string containing `'{x}'` and `'{y}'`, it loads terrain tiles on demand using a `TileLayer` and renders a mesh for each tile. If `elevationData` is an absolute URL, a single mesh is used, and the `bounds` prop is required to position it into the world space.


import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs groupId="language">
  <TabItem value="js" label="JavaScript">

```js
import {Deck} from '@deck.gl/core';
import {TerrainLayer} from '@deck.gl/geo-layers';

const layer = new TerrainLayer({
  elevationDecoder: {
    rScaler: 2,
    gScaler: 0,
    bScaler: 0,
    offset: 0
  },
  // Digital elevation model from https://www.usgs.gov/
  elevationData: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/terrain.png',
  texture: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/terrain-mask.png',
  bounds: [-122.5233, 37.6493, -122.3566, 37.8159],
});

new Deck({
  initialViewState: {
    longitude: -122.4,
    latitude: 37.74,
    zoom: 11
  },
  controller: true,
  layers: [layer]
});
```

  </TabItem>
  <TabItem value="ts" label="TypeScript">

```ts
import {Deck} from '@deck.gl/core';
import {TerrainLayer} from '@deck.gl/geo-layers';

const layer = new TerrainLayer({
  elevationDecoder: {
    rScaler: 2,
    gScaler: 0,
    bScaler: 0,
    offset: 0
  },
  // Digital elevation model from https://www.usgs.gov/
  elevationData: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/terrain.png',
  texture: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/terrain-mask.png',
  bounds: [-122.5233, 37.6493, -122.3566, 37.8159],
});

new Deck({
  initialViewState: {
    longitude: -122.4,
    latitude: 37.74,
    zoom: 11
  },
  controller: true,
  layers: [layer]
});
```

  </TabItem>
  <TabItem value="react" label="React">

```tsx
import React from 'react';
import DeckGL from '@deck.gl/react';
import {TerrainLayer} from '@deck.gl/geo-layers';

function App() {
  const layer = new TerrainLayer({
    elevationDecoder: {
      rScaler: 2,
      gScaler: 0,
      bScaler: 0,
      offset: 0
    },
    // Digital elevation model from https://www.usgs.gov/
    elevationData: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/terrain.png',
    texture: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/terrain-mask.png',
    bounds: [-122.5233, 37.6493, -122.3566, 37.8159],
  });

  return <DeckGL
    initialViewState={{
      longitude: -122.4,
      latitude: 37.74,
      zoom: 11
    }}
    controller
    layers={[layer]}
  />;
}
```

  </TabItem>
</Tabs>


## Installation

To install the dependencies from NPM:

```bash
npm install deck.gl
# or
npm install @deck.gl/core @deck.gl/mesh-layers @deck.gl/geo-layers
```

```ts
import {TerrainLayer} from '@deck.gl/geo-layers';
import type {TerrainLayerProps} from '@deck.gl/geo-layers';

new TerrainLayer(...props: TerrainLayerProps[]);
```

To use pre-bundled scripts:

```html
<script src="https://unpkg.com/deck.gl@^9.0.0/dist.min.js"></script>
<!-- or -->
<script src="https://unpkg.com/@deck.gl/core@^9.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/mesh-layers@^9.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/geo-layers@^9.0.0/dist.min.js"></script>
```

```js
new deck.TerrainLayer({});
```

## Properties

When in Tiled Mode, inherits from all [TileLayer](./tile-layer.md) properties. Forwards `wireframe` property to [SimpleMeshLayer](../mesh-layers/simple-mesh-layer.md).



### Data Options

##### `elevationData` (string | string[], required) {#elevationdata}

Image URL that encodes height data.

- If the value is a valid URL, this layer will render a single mesh.
- If the value is a string, and contains substrings `{x}` and `{y}`, it is considered a URL template. This layer will render a `TileLayer` of meshes. `{x}` `{y}` and `{z}` will be replaced with a tile's actual index when it is requested.
- If the value is an array: multiple URL templates. See `TileLayer`'s `data` prop documentation for use cases.


##### `texture` (string | null, optional) {#texture}

Image URL to use as the surface texture. Same schema as `elevationData`.

- Default: `null`


##### `meshMaxError` (number, optional) {#meshmaxerror}

Martini error tolerance in meters, smaller number results in more detailed mesh..

- Default: `4.0`

##### `elevationDecoder` (object, optional) {#elevationdecoder}

Parameters used to convert a pixel to elevation in meters.
An object containing the following fields:

- `rScaler`: Multiplier of the red channel.
- `gScaler`: Multiplier of the green channel.
- `bScaler`: Multiplier of the blue channel.
- `offset`: Translation of the sum.

Each color channel (r, g, and b) is a number between `[0, 255]`.

For example, the Mapbox terrain service's elevation is [encoded as follows](https://docs.mapbox.com/help/troubleshooting/access-elevation-data/#decode-data):

```
height = -10000 + ((R * 256 * 256 + G * 256 + B) * 0.1)
```

The corresponding `elevationDecoder` is:

```ts
{
  "rScaler": 6553.6,
  "gScaler": 25.6,
  "bScaler": 0.1,
  "offset": -10000
}
```

The default value of `elevationDecoder` decodes a grayscale image:

```ts
{
  "rScaler": 1,
  "gScaler": 0,
  "bScaler": 0,
  "offset": 0
}
```


##### `bounds` (number[4], optional) {#bounds}

Bounds of the image to fit x,y coordinates into. In `[left, bottom, right, top]`.
`left` and `right` refers to the world longitude/x at the corresponding side of the image.
`top` and `bottom` refers to the world latitude/y at the corresponding side of the image.

Must be supplied when using non-tiled elevation data.

- Default: `null`


##### `loadOptions` (object, optional) {#loadoptions}

On top of the [default options](../core/layer.md#loadoptions), also accepts options for the following loaders:

- [TerrainLoader](https://loaders.gl/modules/terrain/docs/api-reference/terrain-loader)
- [ImageLoader](https://loaders.gl/modules/images/docs/api-reference/image-loader) if the `texture` prop is supplied

Note that by default, the `TerrainLoader` parses data using web workers, with code loaded from a [CDN](https://unpkg.com). To change this behavior, see [loaders and workers](../../developer-guide/loading-data.md#loaders-and-web-workers).


### Render Options

##### `color` (Color, optional) {#color}

Color to use if `texture` is unavailable. Forwarded to `SimpleMeshLayer`'s `getColor` prop.

- Default: `[255, 255, 255]`

##### `wireframe` (boolean, optional) {#wireframe}

Forwarded to `SimpleMeshLayer`'s `wireframe` prop.

- Default: `false`

##### `material` (Material, optional) {#material}

Forwarded to `SimpleMeshLayer`'s `material` prop.

- Default: `true`


## Sub Layers

The `TerrainLayer` renders the following sublayers:

* `tiles` - a [TileLayer](./tile-layer.md). Only rendered if `elevationData` is a URL template.
* `mesh` - a [SimpleMeshLayer](../mesh-layers/simple-mesh-layer.md) rendering the terrain mesh.



# Source

[modules/geo-layers/src/terrain-layer](https://github.com/visgl/deck.gl/tree/master/modules/geo-layers/src/terrain-layer)
