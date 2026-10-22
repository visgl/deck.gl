# ScatterplotLayer

![webgpu](https://img.shields.io/badge/webgpu-supported-blue.svg?style=flat-square)

<!-- -->

Edit on Codepen

The `ScatterplotLayer` renders circles at given coordinates.

<!-- -->

* JavaScript
* TypeScript
* React

```
import {Deck} from '@deck.gl/core';

import {ScatterplotLayer} from '@deck.gl/layers';



const layer = new ScatterplotLayer({

  id: 'ScatterplotLayer',

  data: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/bart-stations.json',

  

  stroked: true,

  getPosition: d => d.coordinates,

  getRadius: d => Math.sqrt(d.exits),

  getFillColor: [255, 140, 0],

  getLineColor: [0, 0, 0],

  getLineWidth: 10,

  radiusScale: 6,

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

import {ScatterplotLayer} from '@deck.gl/layers';



type BartStation = {

  name: string;

  entries: number;

  exits: number;

  coordinates: [longitude: number, latitude: number];

};



const layer = new ScatterplotLayer<BartStation>({

  id: 'ScatterplotLayer',

  data: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/bart-stations.json',

  

  stroked: true,

  getPosition: (d: BartStation) => d.coordinates,

  getRadius: (d: BartStation) => Math.sqrt(d.exits),

  getFillColor: [255, 140, 0],

  getLineColor: [0, 0, 0],

  getLineWidth: 10,

  radiusScale: 6,

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

import {ScatterplotLayer} from '@deck.gl/layers';

import type {PickingInfo} from '@deck.gl/core';



type BartStation = {

  name: string;

  entries: number;

  exits: number;

  coordinates: [longitude: number, latitude: number];

};



function App() {

  const layer = new ScatterplotLayer<BartStation>({

    id: 'ScatterplotLayer',

    data: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/bart-stations.json',

    

    stroked: true,

    getPosition: (d: BartStation) => d.coordinates,

    getRadius: (d: BartStation) => Math.sqrt(d.exits),

    getFillColor: [255, 140, 0],

    getLineColor: [0, 0, 0],

    getLineWidth: 10,

    radiusScale: 6,

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

npm install @deck.gl/core @deck.gl/layers
```

```
import {ScatterplotLayer} from '@deck.gl/layers';

import type {ScatterplotLayerProps} from '@deck.gl/layers';



new ScatterplotLayer<DataT>(...props: ScatterplotLayerProps<DataT>[]);
```

To use pre-bundled scripts:

```
<script src="https://unpkg.com/deck.gl@^9.0.0/dist.min.js"></script>

<!-- or -->

<script src="https://unpkg.com/@deck.gl/core@^9.0.0/dist.min.js"></script>

<script src="https://unpkg.com/@deck.gl/layers@^9.0.0/dist.min.js"></script>
```

```
new deck.ScatterplotLayer({});
```

## Properties[​](#properties "Direct link to Properties")

Inherits from all [Base Layer](https://deck.gl/docs/api-reference/core/layer.md) properties.

### Render Options[​](#render-options "Direct link to Render Options")

#### `radiusUnits` (string, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square%22)[​](#radiusunits "Direct link to radiusunits")

* Default: `'meters'`

The units of the radius, one of `'meters'`, `'common'`, and `'pixels'`. See [unit system](https://deck.gl/docs/developer-guide/coordinate-systems.md#supported-units).

#### `radiusScale` (number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square%22)[​](#radiusscale "Direct link to radiusscale")

* Default: `1`

A global radius multiplier for all points.

#### `lineWidthUnits` (string, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square%22)[​](#linewidthunits "Direct link to linewidthunits")

* Default: `'meters'`

The units of the line width, one of `'meters'`, `'common'`, and `'pixels'`. See [unit system](https://deck.gl/docs/developer-guide/coordinate-systems.md#supported-units).

#### `lineWidthScale` (number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square%22)[​](#linewidthscale "Direct link to linewidthscale")

* Default: `1`

A global line width multiplier for all points.

#### `stroked` (boolean, optional)[​](#stroked "Direct link to stroked")

* Default: `false`

Draw the outline of points.

#### `filled` (boolean, optional)[​](#filled "Direct link to filled")

* Default: `true`

Draw the filled area of points.

#### `radiusMinPixels` (number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square%22)[​](#radiusminpixels "Direct link to radiusminpixels")

* Default: `0`

The minimum radius in pixels. This prop can be used to prevent the circle from getting too small when zoomed out.

#### `radiusMaxPixels` (number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square%22)[​](#radiusmaxpixels "Direct link to radiusmaxpixels")

* Default: `Number.MAX_SAFE_INTEGER`

The maximum radius in pixels. This prop can be used to prevent the circle from getting too big when zoomed in.

#### `lineWidthMinPixels` (number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square%22)[​](#linewidthminpixels "Direct link to linewidthminpixels")

* Default: `0`

The minimum line width in pixels. This prop can be used to prevent the stroke from getting too thin when zoomed out.

#### `lineWidthMaxPixels` (number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square%22)[​](#linewidthmaxpixels "Direct link to linewidthmaxpixels")

* Default: `Number.MAX_SAFE_INTEGER`

The maximum line width in pixels. This prop can be used to prevent the path from getting too thick when zoomed in.

#### `billboard` (boolean, optional)[​](#billboard "Direct link to billboard")

* Default: `false`

If `true`, rendered circles always face the camera. If `false` circles face up (i.e. are parallel with the ground plane).

#### `antialiasing` (boolean, optional)[​](#antialiasing "Direct link to antialiasing")

* Default: `true`

If `true`, circles are rendered with smoothed edges. If `false`, circles are rendered with rough edges. Antialiasing can cause artifacts on edges of overlapping circles. Also, antialiasing isn't supported in FirstPersonView.

### Data Accessors[​](#data-accessors "Direct link to Data Accessors")

#### `getPosition` ([Accessor\<Position>](https://deck.gl/docs/developer-guide/using-layers.md#accessors), optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square%22)[​](#getposition "Direct link to getposition")

* Default: `object => object.position`

Method called to retrieve the position of each object.

#### `getRadius` ([Accessor\<number>](https://deck.gl/docs/developer-guide/using-layers.md#accessors), optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square%22)[​](#getradius "Direct link to getradius")

* Default: `1`

The radius of each object, in units specified by `radiusUnits` (default meters).

* If a number is provided, it is used as the radius for all objects.
* If a function is provided, it is called on each object to retrieve its radius.

#### `getColor` ([Accessor\<Color>](https://deck.gl/docs/developer-guide/using-layers.md#accessors), optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square%22)[​](#getcolor "Direct link to getcolor")

* Default: `[0, 0, 0, 255]`

The rgba color is in the format of `[r, g, b, [a]]`. Each channel is a number between 0-255 and `a` is 255 if not supplied.

* If an array is provided, it is used as the color for all objects.
* If a function is provided, it is called on each object to retrieve its color.

It will be overridden by `getLineColor` and `getFillColor` if these new accessors are specified.

#### `getFillColor` ([Accessor\<Color>](https://deck.gl/docs/developer-guide/using-layers.md#accessors), optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square%22)[​](#getfillcolor "Direct link to getfillcolor")

* Default: `[0, 0, 0, 255]`

The rgba color is in the format of `[r, g, b, [a]]`. Each channel is a number between 0-255 and `a` is 255 if not supplied.

* If an array is provided, it is used as the filled color for all objects.
* If a function is provided, it is called on each object to retrieve its color.
* If not provided, it falls back to `getColor`.

#### `getLineColor` ([Accessor\<Color>](https://deck.gl/docs/developer-guide/using-layers.md#accessors), optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square%22)[​](#getlinecolor "Direct link to getlinecolor")

* Default: `[0, 0, 0, 255]`

The rgba color is in the format of `[r, g, b, [a]]`. Each channel is a number between 0-255 and `a` is 255 if not supplied.

* If an array is provided, it is used as the outline color for all objects.
* If a function is provided, it is called on each object to retrieve its color.
* If not provided, it falls back to `getColor`.

#### `getLineWidth` ([Accessor\<number>](https://deck.gl/docs/developer-guide/using-layers.md#accessors), optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square%22)[​](#getlinewidth "Direct link to getlinewidth")

* Default: `1`

The width of the outline of each object, in units specified by `lineWidthUnits` (default meters).

* If a number is provided, it is used as the outline width for all objects.
* If a function is provided, it is called on each object to retrieve its outline width.
* If not provided, it falls back to `strokeWidth`.

#### `getPixelOffset` ([Accessor\<number\[2\]>](https://deck.gl/docs/developer-guide/using-layers.md#accessors), optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square%22)[​](#getpixeloffset "Direct link to getpixeloffset")

* Default: `[0, 0]`

Screen space offset relative to the `coordinates` in pixel unit.

* If an array is provided, it is used as the offset for all objects.
* If a function is provided, it is called on each object to retrieve its offset.

## Source[​](#source "Direct link to Source")

[modules/layers/src/scatterplot-layer](https://github.com/visgl/deck.gl/tree/9.4-release/modules/layers/src/scatterplot-layer)
