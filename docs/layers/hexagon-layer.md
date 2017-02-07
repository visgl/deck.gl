# HexagonLayer

The HexagonLayer is a variation of grid layer. it is intended to render tessellatied hexagons,
and also enables height in 3d. The HexagonLayer takes in the vertices of a primitive
hexagon as [[longitude, latitude]], and an array of hexagon centroid as [longitude, latitude].
It renders each hexagon based on color, opacity and elevation.

<div align="center">
  <img height="300" src="/demo/src/static/images/hexagon-layer.png" />
</div>

    import {HexagonLayer} from 'deck.gl';

Inherits from all [Base Layer](/docs/layers/base-layer.md) properties.

## Layer-specific Properties

##### `hexagonVertices` (Array[[lon, lat]], required)

Primitive hexagon vertices as an array of six [lon, lat] pairs,
in either clockwise or counter clouckwise direction.

##### `radiusScale` (Number, optional)

- Default: `1`

Hexagon radius multiplier, between 0 - 1. It defines the gap between each hexagon.
when set to 1, all hexagons will be closely placed to each other.

##### `extruded` (Boolean, optional)

- Default: `true`

Whether to extrude hexagon. If se to false, all hexagons will be set to flat.

#### `invisibleColor` (Number[3], optional)

- Default: `[0, 0, 0]`

To make one hexagon invisible, set its color to equal to invisibleColor

#### `getCentroid` (Function, optional)

- Default: `object => object.centroid`

Method called to retrieve the centroid of each hexagon. Centoid should be set to [lon, lat]

#### `getColor` (Function, optional)

- Default: `object => object.color`

Method called to retrieve the color of each object. Color should be set to [r, g, b]
with each number between 0 -255

#### `getAlpha` (Function, optional)

- Default: `object => 255`

Method called to retrieve the alpha of each object. Color should be set between 0 to 255

#### `getElevation` (Function, optional)

- Default: `object => object.elevation`

Method called to retrieve the elevation of each object. 1 unit approximate to 100 meters.
