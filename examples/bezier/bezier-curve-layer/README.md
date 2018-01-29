# Bezier Curve Layer

This layer renders bezier curves.

    import BezierCurveLayer from './bezier-curve-layer';

Inherits from all [Base Layer](/docs/layers/base-layer.md) properties.

##### `getCurve` (Function, optional)

- Default: `d => d.path`

Each point is defined as an array of six numbers: `[x1, y1, x2, y2, x3, y3]`.

##### `getColor` (Function, optional)

- Default: `d => d.color`

Called for each data object to retreive stroke colors.
Returns an array in the form of `[r, g, b]`.
