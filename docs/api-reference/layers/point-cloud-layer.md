# PointCloudLayer

import {PointCloudLayerDemo} from '@site/src/doc-demos/layers';

<PointCloudLayerDemo />

The `PointCloudLayer` renders a point cloud with 3D positions, normals and colors.

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs groupId="language">
  <TabItem value="js" label="JavaScript">

```js
import {Deck, COORDINATE_SYSTEM} from '@deck.gl/core';
import {PointCloudLayer} from '@deck.gl/layers';

const layer = new PointCloudLayer({
  id: 'PointCloudLayer',
  data: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/pointcloud.json',
  
  getColor: d => d.color,
  getNormal: d => d.normal,
  getPosition: d => d.position,
  pointSize: 2,
  coordinateOrigin: [-122.4, 37.74],
  coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
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

  </TabItem>
  <TabItem value="ts" label="TypeScript">

```ts
import {Deck, COORDINATE_SYSTEM, PickingInfo} from '@deck.gl/core';
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
  coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
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

  </TabItem>
  <TabItem value="react" label="React">

```tsx
import React from 'react';
import DeckGL from '@deck.gl/react';
import {COORDINATE_SYSTEM} from '@deck.gl/core';
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
    coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
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

  </TabItem>
</Tabs>


`loaders.gl` offers a [category](https://loaders.gl/docs/specifications/category-mesh) of loaders for loading point clouds from standard formats. For example, the following code adds support for LAS/LAZ files:

```ts
import {PointCloudLayer} from '@deck.gl/layers';
import {LASLoader} from '@loaders.gl/las';

new PointCloudLayer({
  data: 'path/to/pointcloud.laz',
  loaders: [LASLoader]
});
```

## Installation

To install the dependencies from NPM:

```bash
npm install deck.gl
# or
npm install @deck.gl/core @deck.gl/layers
```

```js
import {PointCloudLayer} from '@deck.gl/layers';
import type {PointCloudLayerProps} from '@deck.gl/layers';

new PointCloudLayer<DataT>(...props: PointCloudLayerProps<DataT>[]);
```

To use pre-bundled scripts:

```html
<script src="https://unpkg.com/deck.gl@^9.0.0/dist.min.js"></script>
<!-- or -->
<script src="https://unpkg.com/@deck.gl/core@^9.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/layers@^9.0.0/dist.min.js"></script>
```

```js
new deck.PointCloudLayer({});
```

## Properties

Inherits from all [Base Layer](../core/layer.md) properties.

### Render Options

##### `sizeUnits` (string, optional) {#sizeunits}

* Default: `'pixels'`

The units of the point size, one of `'meters'`, `'common'`, and `'pixels'`. See [unit system](../../developer-guide/coordinate-systems.md#supported-units).

##### `pointSize` (number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#pointsize}

* Default: `10`

Global radius of all points, in units specified by `sizeUnits` (default pixels).

##### `material` (Material, optional) {#material}

* Default: `true`

This is an object that contains material props for [lighting effect](../core/lighting-effect.md) applied on extruded polygons.
Check [the lighting guide](../../developer-guide/using-effects.md#material-settings) for configurable settings.

### Data Accessors

##### `getPosition` ([Accessor&lt;Position&gt;](../../developer-guide/using-layers.md#accessors), optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#getposition}

* Default: `object => object.position`

Method called to retrieve the position of each object.

##### `getNormal` ([Accessor&lt;number[3]&gt;](../../developer-guide/using-layers.md#accessors), optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#getnormal}

* Default: `[0, 0, 1]`

The normal of each object, in `[nx, ny, nz]`.

* If an array is provided, it is used as the normal for all objects.
* If a function is provided, it is called on each object to retrieve its normal.


##### `getColor` ([Accessor&lt;Color&gt;](../../developer-guide/using-layers.md#accessors), optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#getcolor}

* Default: `[0, 0, 0, 255]`

The rgba color is in the format of `[r, g, b, [a]]`. Each channel is a number between 0-255 and `a` is 255 if not supplied.

* If an array is provided, it is used as the color for all objects.
* If a function is provided, it is called on each object to retrieve its color.

## Source

[modules/layers/src/point-cloud-layer](https://github.com/visgl/deck.gl/tree/master/modules/layers/src/point-cloud-layer)
