# SimpleMeshLayer

<!-- -->

Edit on Codepen

The `SimpleMeshLayer` renders a number of instances of an arbitrary 3D geometry. For example, it can be used to visualize a fleet of 3d cars each with a position and an orientation over the map.

<!-- -->

* JavaScript
* TypeScript
* React

```
import {Deck} from '@deck.gl/core';

import {SimpleMeshLayer} from '@deck.gl/mesh-layers';

import {OBJLoader} from '@loaders.gl/obj';



const layer = new SimpleMeshLayer({

  id: 'SimpleMeshLayer',

  data: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/bart-stations.json',

  

  getColor: d => [Math.sqrt(d.exits), 140, 0],

  getOrientation: d => [0, Math.random() * 180, 0],

  getPosition: d => d.coordinates,

  mesh: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/humanoid_quad.obj',

  sizeScale: 30,

  pickable: true,

  loaders: [OBJLoader]

});



new Deck({

  initialViewState: {

    longitude: -122.4,

    latitude: 37.74,

    zoom: 11

  },

  controller: true,

  getTooltip: ({object}) => object && object.name,

  layers: [layer]

});
```

```
import {Deck, PickingInfo} from '@deck.gl/core';

import {SimpleMeshLayer} from '@deck.gl/mesh-layers';

import {OBJLoader} from '@loaders.gl/obj';



type BartStation = {

  name: string;

  entries: number;

  exits: number;

  coordinates: [longitude: number, latitude: number];

};



const layer = new SimpleMeshLayer<BartStation>({

  id: 'SimpleMeshLayer',

  data: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/bart-stations.json',

  

  getColor: (d: BartStation) => [Math.sqrt(d.exits), 140, 0],

  getOrientation: (d: BartStation) => [0, Math.random() * 180, 0],

  getPosition: (d: BartStation) => d.coordinates,

  mesh: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/humanoid_quad.obj',

  sizeScale: 30,

  pickable: true,

  loaders: [OBJLoader]

});



new Deck({

  initialViewState: {

    longitude: -122.4,

    latitude: 37.74,

    zoom: 11

  },

  controller: true,

  getTooltip: ({object}: PickingInfo<BartStation>) => object && object.name,

  layers: [layer]

});
```

```
import React from 'react';

import {DeckGL} from '@deck.gl/react';

import {SimpleMeshLayer} from '@deck.gl/mesh-layers';

import {OBJLoader} from '@loaders.gl/obj';

import type {PickingInfo} from '@deck.gl/core';



type BartStation = {

  name: string;

  entries: number;

  exits: number;

  coordinates: [longitude: number, latitude: number];

};



function App() {

  const layer = new SimpleMeshLayer<BartStation>({

    id: 'SimpleMeshLayer',

    data: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/bart-stations.json',

    

    getColor: (d: BartStation) => [Math.sqrt(d.exits), 140, 0],

    getOrientation: (d: BartStation) => [0, Math.random() * 180, 0],

    getPosition: (d: BartStation) => d.coordinates,

    mesh: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/humanoid_quad.obj',

    sizeScale: 30,

    pickable: true,

    loaders: [OBJLoader]

  });



  return <DeckGL

    initialViewState={{

      longitude: -122.4,

      latitude: 37.74,

      zoom: 11

    }}

    controller

    getTooltip={({object}: PickingInfo<BartStation>) => object && object.name}

    layers={[layer]}

  />;

}
```

