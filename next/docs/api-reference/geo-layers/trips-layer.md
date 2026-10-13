# TripsLayer

<!-- -->

Edit on Codepen

The `TripsLayer` renders animated paths that represent vehicle trips.

<!-- -->

* JavaScript
* TypeScript
* React

```
import {Deck} from '@deck.gl/core';

import {TripsLayer} from '@deck.gl/geo-layers';



const layer = new TripsLayer({

  id: 'TripsLayer',

  data: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/sf.trips.json',

  

  getPath: d => d.waypoints.map(p => p.coordinates),

  // Timestamp is stored as float32, do not return a long int as it will cause precision loss

  getTimestamps: d => d.waypoints.map(p => p.timestamp - 1554772579000),

  getColor: [253, 128, 93],

  currentTime: 500,

  trailLength: 600,

  capRounded: true,

  jointRounded: true,

  widthMinPixels: 8

});



new Deck({

  initialViewState: {

    longitude: -122.4,

    latitude: 37.74,

    zoom: 11

  },

  controller: true,

  layers: [layer]

});
```

```
import {Deck} from '@deck.gl/core';

import {TripsLayer} from '@deck.gl/geo-layers';



type DataType = {

  waypoints: {

    coordinates: [longitude: number, latitude: number];

    timestamp: number;

  }[]

};



const layer = new TripsLayer<DataType>({

  id: 'TripsLayer',

  data: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/sf.trips.json',

  

  getPath: (d: DataType) => d.waypoints.map(p => p.coordinates),

  // Timestamp is stored as float32, do not return a long int as it will cause precision loss

  getTimestamps: (d: DataType) => d.waypoints.map(p => p.timestamp - 1554772579000),

  getColor: [253, 128, 93],

  currentTime: 500,

  trailLength: 600,

  capRounded: true,

  jointRounded: true,

  widthMinPixels: 8

});



new Deck({

  initialViewState: {

    longitude: -122.4,

    latitude: 37.74,

    zoom: 11

  },

  controller: true,

  layers: [layer]

});
```

```
import React from 'react';

import {DeckGL} from '@deck.gl/react';

import {TripsLayer} from '@deck.gl/geo-layers';



type DataType = {

  waypoints: {

    coordinates: [longitude: number, latitude: number];

    timestamp: number;

  }[]

};



function App() {

  const layer = new TripsLayer<DataType>({

    id: 'TripsLayer',

    data: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/sf.trips.json',

    

    getPath: (d: DataType) => d.waypoints.map(p => p.coordinates),

    // Timestamp is stored as float32, do not return a long int as it will cause precision loss

    getTimestamps: (d: DataType) => d.waypoints.map(p => p.timestamp - 1554772579000),

    getColor: [253, 128, 93],

    currentTime: 500,

    trailLength: 600,

    capRounded: true,

    jointRounded: true,

    widthMinPixels: 8

  });



  return <DeckGL

    initialViewState={{

      longitude: -122.4,

      latitude: 37.74,

      zoom: 11

    }}

    controller

    layers={[layer]}

  />;

}
```

## Installation[​](#installation "Direct link to Installation")

To install the dependencies from NPM:

```
npm install deck.gl

# or

npm install @deck.gl/core @deck.gl/layers @deck.gl/geo-layers
```

```
import {TripsLayer} from '@deck.gl/geo-layers';

import type {TripsLayerProps} from '@deck.gl/geo-layers';



new TripsLayer<DataT>(...props: TripsLayerProps<DataT>[]);
```

To use pre-bundled scripts:

```
<script src="https://unpkg.com/deck.gl@^9.0.0/dist.min.js"></script>

<!-- or -->

<script src="https://unpkg.com/@deck.gl/core@^9.0.0/dist.min.js"></script>

<script src="https://unpkg.com/@deck.gl/layers@^9.0.0/dist.min.js"></script>

<script src="https://unpkg.com/@deck.gl/geo-layers@^9.0.0/dist.min.js"></script>
```

```
new deck.TripsLayer({});
```

## Properties[​](#properties "Direct link to Properties")

Inherits from all [Base Layer](https://deck.gl/next/docs/api-reference/core/layer.md) and [PathLayer](https://deck.gl/next/docs/api-reference/layers/path-layer.md) properties, plus the following:

### Render Options[​](#render-options "Direct link to Render Options")

#### `currentTime` (number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square%22)[​](#currenttime "Direct link to currenttime")

* Default: `0`

The current time of the frame, i.e. the playhead of the animation.

This value should be in the same units as the timestamps from `getPath`.

#### `fadeTrail` (boolean, optional)[​](#fadetrail "Direct link to fadetrail")

* Default: `true`

Whether or not the path fades out.

If `false`, `trailLength` has no effect.

#### `trailLength` (number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square%22)[​](#traillength "Direct link to traillength")

* Default: `120`

How long it takes for a path to completely fade out.

This value should be in the same units as the timestamps from `getPath`.

### Data Accessors[​](#data-accessors "Direct link to Data Accessors")

#### `getPath` ([Accessor\<PathGeometry>](https://deck.gl/next/docs/developer-guide/using-layers.md#accessors), optional)[​](#getpath "Direct link to getpath")

* Default: `d => d.path`

Called for each data object to retrieve paths. Returns an array of navigation points on a single path.

See [PathLayer](https://deck.gl/next/docs/api-reference/layers/path-layer.md) documentation for supported path formats.

#### `getTimestamps` ([Accessor\<number\[\]>](https://deck.gl/next/docs/developer-guide/using-layers.md#accessors), optional)[​](#gettimestamps "Direct link to gettimestamps")

* Default: `d => d.timestamps`

Returns an array of timestamps, one for each navigation point in the geometry returned by `getPath`, representing the time that the point is visited.

Because timestamps are stored as 32-bit floating numbers, raw unix epoch time can not be used. You may test the validity of a timestamp by calling `Math.fround(t)` to check if there would be any loss of precision.

## Remarks[​](#remarks "Direct link to Remarks")

### Using with GlobeView[​](#using-with-globeview "Direct link to Using with GlobeView")

When using this layer with [GlobeView](https://deck.gl/next/docs/api-reference/core/globe-view.md) or MapLibre's globe projection, trails may be invisible when viewed from certain angles because `GlobeView` enables back-face culling by default. To ensure trails are visible from both sides, set:

```
new TripsLayer({

  // ...other props

  parameters: {cullMode: 'none'}

});
```

# Source

[modules/geo-layers/src/trips-layer](https://github.com/visgl/deck.gl/tree/master/modules/geo-layers/src/trips-layer)
