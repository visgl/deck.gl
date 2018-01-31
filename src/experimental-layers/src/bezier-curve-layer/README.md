# Bezier Curve Layer

This layer renders qudratic bezier curves. Right now it accepts only one control point.

    import BezierCurveLayer from './bezier-curve-layer';

Inherits from all [Base Layer](/docs/layers/base-layer.md) properties.

##### `getSourcePosition` (Function, optional)

- Default: `d => d.sourcePosition`

Each point is defined as an array of three numbers: `[x, y, z]`.

##### `getTargetPosition` (Function, optional)

- Default: `d => d.targetPosition`

Each point is defined as an array of three numbers: `[x, y, z]`.

##### `getControlPoint` (Function, optional)

- Default: `d => d.controlPoint`

Each point is defined as an array of three numbers: `[x, y, z]`.

##### `getColor` (Function, optional)

- Default: `d => d.color`

Called for each data object to retreive stroke colors.
Returns an array in the form of `[r, g, b]`.
