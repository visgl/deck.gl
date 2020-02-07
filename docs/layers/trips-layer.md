<!-- INJECT:"TripsLayerDemo" -->
<p class="badges">
  <img src="https://img.shields.io/badge/@deck.gl/geo--layers-lightgrey.svg?style=flat-square" alt="@deck.gl/geo-layers" />
</p>

# Trips Layer

This layer renders animated paths that represent vehicle trips.


## Installation

To install the dependencies from NPM:

```bash
npm install deck.gl
# or
npm install @deck.gl/core @deck.gl/layers @deck.gl/geo-layers
```

```js
import {TripsLayer} from '@deck.gl/geo-layers';

const App = ({data, viewport}) => {

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
    trailLength: 200,
    currentTime: 100
  });

  return (<DeckGL {...viewport} layers={[layer]} />);
};
```

To use pre-bundled scripts:

```html
<script src="https://unpkg.com/deck.gl@^8.0.0/dist.min.js"></script>
<!-- or -->
<script src="https://unpkg.com/@deck.gl/core@^8.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/layers@^8.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/geo-layers@^8.0.0/dist.min.js"></script>
```

```js
new deck.TripsLayer({});
```


## Properties

Inherits from all [Base Layer](/docs/api-reference/layer.md) and [PathLayer](/docs/layers/path-layer.md) properties, plus the following:

### Render Options

##### `currentTime` (Number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

- Default: `0`

The current time of the frame, i.e. the playhead of the animation.

This value should be in the same units as the timestamps from `getPath`.

##### `trailLength` (Number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

- Default: `120`

How long it takes for a path to completely fade out.

This value should be in the same units as the timestamps from `getPath`.

### Data Accessors

##### `getPath` ([Function](/docs/developer-guide/using-layers.md#accessors), optional)

- Default: `d => d.path`

Called for each data object to retrieve paths.
Returns an array of navigation points on a single path.

See [PathLayer](/docs/layers/path-layer.md) documentation for supported path formats.

##### `getTimestamps` ([Function](/docs/developer-guide/using-layers.md#accessors), optional)

- Default: `d => d.timestamps`

Returns an array of timestamps, one for each navigation point in the geometry returned by `getPath`, representing the time that the point is visited.

Because timestamps are stored as 32-bit floating numbers, raw unix epoch time can not be used. You may test the validity of a timestamp by calling `Math.fround(t)` to check if there would be any loss of precision.

> **<span style="color:red">Legacy API, removing in a future major release:</span>**
>
> If `getTimestamps` is not supplied, each navigation point in the path is interpreted as `[longitude, latitude, timestamp]`, and the paths will always be rendered flat against the ground.


# Source

[modules/geo-layers/src/trips-layer](https://github.com/uber/deck.gl/tree/master/modules/geo-layers/src/trips-layer)
