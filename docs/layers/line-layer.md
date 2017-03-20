<p align="right">
  <img src="https://img.shields.io/badge/64--bit-support-blue.svg?style=flat-square" alt="64-bit" />
</p>

# Line Layer

The Line Layer renders flat lines joining pairs of source and target points,
specified as latitude/longitude coordinates.

<div align="center">
  <img height="300" src="/demo/src/static/images/demo-thumb-line.jpg" />
</div>

    import {LineLayer} from 'deck.gl';

## Properties

Inherits from all [Base Layer](/docs/layers/base-layer.md) properties.

##### `strokeWidth` (Number, optional)

- Default: `1`

The stroke width used to draw each line. Unit is pixels.

##### `fp64` (Boolean, optional)

- Default: `false`

Whether the layer should be rendered in high-precision 64-bit mode

## Accessors

##### `getSourcePosition` (Function, optional)

- Default: `object => object.sourcePosition`

Method called to retrieve the source position of each object.

##### `getTargetPosition` (Function, optional)

- Default: `object => object.targetPosition`

Method called to retrieve the target position of each object.

##### `getColor` (Function, optional)

- Default: `object => object.color`

Method called to determine the rgba color of the source.
* If the alpha parameter is not provided, it will be set to `255`.
* If the method does not return a value for the given object, fallback to
`[0, 0, 0, 255]`.
