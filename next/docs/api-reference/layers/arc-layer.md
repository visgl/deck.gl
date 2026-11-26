# ArcLayer

![webgpu](https://img.shields.io/badge/webgpu-supported-blue.svg?style=flat-square)

<!-- -->

Edit on Codepen

The `ArcLayer` renders raised arcs joining pairs of source and target coordinates.

<!-- -->

* Classic accessors
* Arrow inputs

- JavaScript
- TypeScript
- React

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

```
import {Field, FixedSizeList, Float32, vectorFromArray} from 'apache-arrow';

import {ArcLayer} from '@deck.gl/layers';



const positionType = new FixedSizeList(2, new Field('value', new Float32()));

const positions = vectorFromArray([[-122.4, 37.74]], positionType);

const targets = vectorFromArray([[-122.41, 37.75]], positionType);



const layer = new ArcLayer({

  getSourcePosition: positions,

  getTargetPosition: targets

});
```

See [Using with Arrow](https://deck.gl/next/docs/developer-guide/using-with-arrow.md) for column layouts and mixed inputs.

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

Inherits from all [Base Layer](https://deck.gl/next/docs/api-reference/core/layer.md) properties.

### Render Options[​](#render-options "Direct link to Render Options")

#### `heightMode` ('relative' | 'absolute', optional)[​](#heightmode "Direct link to heightmode")

Default: `'relative'`. In relative mode, `getHeight` scales the arc height with endpoint separation. In absolute mode, `getHeight` sets the midpoint rise above the linearly interpolated endpoint elevations before tilt, in meters for geographic coordinates or coordinate units for Cartesian data. Negative values bend the arc downward.

#### `greatCircle` (boolean, optional)[​](#greatcircle "Direct link to greatcircle")

* Default: `false`

If `true`, create the arc along the shortest path on the earth surface. This option is only effective with data in the `LNGLAT` coordinate system.

#### `numSegments` (number, optional)[​](#numsegments "Direct link to numsegments")

* Default: `50`

The number of segments used to draw each arc. This prop can be used to make arcs smooth when using `greatCircle` with long paths.

#### `widthUnits` (string, optional)[​](#widthunits "Direct link to widthunits")

* Default: `'pixels'`

The units of the line width, one of `'meters'`, `'common'`, and `'pixels'`. See [unit system](https://deck.gl/next/docs/developer-guide/coordinate-systems.md#supported-units).

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

Arrow inputs follow the shared [column requirements and limitations](https://deck.gl/next/docs/developer-guide/using-with-arrow.md#limitations).

#### `getSourcePosition` (constant | Accessor | arrow\.Vector, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square%22)[​](#getsourceposition "Direct link to getsourceposition")

* Default: `object => object.sourcePosition`

Method called to retrieve the source position of each object.

An Arrow vector supplies one value per object. See [position columns](https://deck.gl/next/docs/developer-guide/using-with-arrow.md#positions-and-other-vectors) for requirements.

#### `getTargetPosition` (constant | Accessor | arrow\.Vector, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square%22)[​](#gettargetposition "Direct link to gettargetposition")

* Default: `object => object.targetPosition`

Method called to retrieve the target position of each object.

An Arrow vector supplies one value per object. See [position columns](https://deck.gl/next/docs/developer-guide/using-with-arrow.md#positions-and-other-vectors) for requirements.

#### `getSourceColor` (constant | Accessor | arrow\.Vector, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square%22)[​](#getsourcecolor "Direct link to getsourcecolor")

* Default: `[0, 0, 0, 255]`

For arrays and callback results, the rgba color is in the format of `[r, g, b, [a]]`. Each channel is a number between 0-255 and `a` is 255 if not supplied.

* If an array is provided, it is used as the source color for all objects.
* If a function is provided, it is called on each object to retrieve its source color.

An Arrow vector supplies one value per object. See [color columns](https://deck.gl/next/docs/developer-guide/using-with-arrow.md#colors) for requirements.

#### `getTargetColor` (constant | Accessor | arrow\.Vector, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square%22)[​](#gettargetcolor "Direct link to gettargetcolor")

* Default `[0, 0, 0, 255]`

The rgba color at the target, in `r, g, b, [a]`. Each component is in the 0-255 range.

* If an array is provided, it is used as the target color for all objects.
* If a function is provided, it is called on each object to retrieve its target color.

An Arrow vector supplies one value per object. See [color columns](https://deck.gl/next/docs/developer-guide/using-with-arrow.md#colors) for requirements.

#### `getWidth` (constant | Accessor | arrow\.Vector, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square%22)[​](#getwidth "Direct link to getwidth")

* Default: `1`

The line width of each object, in units specified by `widthUnits` (default pixels).

* If a number is provided, it is used as the line width for all objects.
* If a function is provided, it is called on each object to retrieve its line width.

An Arrow vector supplies one value per object. See [scalar columns](https://deck.gl/next/docs/developer-guide/using-with-arrow.md#scalars) for requirements.

#### `getHeight` (constant | Accessor | arrow\.Vector, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square%22)[​](#getheight "Direct link to getheight")

* Default: `1`

Height multiplier in relative mode, or signed midpoint rise in absolute mode.

An Arrow vector supplies one value per object. See [scalar columns](https://deck.gl/next/docs/developer-guide/using-with-arrow.md#scalars) for requirements.

#### `getTilt` (constant | Accessor | arrow\.Vector, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square%22)[​](#gettilt "Direct link to gettilt")

* Default: `0`

Use to tilt the arc to the side if you have multiple arcs with the same source and target positions. In degrees, can be positive or negative (`-90 to +90`).

An Arrow vector supplies one value per object. See [scalar columns](https://deck.gl/next/docs/developer-guide/using-with-arrow.md#scalars) for requirements.

## Remarks[​](#remarks "Direct link to Remarks")

* If varying attributes exceed the WebGPU device's vertex buffer limit, use constant accessors for styling values shared by all arcs.

## GPUVector inputs 🧪[​](#gpuvector-inputs-unstable "Direct link to GPUVector inputs 🧪")

> GPU buffer layouts are internal to layer implementations and can change in future releases.

GPUVector props let applications supply caller-owned GPU buffers to the rendering path. This is particularly useful when applications compute rendering attributes on the GPU.

* `sourcePositions` – `float32x2` or `float32x3` – XY or XYZ positions. Packed XY positions have zero elevation.
* `targetPositions` – `float32x2` or `float32x3` – XY or XYZ positions. Packed XY positions have zero elevation.
* `sourceColors` – `unorm8x4` – Packed RGBA colors at source positions.
* `targetColors` – `unorm8x4` – Packed RGBA colors at target positions.
* `widths` – `float32`
* `heights` – `float32`
* `tilts` – `float32`

Notes:

* Supply one value per rendered instance, in instance order.
* See [Direct GPUVector inputs](https://deck.gl/next/docs/developer-guide/using-with-arrow.md#direct-gpuvector-inputs) for ownership, chunk alignment, and preprocessing requirements.

## Source[​](#source "Direct link to Source")

[modules/layers/src/arc-layer](https://github.com/visgl/deck.gl/tree/master/modules/layers/src/arc-layer)
