
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
