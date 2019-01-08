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

##### `getColor` (Function|Array, optional)

- Default: `[0, 0, 0, 255]`

The rgba color of each object, in `r, g, b, [a]`. Each component is in the 0-255 range.

* If an array is provided, it is used as the color for all objects.
* If a function is provided, it is called on each object to retrieve its color.
