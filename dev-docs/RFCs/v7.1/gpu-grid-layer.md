# RFC: GPU Acceleration in GridLayer

* **Authors**: Ravi Akkenapally
* **Date**: May 2019
* **Status**: **Implemented**


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

`GridLayer`'s `getColor` and `getElevation` perform two things. 1. Specify which field in original data set to use as weight and 2. aggregation operation. To support GPU Aggregation weight and operation have to be split, and introduce two new props `colorAggregation` and `elevationAggregation`. Each of these props is an object with following fields :

    * `operation` (`Enum`): Defines type of aggregation , which could be SUM, MIN, MAX or MEAN.
    * `weight` (`Number`, `String` or `Function`): Defines weight of each individual point. When `Number` is specified, that value is used as weight, when `String` is specified, it is used as a key to access weight from data object and when `Funciton` is specified, it is called by passing data object and should return a weight.

    For example: `colorAggregation: {operation: SUM, weight: 'SPACES'};`

So in addition to `getColor` and `getElevation` props, we will add `colorAggregation`, and `weightAggregation` props. For any custom aggregations, we will exclusively specify existing props, `getColor/ElevationValue` and fallback to CPU Aggregation. If GPU Aggregation is required users must specify new props.


## Picking

When aggregation is performed on CPU, each cell can point to an array of objects that fall into the cell. And when a cell is picked, `GridLayer` can provide this array of objects. But when using GPU Aggregation, picking information will be limited to `aggregated value` of the cell and `domain value` (min/max value of all aggregated cells). To provide same information as existing `GridLayer` while using GPU Aggregation, we will perform CPU Aggregation and provide the list. This will introduce a delay but should only happen when user requests picking information programatically. For picking during mouse over, we will provide current cell values by reading GPU aggregation results.


## Changes to GridLayer

Existing `GridLayer` will be renamed to `CPUGridLayer` and a new composite layer replaces `GridLayer`. This new composite layer, based on props and user settings, will either construct `CPUGridLayer` or `GPUGridLayer`.


## Some Aggregation API Ideas that need more investigation


### Lower/Higher Percentile

Intention of this prop is to remove a few "outliers" in the input data that skew things too much. Currently this is done on aggregated values. But we can do the same on non aggregated data, by filtering this on GPU, in that way, we don't need to perform sorting and hence don't need to fallback to CPU.

### Common Aggregation API

Deck.gl has 4 aggregation layers, and 3 layers support GPU Aggregation (including `GridLayer`), and new aggregation layer might be added in future. Following is an idea support consistent API to specify aggregation props.

Aggregation can be defined outside of the layer

```
  const aggregator = new Aggregator({
    aggregations: {
      COUNT_SUM: {aggregation: 'SUM', field: 'count'},
      VALUE_MEAN: {aggregation: 'MEAN', field: 'value'}
    }
  });
```    

and its result can be feed into the one ore more layers.

```
   color: aggregator.COUNT_SUM,
   colorScale: ..., // Some format that can be GLSL compiled
   elevation: aggregator.VALUE_MIN,
   ...
```
