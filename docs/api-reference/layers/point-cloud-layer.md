# PointCloudLayer

import {PointCloudLayerDemo} from '@site/src/doc-demos/layers';

<PointCloudLayerDemo />

The `PointCloudLayer` renders a point cloud with 3D positions, normals and colors.

```js
import DeckGL from '@deck.gl/react';
import {PointCloudLayer} from '@deck.gl/layers';

function App({data, viewState}) {
  /**
   * Data format:
   * [
   *   {position: [-122.4, 37.7, 12], normal: [-1, 0, 0], color: [255, 255, 0]},
   *   ...
   * ]
   */
  const layer = new PointCloudLayer({
    id: 'point-cloud-layer',
    data,
    pickable: false,
    coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
    coordinateOrigin: [-122.4, 37.74],
    radiusPixels: 4,
    getPosition: d => d.position,
    getNormal: d => d.normal,
    getColor: d => d.color
  });

  return <DeckGL viewState={viewState}
    layers={[layer]}
    getTooltip={({object}) => object && object.position.join(', ')} />;
}
```

`loaders.gl` offers a [category](https://loaders.gl/docs/specifications/category-mesh) of loaders for loading point clouds from standard formats. For example, the following code adds support for LAS/LAZ files:

```js
import {PointCloudLayer} from '@deck.gl/layers';
import {LASLoader} from '@loaders.gl/las';

new PointCloudLayer({
  ...
  mesh: 'path/to/pointcloud.laz',
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
new PointCloudLayer({});
```

To use pre-bundled scripts:

```html
<script src="https://unpkg.com/deck.gl@^8.0.0/dist.min.js"></script>
<!-- or -->
<script src="https://unpkg.com/@deck.gl/core@^8.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/layers@^8.0.0/dist.min.js"></script>
```

```js
new deck.PointCloudLayer({});
```

## Properties

Inherits from all [Base Layer](../core/layer.md) properties.

### Render Options

##### `sizeUnits` (String, optional) {#sizeunits}

* Default: `'pixels'`

The units of the point size, one of `'meters'`, `'common'`, and `'pixels'`. See [unit system](../../developer-guide/coordinate-systems.md#supported-units).

##### `pointSize` (Number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#pointsize}

* Default: `10`

Global radius of all points, in units specified by `sizeUnits` (default pixels).

##### `material` (Object, optional) {#material}

* Default: `true`

This is an object that contains material props for [lighting effect](../core/lighting-effect.md) applied on extruded polygons.
Check [the lighting guide](../../developer-guide/using-lighting.md#constructing-a-material-instance) for configurable settings.

### Data Accessors

##### `getPosition` ([Function](../../developer-guide/using-layers.md#accessors), optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#getposition}

* Default: `object => object.position`

Method called to retrieve the position of each object.

##### `getNormal` ([Function](../../developer-guide/using-layers.md#accessors)|Array, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#getnormal}

* Default: `[0, 0, 1]`

The normal of each object, in `[nx, ny, nz]`.

* If an array is provided, it is used as the normal for all objects.
* If a function is provided, it is called on each object to retrieve its normal.


##### `getColor` ([Function](../../developer-guide/using-layers.md#accessors)|Array, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#getcolor}

* Default: `[0, 0, 0, 255]`

The rgba color is in the format of `[r, g, b, [a]]`. Each channel is a number between 0-255 and `a` is 255 if not supplied.

* If an array is provided, it is used as the color for all objects.
* If a function is provided, it is called on each object to retrieve its color.

## Source

[modules/layers/src/point-cloud-layer](https://github.com/visgl/deck.gl/tree/master/modules/layers/src/point-cloud-layer)
