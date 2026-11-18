# PointCloudLayer

![webgpu](https://img.shields.io/badge/webgpu-supported-blue.svg?style=flat-square)

<!-- -->

Edit on Codepen

The `PointCloudLayer` renders a point cloud with 3D positions, normals and colors.

<!-- -->

* Classic accessors
* Arrow inputs

- JavaScript
- TypeScript
- React

```
import {Deck} from '@deck.gl/core';

import {PointCloudLayer} from '@deck.gl/layers';



const layer = new PointCloudLayer({

  id: 'PointCloudLayer',

  data: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/pointcloud.json',

  

  getColor: d => d.color,

  getNormal: d => d.normal,

  getPosition: d => d.position,

  pointSize: 2,

  coordinateOrigin: [-122.4, 37.74],

  coordinateSystem: 'meter-offsets',

  pickable: true

});



new Deck({

  initialViewState: {

    longitude: -122.4,

    latitude: 37.74,

    zoom: 11

  },

  controller: true,

  getTooltip: ({object}) => object && object.position.join(', '),

  layers: [layer]

});
```

```
import {Deck, PickingInfo} from '@deck.gl/core';

import {PointCloudLayer} from '@deck.gl/layers';



type DataType = {

  position: [x: number, y: number, z: number];

  normal: [nx: number, ny: number, nz: number];

  color: [r: number, g: number, b: number];

};



const layer = new PointCloudLayer<DataType>({

  id: 'PointCloudLayer',

  data: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/pointcloud.json',

  

  getColor: (d: DataType) => d.color,

  getNormal: (d: DataType) => d.normal,

  getPosition: (d: DataType) => d.position,

  pointSize: 2,

  coordinateOrigin: [-122.4, 37.74],

  coordinateSystem: 'meter-offsets',

  pickable: true

});



new Deck({

  initialViewState: {

    longitude: -122.4,

    latitude: 37.74,

    zoom: 11

  },

  controller: true,

  getTooltip: ({object}: PickingInfo<DataType>) => object && object.position.join(', '),

  layers: [layer]

});
```

```
import React from 'react';

import {DeckGL} from '@deck.gl/react';

import {PointCloudLayer} from '@deck.gl/layers';

import type {PickingInfo} from '@deck.gl/core';



type DataType = {

  position: [x: number, y: number, z: number];

  normal: [nx: number, ny: number, nz: number];

  color: [r: number, g: number, b: number];

};



function App() {

  const layer = new PointCloudLayer<DataType>({

    id: 'PointCloudLayer',

    data: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/pointcloud.json',

    

    getColor: (d: DataType) => d.color,

    getNormal: (d: DataType) => d.normal,

    getPosition: (d: DataType) => d.position,

    pointSize: 2,

    coordinateOrigin: [-122.4, 37.74],

    coordinateSystem: 'meter-offsets',

    pickable: true

  });



  return <DeckGL

    initialViewState={{

      longitude: -122.4,

      latitude: 37.74,

      zoom: 11

    }}

    controller

    getTooltip={({object}: PickingInfo<DataType>) => object && object.position.join(', ')}

    layers={[layer]}

  />;

}
```

```
import {Field, FixedSizeList, Float32, vectorFromArray} from 'apache-arrow';

import {PointCloudLayer} from '@deck.gl/layers';



const positionType = new FixedSizeList(3, new Field('value', new Float32()));

const positions = vectorFromArray([[0, 0, 0]], positionType);



const layer = new PointCloudLayer({

  getPosition: positions

});
```

See [Using with Arrow](https://deck.gl/next/docs/developer-guide/using-with-arrow.md) for column layouts and mixed inputs.

`loaders.gl` offers a [category](https://loaders.gl/docs/specifications/category-mesh) of loaders for loading point clouds from standard formats. For example, the following code adds support for LAS/LAZ files:

```
import {PointCloudLayer} from '@deck.gl/layers';

import {LASLoader} from '@loaders.gl/pointclouds/las';



new PointCloudLayer({

  data: 'path/to/pointcloud.laz',

  loaders: [LASLoader]

});
```

## Installation[​](#installation "Direct link to Installation")

To install the dependencies from NPM:

```
npm install deck.gl

# or

npm install @deck.gl/core @deck.gl/layers
```

```
import {PointCloudLayer} from '@deck.gl/layers';

import type {PointCloudLayerProps} from '@deck.gl/layers';



new PointCloudLayer<DataT>(...props: PointCloudLayerProps<DataT>[]);
```

To use pre-bundled scripts:

```
<script src="https://unpkg.com/deck.gl@^9.0.0/dist.min.js"></script>

<!-- or -->

<script src="https://unpkg.com/@deck.gl/core@^9.0.0/dist.min.js"></script>

<script src="https://unpkg.com/@deck.gl/layers@^9.0.0/dist.min.js"></script>
```

```
new deck.PointCloudLayer({});
```

## Properties[​](#properties "Direct link to Properties")

Inherits from all [Base Layer](https://deck.gl/next/docs/api-reference/core/layer.md) properties.

### Render Options[​](#render-options "Direct link to Render Options")

#### `sizeUnits` (string, optional)[​](#sizeunits "Direct link to sizeunits")

* Default: `'pixels'`

The units of the point size, one of `'meters'`, `'common'`, and `'pixels'`. See [unit system](https://deck.gl/next/docs/developer-guide/coordinate-systems.md#supported-units).

#### `pointSize` (number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square%22)[​](#pointsize "Direct link to pointsize")

* Default: `10`

Global radius of all points, in units specified by `sizeUnits` (default pixels).

#### `antialiasing` (boolean, optional)[​](#antialiasing "Direct link to antialiasing")

* Default: `false`

When enabled, this prop computes edge coverage in the shader. When disabled, the layer relies on render-target multisampling. Shader-computed coverage can cause artifacts where points overlap.

Other antialiasing techniques have different trade-offs; see [Antialiasing and Multisampling](https://luma.gl/docs/api-guide/gpu/gpu-antialiasing) in the luma.gl docs.

#### `material` (Material, optional)[​](#material "Direct link to material")

* Default: `true`

This is an object that contains material props for [lighting effect](https://deck.gl/next/docs/api-reference/core/lighting-effect.md) applied on extruded polygons. Check [the lighting guide](https://deck.gl/next/docs/developer-guide/using-effects.md#material-settings) for configurable settings.

### Data Accessors[​](#data-accessors "Direct link to Data Accessors")

Arrow inputs follow the shared [column requirements and limitations](https://deck.gl/next/docs/developer-guide/using-with-arrow.md#limitations).

#### `getPosition` (constant | Accessor | arrow\.Vector, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square%22)[​](#getposition "Direct link to getposition")

* Default: `object => object.position`

Method called to retrieve the position of each object.

An Arrow vector supplies one value per object. See [position columns](https://deck.gl/next/docs/developer-guide/using-with-arrow.md#positions-and-other-vectors) for requirements.

#### `getNormal` (constant | Accessor | arrow\.Vector, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square%22)[​](#getnormal "Direct link to getnormal")

* Default: `[0, 0, 1]`

The normal of each object, in `[nx, ny, nz]`.

* If an array is provided, it is used as the normal for all objects.
* If a function is provided, it is called on each object to retrieve its normal.

An Arrow vector supplies one numeric fixed-size list with three (XYZ) components per object. See [vector columns](https://deck.gl/next/docs/developer-guide/using-with-arrow.md#positions-and-other-vectors) for requirements.

On top-level layers, Deck's [`normalizedColors`](https://deck.gl/next/docs/api-reference/core/deck.md#normalizedcolors) option interprets plain-array color constants and callback results as 0–1 channels. Built-in defaults, typed arrays, binary inputs, and Arrow color columns retain their encoding.

#### `getColor` (constant | Accessor | arrow\.Vector, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square%22)[​](#getcolor "Direct link to getcolor")

* Default: `[0, 0, 0, 255]`

For arrays and callback results, the rgba color is in the format of `[r, g, b, [a]]`. Each channel is a number between 0-255 and `a` is 255 if not supplied.

* If an array is provided, it is used as the color for all objects.
* If a function is provided, it is called on each object to retrieve its color.

An Arrow vector supplies one value per object. See [color columns](https://deck.gl/next/docs/developer-guide/using-with-arrow.md#colors) for requirements.

## GPUVector inputs 🧪[​](#gpuvector-inputs-unstable "Direct link to GPUVector inputs 🧪")

> GPU buffer layouts are internal to layer implementations and can change in future releases.

GPUVector props let applications supply caller-owned GPU buffers to the rendering path. This is particularly useful when applications compute rendering attributes on the GPU.

* `positions` – `float32x3` – Positions in XYZ order.
* `normals` – `float32x3` – Normal vectors in XYZ order.
* `colors` – `unorm8x4` – Packed RGBA colors.

Notes:

* Supply one value per rendered instance, in instance order.
* See [Direct GPUVector inputs](https://deck.gl/next/docs/developer-guide/using-with-arrow.md#direct-gpuvector-inputs) for ownership, chunk alignment, and preprocessing requirements.

## Source[​](#source "Direct link to Source")

[modules/layers/src/point-cloud-layer](https://github.com/visgl/deck.gl/tree/master/modules/layers/src/point-cloud-layer)
