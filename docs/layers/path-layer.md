# Path Layer

The Path Layer takes in lists of coordinate points and
renders them as extruded lines with mitering.

  <div align="center">
    <img height="300" src="/demo/src/static/images/demo-thumb-path.jpg" />
  </div>

    import {PathLayer} from 'deck.gl';

## Properties

Inherits from all [Base Layer](/docs/layers/base-layer.md) properties.

##### `widthScale` (Number, optional)

- Default: `1`

The path width multiplier that multiplied to all paths.

##### `widthMinPixels` (Number, optional)

- Default: `0`

The minimum path width in pixels.

##### `widthMaxPixels` (Number, optional)

- Default: Number.MAX_SAFE_INTEGER

The maximum path width in pixels.

##### `rounded` (Boolean, optional)

- Default: `false`

Type of joint. If `true`, draw round joints. Otherwise draw miter joints.

##### `miterLimit` (Number, optional)

- Default: `4`

The maximum extent of a joint in ratio to the stroke width.
Only works if `rounded` is `false`.

##### `fp64` (Boolean, optional)

- Default: `false`

Whether the layer should be rendered in high-precision 64-bit mode

## Accessors

#### `getPath` (Function, optional)

- Default: `(object, index) => object.paths`

Returns the specified path for the object.

A path is an array of coordinates.

#### `getColor` (Function, optional)

Returns an array of color

- Default `(object, index) => object.color || [0, 0, 0, 255]`

Method called to determine the rgba color of the source.

If the color alpha (the fourth component) is not provided,
`alpha` will be set to `255`.

#### `getWidth` (Function, optional)

- Default: `(object, index) => object.width || 1`

Method called to determine the width to draw each path with.
Unit is meters.
