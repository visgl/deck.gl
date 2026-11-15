---
description: "LineLayer renders straight lines between pairs of source and target coordinates."
---

# LineLayer
![webgpu](https://img.shields.io/badge/webgpu-supported-blue.svg?style=flat-square)

import {LineLayerDemo} from '@site/src/doc-demos/layers';

<LineLayerDemo />

The `LineLayer` renders straight lines joining pairs of source and target coordinates.

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs groupId="layer-input">
  <TabItem value="accessors" label="Classic accessors">

<Tabs groupId="language">
  <TabItem value="js" label="JavaScript">

```js
import {Deck} from '@deck.gl/core';
import {LineLayer} from '@deck.gl/layers';

const layer = new LineLayer({
  id: 'LineLayer',
  data: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/bart-segments.json',
  
  getColor: d => [Math.sqrt(d.inbound + d.outbound), 140, 0],
  getSourcePosition: d => d.from.coordinates,
  getTargetPosition: d => d.to.coordinates,
  getWidth: 12,
  pickable: true
});

new Deck({
  initialViewState: {
    longitude: -122.4,
    latitude: 37.74,
    zoom: 11
  },
  controller: true,
  getTooltip: ({object}) => object && `${object.from.name} to ${object.to.name}`,
  layers: [layer]
});
```

  </TabItem>
  <TabItem value="ts" label="TypeScript">

```ts
import {Deck, PickingInfo} from '@deck.gl/core';
import {LineLayer} from '@deck.gl/layers';

type BartSegment = {
  inbound: number;
  outbound: number;
  from: {
    name: string;
    coordinate: [longitude: number, latitude: number];
  };
  to: {
    name: string;
    coordinate: [longitude: number, latitude: number];
  };
};

const layer = new LineLayer<BartSegment>({
  id: 'LineLayer',
  data: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/bart-segments.json',
  
  getColor: (d: BartSegment) => [Math.sqrt(d.inbound + d.outbound), 140, 0],
  getSourcePosition: (d: BartSegment) => d.from.coordinates,
  getTargetPosition: (d: BartSegment) => d.to.coordinates,
  getWidth: 12,
  pickable: true
});

new Deck({
  initialViewState: {
    longitude: -122.4,
    latitude: 37.74,
    zoom: 11
  },
  controller: true,
  getTooltip: ({object}: PickingInfo<BartSegment>) => object && `${object.from.name} to ${object.to.name}`,
  layers: [layer]
});
```

  </TabItem>
  <TabItem value="react" label="React">

```tsx
import React from 'react';
import {DeckGL} from '@deck.gl/react';
import {LineLayer} from '@deck.gl/layers';
import type {PickingInfo} from '@deck.gl/core';

type BartSegment = {
  inbound: number;
  outbound: number;
  from: {
    name: string;
    coordinate: [longitude: number, latitude: number];
  };
  to: {
    name: string;
    coordinate: [longitude: number, latitude: number];
  };
};

function App() {
  const layer = new LineLayer<BartSegment>({
    id: 'LineLayer',
    data: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/bart-segments.json',
    
    getColor: (d: BartSegment) => [Math.sqrt(d.inbound + d.outbound), 140, 0],
    getSourcePosition: (d: BartSegment) => d.from.coordinates,
    getTargetPosition: (d: BartSegment) => d.to.coordinates,
    getWidth: 12,
    pickable: true
  });

  return <DeckGL
    initialViewState={{
      longitude: -122.4,
      latitude: 37.74,
      zoom: 11
    }}
    controller
    getTooltip={({object}: PickingInfo<BartSegment>) => object && `${object.from.name} to ${object.to.name}`}
    layers={[layer]}
  />;
}
```

  </TabItem>
</Tabs>

  </TabItem>
  <TabItem value="arrow" label="Arrow inputs">

```js
import {Field, FixedSizeList, Float32, vectorFromArray} from 'apache-arrow';
import {LineLayer} from '@deck.gl/layers';

const positionType = new FixedSizeList(2, new Field('value', new Float32()));
const positions = vectorFromArray([[-122.4, 37.74]], positionType);
const targets = vectorFromArray([[-122.41, 37.75]], positionType);

const layer = new LineLayer({
  getSourcePosition: positions,
  getTargetPosition: targets
});
```

See [Using with Arrow](../../developer-guide/using-with-arrow.md) for column layouts and mixed inputs.

  </TabItem>

  <TabItem value="query" label="Query">

```js
import {Deck} from '@deck.gl/core';
import {sqlParser} from '@deck.gl/core/sql';
import {LineLayer} from '@deck.gl/layers';
import {tableFromArrays} from 'apache-arrow';

const data = tableFromArrays({
  sourceLongitude: [-122.4],
  sourceLatitude: [37.74],
  targetLongitude: [-122.41],
  targetLatitude: [37.75]
});

new Deck({
  sqlParser,
  layers: [
    new LineLayer({
      data,
      getSourcePosition: {sql: 'FLOAT64x2(sourceLongitude, sourceLatitude)'},
      getTargetPosition: {sql: 'FLOAT64x2(targetLongitude, targetLatitude)'}
    })
  ]
});
```

See [Querying Arrow data](../../developer-guide/using-with-arrow.md#querying-arrow-data)
for filtering rows and writing accessor expressions.

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
import {LineLayer} from '@deck.gl/layers';
import type {LineLayerProps} from '@deck.gl/layers';

new LineLayer<DataT>(...props: LineLayerProps<DataT>[]);
```

To use pre-bundled scripts:

```html
<script src="https://unpkg.com/deck.gl@^9.0.0/dist.min.js"></script>
<!-- or -->
<script src="https://unpkg.com/@deck.gl/core@^9.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/layers@^9.0.0/dist.min.js"></script>
```

```js
new deck.LineLayer({});
```

## Properties

Inherits from all [Base Layer](../core/layer.md) properties.

### Render Options

The width used to draw each line. Unit is pixels.

#### `widthUnits` (string, optional) {#widthunits}

* Default: `'pixels'`

The units of the line width, one of `'meters'`, `'common'`, and `'pixels'`. See [unit system](../../developer-guide/coordinate-systems.md#supported-units).

#### `widthScale` (number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#widthscale}

* Default: `1`

The scaling multiplier for the width of each line. This prop is a very efficient way to change the width of all objects, comparing to recalculating the width for each object with `getWidth`.

#### `widthMinPixels` (number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#widthminpixels}

* Default: `0`

The minimum line width in pixels. This prop can be used to prevent the line from getting to thin when zoomed out.

#### `widthMaxPixels` (number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#widthmaxpixels}

* Default: `Number.MAX_SAFE_INTEGER`

The maximum line width in pixels. This prop can be used to prevent the line from getting to thick when zoomed in.

#### `antialiasing` (boolean, optional) {#antialiasing}

* Default: `false`

When enabled, this prop computes edge coverage in the shader. When disabled, the layer relies on render-target multisampling. Shader-computed coverage can cause artifacts where lines overlap. Only the edges along the width of the line are smoothed — the two ends are not.

Other antialiasing techniques have different trade-offs; see [Antialiasing and Multisampling](https://luma.gl/docs/api-guide/gpu/gpu-antialiasing) in the luma.gl docs.



### Data Accessors

Arrow inputs follow the shared [column requirements and limitations](../../developer-guide/using-with-arrow.md#limitations).

#### `getSourcePosition` (constant | Accessor | arrow.Vector, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#getsourceposition}

* Default: `object => object.sourcePosition`

Method called to retrieve the source position of each object.

An Arrow vector supplies one value per object. See [position columns](../../developer-guide/using-with-arrow.md#positions-and-other-vectors) for requirements.


#### `getTargetPosition` (constant | Accessor | arrow.Vector, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#gettargetposition}

* Default: `object => object.targetPosition`

Method called to retrieve the target position of each object.

An Arrow vector supplies one value per object. See [position columns](../../developer-guide/using-with-arrow.md#positions-and-other-vectors) for requirements.


#### `getColor` (constant | Accessor | arrow.Vector, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#getcolor}

* Default: `[0, 0, 0, 255]`

For arrays and callback results, the rgba color is in the format of `[r, g, b, [a]]`. Each channel is a number between 0-255 and `a` is 255 if not supplied.

* If an array is provided, it is used as the color for all objects.
* If a function is provided, it is called on each object to retrieve its color.

An Arrow vector supplies one value per object. See [color columns](../../developer-guide/using-with-arrow.md#colors) for requirements.


#### `getWidth` (constant | Accessor | arrow.Vector, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#getwidth}

* Default: `1`

The line width of each object, in units specified by `widthUnits` (default pixels).

* If a number is provided, it is used as the line width for all objects.
* If a function is provided, it is called on each object to retrieve its line width.

An Arrow vector supplies one value per object. See [scalar columns](../../developer-guide/using-with-arrow.md#scalars) for requirements.


## GPUVector inputs 🧪 {#gpuvector-inputs-unstable}

> GPU buffer layouts are internal to layer implementations and can change in future releases.

GPUVector props let applications supply caller-owned GPU buffers to the rendering path. This is particularly useful when applications compute rendering attributes on the GPU.

- `sourcePositions` – `float32x3` – Source positions in XYZ order.
- `targetPositions` – `float32x3` – Target positions in XYZ order.
- `colors` – `unorm8x4` – Packed RGBA colors.
- `widths` – `float32`

Notes:

- Supply one value per rendered instance, in instance order.
- See [Direct GPUVector inputs](../../developer-guide/using-with-arrow.md#direct-gpuvector-inputs) for ownership, chunk alignment, and preprocessing requirements.

## Source

[modules/layers/src/line-layer](https://github.com/visgl/deck.gl/tree/master/modules/layers/src/line-layer)
