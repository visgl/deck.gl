<!-- INJECT:"TripsLayerDemo" -->
<p class="badges">
  <img src="https://img.shields.io/badge/@deck.gl/geo--layers-lightgrey.svg?style=flat-square" alt="@deck.gl/geo-layers" />
  <img src="https://img.shields.io/badge/fp64-yes-blue.svg?style=flat-square" alt="64-bit" />
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
    // deduct start timestamp from each data point to avoid overflow
    getPath: d => d.waypoints.map(p => [p.coordinates[0], p.coordinates[1], p.timestamp - 1554772579000]),
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
<script src="https://unpkg.com/@deck.gl@~7.0.0/dist.min.js"></script>
<!-- or -->
<script src="https://unpkg.com/@deck.gl/core@~7.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/layers@~7.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/geo-layers@~7.0.0/dist.min.js"></script>
```

```js
new deck.TripsLayer({});
```


## Properties

Inherits from all [Base Layer](/docs/api-reference/layer.md) and [PathLayer](/docs/layers/path-layer.md) properties, plus the following:

### Render Options

##### `currentTime` (Number, optional)

- Default: `0`

The current time of the frame, i.e. the playhead of the animation.

This value should be in the same units as the timestamps from `getPath`.

##### `trailLength` (Number, optional)

- Default: `120`

How long it takes for a path to completely fade out.

This value should be in the same units as the timestamps from `getPath`.

### Data Accessors

##### `getPath` ([Function](/docs/developer-guide/using-layers.md#accessors), optional)

- Default: `d => d.path`

Called for each data object to retreive paths.
Returns an array of navigation points on a single path.
Each navigation point is defined as an array of three numbers: `[longitude, latitude, timestamp]`.
Points should be sorted by `timestamp`. 
Because `timestamp` is represented as 32-bits floating number, raw unix epoch can not be used. You may test the validity of a timestamp by calling Math.fround(t) to check if there would be any loss of precision.

# Source

[modules/geo-layers/src/trips-layer](https://github.com/uber/deck.gl/tree/7.0-release/modules/geo-layers/src/trips-layer)
