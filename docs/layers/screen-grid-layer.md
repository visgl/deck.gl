## ScreenGridLayer

The ScreenGridLayer takes in an array of latitude and longitude
coordinated points, aggregates them into histogram bins and
renders as a grid.

Note: The aggregation is done in screen space, so the data prop
needs to be reaggregated by the layer whenever the map is zoomed or panned.
This means that this layer is best used with small data set, however the
visuals when used with the right data set can be quite effective.


**Layer-specific Parameters**

* `data` (array, required) array of objects: [{ position, color }, ...]
* `unitWidth` [number, optional, default=100] unit width of the bins
* `unitHeight` [number, optional, default=100] unit height of the bins
