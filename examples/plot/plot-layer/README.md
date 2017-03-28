# Plot Layer

This layer plots a math equation in 3d space.
Each sample point on the 3d surface is represented by `x, y, z` values and color.
It can also render axes and labels around the surface. (requires `d3-scale` module)

    import PlotLayer from './plot-layer';

Inherits from all [Base Layer](/docs/layers/base-layer.md) properties.


##### `getZ` (Function, optional)

- Default: `(x, y) => 0`

Called to get the `z` value from a `(x, y)` pair.

##### `getColor` (Function, optional)

- Default: `(x, y, z) => [0, 0, 0, 255]`

Called for each `(x, y, z)` triplet to retreive surface color.
Returns an array in the form of `[r, g, b, a]`.
If the alpha component is not supplied, it is default to `255`.

##### `xMin` (Number, optional)

- Default: `-1`

Lower bound of the `x` range.

##### `xMax` (Number, optional)

- Default: `1`

Upper bound of the `x` range.

##### `yMin` (Number, optional)

- Default: `-1`

Lower bound of the `y` range.

##### `yMax` (Number, optional)

- Default: `1`

Upper bound of the `y` range.

##### `xResolution` (Number, optional)

- Default: `100`

Number of points to sample in the `x` range.

##### `yResolution` (Number, optional)

- Default: `100`

Number of points to sample in the `y` range.

##### `lightStrength` (Number, optional)

- Default: `1`

Intensity of the front-lit effect for the 3d surface.

##### `drawAxes` (Bool, optional)

- Default: `true`

Whether to draw axis grids and labels.

##### `fontSize` (Number, optional)

- Default: `24`

Font size of the labels.

##### `ticksCount` (Number, optional)

- Default: `6`

Number of ticks on each axis.
For details, see [d3.scale.ticks](https://github.com/d3/d3-axis/blob/master/README.md#axis_ticks).

##### `axesOffset` (Number, optional)

- Default: `0`

Amount that grids should setback from the bounding box. Relative to the size of the bounding box.

##### `axesColor` (Array, optional)

- Default: `[0, 0, 0, 255]`

Color to draw the grids with, in `[r, g, b, a]`.
