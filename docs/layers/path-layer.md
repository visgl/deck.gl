# Path Layer

The Path Layer takes in paired latitude and longitude coordinated points and
render them as arcs that links the starting and ending points.

  <div align="center">
    <img height="300" src="/demo/src/static/images/demo-thumb-path.jpg" />
  </div>

    import {PathLayer} from 'deck.gl';

Inherits from all [Base Layer](/docs/layers/base-layer.md) properties.

## Layer-specific Properties


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


#### `getStrokeWidth` (Function, optional)

- Default: `(object, index) => object.width || 1`

Method called to determine the width to draw each path with.
Unit is meters.


##### `strokeWidthScale` (Number, optional)

- Default: `1`

The global stroke width multiplier.

##### `strokeMinPixels` (Number, optional)

- Default: `0`

The minimum stroke size in pixels.


##### `strokeMaxPixels` (Number, optional)

- Default: `None`

The maximum stroke size in pixels.

##### `rounded` (Boolean, optional)

- Default: `false`

Type of joint. If `true`, draw round joints. Otherwise draw miter joints.


##### `miterLimit` (Number, optional)

- Default: `4`

The maximum extent of a joint in ratio to the stroke width.
Only works if `rounded` is `false`.
