# RFC: Heatmap Layer

* **Authors**: Ravi Akkenapally
* **Date**: June 2019
* **Status**: **Draft**


## Abstract

`deck.gl` provides several aggregation layers, `GridLayer`, `HexagonLayer` and `ContourLayers`. All these layers work by binning given random data set into cells or regions. These techniques avoid over plotting of individual samples and help visualize how data is distributed among the regions. But these visualization techniques are not suitable to understand spatial distribution of data. Depending on how boundaries are defined, visuals can change drastically between boundaries and hence they lack visualization of `continuity` and `pattern`. [heat map](https://en.wikipedia.org/wiki/Heat_map) provides solution by smoothening these boundaries. This RFC proposes a new `HeatmapLayer` to render heat maps.


## Approach

Grid aggregation is first used to aggregate data into small grid cells and generate a `Texture` object where each pixel represents a cell. Then using [KDE](https://en.wikipedia.org/wiki/Kernel_(statistics%29#Kernel_functions_in_common_use) function data is smoothed. Finally we render a textured rectangle covering the bounding box of input data samples using Texture produced above to produce the heat map. Following section describe these steps with more details.


## Implementation

### Possible Layer props

* `data`

* `longitudeRange` (Array, optional)
  Range, [minLng, maxLng], of longitude values, any data sample outside of this range is excluded.

* `lattiudeRange` (Array, optional)
  Range, [minLat, maxLat], of lattitude values, any data sample outside of this range is excluded.

* `getWeight` (Accessor, default: `x => 1`)
  Defines weight of sample point.

* `colorRange` (Array, default: [[0, 25, 0, 25], [0, 255, 0, 255]])
  Array with two or six color values. When two colors are provided, linear scaling is used, when 6 colors are provided, quantize scaling is used, to determine each pixel color in the heat map.

* `radiusPixels` (Number, default: 30, min: 1)
  Number defines the radius of the pixel circle to which each pixel's weight is distributed using KDE function.

* `radiusScaleFactor` (Number, default: 1)
  Radius used in KDE function changes with zoom, decreases when zoomed in (reveals details of hot spot) and increases when zoomed out (smoothens the hotspots), `radiusScaleFactor` can be used to control this change.

* `resolution` (Number, default: 1, range: [0, 1])
  This controls the aggregation cell size. When cell size is small, heat map is more detailed as more number of pixels are used, but it comes at higher performance cost as it requires processing lot more pixels. Vice versa, bigger the cell size, heat map is more smoothened but is faster.


### Aggregation

A bounding box is first computed for given data samples, padding is added to this bounding box to avoid clipping of heat spots. Based on cell size (usually very small) and bounding box, texture size is calculated. A float texture with this size is created and set as render target. Data is aggregated into this texture using deck.gl `GPUGridAggregator`, which uses additive blending for aggregation.


### KDE (Kernel Density Estimation)

A [KDE function](https://en.wikipedia.org/wiki/Kernel_(statistics%29#Kernel_functions_in_common_use) is used to distribute the value of each cell to its neighbors. For each pixel with a non zero weight in the texture, a point is rendered with `gl_PointSize` that is set based user provided `radius`. Additive blending is setup and KDE is run for all the pixels in the texture. Resulting texture contains smoothened weight values. We use luma.gl `Transform` class to run the KDE function and to generate the min and max weight values from the heat map texture.


#### Performance (Needs investigation)

Each pixel (cell) containing a non zero weight will invoke multiple number of fragment shader executions. (One invocation for each pixel that is inside the circle defined by `radius`). Based on `radius` and `resolution` (defines cell size) number of fragment invocations might be too high and could result in a poor UI experience. Remember KDE function is executed, each time zoom is changed or any other relevant prop. Instead of using traditional KDE function (a.k.a. radial function) we can also use KDE convolution kernel (results and speed change needs to be investigated).


### Rendering

The rectangle representing the Bounding box calculated in `Aggregation` step is rendered with , `heatmap` texture bound for texture sampling. For each pixel, we sample the `heatmap` texture to get the weight. We use `LINEAR` texture filtering that will further help smoothen the weight values. Weight of the pixel and user provided `color` value is used to compute the pixels final color.
