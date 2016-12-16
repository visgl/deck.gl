# Scatterplot Layer

The Scatterplot Layer takes in paired latitude and longitude coordinated
points and renders them as circles with a certain radius.

<div align="center">
  <img height="300" src="/demo/src/static/images/demo-thumb-scatterplot.jpg" />
</div>

    import {ScatterplotLayer} from 'deck.gl';

Inherits from all [Base Layer](/docs/layers/base-layer.md) properties.

## Layer-specific Properties

##### `strokeWidth` (Number, optional)

- Default: `1`

Width of stroke if drawing outline.

##### `drawOutline` (Boolean, optional)

- Default: `false`

Only draw outline of dot.

##### `radius` (Number, optional)

- Default: `30`

Global radius across all markers.

##### `getPosition` (Function, optional)

- Default: `object => object.position`

Method called to retrieve the position of each object.

##### `getRadius` (Function, optional)

- Default: `object => object.radius`

Method called to retrieve the radius of each object.

##### `getColor` (Function, optional)

- Default: `object => object.color`

Method called to retrieve the rgba color of each object. If the alpha parameter
is not provided, it will be set to `255`.

If the method does not return a value for the given object, fallback to
`[255, 0, 255, 255]`.
