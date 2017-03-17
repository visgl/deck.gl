
# Point Cloud Layer

The Point Cloud Layer takes in points with 3d positions, normals and colors
and renders them as spheres with a certain radius.

  <div align="center">
    <img height="300" src="/demo/src/static/images/demo-thumb-point-cloud.jpg" />
  </div>

    import {PointCloudLayer} from 'deck.gl';

## Properties

Inherits from all [Base Layer](/docs/layers/base-layer.md) properties.

##### `radiusPixels` (Number, optional)

- Default: `10`

Global radius of all points.

##### `fp64` (Boolean, optional)

- Default: `false`

Whether the layer should be rendered in high-precision 64-bit mode
##### `lightSettings` (Object, optional) **EXPERIMENTAL**

This is an object that contains light settings for the point cloud.
Be aware that this prop will likely be changed in a future version of deck.gl.

## Accessors

##### `getPosition` (Function, optional)

- Default: `object => object.position`

Method called to retrieve the position of each object.

##### `getNormal` (Function, optional)

- Default: `object => object.normal`

Method called to retrieve the normal of each object.

##### `getColor` (Function, optional)

- Default: `object => object.color`

Method called to retrieve the rgba color of each object.
* If the alpha parameter is not provided, it will be set to `255`.
* If the method does not return a value for the given object, fallback to
`[0, 0, 0, 255]`.
