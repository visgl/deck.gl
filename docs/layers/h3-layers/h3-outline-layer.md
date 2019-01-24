# H3OutlineLayer (Experimental)

A layer that extrudes takes a list of hexagons and draws polygon(s) around
the outline of any hexagon clusters.

## Properties

See common deck.gl layer properties below for more information on inherited
props.

* `drawContour` [boolean, default=true] whether to draw a contour
* `strokeColor`: [array, [0, 0, 0]] contour will be draw in this color
* `strokeWidth`: [number, 3] width of line segments
* `fillColor`: [array [128, 128, 128]] fill will be drawn in this color
* `elevation`: [number, 0] choropleth will be drawn at this elevation
* `getColor`: [function, optional] data accessor: get Color for segment

## Accessors

* `getHexagonId` [function, optional] data accessor: h3 hexagon id
