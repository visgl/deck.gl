# Path Layer

The Path Layer takes in paired latitude and longitude coordinated points and
render them as arcs that links the starting and ending points.

    import {PathLayer} from 'deck.gl';

Inherits from all [Base Layer](/docs/layers/base-layer.md) properties.

## Layer-specific Properties


#### `getPath` (Function, optional)

- Default: `(object, index) => object.paths`

Returns the specified path for the object.

A path is an array of coordinates.


#### `getColor` (Function, optional)

Returns an array of color

- Default `(object, index) => object.color`

Method called to determine the rgba color of the source.

If the method does not return a value for the given object,
fallback to `strokeColor`.

If the color alpha (the fourth component) is not provided,
`alpha` will be set to `255`.


#### `getWidth` (Function, optional)

- Default: `(object, index) => object.width`

Return a width multiplier from each object.


##### `strokeWidth` (Number, optional)

- Default: `1`

The stroke width used to draw each line. Unit is meters.

##### `strokeMinPixels` (Number, optional)

- Default: `0`

The minimum stroke size in pixels.


##### `strokeMaxPixels` (Number, optional)

- Default: `None`

The maximum stroke size in pixels.


##### `miterLimit` (Number, optional)

- Default: `4`

The maximum extent of the join as a ratio to the stroke-width.


##### `strokeColor` (Number, optional)

- Default: `[0, 0, 0, 255]`

