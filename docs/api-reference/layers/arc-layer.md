# ArcLayer

![webgpu](https://img.shields.io/badge/webgpu-supported-blue.svg?style=flat-square)

<!-- -->

Edit on Codepen

The `ArcLayer` renders raised arcs joining pairs of source and target coordinates.

<!-- -->

* JavaScript
* TypeScript
* React

```
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

```
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

```
import React from 'react';

import {DeckGL} from '@deck.gl/react';

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

## Installation[​](#installation "Direct link to Installation")

To install the dependencies from NPM:

```
npm install deck.gl

# or

npm install @deck.gl/core @deck.gl/layers
```

```
import {ArcLayer} from '@deck.gl/layers';

import type {ArcLayerProps} from '@deck.gl/layers';



new ArcLayer<DataT>(...props: ArcLayerProps<DataT>[]);
```

To use pre-bundled scripts:

```
<script src="https://unpkg.com/deck.gl@^9.0.0/dist.min.js"></script>

<!-- or -->

<script src="https://unpkg.com/@deck.gl/core@^9.0.0/dist.min.js"></script>

<script src="https://unpkg.com/@deck.gl/layers@^9.0.0/dist.min.js"></script>
```

```
new deck.ArcLayer({});
```

## Properties[​](#properties "Direct link to Properties")

Inherits from all [Base Layer](https://deck.gl/docs/api-reference/core/layer.md) properties.

### Render Options[​](#render-options "Direct link to Render Options")

#### `greatCircle` (boolean, optional)[​](#greatcircle "Direct link to greatcircle")

* Default: `false`

If `true`, create the arc along the shortest path on the earth surface. This option is only effective with data in the `LNGLAT` coordinate system.

#### `numSegments` (number, optional)[​](#numsegments "Direct link to numsegments")

* Default: `50`

The number of segments used to draw each arc. This prop can be used to make arcs smooth when using `greatCircle` with long paths.

#### `widthUnits` (string, optional)[​](#widthunits "Direct link to widthunits")

* Default: `'pixels'`

The units of the line width, one of `'meters'`, `'common'`, and `'pixels'`. See [unit system](https://deck.gl/docs/developer-guide/coordinate-systems.md#supported-units).

#### `widthScale` (number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square%22)[​](#widthscale "Direct link to widthscale")

* Default: `1`

The scaling multiplier for the width of each line. This prop is a very efficient way to change the width of all objects, comparing to recalculating the width for each object with `getWidth`.

#### `widthMinPixels` (number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square%22)[​](#widthminpixels "Direct link to widthminpixels")

* Default: `0`

The minimum line width in pixels. This prop can be used to prevent the line from getting too thin when zoomed out.

#### `widthMaxPixels` (number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square%22)[​](#widthmaxpixels "Direct link to widthmaxpixels")

* Default: `Number.MAX_SAFE_INTEGER`

The maximum line width in pixels. This prop can be used to prevent the line from getting too thick when zoomed in.

#### `antialiasing` (boolean, optional)[​](#antialiasing "Direct link to antialiasing")

* Default: `false`

When enabled, this prop computes edge coverage in the shader. When disabled, the layer relies on render-target multisampling. Shader-computed coverage can cause artifacts where arcs overlap. Only the edges along the width of the arc are smoothed — the two ends are not.

Other antialiasing techniques have different trade-offs; see [Antialiasing and Multisampling](https://luma.gl/docs/api-guide/gpu/gpu-antialiasing) in the luma.gl docs.

### Data Accessors[​](#data-accessors "Direct link to Data Accessors")

#### `getSourcePosition` ([Accessor\<Position>](https://deck.gl/docs/developer-guide/using-layers.md#accessors), optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square%22)[​](#getsourceposition "Direct link to getsourceposition")

* Default: `object => object.sourcePosition`

Method called to retrieve the source position of each object.

#### `getTargetPosition` ([Accessor\<Position>](https://deck.gl/docs/developer-guide/using-layers.md#accessors), optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square%22)[​](#gettargetposition "Direct link to gettargetposition")

* Default: `object => object.targetPosition`

Method called to retrieve the target position of each object.

#### `getSourceColor` ([Accessor\<Color>](https://deck.gl/docs/developer-guide/using-layers.md#accessors), optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square%22)[​](#getsourcecolor "Direct link to getsourcecolor")

* Default: `[0, 0, 0, 255]`

The rgba color is in the format of `[r, g, b, [a]]`. Each channel is a number between 0-255 and `a` is 255 if not supplied.

* If an array is provided, it is used as the source color for all objects.
* If a function is provided, it is called on each object to retrieve its source color.

#### `getTargetColor` ([Accessor\<Color>](https://deck.gl/docs/developer-guide/using-layers.md#accessors), optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square%22)[​](#gettargetcolor "Direct link to gettargetcolor")

* Default `[0, 0, 0, 255]`

The rgba color at the target, in `r, g, b, [a]`. Each component is in the 0-255 range.

* If an array is provided, it is used as the target color for all objects.
* If a function is provided, it is called on each object to retrieve its target color.

#### `getWidth` ([Accessor\<number>](https://deck.gl/docs/developer-guide/using-layers.md#accessors), optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square%22)[​](#getwidth "Direct link to getwidth")

* Default: `1`

The line width of each object, in units specified by `widthUnits` (default pixels).

* If a number is provided, it is used as the line width for all objects.
* If a function is provided, it is called on each object to retrieve its line width.

#### `getHeight` ([Accessor\<number>](https://deck.gl/docs/developer-guide/using-layers.md#accessors), optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square%22)[​](#getheight "Direct link to getheight")

* Default: `1`

Multiplier of layer height. `0` will make the layer flat.

#### `getTilt` ([Accessor\<number>](https://deck.gl/docs/developer-guide/using-layers.md#accessors), optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square%22)[​](#gettilt "Direct link to gettilt")

* Default: `0`

Use to tilt the arc to the side if you have multiple arcs with the same source and target positions. In degrees, can be positive or negative (`-90 to +90`).

## Remarks[​](#remarks "Direct link to Remarks")

### Using with GlobeView[​](#using-with-globeview "Direct link to Using with GlobeView")

When using this layer with [GlobeView](https://deck.gl/docs/api-reference/core/globe-view.md) or MapLibre's globe projection, arcs may be invisible when viewed from certain angles because `GlobeView` enables back-face culling by default. To ensure arcs are visible from both sides, set:

```
new ArcLayer({

  // ...other props

  parameters: {cullMode: 'none'}

});
```

## Source[​](#source "Direct link to Source")

[modules/layers/src/arc-layer](https://github.com/visgl/deck.gl/tree/9.4-release/modules/layers/src/arc-layer)
