# ArcLayer

import {ArcLayerDemo} from '@site/src/doc-demos/layers';

<ArcLayerDemo />

The `ArcLayer` renders raised arcs joining pairs of source and target coordinates.


import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs groupId="language">
  <TabItem value="js" label="JavaScript">

```js
import {Deck} from '@deck.gl/core';
import {ArcLayer} from '@deck.gl/layers';

const layer = new ArcLayer({
  id: 'ArcLayer',
  data: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/bart-segments.json',
  getSourcePosition: d => d.from.coordinates,
  getTargetPosition: d => d.to.coordinates,
  getSourceColor: d => [Math.sqrt(d.inbound), 140, 0],
  getTargetColor: d => [Math.sqrt(d.outbound), 140, 0],
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
import {ArcLayer} from '@deck.gl/layers';

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

const layer = new ArcLayer<BartSegment>({
  id: 'ArcLayer',
  data: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/bart-segments.json',
  getSourcePosition: (d: BartSegment) => d.from.coordinates,
  getTargetPosition: (d: BartSegment) => d.to.coordinates,
  getSourceColor: (d: BartSegment) => [Math.sqrt(d.inbound), 140, 0],
  getTargetColor: (d: BartSegment) => [Math.sqrt(d.outbound), 140, 0],
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
import DeckGL from '@deck.gl/react';
import {ArcLayer} from '@deck.gl/layers';
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
  const layer = new ArcLayer<BartSegment>({
    id: 'ArcLayer',
    data: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/bart-segments.json',
    getSourcePosition: (d: BartSegment) => d.from.coordinates,
    getTargetPosition: (d: BartSegment) => d.to.coordinates,
    getSourceColor: (d: BartSegment) => [Math.sqrt(d.inbound), 140, 0],
    getTargetColor: (d: BartSegment) => [Math.sqrt(d.outbound), 140, 0],
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


## Installation

To install the dependencies from NPM:

```bash
npm install deck.gl
# or
npm install @deck.gl/core @deck.gl/layers
```

```ts
import {ArcLayer} from '@deck.gl/layers';
import type {ArcLayerProps} from '@deck.gl/layers';

new ArcLayer<DataT>(...props: ArcLayerProps<DataT>[]);
```

To use pre-bundled scripts:

```html
<script src="https://unpkg.com/deck.gl@^9.0.0/dist.min.js"></script>
<!-- or -->
<script src="https://unpkg.com/@deck.gl/core@^9.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/layers@^9.0.0/dist.min.js"></script>
```

```js
new deck.ArcLayer({});
```

## Properties

Inherits from all [Base Layer](../core/layer.md) properties.

### Render Options

#### `greatCircle` (boolean, optional) {#greatcircle}

* Default: `false`

If `true`, create the arc along the shortest path on the earth surface. This option is only effective with data in the `LNGLAT` coordinate system.

#### `numSegments` (number, optional) {#numsegments}

* Default: `50`

The number of segments used to draw each arc. This prop can be used to make arcs smooth when using `greatCircle` with long paths.

#### `widthUnits` (string, optional) {#widthunits}

* Default: `'pixels'`

The units of the line width, one of `'meters'`, `'common'`, and `'pixels'`. See [unit system](../../developer-guide/coordinate-systems.md#supported-units).

#### `widthScale` (number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#widthscale}

* Default: `1`

The scaling multiplier for the width of each line. This prop is a very efficient way to change the width of all objects, comparing to recalculating the width for each object with `getWidth`.

#### `widthMinPixels` (number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#widthminpixels}

* Default: `0`

The minimum line width in pixels. This prop can be used to prevent the line from getting too thin when zoomed out.

#### `widthMaxPixels` (number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#widthmaxpixels}

* Default: `Number.MAX_SAFE_INTEGER`

The maximum line width in pixels. This prop can be used to prevent the line from getting too thick when zoomed in.


### Data Accessors

#### `getSourcePosition` ([Accessor&lt;Position&gt;](../../developer-guide/using-layers.md#accessors), optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#getsourceposition}

* Default: `object => object.sourcePosition`

Method called to retrieve the source position of each object.

#### `getTargetPosition` ([Accessor&lt;Position&gt;](../../developer-guide/using-layers.md#accessors), optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#gettargetposition}

* Default: `object => object.targetPosition`

Method called to retrieve the target position of each object.

#### `getSourceColor` ([Accessor&lt;Color&gt;](../../developer-guide/using-layers.md#accessors), optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#getsourcecolor}

* Default: `[0, 0, 0, 255]`

The rgba color is in the format of `[r, g, b, [a]]`. Each channel is a number between 0-255 and `a` is 255 if not supplied.

* If an array is provided, it is used as the source color for all objects.
* If a function is provided, it is called on each object to retrieve its source color.

#### `getTargetColor` ([Accessor&lt;Color&gt;](../../developer-guide/using-layers.md#accessors), optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#gettargetcolor}

* Default `[0, 0, 0, 255]`

The rgba color at the target, in `r, g, b, [a]`. Each component is in the 0-255 range.

* If an array is provided, it is used as the target color for all objects.
* If a function is provided, it is called on each object to retrieve its target color.

#### `getWidth` ([Accessor&lt;number&gt;](../../developer-guide/using-layers.md#accessors), optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#getwidth}

* Default: `1`

The line width of each object, in units specified by `widthUnits` (default pixels).

* If a number is provided, it is used as the line width for all objects.
* If a function is provided, it is called on each object to retrieve its line width.

#### `getHeight` ([Accessor&lt;number&gt;](../../developer-guide/using-layers.md#accessors), optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#getheight}

* Default: `1`

Multiplier of layer height. `0` will make the layer flat.

#### `getTilt` ([Accessor&lt;number&gt;](../../developer-guide/using-layers.md#accessors), optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#gettilt}

* Default: `0`

Use to tilt the arc to the side if you have multiple arcs with the same source and target positions.
In degrees, can be positive or negative (`-90 to +90`).

## Source

[modules/layers/src/arc-layer](https://github.com/visgl/deck.gl/tree/master/modules/layers/src/arc-layer)
