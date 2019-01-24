# H3RingLayer (Experimental)

A layer that extrudes draws hexagon k-rings as polygon(s) around the outline of any hexagon clusters.


## Properties

**Note:** See [deck.gl](https://github.com/uber/deck.gl) documentation for more details on the common Layer base class properties.


* `drawContour` [boolean, default=true] whether to draw a contour
* `strokeColor`: [array, [0, 0, 0]] contour will be draw in this color
* `strokeWidth`: [number, 3] width of line segments
* `fillColor`: [array [128, 128, 128]] fill will be drawn in this color
* `elevation`: [number, 0] choropleth will be drawn at this elevation
* `getColor`: [function, optional] data accessor: get Color for segment


## Accessors

* `getHexagonId` [function, optional] data accessor: h3 hexagon id
