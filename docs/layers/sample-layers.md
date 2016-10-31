# Sample Layers

Deck.gl provides a number of sample layers intended to illustrate
various ideas and approaches to how layers can be designed.

**Warning**:
The sample layers are not actively supported, and could even have breaking
changes between minor releases of deck.gl.

If a production application wants to use one of these layers, we recommend
copying these layers rather than importing them into to your application to
avoid being affected by changes when updating to new versions of deck.gl.

Inherits from all [Base Layer properties](/docs/layer.md).

### ExtrudedChoroplethLayer

A layer that extrudes lines in Choropleth polygons by tesselating them into
long, thin triangles. This provides control over line thickness
while ensuring good line mitering, overcoming WebGL's limitations in this
regard.

**Note:** Very sharp angles can generate very long miters and handling of this
case needs more work, but for "modest" angles (e.g. 60 degrees in hexagons)
the results will be good.

##### `drawContour` (Boolean, optional)

- Default: `true`

Whether to draw a contour.

##### `opacity` (Number, optional)

- Default: `1`

Change the opacity, from `0` to `1`.

##### `strokeColor`: (Number[3], optional)

- Default: `[0, 0, 0]`

The contour will be draw in this color.

##### `strokeWidth`: (Number, optional)

- Default: `3`

Width of line segments.

##### `fillColor`: (Number[3], optional)

- Default: `[128, 128, 128]`

Fill will be drawn in this color.

##### `elevation`: (Number, optional)

- Default: `0`

Choropleth will be drawn at this elevation.

##### `getColor`: (Function, optional)

Provide a custom method which gets the segment and that needs to return a color.
If it is not defined, simply use the `strokeColor`.
