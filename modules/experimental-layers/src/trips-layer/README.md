# Trips Layer

This layer renders animated paths that represent vehicle trips.

    import TripsLayer from './trips-layer';

Inherits from all [Base Layer](/docs/layers/base-layer.md) properties.

##### `getPath` (Function, optional)

- Default: `d => d.path`

Called for each data object to retreive paths.
Returns an array of navigation points on a single path.
Each navigation point is defined as an array of three numbers: `[longitude, latitude, timestamp]`.
Points should be sorted by timestamp.

##### `getColor` (Function, optional)

- Default: `d => d.color`

Called for each data object to retreive stroke colors.
Returns an array in the form of `[r, g, b]`.

##### `currentTime` (Number, optional)

- Default: `0`

The timestamp that represents the current time of the frame.
This value is used with the timestamps from `getPath` to determine where the vehicle positions are.

##### `trailLength` (Number, optional)

- Default: `120`

How long it takes for a path to completely fade out.
