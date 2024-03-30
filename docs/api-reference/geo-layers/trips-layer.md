# TripsLayer

import {TripsLayerDemo} from '@site/src/doc-demos/geo-layers';

<TripsLayerDemo />

The `TripsLayer` renders animated paths that represent vehicle trips.

```js
import {TripsLayer} from '@deck.gl/geo-layers';

function App({data, viewState}) {
  /**
   * Data format:
   * [
   *   {
   *     waypoints: [
   *      {coordinates: [-122.3907988, 37.7664413], timestamp: 1554772579000}
   *      {coordinates: [-122.3908298,37.7667706], timestamp: 1554772579010}
   *       ...,
   *      {coordinates: [-122.4485672, 37.8040182], timestamp: 1554772580200}
   *     ]
   *   }
   * ]
   */
  const layer = new TripsLayer({
    id: 'trips-layer',
    data,
    getPath: d => d.waypoints.map(p => p.coordinates),
    // deduct start timestamp from each data point to avoid overflow
    getTimestamps: d => d.waypoints.map(p => p.timestamp - 1554772579000),
    getColor: [253, 128, 93],
    opacity: 0.8,
    widthMinPixels: 5,
    rounded: true,
    fadeTrail: true,
    trailLength: 200,
    currentTime: 100
  });

  return <DeckGL viewState={viewState} layers={[layer]} />;
}
```

## Installation

To install the dependencies from NPM:

```bash
npm install deck.gl
# or
npm install @deck.gl/core @deck.gl/layers @deck.gl/geo-layers
```

```js
import {TripsLayer} from '@deck.gl/geo-layers';
new TripsLayer({});
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

##### `currentTime` (number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#currenttime}

- Default: `0`

The current time of the frame, i.e. the playhead of the animation.

This value should be in the same units as the timestamps from `getPath`.

##### `fadeTrail` (boolean, optional) {#fadetrail}

- Default: `true`

Whether or not the path fades out.

If `false`, `trailLength` has no effect.

##### `trailLength` (number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#traillength}

- Default: `120`

How long it takes for a path to completely fade out.

This value should be in the same units as the timestamps from `getPath`.

### Data Accessors

##### `getPath` ([Accessor&lt;PathGeometry&gt;](../../developer-guide/using-layers.md#accessors), optional) {#getpath}

- Default: `d => d.path`

Called for each data object to retrieve paths.
Returns an array of navigation points on a single path.

See [PathLayer](../layers/path-layer.md) documentation for supported path formats.

##### `getTimestamps` ([Accessor&lt;number[]&gt;](../../developer-guide/using-layers.md#accessors), optional) {#gettimestamps}

- Default: `d => d.timestamps`

Returns an array of timestamps, one for each navigation point in the geometry returned by `getPath`, representing the time that the point is visited.

Because timestamps are stored as 32-bit floating numbers, raw unix epoch time can not be used. You may test the validity of a timestamp by calling `Math.fround(t)` to check if there would be any loss of precision.

> **<span style={{color:'red'}}>Legacy API, removing in a future major release:</span>**
>
> If `getTimestamps` is not supplied, each navigation point in the path is interpreted as `[longitude, latitude, timestamp]`, and the paths will always be rendered flat against the ground.


# Source

[modules/geo-layers/src/trips-layer](https://github.com/visgl/deck.gl/tree/master/modules/geo-layers/src/trips-layer)
