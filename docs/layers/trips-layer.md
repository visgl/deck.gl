# Trips Layer

This layer renders animated paths that represent vehicle trips.

    import TripsLayer from './trips-layer';

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

##### `getPath` (Function, optional)

- Default: `d => d.path`

Called for each data object to retreive paths.
Returns an array of navigation points on a single path.
Each navigation point is defined as an array of three numbers: `[longitude, latitude, timestamp]`.
Points should be sorted by timestamp.


# Source

[modules/geo-layers/src/trips-layer](https://github.com/uber/deck.gl/tree/master/modules/geo-layers/src/trips-layer)
