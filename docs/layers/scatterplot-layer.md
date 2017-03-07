<p align="right">
  <img src="https://img.shields.io/badge/64--bit-support-blue.svg?style=flat-square" alt="64-bit" />
</p>

# Scatterplot Layer

The Scatterplot Layer takes in paired latitude and longitude coordinated
points and renders them as circles with a certain radius.

<div align="center">
  <img height="300" src="/demo/src/static/images/demo-thumb-scatterplot.jpg" />
</div>

    import {ScatterplotLayer} from 'deck.gl';

## Properties

Inherits from all [Base Layer](/docs/layers/base-layer.md) properties.

##### `outline` (Boolean, optional)

- Default: `false`

Only draw outline of dot.

##### `radiusScale` (Number, optional)

- Default: `1`

Global radius across all markers.


## Accessors

##### `getPosition` (Function, optional)

- Default: `object => object.position`

Method called to retrieve the position of each object.

##### `getRadius` (Function, optional)

- Default: `object => object.radius`

Method called to retrieve the radius of each object.

##### `getColor` (Function, optional)

- Default: `object => object.color`

Method called to retrieve the rgba color of each object.
* If the alpha parameter is not provided, it will be set to `255`.
* If the method does not return a value for the given object, fallback to
`[0, 0, 0, 255]`.
