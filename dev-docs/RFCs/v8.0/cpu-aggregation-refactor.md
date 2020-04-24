# RFC: CPU Aggregation Refactor

* Author: Ravi Akkenapally
* Date: November 4, 2019
* Status: **Draft**

## Overview

This RFC covers following topics

* `Consolidation`: Consolidate CPU aggregation modules/functions.
* `AttributeManager Integration`: Update CPU aggregation to consume data from `AttributeManager`'s attributes.
* `Data Filtering`: Add data filtering support to match GPU based data filtering (`DataFilterExtension`)

## Consolidation

CPU based grid aggregation is used in several layers of `aggregation-layer` module, when GPU aggregation is either not supported or the Layer has features that cannot be implemented on GPU. Currently there are two modules that are performing cpu grid aggregation.

### CPUAggregator

`CPUAggregator`, used by `HexagonLayer` and `CPUGridLayer`, in addition to basic aggregation it also does:

* `state management`: to determine what state change requires re aggregation
* `dimension management`: which is specifically related to these two layer's advanced feature such as percentile props (`lower/higherPercentile`), custom aggregation (aggregations that are not supported by `GPUGridAggregator`) and various scaling function support (`quantile`, `ordinal` etc)
* `aggregator`: a method that actually performs aggregation, this can be grid or hexagon aggregation.

### GPUGridAggregator

`GPUGridAggregator` is used by `ContourLayer` and `ScreenGridLayer`, it is only used as a fallback when GPU aggregation is not supported. In addition grid aggregation it also supports:

* `Screen vs World space aggregation`: Caller can provide a flag to perform aggregation in screen space or world space.
* `Aggregation result format`: It provides aggregation result in the same format as GPU based aggregation, so the sublayers are immune to where the aggregation is happened.

To consolidate these two modules and still provide their respective functionalities following changes are needed :

* `CPUGridAggregator`: This new class, works as base cpu aggregation class, and performs  following:

   * `state management`
   * `aggregator` : supports aggregator prop to provide both grid and hexagon aggregation
   * `Screen vs World space aggregation` :
   * `Aggregation results format` : based on a flag, aggregation result will be converted into GPU Aggregation format (basically build WebGL `Buffer` objects, which contains data for each cell whether they have any aggregated data or not)

* `GridHexAggregator` : This new class, is a subclass of `CPUGridAggregator` and supports:
   * `dimension management`

* All the CPU aggregation code from `GPUAggregator` is removed.
* Above classes replace current `CPUAggregator` class.


## AttributeManager Integration

CPU Grid/Hexagon aggregation methods should consume data from `attributes` returned by `AttributeManager` instead of directly parsing the `data` prop. As part of `AttributeManager Integration for GPU Aggregation` (https://github.com/visgl/deck.gl/pull/3777) most of the aggregation layers updated to achieve this, similar changes will be done for `CPUGridLayer` and `HexagonLayer`.

In addition to changes to layers, Grid and Hexagon aggregation methods must also be updated to consume `attributes` instead of `data` prop.


## Data Filtering

deck.gl provides GPU based data filtering through `DataFilterExtension`, but for CPU aggregation this has to happen on CPU since aggregation is happening on CPU. Filtering should happen before we aggregate individual objects to a grid/hexagon cells.

With above changes, CPU aggregation is consolidated into single class, a layer can propagated filter parameters to the aggregator and data can filtered and then aggregated.


## Conclusion

By consolidating CPU aggregation modules, we can remove CPU aggregation support from `GPUGridAggregator` and makes that modules less complicated. By integrating with `AttributeManager`, CPU aggregation take advantage of existing and any new features/optimization of `AttributeManager`. Finally it also allows implementing extensions like `DataFilterExtension`.


## Notes

- `GPUGridAggregator` originally designed to provide data in single format so the aggregation layers are immune to whether aggregation happened on CPU or GPU. But `GridLayer` and `HexagonLayer` has few features (such as domain, multiple aggregation types) that required lot more code that is specific to CPU aggregation only (those are not supported on GPU). To avoid duplication it is best to remove CPU Aggregation code from `GPUGridAggregator`.

## Open questions

- Given data filtering happening on CPU, we can support more filtering types than existing `DataFilterExtension`. Should we support those or just provide mechanism for users extend the functionality?
