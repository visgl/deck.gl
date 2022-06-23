# GridAggregationLayer

This layer performs some common tasks required to perform aggregation to grid cells, especially it takes care of deciding CPU vs GPU aggregation, allocating resources for GPU aggregation and uploading results.

This in an abstract layer, subclassed form `AggregationLayer`, `GPUGridLayer`, `ScreenGridLayer` and `ContourLayer` are subclassed from this layer.

## updateState()

During `updateState()`, it calls `updateAggregationState()` which sub classes must implement. During this method, sub classes must set following aggregation flags and aggregation params.

### Aggregation Flags

* `gpuAggregation`: When `true` aggregation happens on GPU, otherwise on CPU.
* `aggregationDataDirty` : When `true` data is re-aggregated.
* `aggregationWeightsDirty` : This flag is applicable only for CPU aggregation. When `true`, bin's aggregated values are re computed.

## Aggregation Parameters

* `gridOffset` : Grid's cell size in the format {xOffset, yOffset}.
* `projectPoints` : Should be `true` when doing screen space aggregation, when `false` it implies world space aggregation.
* `attributes` : Layer's current set of attributes which provide position and weights to CPU/GPU aggregators.
* `viewport` : current viewport object.
* `posOffset` : Offset to be added to object's position before aggregating.
* `boundingBox` : Bounding box of the input data.
Following are applicable for GPU aggregation only:
* `translation` : [xTranslation, yTranslation], position translation to be applied on positions.
* `scaling` : [xScale, yScale, flag], scaling to be applied on positions. When scaling not needed `flag` should be set to `0`.
* `vertexCount` : Number of objects to be aggregated.
* `moduleSettings` : Object with set of fields required for applying shader modules.


## updateResults()

When aggregation performed on CPU, aggregation result is in JS Array objects. Subclasses can override this method to consume aggregation data. This method is called with an object with following fields:
  * `aggregationData` (*Float32Array*) - Array containing aggregation data per grid cell. Four elements per grid cell in the format `[value, 0, 0, count]`, where `value` is the aggregated weight value, up to 3 different weights. `count` is the number of objects aggregated to the grid cell.
  * `maxMinData` (*Float32Array*) - Array with four values in format, `[maxValue, 0, 0, minValue]`, where `maxValue` is max of all aggregated cells.
  * `maxData` (*Float32Array*) - Array with four values in format, `[maxValue, 0, 0, count]`, where `maxValue` is max of all aggregated cells and `count` is total number aggregated objects.
  * `minData` (*Float32Array*) - Array with four values in format, `[minValue, 0, 0, count]`, where `minValue` is min of all aggregated cells and `count` is total number aggregated objects.

  NOTE: The goal is to match format of CPU aggregation results to that of GPU aggregation, so consumers of this data (Sublayers) don't have to change.

## allocateResources()

Called with following arguments to allocated resources required to hold aggregation results.
  * `numRow` (*Number*) - Number of rows in the grid.
  * `numCol` (*Number*) - Number of columns in the grid.
