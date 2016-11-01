# Line Layer

The Line Layer takes in paired latitude and longitude coordinated points and
render them as arcs that links the starting and ending points.

Inherits from all [Base Layer properties](/docs/layers/base-layer.md).

    import {LineLayer} from 'deck.gl';

## Layer-specific Properties

##### `strokeWidth` (Number, optional)

- Default: `9`

The stroke width used to draw each line.

##### `getSourcePosition` (Function, optional)

- Default: `object => object.sourcePosition`

Method called to retrieve the source position of each object.

##### `getTargetPosition` (Function, optional)

- Default: `object => object.targetPosition`

Method called to retrieve the target position of each object.

##### `getColor` (Function, optional)

- Default: `object => object.color`

Method called to determine the color of the source.

If the method does not return a value for the given object, fallback to `[0, 0, 255]`.
