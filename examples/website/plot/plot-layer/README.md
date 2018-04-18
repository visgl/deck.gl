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

##### `getXScale` (Function, optional)

- Default: `({min, max}) => d3.scaleLinear()`

Called to retreive a [d3 scale](https://github.com/d3/d3-scale/blob/master/README.md) for x values.
Default to identity.

Arguments:
- `context` (Object)
  + `context.min` (Number) - lower bounds of x values
  + `context.max` (Number) - upper bounds of x values

##### `getYScale` (Function, optional)

- Default: `({min, max}) => d3.scaleLinear()`

Called to retreive a [d3 scale](https://github.com/d3/d3-scale/blob/master/README.md) for y values.
Default to identity.

Arguments:
- `context` (Object)
  + `context.min` (Number) - lower bounds of y values
  + `context.max` (Number) - upper bounds of y values

##### `getZScale` (Function, optional)

- Default: `({min, max}) => d3.scaleLinear()`

Called to retreive a [d3 scale](https://github.com/d3/d3-scale/blob/master/README.md) for z values.
Default to identity.

Arguments:
- `context` (Object)
  + `context.min` (Number) - lower bounds of z values
  + `context.max` (Number) - upper bounds of z values

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

##### `xTicks` (Number | [Number], optional)

- Default: `6`

Either number of ticks on x axis, or an array of tick values.

##### `yTicks` (Number | [Number], optional)

- Default: `6`

Either number of ticks on y axis, or an array of tick values.

##### `zTicks` (Number | [Number], optional)

- Default: `6`

Either number of ticks on z axis, or an array of tick values.


##### `xTickFormat` (Function, optional)

- Default: `value => value.toFixed(2)`

Format a tick value on x axis to text string.

##### `yTickFormat` (Function, optional)

- Default: `value => value.toFixed(2)`

Format a tick value on y axis to text string.

##### `zTickFormat` (Function, optional)

- Default: `value => value.toFixed(2)`

Format a tick value on z axis to text string.

##### `xTitle` (String, optional)

- Default: `x`

X axis title string.

##### `yTitle` (String, optional)

- Default: `y`

Y axis title string.

##### `zTitle` (String, optional)

- Default: `z`

Z axis title string.

##### `axesPadding` (Number, optional)

- Default: `0`

Amount that grids should setback from the bounding box. Relative to the size of the bounding box.

##### `axesColor` (Array, optional)

- Default: `[0, 0, 0, 255]`

Color to draw the grids with, in `[r, g, b, a]`.

##### `axesTitles` (Array, optional)

- Default: `['x', 'z', 'y']`

Strings to draw next to each axis as their titles, note that the second element is the axis that points upwards.