`loaders.gl` offers a [category](https://loaders.gl/docs/specifications/category-mesh) of loaders for loading meshes from standard formats. For example, the following code adds support for PLY files:

```
import {SimpleMeshLayer} from '@deck.gl/mesh-layers';

import {PLYLoader} from '@loaders.gl/ply';



new SimpleMeshLayer({

  mesh: 'path/to/model.ply',

  loaders: [PLYLoader]

});
```

## Installation[​](#installation "Direct link to Installation")

To install the dependencies from NPM:

```
npm install deck.gl

# or

npm install @deck.gl/core @deck.gl/mesh-layers
```

```
import {SimpleMeshLayer} from '@deck.gl/mesh-layers';

import type {SimpleMeshLayerProps} from '@deck.gl/mesh-layers';



new SimpleMeshLayer<DataT>(...props: SimpleMeshLayerProps<DataT>[]);
```

To use pre-bundled scripts:

```
<script src="https://unpkg.com/deck.gl@^9.0.0/dist.min.js"></script>

<!-- or -->

<script src="https://unpkg.com/@deck.gl/core@^9.0.0/dist.min.js"></script>

<script src="https://unpkg.com/@deck.gl/mesh-layers@^9.0.0/dist.min.js"></script>
```

```
new deck.SimpleMeshLayer({});
```

## Properties[​](#properties "Direct link to Properties")

Inherits from all [Base Layer](https://deck.gl/next/docs/api-reference/core/layer.md) properties.

### Mesh[​](#mesh "Direct link to Mesh")

#### `mesh` (string | object)[​](#mesh "Direct link to mesh")

The geometry to render for each data object. One of:

* An URL to a mesh description file in a format supported by [loaders.gl](https://loaders.gl/docs/specifications/category-mesh). The appropriate loader will have to be registered via the loaders.gl `registerLoaders` function for this usage.

* A luma.gl [Geometry](https://github.com/visgl/luma.gl/blob/8.5-release/modules/engine/docs/api-reference/geometry.md) instance

* An object containing the following fields:

  <!-- -->

  * `positions` (Float32Array) - 3d vertex offset from the object center, in meters
  * `normals` (Float32Array) - 3d normals
  * `texCoords` (Float32Array) - 2d texture coordinates

#### `texture` (string | Texture | Image | ImageData | HTMLCanvasElement | HTMLVideoElement | ImageBitmap | Promise | object, optional)[​](#texture "Direct link to texture")

* Default `null`.

The texture of the geometries.

* If a string is supplied, it is interpreted as a URL or a [Data URL](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs).

* One of the following, or a Promise that resolves to one of the following:

  <!-- -->

  * One of the valid [pixel sources for WebGL2 texture](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texImage2D)
  * A luma.gl [Texture](https://luma.gl/docs/api-reference/core/resources/texture) instance
  * A plain object that can be passed to the `Texture` constructor, e.g. `{width: <number>, height: <number>, data: <Uint8Array>}`. Note that whenever this object shallowly changes, a new texture will be created.

The image data will be converted to a [Texture](https://luma.gl/docs/api-reference/core/resources/texture) object. See `textureParameters` prop for advanced customization.

If `texture` is supplied, texture is used to render the geometries. Otherwise, object color obtained via the `getColor` accessor is used.

#### `textureParameters` (object)[​](#textureparameters "Direct link to textureparameters")

Customize the [texture parameters](https://luma.gl/docs/api-reference/core/resources/sampler#samplerprops).

If not specified, the layer uses the following defaults to create a linearly smoothed texture from `texture`:

```
{

  minFilter: 'linear',

  magFilter: 'linear',

  mipmapFilter: 'linear',

  addressModeU: 'clamp-to-edge',

  addressModeV: 'clamp-to-edge'

}
```

### Render Options[​](#render-options "Direct link to Render Options")

#### `sizeScale` (number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square%22)[​](#sizescale "Direct link to sizescale")

* Default `1`.

Multiplier to scale each geometry by.

#### `wireframe` (boolean, optional)[​](#wireframe "Direct link to wireframe")

* Default: `false`

Whether to render the mesh in wireframe mode.

#### `material` (Material, optional)[​](#material "Direct link to material")

* Default: `true`

This is an object that contains material props for [lighting effect](https://deck.gl/next/docs/api-reference/core/lighting-effect.md) applied on extruded polygons. Check [the lighting guide](https://deck.gl/next/docs/developer-guide/using-effects.md#material-settings) for configurable settings.

### Data Accessors[​](#data-accessors "Direct link to Data Accessors")

#### `getPosition` ([Accessor\<Position>](https://deck.gl/next/docs/developer-guide/using-layers.md#accessors), optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square%22)[​](#getposition "Direct link to getposition")

* Default: `object => object.position`

Method called to retrieve the center position for each object in the `data` stream.

#### `getColor` ([Accessor\<Color>](https://deck.gl/next/docs/developer-guide/using-layers.md#accessors), optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square%22)[​](#getcolor "Direct link to getcolor")

* Default: `[0, 0, 0, 255]`

If `mesh` does not contain vertex colors, use this color to render each object. If `mesh` contains vertex colors, then the two colors are mixed together. Use `[255, 255, 255]` to use the original mesh colors. If `texture` is assigned, then both colors will be ignored.

The color is in the format of `[r, g, b, [a]]`. Each channel is a number between 0-255 and `a` is 255 if not supplied.

* If an array is provided, it is used as the color for all objects.
* If a function is provided, it is called on each object to retrieve its color.

#### `getOrientation` ([Accessor\<number\[3\]>](https://deck.gl/next/docs/developer-guide/using-layers.md#accessors), optional)[​](#getorientation "Direct link to getorientation")

* Default: `[0, 0, 0]`

Object orientation defined as a vec3 of Euler angles, `[pitch, yaw, roll]` in degrees. This will be composed with layer's [modelMatrix](https://github.com/visgl/deck.gl/blob/master/docs/api-reference/core/layer.md#modelmatrix-number16-optional).

* If an array is provided, it is used as the orientation for all objects.
* If a function is provided, it is called on each object to retrieve its orientation.

#### `getScale` ([Accessor\<number\[3\]>](https://deck.gl/next/docs/developer-guide/using-layers.md#accessors), optional)[​](#getscale "Direct link to getscale")

* Default: `[1, 1, 1]`

Scaling factor on the mesh along each axis.

* If an array is provided, it is used as the scale for all objects.
* If a function is provided, it is called on each object to retrieve its scale.

#### `getTranslation` ([Accessor\<number\[3\]>](https://deck.gl/next/docs/developer-guide/using-layers.md#accessors), optional)[​](#gettranslation "Direct link to gettranslation")

* Default: `[0, 0, 0]`

Translation of the mesh along each axis. Offset from the center position given by `getPosition`. `[x, y, z]` in meters. This will be composed with layer's [modelMatrix](https://github.com/visgl/deck.gl/blob/master/docs/api-reference/core/layer.md#modelmatrix-number16-optional).

* If an array is provided, it is used as the offset for all objects.
* If a function is provided, it is called on each object to retrieve its offset.

#### `getTransformMatrix` ([Accessor\<number\[16\]>](https://deck.gl/next/docs/developer-guide/using-layers.md#accessors), optional)[​](#gettransformmatrix "Direct link to gettransformmatrix")

* Default: `null`

Explicitly define a 4x4 column-major model matrix for the mesh. If provided, will override `getOrientation`, `getScale`, `getTranslation`.

* If an array is provided, it is used as the transform matrix for all objects.
* If a function is provided, it is called on each object to retrieve its transform matrix.

## Source[​](#source "Direct link to Source")

[modules/mesh-layers/src/simple-mesh-layer](https://github.com/visgl/deck.gl/tree/master/modules/mesh-layers/src/simple-mesh-layer)
