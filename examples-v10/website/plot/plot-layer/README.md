# Plot Layer

This layer plots a math equation in 3d space.
Each sample point on the 3d surface is represented by `x, y, z` values and color.
It can also render axes and labels around the surface. (requires `d3-scale` module)

    import PlotLayer from './plot-layer';

Inherits from all [Base Layer](/docs/layers/base-layer.md) properties.


##### `getPosition` (Function, optional)

- Default: `([u, v]) => [0, 0, 0]`

Called to get the `[x, y, z]` value from a `(u, v)` pair.

Arguments:
- `u` (Number) - a value between `[0, 1]`
- `v` (Number) - a value between `[0, 1]`

##### `getColor` (Function | Color, optional)

- Default: `[128, 128, 128, 255]`

Color of the surface.
If a function is supplied, it is called for each `[x, y, z]` position to retreive surface color.
Returns an array in the form of `[r, g, b, a]`. If the alpha component is not supplied, it is default to `255`.

##### `onAxesChange` (Function, optional)

- Default: `(axes: Axes) => void`

Called to get optional settings for each axis.
Default to identity.

Arguments:
- `axes` (Axes)
  + `x` (Axis)
  + `y` (Axis)
  + `z` (Axis)

Each Axis object contains the following fields:

- `name` (string) - one of `'x'`, `'y'` or `'z'`
- `min` (number) - lower bound of the values on this axis
- `max` (number) - upper bound of the values on this axis

The callback offers an oportunity to populate an axis with some optional fields:

- `title` (string)
- `scale` (Function) - remaps values in the model space
- `ticks` (number[]) - list of values at which to display grid/labels

##### `uCount` (number, optional)

- Default: `100`

Number of points to sample `u` in the `[0, 1]` range.

##### `vCount` (number, optional)

- Default: `100`

Number of points to sample `v` in the `[0, 1]` range.


##### `lightStrength` (number, optional)

- Default: `0.1`

Intensity of the front-lit effect for the 3d surface.

##### `drawAxes` (boolean, optional)

- Default: `true`

Whether to draw axis grids and labels.

##### `fontSize` (Number, optional)

- Default: `12`

Font size of the labels.

##### `tickFormat` (Function, optional)

- Default: `value => value.toFixed(2)`

Format a tick value on an axis to text string.

##### `axesPadding` (number, optional)

- Default: `0`

Amount that grids should setback from the bounding box. Relative to the size of the bounding box.

##### `axesColor` (Color, optional)

- Default: `[0, 0, 0, 255]`

Color to draw the grids with, in `[r, g, b, a]`.
