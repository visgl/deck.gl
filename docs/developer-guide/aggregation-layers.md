# Aggregation Layers

All of the layers in `@deck.gl/aggregation-layers` module perform some sort of data aggregation. All these layers perform aggregation with different parameters (CPU vs GPU, aggregation to rectangular bins vs hexagon bins, world space vs screen space etc).

Following tow abstract composite layers perform most of the common tasks for aggregation with flexibility of customizations. All of the aggregation Layers are subclasses of these Layers.


## AggregationLayer

This in an abstract Layer, subclassed form `CompositeLayer` and all layers in `@deck.gl/aggregation-layers` are subclassed from this Layer.

### Integration with `AttributeManger`

It creates `AttributeManger` and makes it available for its subclasses. Any aggregation layer can add attributes to the `AttributeManager` and retrieve them using `getAttributes` method.

### Checking if aggregation is dirty

Constructor, takes an array of props, `aggregationProps`, and a private method `_isAggregationDirty()` is provided that returns `true` when any of the props in `aggregationProps` are changed. Subclasses can customize this to desired props by providing `aggregatinProps` array.

### Updating shaders

When performing GPU aggregations, `Model` objects used in GPU aggregation should be updated when Layer's `extensions` are changed, this is detected during `updateState` and `_updateShaders` is called, by default this method is empty, but subclasses can override and update the aggregation `Model` objects if needed.


## GridAggregationLayer

This in an abstract layer, subclassed form `AggregationLayer` and provides support for aggregation to grid cells and handles aggregation on both CPU and GPU. `GPUGridLayer`, `ScreenGridLayer` and `ContourLayer` are subclassed from this layer.

### Updating aggregation flags

A layer extending this class must implement `_updateAggregationFlags()` method to set following variables in `state` object :

- `gpuAggregation` : Should be set to `true` if aggregating on `GPU`, `false` otherwise.
- `needsReProjection` : Should be set to `true` if data needs to be reprojected. For example, `ScreenGridLayer` sets this flag to true when `viewport` is changed.
- `dataChanged` : Should be set to true, if data required for aggregation is changed.
- `cellSize` : Should be set to the size of the grid cell.
-  `cellSizeChanged` : Should be set to true when grid cell size is changed.

### Customization of weights

By default, this class aggregates single weight for each grid cell. If a subclass of this layer requires aggregating more than one weight or upload CPU aggregation results to corresponding GPU attribute buffers following private methods can be customized.

- `_updateResults`: When aggregation performed on CPU, aggregation result is in JS Array objects. Subclasses can override this method to consume aggregation data. This method is called with an object with following fields:
  * `aggregationData` (*Float32Array*) - Array containing aggregation data per grid cell. Four elements per grid cell in the format `[value, 0, 0, count]`, where `value` is the aggregated weight value, up to 3 different weights. `count` is the number of objects aggregated to the grid cell.
  * `maxMinData` (*Float32Array*) - Array with four values in format, `[maxValue, 0, 0, minValue]`, where `maxValue` is max of all aggregated cells.
  * `maxData` (*Float32Array*) - Array with four values in format, `[maxValue, 0, 0, count]`, where `maxValue` is max of all aggregated cells and `count` is total number aggregated objects.
  * `minData` (*Float32Array*) - Array with four values in format, `[minValue, 0, 0, count]`, where `minValue` is min of all aggregated cells and `count` is total number aggregated objects.

  NOTE: The goal is to match format of CPU aggregation results to that of GPU aggregation, so consumers of this data (Sublayers) don't have to change.

- `_allocateResources`: Called with following arguments to allocated resources required to hold aggregation results.
  * `numRow` (*Number*) - Number of rows in the grid.
  * `numCol` (*Number*) - Number of columns in the grid.

- `_updateWeightParams`: For each weight to be aggregated aggregator requires, `operation` and `getWeight` params. Subclasses can override this method to customize these parameters for each weight being aggregated.
