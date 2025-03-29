# PathLayer

import {PathLayerDemo} from '@site/src/doc-demos/layers';

<PathLayerDemo />

The `PathLayer` renders lists of coordinate points as extruded polylines with mitering.

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs groupId="language">
  <TabItem value="js" label="JavaScript">

```js
import {Deck} from '@deck.gl/core';
import {PathLayer} from '@deck.gl/layers';

const layer = new PathLayer({
  id: 'PathLayer',
  data: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/bart-lines.json',

  getColor: d => {
    const hex = d.color;
    // convert to RGB
    return hex.match(/[0-9a-f]{2}/g).map(x => parseInt(x, 16));
  },
  getPath: d => d.path,
  getWidth: 100,
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

  </TabItem>
  <TabItem value="ts" label="TypeScript">

```ts
import {Deck, PickingInfo} from '@deck.gl/core';
import {PathLayer} from '@deck.gl/layers';

type BartLine = {
  name: string;
  color: string;
  path: [longitude: number, latitude: number][];
};

const layer = new PathLayer<BartLine>({
  id: 'PathLayer',
  data: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/bart-lines.json',

  getColor: (d: BartLine) => {
    const hex = d.color;
    // convert to RGB
    return hex.match(/[0-9a-f]{2}/g).map(x => parseInt(x, 16));
  },
  getPath: (d: BartLine) => d.path,
  getWidth: 100,
  pickable: true
});

new Deck({
  initialViewState: {
    longitude: -122.4,
    latitude: 37.74,
    zoom: 11
  },
  controller: true,
  getTooltip: ({object}: PickingInfo<BartLine>) => object && object.name,
  layers: [layer]
});
```

  </TabItem>
  <TabItem value="react" label="React">

```tsx
import React from 'react';
import {DeckGL} from '@deck.gl/react';
import {PathLayer} from '@deck.gl/layers';
import type {PickingInfo} from '@deck.gl/core';

type BartLine = {
  name: string;
  color: string;
  path: [longitude: number, latitude: number][];
};

