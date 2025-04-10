# TripsLayer

import {TripsLayerDemo} from '@site/src/doc-demos/geo-layers';

<TripsLayerDemo />

The `TripsLayer` renders animated paths that represent vehicle trips.



import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs groupId="language">
  <TabItem value="js" label="JavaScript">

```js
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

  </TabItem>
  <TabItem value="ts" label="TypeScript">

```ts
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

  </TabItem>
  <TabItem value="react" label="React">

```tsx
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

  </TabItem>
</Tabs>



## Installation

To install the dependencies from NPM:

```bash
npm install deck.gl
# or
npm install @deck.gl/core @deck.gl/layers @deck.gl/geo-layers
```

```ts
import {TripsLayer} from '@deck.gl/geo-layers';
import type {TripsLayerProps} from '@deck.gl/geo-layers';

new TripsLayer<DataT>(...props: TripsLayerProps<DataT>[]);
```

To use pre-bundled scripts:

```html
<script src="https://unpkg.com/deck.gl@^9.0.0/dist.min.js"></script>
<!-- or -->
<script src="https://unpkg.com/@deck.gl/core@^9.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/layers@^9.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/geo-layers@^9.0.0/dist.min.js"></script>
```

```js
new deck.TripsLayer({});
```


## Properties

Inherits from all [Base Layer](../core/layer.md) and [PathLayer](../layers/path-layer.md) properties, plus the following:

### Render Options

#### `currentTime` (number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#currenttime}

- Default: `0`

The current time of the frame, i.e. the playhead of the animation.

This value should be in the same units as the timestamps from `getPath`.

#### `fadeTrail` (boolean, optional) {#fadetrail}

- Default: `true`

Whether or not the path fades out.

If `false`, `trailLength` has no effect.

#### `trailLength` (number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#traillength}

- Default: `120`

How long it takes for a path to completely fade out.

This value should be in the same units as the timestamps from `getPath`.

### Data Accessors

#### `getPath` ([Accessor&lt;PathGeometry&gt;](../../developer-guide/using-layers.md#accessors), optional) {#getpath}

- Default: `d => d.path`

Called for each data object to retrieve paths.
Returns an array of navigation points on a single path.

See [PathLayer](../layers/path-layer.md) documentation for supported path formats.

#### `getTimestamps` ([Accessor&lt;number[]&gt;](../../developer-guide/using-layers.md#accessors), optional) {#gettimestamps}

- Default: `d => d.timestamps`

Returns an array of timestamps, one for each navigation point in the geometry returned by `getPath`, representing the time that the point is visited.

Because timestamps are stored as 32-bit floating numbers, raw unix epoch time can not be used. You may test the validity of a timestamp by calling `Math.fround(t)` to check if there would be any loss of precision.


# Source

[modules/geo-layers/src/trips-layer](https://github.com/visgl/deck.gl/tree/9.1-release/modules/geo-layers/src/trips-layer)
