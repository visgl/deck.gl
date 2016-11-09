# Arc Layer

The Arc Layer takes in paired latitude and longitude coordinated points and
render them as arcs that links the starting and ending points.

<div align="center">
  <img height="300" src="/demo/src/static/images/demo-thumb-arc.jpg" />
</div>

    import {ArcLayer} from 'deck.gl';

Inherits from all [Base Layer properties](/docs/layers/base-layer.md).

## Layer-specific Properties

##### `strokeWidth` (Number, optional)

- Default: `1`

The stroke width used to draw each arc.

##### `getSourcePosition` (Function, optional)

- Default: `object => object.sourcePosition`

Method called to retrieve the source position of each object.

##### `getTargetPosition` (Function, optional)

- Default: `object => object.targetPosition`

Method called to retrieve the target position of each object.

##### `getSourceColor` (Function, optional)

- Default: `object => object.color`

Method called to determine the rgba color of the source. If the alpha parameter
is not provided, it will be set to `255`.

If the method does not return a value for the given object, fallback to `[0, 0, 255, 255]`.

##### `getTargetColor` (Function, optional)

- Default `object => object.color`

Method called to determine the rgba color of the source. If the alpha parameter
is not provided, it will be set to `255`.

If the method does not return a value for the given object, fallback to `[0, 0, 255, 255]`.
