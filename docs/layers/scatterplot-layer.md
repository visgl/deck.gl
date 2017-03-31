<!-- INJECT:"ScatterplotLayerDemo" -->

<p class="badges">
  <img src="https://img.shields.io/badge/64--bit-support-blue.svg?style=flat-square" alt="64-bit" />
</p>

# Scatterplot Layer

The Scatterplot Layer takes in paired latitude and longitude coordinated
points and renders them as circles with a certain radius.

    import {ScatterplotLayer} from 'deck.gl';

## Properties

Inherits from all [Base Layer](/docs/api-reference/base-layer.md) properties.

##### `radiusScale` (Number, optional)

- Default: `1`

Global radius across all markers.

##### `outline` (Boolean, optional)

- Default: `false`

Only draw outline of dot.

##### `strokeWidth` (Number, optional)

- Default: `1`

Width of the outline, in meters. Requires `outline` to be `true`.

##### `radiusMinPixels` (Number, optional)

- Default: `0`

The minimum radius in pixels.


##### `radiusMaxPixels` (Number, optional)

- Default: `Number.MAX_SAFE_INTEGER`

The maximum radius in pixels.


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
