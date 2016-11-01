# Scatterplot Layer

The Scatterplot Layer takes in paride latitude and longitude coordinated points and render them as circles with a certain radius.

Inherits from all [Base Layer properties](/docs/layers/base-layer.md).

    import {ScatterplotLayer} from 'deck.gl';

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

Method called to retrieve the color of each object.

Fallback to `[255, 0, 255]` if the object doesn't have a color property
