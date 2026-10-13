# ScenegraphLayer

![webgpu](https://img.shields.io/badge/webgpu-supported-blue.svg?style=flat-square)

<!-- -->

Edit on Codepen

The `ScenegraphLayer` renders a number of instances of a complete glTF scenegraph.

<!-- -->

* JavaScript
* TypeScript
* React

```
import {Deck} from '@deck.gl/core';

import {ScenegraphLayer} from '@deck.gl/mesh-layers';



const layer = new ScenegraphLayer({

  id: 'ScenegraphLayer',

  data: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/bart-stations.json',

  

  getPosition: d => d.coordinates,

  getOrientation: d => [0, Math.random() * 180, 90],

  scenegraph: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/BoxAnimated/glTF-Binary/BoxAnimated.glb',

  sizeScale: 500,

  _animations: {

    '*': {speed: 5}

  },

  _lighting: 'pbr',

  pickable: true

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

import {ScenegraphLayer} from '@deck.gl/mesh-layers';



type BartStation = {

  name: string;

  coordinates: [longitude: number, latitude: number];

};



const layer = new ScenegraphLayer<BartStation>({

  id: 'ScenegraphLayer',

  data: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/bart-stations.json',

  

  getPosition: (d: BartStation) => d.coordinates,

  getOrientation: (d: BartStation) => [0, Math.random() * 180, 90],

  scenegraph: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/BoxAnimated/glTF-Binary/BoxAnimated.glb',

  sizeScale: 500,

  _animations: {

    '*': {speed: 5}

  },

  _lighting: 'pbr',

  pickable: true

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

import {ScenegraphLayer} from '@deck.gl/mesh-layers';

import type {PickingInfo} from '@deck.gl/core';



type BartStation = {

  name: string;

  coordinates: [longitude: number, latitude: number];

};



function App() {

  const layer = new ScenegraphLayer<BartStation>({

    id: 'ScenegraphLayer',

    data: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/bart-stations.json',

    

    getPosition: (d: BartStation) => d.coordinates,

    getOrientation: (d: BartStation) => [0, Math.random() * 180, 90],

    scenegraph: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/BoxAnimated/glTF-Binary/BoxAnimated.glb',

    sizeScale: 500,

    _animations: {

      '*': {speed: 5}

    },

    _lighting: 'pbr',

    pickable: true

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

## Installation[​](#installation "Direct link to Installation")

To install the dependencies from NPM:

```
npm install deck.gl

# or

npm install @deck.gl/core @deck.gl/mesh-layers
```

```
import {ScenegraphLayer} from '@deck.gl/mesh-layers';

import type {ScenegraphLayerProps} from '@deck.gl/mesh-layers';



new ScenegraphLayer<DataT>(...props: ScenegraphLayerProps<DataT>[]);
```

To use pre-bundled scripts:

```
<script src="https://unpkg.com/deck.gl@^9.0.0/dist.min.js"></script>

<!-- or -->

<script src="https://unpkg.com/@deck.gl/core@^9.0.0/dist.min.js"></script>

<script src="https://unpkg.com/@deck.gl/mesh-layers@^9.0.0/dist.min.js"></script>
```

```
new deck.ScenegraphLayer({});
```

## Properties[​](#properties "Direct link to Properties")

Inherits from all [Base Layer](https://deck.gl/next/docs/api-reference/core/layer.md) properties.

### Mesh[​](#mesh "Direct link to Mesh")

#### `scenegraph` (string | object | Promise)[​](#scenegraph "Direct link to scenegraph")

The geometry to render for each data object. Can be a URL of an object. You need to provide the `fetch` function to load the object. Can also be a luma.gl [ScenegraphNode](https://github.com/visgl/luma.gl/blob/8.5-release/modules/experimental/docs/api-reference/scenegraph/scenegraph-node.md), or a `Promise` that resolves to one. The layer calls *delete()* on *scenegraph* when a new one is provided or the layer is finalized.

#### `loadOptions` (object, optional)[​](#loadoptions "Direct link to loadoptions")

On top of the [default options](https://deck.gl/next/docs/api-reference/core/layer.md#loadoptions), also accepts options for the following loaders:

* [GLTFLoader](https://loaders.gl/modules/gltf/docs/api-reference/gltf-loader) if the `scenegraph` prop is an URL

### Render Options[​](#render-options "Direct link to Render Options")

#### `sizeScale` (number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square%22)[​](#sizescale "Direct link to sizescale")

* Default `1`.

Multiplier to scale each geometry by.

#### `_animations` (object, optional)[​](#_animations "Direct link to _animations")

* Default `undefined`. (No animations are running).

An object used to configure animations playing. *keys* can be one of the following:

* *number* for index number
* *name* for animation name
* `*` to affect all animations Each value is an object with:
* `playing` (boolean) default `true`
* `speed` (number) speed multiplier, default `1`.
* `startTime` (number) start time, default `0`. Animations are parsed automatically from `glTF` files.

#### `getScene` (Function, optional)[​](#getscene "Direct link to getscene")

* Default: `scenegraph => (scenegraph && scenegraph.scenes ? scenegraph.scenes[0] : scenegraph)`

If you have multiple scenes you can select the scene you want to use. Only triggers when scenegraph property changes.

#### `getAnimator` (Function, optional)[​](#getanimator "Direct link to getanimator")

* Default: `scenegraph => scenegraph && scenegraph.animator`

Return `null` to disable animation or provide your custom animator. Only triggers when scenegraph property changes.

#### `_lighting` (string, optional)[​](#_lighting "Direct link to _lighting")

* Default: `flat`

**Experimental** lighting support, can be:

* `flat`: No light calculation. Works well with any textured object.
* `pbr` Uses `glTF` PBR model. Works well with `glTF` models.

Only read when scenegraph property changes. Uses [global light configuration](https://deck.gl/next/docs/developer-guide/using-effects.md#lighting) from deck.

#### `_imageBasedLightingEnvironment` (Function | GLTFEnvironment, optional)[​](#_imagebasedlightingenvironment "Direct link to _imagebasedlightingenvironment")

* Default: `null`

**Experimental** Can be:

* A `GLTFEnvironment` object.
* A function that takes `{gl, layer}` as first argument and returns a `GLTFEnvironment`.

Only read when scenegraph property changes.

### Data Accessors[​](#data-accessors "Direct link to Data Accessors")

#### `getPosition` ([Accessor\<Position>](https://deck.gl/next/docs/developer-guide/using-layers.md#accessors), optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square%22)[​](#getposition "Direct link to getposition")

* Default: `object => object.position`

Method called to retrieve the center position for each object in the `data` stream.

#### `getColor` ([Accessor\<Color>](https://deck.gl/next/docs/developer-guide/using-layers.md#accessors), optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square%22)[​](#getcolor "Direct link to getcolor")

* Default: `[0, 0, 0, 255]`

The rgba color is in the format of `[r, g, b, [a]]`. Each channel is a number between 0-255 and `a` is 255 if not supplied. Only used if `texture` is empty.

* If an array is provided, it is used as the color for all objects.
* If a function is provided, it is called on each object to retrieve its color.

#### `getOrientation` ([Accessor\<number\[3\]>](https://deck.gl/next/docs/developer-guide/using-layers.md#accessors), optional)[​](#getorientation "Direct link to getorientation")

* Default: `[0, 0, 0]`

Object orientation defined as a vec3 of Euler angles, `[pitch, yaw, roll]` in degrees. This will be composed with layer's [`modelMatrix`](https://github.com/visgl/deck.gl/blob/master/docs/api-reference/core/layer.md#modelmatrix-number16-optional).

* If an array is provided, it is used as the orientation for all objects.
* If a function is provided, it is called on each object to retrieve its orientation.

#### `getScale` ([Accessor\<number\[3\]>](https://deck.gl/next/docs/developer-guide/using-layers.md#accessors), optional)[​](#getscale "Direct link to getscale")

* Default: `[1, 1, 1]`

Scaling factor on the mesh along each axis.

* If an array is provided, it is used as the scale for all objects.
* If a function is provided, it is called on each object to retrieve its scale.

#### `getTranslation` ([Accessor\<number\[3\]>](https://deck.gl/next/docs/developer-guide/using-layers.md#accessors), optional)[​](#gettranslation "Direct link to gettranslation")

* Default: `[0, 0, 0]`

Translation of the mesh along each axis. Offset from the center position given by `getPosition`. `[x, y, z]` in meters.

* If an array is provided, it is used as the offset for all objects.
* If a function is provided, it is called on each object to retrieve its offset.

#### `getTransformMatrix` ([Accessor\<number\[16\]>](https://deck.gl/next/docs/developer-guide/using-layers.md#accessors), optional)[​](#gettransformmatrix "Direct link to gettransformmatrix")

* Default: `null`

Explicitly define a 4x4 column-major model matrix for the mesh. If provided, will override `getOrientation`, `getScale`, `getTranslation`. This will be composed with layer's [`modelMatrix`](https://github.com/visgl/deck.gl/blob/master/docs/api-reference/core/layer.md#modelmatrix-number16-optional).

* If an array is provided, it is used as the transform matrix for all objects.
* If a function is provided, it is called on each object to retrieve its transform matrix.

#### `sizeMinPixels` (number, optional)[​](#sizeminpixels "Direct link to sizeminpixels")

* Default: `0`

The minimum size in pixels for one unit of the scene.

#### `sizeMaxPixels` (number, optional)[​](#sizemaxpixels "Direct link to sizemaxpixels")

* Default: `Number.MAX_SAFE_INTEGER`

The maximum size in pixels for one unit of the scene.

## Source[​](#source "Direct link to Source")

[modules/mesh-layers/src/scenegraph-layer](https://github.com/visgl/deck.gl/tree/master/modules/mesh-layers/src/scenegraph-layer)
