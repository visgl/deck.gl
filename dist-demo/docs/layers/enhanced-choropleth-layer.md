# Enhanced Choropleth Layer (64 bit)

A layer that extrudes lines in Choropleth polygons by tesselating them into
long, thin triangles. This provides control over line thickness
while ensuring good line mitering, overcoming WebGL's limitations in this
regard.

**Note:** Very sharp angles can generate very long miters and handling of this
case needs more work, but for "modest" angles (e.g. 60 degrees in hexagons)
the results will be good.

    import {ExtrudedChoroplethLayer64} from 'deck.gl';

Inherits from all [Base Layer](/docs/layers/base-layer.md) properties.

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
