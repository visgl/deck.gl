# RFC: GPU Acceleration in GridLayer

* **Authors**: Ravi Akkenapally
* **Date**: May 2019
* **Status**: **Draft**


## Abstract

GPU accelerated aggregation is currently available in `ScreenGridLayer` and `ContourLayer`. In 6.3 release, `GPUAggregator` is enhanced to support aggregation of multiple weights required for `GridLayer`. This RFC proposes adding GPU accelerated aggregation to `GridLayer`.


## Fallback cases

There are several features of `GridLayer` that can't be supported by GPU Aggregation.

* `Lower and higher Percentile` : When these props are set to a non zero value, grid cells are sorted based on their aggregated values and some of the begining and ending cells are ignored (not rendered) based on specified percentile value. On GPU, sorting is not possible.

* `Aggregation operation` : Any aggregation other than `Min`, `Max`, `SUM` or `MEAN` is not supported on GPU.

* `Picking` : When aggregation is performed on CPU, each cell can point to an array of objects that fall into the cell. And when a cell is picked, `GridLayer` can provide this array of objects. But on GPU picking information will be limited to `aggregated value` of the cell and `domain value` (min/max value of all aggregated cells).

* `Custom Color/Elevation calculations` : `GridLayer` has accessor props `getColorValue` and `getElevationValue`, which take an array of all points fall into a grid cell and calculate the `color` and `elevation` of that cell. Not all custom implementation of these accessors will be supported, but most common usecases will be supported. More details below.

* `WebGL` : GPU Aggregaiton is only supported when using `WebGL2` context, when using `WebGL` context we fallback to CPU Aggregation.


## Color and Elevation Accessors

`GridLayer`'s `getColor` and `getElevation` perform two things. 1. Specify which field in original data set to use as weight and 2. aggregation operation. To support GPU Aggregation, these accessor props need to be split into two new props.

    1.`getColorWeight/getElevationWeight`: specifies weight field of each data point.
    2.`colorAggregation/elevationAggregation`:  SUM, MIN, MAX or MEAN

So in addition to `getColor` and `getElevation` props, we will add `getColorWeight`, `getElevationWeight`, `colorAggregation` and `elevationAggregation`. For any custom aggregations, we will exclusively specify existing props, `getColor/ElevationValue` and fallback to CPU Aggregation. If GPU Aggregation is required users must specify new props.


## Changes to GridLayer

Existing `GridLayer` will be renamed to `CPUGridLayer` and a new composite layer replaces `GridLayer`. This new composite layer, based on props and user settings, will either construct `CPUGridLayer` or `GPUGridLayer`.
