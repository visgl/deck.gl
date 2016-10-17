# Sample Layers

Deck.gl provides a number of sample layers intended to illustrate
various ideas and approaches to how layers can be designed.

**Warning**:
The sample layers are not actively supported, and could even have breaking
changes between minor releases of deck.gl.

If a production application wants to use one of these layers, we recommend
copying these layers rather than importing them into to your application to
avoid being affected by changes when updating to new versions of deck.gl.


### ExtrudedChoroplethLayer

A layer that extrudes lines in Choropleth polygons by tesselating them into
long, thin triangles. This provides control over line thickness
while ensuring good line mitering, overcoming WebGL's limitations in this
regard.

**Note:** very sharp angles can generate very long miters and handling of this
case needs more work, but for "modest" angles (e.g. 60 degrees in hexagons)
the results will be good.

**Properties**

* `drawContour` [boolean, default=true] whether to draw a contour
* `strokeColor`: [array, [0, 0, 0]] contour will be draw in this color
* `strokeWidth`: [number, 3] width of line segments
* `fillColor`: [array [128, 128, 128]] fill will be drawn in this color
* `elevation`: [number, 0] choropleth will be drawn at this elevation
* `getColor`: [function, optional] data accessor: get Color for segment

See common deck.gl layer properties below for more information on inherited
props.
