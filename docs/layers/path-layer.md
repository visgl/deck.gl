# Path Layer

The Path Layer takes in paired latitude and longitude coordinated points and
render them as arcs that links the starting and ending points.

    import {PathLayer} from 'deck.gl';

Inherits from all [Base Layer](/docs/layers/base-layer.md) properties.

## Layer-specific Properties


#### `getPathCount`

default: `object => 1`

Number of paths for an object


#### `getPath` (Function, optional)

- Default: `(object, index) => object.paths[index]`

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


#### `getCoordinate` (Function, optional)

- Default: `(path, index) => path[index]`

Return a coordinate from a path. The coordinate is expected to be
three components. The third component will be set to 0 if not provided.


##### `strokeWidth` (Number, optional)

- Default: `1`

The stroke width used to draw each line.


##### `strokeColor` (Number, optional)

- Default: `[0, 0, 0, 255]`