function App() {
  const layer = new PathLayer<BartLine>({
    id: 'PathLayer',
    data: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/bart-lines.json',

    getColor: (d: BartLine) => {
      const hex = d.color;
      // convert to RGB
      return hex.match(/[0-9a-f]{2}/g).map(x => parseInt(x, 16));
    },
    getPath: (d: BartLine) => d.path,
    getWidth: 100,
    pickable: true
  });

  return <DeckGL
    initialViewState={{
      longitude: -122.4,
      latitude: 37.74,
      zoom: 11
    }}
    controller
    getTooltip={({object}: PickingInfo<BartLine>) => object && object.name}
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
npm install @deck.gl/core @deck.gl/layers
```

```ts
import {PathLayer} from '@deck.gl/layers';
import type {PathLayerProps} from '@deck.gl/layers';

new PathLayer<DataT>(...props: PathLayerProps<DataT>[]);
```

To use pre-bundled scripts:

```html
<script src="https://unpkg.com/deck.gl@^9.0.0/dist.min.js"></script>
<!-- or -->
<script src="https://unpkg.com/@deck.gl/core@^9.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/layers@^9.0.0/dist.min.js"></script>
```

```js
new deck.PathLayer({});
```

## Properties

Inherits from all [Base Layer](../core/layer.md) properties.

### Render Options

#### `widthUnits` (string, optional) {#widthunits}

* Default: `'meters'`

The units of the line width, one of `'meters'`, `'common'`, and `'pixels'`. See [unit system](../../developer-guide/coordinate-systems.md#supported-units).

#### `widthScale` (number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#widthscale}

* Default: `1`

The path width multiplier that multiplied to all paths.

#### `widthMinPixels` (number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#widthminpixels}

* Default: `0`

The minimum path width in pixels. This prop can be used to prevent the path from getting too thin when zoomed out.

#### `widthMaxPixels` (number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#widthmaxpixels}

* Default: Number.MAX_SAFE_INTEGER

The maximum path width in pixels. This prop can be used to prevent the path from getting too thick when zoomed in.


#### `capRounded` (boolean, optional) {#caprounded}

* Default: `false`

Type of caps. If `true`, draw round caps. Otherwise draw square caps.


#### `jointRounded` (boolean, optional) {#jointrounded}

* Default: `false`

Type of joint. If `true`, draw round joints. Otherwise draw miter joints.

#### `billboard` (boolean, optional) {#billboard}

* Default: `false`

If `true`, extrude the path in screen space (width always faces the camera).
If `false`, the width always faces up.

#### `miterLimit` (number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#miterlimit}

* Default: `4`

The maximum extent of a joint in ratio to the stroke width.
Only works if `jointRounded` is `false`.

#### `_pathType` (object, optional) {#_pathtype}

* Default: `null`

> Note: This prop is experimental

One of `null`, `'loop'` or `'open'`.

If `'loop'` or `'open'`, will skip normalizing the coordinates returned by `getPath` and instead assume all paths are to be loops or open paths. Disabling normalization improves performance during data update, but makes the layer prone to error in case the data is malformed. It is only recommended when you use this layer with preprocessed static data or validation on the backend.

When normalization is disabled, paths must be specified in the format of flat array. Open paths must contain at least 2 vertices and closed paths must contain at least 3 vertices. See `getPath` below for details.

### Data Accessors

#### `getPath` ([Accessor&lt;PathGeometry&gt;](../../developer-guide/using-layers.md#accessors), optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#getpath}

* Default: `object => object.path`

Called on each object in the `data` stream to retrieve its corresponding path.

A path can be one of the following formats:

* An array of points (`[x, y, z]`). Compatible with the GeoJSON [LineString](https://tools.ietf.org/html/rfc7946#section-3.1.4) specification.
* A flat array or [TypedArray](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) of numbers, in the shape of `[x0, y0, z0, x1, y1, z1, ...]`. By default, each coordinate is assumed to contain 3 consecutive numbers. If each coordinate contains only two numbers (x, y), set the `positionFormat` prop of the layer to `XY`:

```ts
new PathLayer<{vertices: Float32Array}>({
  getPath: d => d.vertices, // [x0, y0, x1, y1, x2, y2, ...]
  positionFormat: 'XY'
})
```

#### `getColor` ([Accessor&lt;Color&gt;](../../developer-guide/using-layers.md#accessors), optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#getcolor}

* Default `[0, 0, 0, 255]`

The rgba color of each object, in `r, g, b, [a]`. Each component is in the 0-255 range.

* If an array is provided, it is used as the color for all objects.
* If a function is provided, it is called on each object to retrieve its color.

#### `getWidth` ([Accessor&lt;number&gt;](../../developer-guide/using-layers.md#accessors), optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#getwidth}

* Default: `1`

The width of each path, in units specified by `widthUnits` (default meters).

* If a number is provided, it is used as the width for all paths.
* If a function is provided, it is called on each path to retrieve its width.


## Use binary attributes

This section is about the special requirements when [supplying attributes directly](../../developer-guide/performance.md#supply-attributes-directly) to a `PathLayer`.

Because each path has a different number of vertices, when `data.attributes.getPath` is supplied, the layer also requires an array `data.startIndices` that describes the vertex index at the start of each path. For example, if there are 3 paths of 2, 3, and 4 vertices each, `startIndices` should be `[0, 2, 5, 9]`.

Additionally, all other attributes (`getColor`, `getWidth`, etc.), if supplied, must contain the same layout (number of vertices) as the `getPath` buffer.

To truly realize the performance gain from using binary data, the app likely wants to skip all data processing in this layer. Specify the `_pathType` prop to skip normalization.

Example use case:

```ts title="Use plain JSON array"
const PATH_DATA = [
  {
    path: [[-122.4, 37.7], [-122.5, 37.8], [-122.6, 37.85]],
    name: 'Richmond - Millbrae',
    color: [255, 0, 0]
  },
  // ...
];

new PathLayer({
  data: PATH_DATA,
  getPath: d => d.path,
  getColor: d => d.color
})
```

The equivalent binary attributes would be:

```ts title="Use binary attributes"
// Flatten PATH_DATA into several binary buffers. This is typically done on the server or in a worker
// [-122.4, 37.7, -122.5, 37.8, -122.6, 37.85, ...]
const positions = new Float64Array(PATH_DATA.map(d => d.path).flat(2));
// The color attribute must supply one color for each vertex
// [255, 0, 0, 255, 0, 0, 255, 0, 0, ...]
const colors = new Uint8Array(PATH_DATA.map(d => d.path.map(_ => d.color)).flat(2));
// The "layout" that tells PathLayer where each path starts
const startIndices = new Uint16Array(PATH_DATA.reduce((acc, d) => {
  const lastIndex = acc[acc.length - 1];
  acc.push(lastIndex + d.path.length);
  return acc;
}, [0]));

new PathLayer({
  data: {
    length: PATH_DATA.length,
    startIndices: startIndices, // this is required to render the paths correctly!
    attributes: {
      getPath: {value: positions, size: 2},
      getColor: {value: colors, size: 3}
    }
  },
  _pathType: 'open' // this instructs the layer to skip normalization and use the binary as-is
})
```

## Source

[modules/layers/src/path-layer](https://github.com/visgl/deck.gl/tree/master/modules/layers/src/path-layer)
