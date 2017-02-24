<p align="right">
  <img src="https://img.shields.io/badge/extruded-yes-blue.svg?style=flat-square" alt="64-bit" />
</p>

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


## Layer Accessors

#### `getCentroid` (Function, optional)

- Default: `object => object.centroid`

Method called to retrieve the centroid of each hexagon. Centoid should be set to [lon, lat]

#### `getColor` (Function, optional)

- Default: `object => object.color`

Method called to retrieve the color of each object. Color should be set to [r, g, b, a]
with each number between 0 -255

#### `getElevation` (Function, optional)

- Default: `object => object.elevation`

Method called to retrieve the elevation of each object. 1 unit approximate to 100 meters.


## Layer-specific Properties

##### `hexagonVertices` (Array[[lon, lat]], required)

Primitive hexagon vertices as an array of six [lon, lat] pairs,
in either clockwise or counter clouckwise direction.

##### `radiusScale` (Number, optional)

- Default: `1`

Hexagon radius multiplier, between 0 - 1. The radius of hexagon is calculated by 
radiusScale * getRadius(d)

##### `extruded` (Boolean, optional)

- Default: `true`

Whether to extrude hexagon. If se to false, all hexagons will be set to flat.

##### `selectedPickingColor` (Array, optional) **EXPERIMENTAL**

Shader based highlighting of a selected object

##### `lightSettings` (Object, optional) **EXPERIMENTAL**

This is an object that contains light settings for extruded polygons.
Be aware that this prop will likely be changed in a future version of deck.gl.
