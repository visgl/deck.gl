# Core Layers


## Scatterplot Layer

In addition to default layer properties:

* `data` (array, required) array of objects: [{ position, color, radius }, ...]
* `radius` [number, optional, default=10] global radius across all markers


## Choropleth Layer

The Choropleth Layer takes in [GeoJson](http://geojson.org/) formatted data and
renders it as interactive choropleths.

In addition to default layer properties:

* `data` (object, required) input data in GeoJson format
* `drawContour` [bool, optional, default=false] draw choropleth contour if
true, else fill choropleth area
* `onChoroplethHovered` [function, optional] bubbles choropleth properties
when mouse hovering
* `onChoroplethClicked` [function, optional] bubbles choropleth properties
when mouse clicking


## Arc Layer

The Arc Layer takes in paired latitude and longitude coordinated points and
render them as arcs that links the starting and ending points.

**Layer-specific Parameters**

* `data` (array, required) array of objects: [{ position: {x0, y0, x1, y1},
color }, ...]


## Grid Layer

The Grid Layer takes in an array of latitude and longitude coordinated points,
aggregates them into histogram bins and renders as a grid.

**Layer-specific Parameters**

* `data` (array, required) array of objects: [{ position, color }, ...]
* `unitWidth` [number, optional, default=100] unit width of the bins
* `unitHeight` [number, optional, default=100] unit height of the bins


## Hexagon Layer

The Hexagon Layer takes in a list of hexagon objects and renders them as
interactive hexagons.

In addition to default layer properties:

* `data` (array, required) array of hexagon objects: [{ centroid, vertices,
color }, ...]
* `dotRadius` [number, optional, default=10] radius of each hexagon
* `elevation` [number, optional, default=0.02] height scale of hexagons
* `lightingEnabled` [bool, optional, default=false] whether lighting is
enabled
* `onHexagonHovered` [function, optional] bubbles selection index when mouse
hovering
* `onHexagonClicked` [function, optional] bubbles selection index when mouse
clicking
