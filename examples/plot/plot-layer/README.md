# Plot Layer

This layer plots a math equation in 3d space.
Each sample point on the 3d surface is represented by `x, y, z` values and color.
It can also render axes and labels around the surface. (requires `d3-scale` module)

    import PlotLayer from './plot-layer';

Inherits from all [Base Layer](/docs/layers/base-layer.md) properties.


##### `getPosition` (Function, optional)

- Default: `(u, v) => [0, 0, 0]`

Called to get the `[x, y, z]` value from a `(u, v)` pair.

Arguments:
- `u` (Number) - a value between `[0, 1]`
- `v` (Number) - a value between `[0, 1]`

##### `getColor` (Function, optional)

- Default: `(x, y, z) => [0, 0, 0, 255]`

Called for each `(x, y, z)` triplet to retreive surface color.
Returns an array in the form of `[r, g, b, a]`.
If the alpha component is not supplied, it is default to `255`.

##### `getScale` (Function, optional)

- Default: `({axis, min, max}) => d3.scaleLinear().domain([min, max]).range([min, max])`

Called for each axis to retreive a [d3 scale](https://github.com/d3/d3-scale/blob/master/README.md).
Default to identity.

Arguments:
- `params` (Object)
  + `params.axis` (String) - one of `x` `y` `z`
  + `params.min` (Number) - lower bounds of the input
  + `params.max` (Number) - upper bounds of the input

##### `uCount` (Number, optional)

- Default: `100`

Number of points to sample `u` in the `[0, 1]` range.

##### `vCount` (Number, optional)

- Default: `100`

Number of points to sample `v` in the `[0, 1]` range.


##### `lightStrength` (Number, optional)

- Default: `0.1`

Intensity of the front-lit effect for the 3d surface.

##### `drawAxes` (Bool, optional)

- Default: `true`

Whether to draw axis grids and labels.

##### `fontSize` (Number, optional)

- Default: `12`

Font size of the labels.

##### `ticksCount` (Number, optional)

- Default: `6`

Number of ticks on each axis.
For details, see [d3.scale.ticks](https://github.com/d3/d3-axis/blob/master/README.md#axis_ticks).


##### `formatTick` (Function, optional)

- Default: `(value, axis) => value.toFixed(2)`

Format a tick value to text string.

Parameters:
- `value` (Number) - tick value
- `axis` (String) - one of `x` `y` `z`

##### `axesPadding` (Number, optional)

- Default: `0`

Amount that grids should setback from the bounding box. Relative to the size of the bounding box.

##### `axesColor` (Array, optional)

- Default: `[0, 0, 0, 255]`

Color to draw the grids with, in `[r, g, b, a]`.

##### `axesTitles` (Array, optional)

- Default: `['x', 'z', 'y']`

Strings to draw next to each axis as their titles, note that the second element is the axis that points upwards.