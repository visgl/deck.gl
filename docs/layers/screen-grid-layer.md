## Grid Layer

The Grid Layer takes in an array of latitude and longitude coordinated points,
aggregates them into histogram bins and renders as a grid.

**Layer-specific Parameters**

* `data` (array, required) array of objects: [{ position, color }, ...]
* `unitWidth` [number, optional, default=100] unit width of the bins
* `unitHeight` [number, optional, default=100] unit height of the bins
